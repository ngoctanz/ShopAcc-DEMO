import { Account } from "../models/account.model.js";
import { Order } from "../models/order.model.js";
import cloudinaryService from "./cloudinary.service.js";

/**
 * Cleanup Service
 * Handles scheduled cleanup of sold accounts and related resources
 */

const BATCH_SIZE = 100; // Process in batches to avoid memory issues
const ACCOUNT_RETENTION_DAYS = 90; // Keep sold accounts for 90 days (3 months)

let isRunning = false; // Prevent concurrent runs

/**
 * Get cutoff date for accounts (90 days / 3 months ago)
 */
const getAccountCutoffDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - ACCOUNT_RETENTION_DAYS);
  return date;
};

/**
 * Extract all Cloudinary public IDs from account images
 */
const extractImagePublicIds = (account) => {
  const publicIds = [];
  
  // Cover image
  if (account.coverImage) {
    const publicId = cloudinaryService.extractPublicId(account.coverImage);
    if (publicId) publicIds.push(publicId);
  }
  
  // Images array
  if (account.images && account.images.length > 0) {
    for (const imageUrl of account.images) {
      const publicId = cloudinaryService.extractPublicId(imageUrl);
      if (publicId) publicIds.push(publicId);
    }
  }
  
  return publicIds;
};

/**
 * Batch update order snapshots for accounts that don't have them
 */
const batchEnsureOrderSnapshots = async (accounts) => {
  const accountIds = accounts.map(a => a._id);
  
  // Find orders that need snapshot update (missing code)
  const ordersToUpdate = await Order.find({
    accountId: { $in: accountIds },
    "accountSnapshot.code": { $exists: false },
  }).lean();
  
  if (ordersToUpdate.length === 0) return 0;
  
  // Create a map of accountId -> account for quick lookup
  const accountMap = new Map(accounts.map(a => [a._id.toString(), a]));
  
  // Batch update using bulkWrite
  const bulkOps = [];
  
  for (const order of ordersToUpdate) {
    const account = accountMap.get(order.accountId?.toString());
    if (!account) continue;
    
    bulkOps.push({
      updateOne: {
        filter: { _id: order._id },
        update: {
          $set: {
            "accountSnapshot.code": account.code || null,
            "accountSnapshot.image": account.coverImage || account.images?.[0] || null,
          },
        },
      },
    });
  }
  
  if (bulkOps.length > 0) {
    await Order.bulkWrite(bulkOps);
  }
  
  return bulkOps.length;
};

/**
 * Delete images from Cloudinary in batches
 */
const deleteCloudinaryImages = async (publicIds) => {
  if (!publicIds || publicIds.length === 0) return { deleted: 0, failed: 0 };
  
  let deleted = 0;
  let failed = 0;
  
  // Cloudinary allows max 100 resources per delete call
  const CLOUDINARY_BATCH_SIZE = 100;
  
  for (let i = 0; i < publicIds.length; i += CLOUDINARY_BATCH_SIZE) {
    const batch = publicIds.slice(i, i + CLOUDINARY_BATCH_SIZE);
    
    try {
      const result = await cloudinaryService.deleteFiles(batch, "image");
      deleted += Object.keys(result.deleted || {}).length;
    } catch (error) {
      console.error(`[Cleanup] Failed to delete Cloudinary batch:`, error.message);
      failed += batch.length;
    }
  }
  
  return { deleted, failed };
};

/**
 * Main cleanup job - Delete sold accounts older than retention period
 */
export const cleanupSoldAccounts = async () => {
  // Prevent concurrent runs
  if (isRunning) {
    console.log("[Cleanup] Job already running, skipping...");
    return { skipped: true, reason: "Already running" };
  }
  
  isRunning = true;
  const startTime = Date.now();
  const cutoffDate = getAccountCutoffDate();
  
  console.log(`[Cleanup] Starting cleanup job...`);
  console.log(`[Cleanup] Cutoff date: ${cutoffDate.toISOString()}`);
  
  const stats = {
    accountsProcessed: 0,
    accountsDeleted: 0,
    imagesDeleted: 0,
    imagesFailed: 0,
    ordersUpdated: 0,
    errors: [],
  };
  
  try {
    // Process in batches using cursor-based pagination (more reliable than skip)
    let lastId = null;
    let hasMore = true;
    
    while (hasMore) {
      // Build query with cursor-based pagination
      const query = {
        status: "SOLD",
        updatedAt: { $lt: cutoffDate },
      };
      
      if (lastId) {
        query._id = { $gt: lastId };
      }
      
      // Fetch batch of accounts sorted by _id for consistent pagination
      const accounts = await Account.find(query)
        .sort({ _id: 1 })
        .limit(BATCH_SIZE)
        .lean();
      
      if (accounts.length === 0) {
        hasMore = false;
        break;
      }
      
      // Update lastId for next iteration
      lastId = accounts[accounts.length - 1]._id;
      
      const accountIds = [];
      const allPublicIds = [];
      
      // 1. Batch ensure order snapshots
      try {
        const updatedCount = await batchEnsureOrderSnapshots(accounts);
        stats.ordersUpdated += updatedCount;
      } catch (error) {
        console.error(`[Cleanup] Error updating order snapshots:`, error.message);
        stats.errors.push({ phase: "snapshot", error: error.message });
      }
      
      // 2. Collect image public IDs and account IDs
      for (const account of accounts) {
        try {
          const publicIds = extractImagePublicIds(account);
          allPublicIds.push(...publicIds);
          accountIds.push(account._id);
          stats.accountsProcessed++;
        } catch (error) {
          console.error(`[Cleanup] Error processing account ${account._id}:`, error.message);
          stats.errors.push({ accountId: account._id, error: error.message });
        }
      }
      
      // 3. Delete Cloudinary images
      if (allPublicIds.length > 0) {
        const cloudinaryResult = await deleteCloudinaryImages(allPublicIds);
        stats.imagesDeleted += cloudinaryResult.deleted;
        stats.imagesFailed += cloudinaryResult.failed;
      }
      
      // 4. Delete accounts from database
      if (accountIds.length > 0) {
        const deleteResult = await Account.deleteMany({ _id: { $in: accountIds } });
        stats.accountsDeleted += deleteResult.deletedCount;
      }
      
      console.log(`[Cleanup] Batch processed: ${accounts.length} accounts`);
      
      // If we got less than BATCH_SIZE, we're done
      if (accounts.length < BATCH_SIZE) {
        hasMore = false;
      }
    }
    
  } catch (error) {
    console.error(`[Cleanup] Critical error:`, error);
    stats.errors.push({ critical: true, error: error.message });
  } finally {
    isRunning = false;
  }
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  console.log(`[Cleanup] Job completed in ${duration}s`);
  console.log(`[Cleanup] Stats:`, JSON.stringify(stats, null, 2));
  
  return stats;
};

/**
 * Check if cleanup is currently running
 */
export const isCleanupRunning = () => isRunning;

/**
 * Manual trigger for testing (can be called via admin API)
 */
export const runCleanupManually = async () => {
  return cleanupSoldAccounts();
};

export default {
  cleanupSoldAccounts,
  runCleanupManually,
  isCleanupRunning,
};
