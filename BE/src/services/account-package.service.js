import { AccountPackage } from "../models/account-package.model.js";
import { Account } from "../models/account.model.js";
import { User } from "../models/user.model.js";
import { Order } from "../models/order.model.js";
import { Transaction } from "../models/transaction.model.js";
import mongoose from "mongoose";
import cloudinaryService from "./cloudinary.service.js";

const buildAccountFilter = (pkg) => {
  return {
    packageId: pkg._id,
    status: "AVAILABLE",
  };
};

export const accountPackageService = {
  /**
   * Get all packages
   */
  async getAllPackages(query) {
    const { typeId, mode, isActive } = query;

    const filter = {};
    if (typeId) filter.typeId = typeId;
    if (mode) filter.mode = mode;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const packages = await AccountPackage.find(filter)
      .populate("typeId", "code name")
      .sort({ order: 1, createdAt: -1 });

    const packagesWithCount = await Promise.all(
      packages.map(async (pkg) => {
        const count = await Account.countDocuments(buildAccountFilter(pkg));
        return { ...pkg.toObject(), accountCount: count };
      })
    );

    return packagesWithCount;
  },

  /**
   * Get packages grouped by type
   */
  async getPackagesGroupedByType() {
    const packages = await AccountPackage.find({ isActive: true })
      .populate("typeId", "code name description")
      .sort({ order: 1 });

    const packagesWithCount = await Promise.all(
      packages.map(async (pkg) => {
        const count = await Account.countDocuments(buildAccountFilter(pkg));
        return { ...pkg.toObject(), accountCount: count };
      })
    );

    // Group by typeId (skip packages without typeId)
    const grouped = packagesWithCount.reduce((acc, pkg) => {
      if (!pkg.typeId?._id) return acc; // Skip if no typeId

      const typeId = pkg.typeId._id.toString();
      if (!acc[typeId]) {
        acc[typeId] = { type: pkg.typeId, packages: [] };
      }
      acc[typeId].packages.push(pkg);
      return acc;
    }, {});

    return Object.values(grouped);
  },

  /**
   * Get package by ID or Slug
   */
  async getPackageById(id) {
    let pkg = await AccountPackage.findById(id)
      .populate("typeId")
      .catch(() => null);
    if (!pkg)
      pkg = await AccountPackage.findOne({ slug: id }).populate("typeId");

    if (!pkg) {
      throw new Error("Package not found");
    }

    const accountCount = await Account.countDocuments(buildAccountFilter(pkg));

    return { ...pkg.toObject(), accountCount };
  },

  /**
   * Get accounts by package
   * Supports: page, limit, sort, search, minPrice, maxPrice
   */
  async getAccountsByPackage(id, query) {
    const { page = 1, limit = 20, sort = "price", search, minPrice, maxPrice } = query;

    let pkg = await AccountPackage.findById(id)
      .populate("typeId")
      .catch(() => null);
    if (!pkg)
      pkg = await AccountPackage.findOne({ slug: id }).populate("typeId");

    if (!pkg) {
      throw new Error("Package not found");
    }

    const sortOptions = {
      price: { price: 1 },
      "-price": { price: -1 },
      newest: { createdAt: -1 },
      default: { createdAt: -1 },
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter with search and price range
    const accountFilter = buildAccountFilter(pkg);

    // Search by code or featuredSkins
    if (search && search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: "i" };
      accountFilter.$or = [
        { code: searchRegex },
        { featuredSkins: searchRegex },
      ];
    }

    // Price range filter
    if (minPrice || maxPrice) {
      accountFilter.price = {};
      if (minPrice) accountFilter.price.$gte = parseFloat(minPrice);
      if (maxPrice) accountFilter.price.$lte = parseFloat(maxPrice);
    }

    const [accounts, total] = await Promise.all([
      Account.find(accountFilter)
        .populate({
          path: "packageId",
          populate: { path: "typeId", select: "code name" },
        })
        .sort(sortOptions[sort] || sortOptions.default)
        .skip(skip)
        .limit(parseInt(limit)),
      Account.countDocuments(accountFilter),
    ]);

    return {
      package: pkg,
      accounts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    };
  },

  /**
   * Create package
   */
  async createPackage(data) {
    // Ensure RANDOM/CLONE packages start with discountPrice = price (as requested)
    if (data.mode === "RANDOM" || data.mode === "CLONE") {
      data.discountPrice = data.price;
    }
    const pkg = await AccountPackage.create(data);
    await pkg.populate("typeId");
    return pkg;
  },

  /**
   * Update package
   */
  async updatePackage(id, data) {
    // Get current package to check for image change
    const currentPkg = await AccountPackage.findById(id);
    if (!currentPkg) {
      throw new Error("Package not found");
    }

    // Check if image is being changed (replaced or removed)
    const oldImage = currentPkg.image;
    const newImage = data.image;
    const imageChanged = "image" in data && oldImage && (!newImage || newImage !== oldImage);

    // For RANDOM/CLONE, prevent manual discountPrice update (managed by Discounts only)
    if (currentPkg.mode === "RANDOM" || currentPkg.mode === "CLONE") {
      delete data.discountPrice;
    }

    const pkg = await AccountPackage.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).populate("typeId");

    // Delete old image from Cloudinary if changed
    if (imageChanged) {
      const publicId = cloudinaryService.extractPublicId(oldImage);
      if (publicId) {
        cloudinaryService.deleteFile(publicId, "image").catch((err) => {
          console.error(`[Package] Failed to delete old image:`, err.message);
        });
      }
    }

    // Propagate price changes to AVAILABLE accounts for RANDOM/CLONE packages
    if (pkg.mode === "RANDOM" || pkg.mode === "CLONE") {
      if (pkg.discountPrice && pkg.discountPrice < pkg.price) {
        // Apply discount to all available accounts
        await Account.updateMany(
          { packageId: pkg._id, status: "AVAILABLE" },
          {
            $set: {
              price: pkg.discountPrice,
              originalPrice: pkg.price,
            },
          }
        );
      } else {
        // No discount or invalid discount, revert to normal price
        await Account.updateMany(
          { packageId: pkg._id, status: "AVAILABLE" },
          {
            $set: {
              price: pkg.price,
              originalPrice: null,
            },
          }
        );
      }
    }

    return pkg;
  },

  /**
   * Delete package
   * Note: Does NOT delete accounts in this package - they become orphaned
   * Use bulkDeleteAccounts separately if needed
   */
  async deletePackage(id) {
    const pkg = await AccountPackage.findById(id);
    if (!pkg) {
      throw new Error("Package not found");
    }

    // Check if package has accounts
    const accountCount = await Account.countDocuments({ packageId: id });
    if (accountCount > 0) {
      throw new Error(`Cannot delete package with ${accountCount} accounts. Delete accounts first.`);
    }

    // Delete image from Cloudinary
    if (pkg.image) {
      const publicId = cloudinaryService.extractPublicId(pkg.image);
      if (publicId) {
        try {
          await cloudinaryService.deleteFile(publicId, "image");
        } catch (error) {
          console.error(`[Package] Failed to delete Cloudinary image:`, error.message);
        }
      }
    }

    await AccountPackage.findByIdAndDelete(id);
    return pkg;
  },


  async randomPurchase(packageId, userId) {
    // Strict mode validation - RANDOM only
    const pkg = await AccountPackage.findById(packageId).populate("typeId");
    if (!pkg) {
      throw new Error("Package not found");
    }
    if (pkg.mode !== "RANDOM") {
      throw new Error(
        "Invalid package mode. This endpoint only supports RANDOM packages."
      );
    }

    // Delegate to shared purchase logic
    return this._executePurchase(pkg, userId, {
      sortAccount: undefined, // RANDOM: no specific sort, MongoDB default
      modeLabel: "Random",
    });
  },

  /**
   * Clone purchase (CLONE mode only)
   * NEW LOGIC: Purchases take credentials from cloneAccounts array
   * Each clone account has many sub-accounts stored in cloneAccounts
   */
  async clonePurchase(packageId, userId) {
    // Strict mode validation - CLONE only
    const pkg = await AccountPackage.findById(packageId).populate("typeId");
    if (!pkg) {
      throw new Error("Package not found");
    }
    if (pkg.mode !== "CLONE") {
      throw new Error(
        "Invalid package mode. This endpoint only supports CLONE packages."
      );
    }
    if (!pkg.isActive) {
      throw new Error("Package is not active");
    }

    // Find an AVAILABLE clone account with available sub-accounts
    const cloneAccount = await Account.findOne({
      packageId: pkg._id,
      status: "AVAILABLE",
      isClone: true,
      quantity: { $gte: 1 },
    }).select("+cloneAccounts.username +cloneAccounts.password +cloneAccounts.additionalInfo");

    if (!cloneAccount || !cloneAccount.cloneAccounts?.length) {
      throw new Error("No available accounts in this package");
    }

    const purchasePrice = cloneAccount.price;
    if (purchasePrice == null || purchasePrice < 1) {
      throw new Error("Invalid account price");
    }

    // Get user and validate balance
    const user = await User.findById(userId);
    if (!user || user.status !== "active") {
      throw new Error("User account is not active");
    }
    if (user.balance < purchasePrice) {
      throw new Error("Insufficient balance");
    }

    // Atomically pop one credential from cloneAccounts and decrease quantity
    const updatedAccount = await Account.findOneAndUpdate(
      {
        _id: cloneAccount._id,
        quantity: { $gte: 1 },
        "cloneAccounts.0": { $exists: true }
      },
      {
        $pop: { cloneAccounts: -1 }, // Remove first element
        $inc: { quantity: -1 }
      },
      { new: false } // Return old document to get the popped credential
    ).select("+cloneAccounts.username +cloneAccounts.password +cloneAccounts.additionalInfo");

    if (!updatedAccount || !updatedAccount.cloneAccounts?.length) {
      throw new Error("Account is no longer available");
    }

    // Get the claimed credential (first element before pop)
    const claimedCredential = updatedAccount.cloneAccounts[0];

    // Deduct user balance
    const deductedUser = await User.findOneAndUpdate(
      { _id: userId, balance: { $gte: purchasePrice }, status: "active" },
      { $inc: { balance: -purchasePrice } },
      { new: true }
    );

    if (!deductedUser) {
      // Rollback: return the credential
      await Account.findByIdAndUpdate(cloneAccount._id, {
        $push: { cloneAccounts: { $each: [claimedCredential], $position: 0 } },
        $inc: { quantity: 1 }
      });
      throw new Error("Insufficient balance or user not active");
    }

    const balanceBefore = deductedUser.balance + purchasePrice;
    const balanceAfter = deductedUser.balance;

    // Check if account should be marked as SOLD
    if (updatedAccount.quantity <= 1 || updatedAccount.cloneAccounts.length <= 1) {
      await Account.findByIdAndUpdate(cloneAccount._id, { status: "SOLD" });
    }

    // Create order
    const order = await Order.create({
      userId,
      accountId: cloneAccount._id,
      price: purchasePrice,
      status: "completed",
      accountCredentials: {
        username: claimedCredential.username,
        password: claimedCredential.password,
        additionalInfo: claimedCredential.additionalInfo,
      },
      accountSnapshot: {
        code: cloneAccount.code || null,
        packageTitle: pkg.title || null,
        image: cloneAccount.coverImage || pkg.image || null,
      },
    });

    // Create transaction log
    try {
      await Transaction.create({
        userId,
        type: "purchase",
        amount: purchasePrice,
        balanceBefore,
        balanceAfter,
        description: `Clone purchase from package "${pkg.title}"`,
        referenceId: order._id,
        referenceType: "order",
      });
    } catch (txError) {
      console.error(`[ClonePurchase] Failed to create transaction log:`, txError.message);
    }

    return {
      success: true,
      order: {
        _id: order._id,
        price: order.price,
        status: order.status,
        createdAt: order.createdAt,
      },
      account: {
        _id: cloneAccount._id,
        code: cloneAccount.code,
        accountInfo: cloneAccount.accountInfo,
      },
      package: {
        _id: pkg._id,
        title: pkg.title,
        mode: pkg.mode,
      },
      balanceAfter,
    };
  },

  /**
   * Bulk clone purchase (CLONE mode only)
   * NEW LOGIC: Purchases multiple credentials from cloneAccounts array of a single account
   */
  async clonePurchaseBulk(packageId, userId, quantity) {
    const MAX_QUANTITY = 10;
    const MIN_QUANTITY = 1;

    // Validate quantity
    const parsedQuantity = Number(quantity);
    if (!Number.isInteger(parsedQuantity) || parsedQuantity < MIN_QUANTITY || parsedQuantity > MAX_QUANTITY) {
      throw new Error(`Quantity must be an integer between ${MIN_QUANTITY} and ${MAX_QUANTITY}`);
    }
    quantity = parsedQuantity;

    // Validate package
    const pkg = await AccountPackage.findById(packageId).populate("typeId");
    if (!pkg) {
      throw new Error("Package not found");
    }
    if (pkg.mode !== "CLONE") {
      throw new Error("Invalid package mode. This endpoint only supports CLONE packages.");
    }
    if (!pkg.isActive) {
      throw new Error("Package is not active");
    }

    // Find a clone account with enough sub-accounts
    const cloneAccount = await Account.findOne({
      packageId: pkg._id,
      status: "AVAILABLE",
      isClone: true,
      quantity: { $gte: quantity },
    }).select("+cloneAccounts.username +cloneAccounts.password +cloneAccounts.additionalInfo");

    if (!cloneAccount || !cloneAccount.cloneAccounts?.length || cloneAccount.cloneAccounts.length < quantity) {
      throw new Error(`Not enough accounts available. Required: ${quantity}, Available: ${cloneAccount?.quantity || 0}`);
    }

    const unitPrice = cloneAccount.price;
    if (unitPrice == null || unitPrice < 1) {
      throw new Error("Invalid account price");
    }
    const totalPrice = unitPrice * quantity;

    // Validate user balance
    const user = await User.findById(userId);
    if (!user || user.status !== "active") {
      throw new Error("User account is not active");
    }
    if (user.balance < totalPrice) {
      throw new Error("Insufficient balance");
    }

    // Generate batchId for grouping orders
    const batchId = new mongoose.Types.ObjectId().toString();

    // Get the credentials to claim (first N from array)
    const credentialsToClaim = cloneAccount.cloneAccounts.slice(0, quantity);

    // Atomically remove credentials and decrease quantity
    const updatedAccount = await Account.findOneAndUpdate(
      {
        _id: cloneAccount._id,
        quantity: { $gte: quantity },
      },
      {
        $set: {
          cloneAccounts: cloneAccount.cloneAccounts.slice(quantity) // Remove first N elements
        },
        $inc: { quantity: -quantity }
      },
      { new: true }
    );

    if (!updatedAccount) {
      throw new Error("Account is no longer available");
    }

    // Deduct user balance
    const deductedUser = await User.findOneAndUpdate(
      { _id: userId, balance: { $gte: totalPrice }, status: "active" },
      { $inc: { balance: -totalPrice } },
      { new: true }
    );

    if (!deductedUser) {
      // Rollback: return credentials
      await Account.findByIdAndUpdate(cloneAccount._id, {
        $push: { cloneAccounts: { $each: credentialsToClaim, $position: 0 } },
        $inc: { quantity: quantity }
      });
      throw new Error("Insufficient balance or user not active");
    }

    const balanceBefore = deductedUser.balance + totalPrice;
    const balanceAfter = deductedUser.balance;

    // Check if account should be marked as SOLD
    if (updatedAccount.quantity <= 0 || !updatedAccount.cloneAccounts?.length) {
      await Account.findByIdAndUpdate(cloneAccount._id, { status: "SOLD" });
    }

    // Create orders for each claimed credential
    const orderDocs = credentialsToClaim.map(cred => ({
      userId,
      accountId: cloneAccount._id,
      price: unitPrice,
      status: "completed",
      batchId,
      accountCredentials: {
        username: cred.username,
        password: cred.password,
        additionalInfo: cred.additionalInfo,
      },
      accountSnapshot: {
        code: cloneAccount.code || null,
        packageTitle: pkg.title || null,
        image: cloneAccount.coverImage || pkg.image || null,
      },
    }));

    const orders = await Order.insertMany(orderDocs, { ordered: true });

    // Create transaction log
    try {
      await Transaction.create({
        userId,
        type: "purchase",
        amount: totalPrice,
        balanceBefore,
        balanceAfter,
        description: `Bulk clone purchase: ${quantity} accounts from "${pkg.title}"`,
        referenceId: batchId,
        referenceType: "batch",
      });
    } catch (txError) {
      console.error(`[BulkClonePurchase] Failed to create transaction log:`, txError.message);
    }

    return {
      success: true,
      batchId,
      quantity,
      totalPrice,
      unitPrice,
      orders: orders.map((o) => ({
        _id: o._id,
        price: o.price,
        status: o.status,
        createdAt: o.createdAt,
      })),
      package: {
        _id: pkg._id,
        title: pkg.title,
        mode: pkg.mode,
      },
      balanceAfter,
    };
  },



  async _executePurchase(pkg, userId, options) {
    const { sortAccount, modeLabel } = options;

    // 1. Validate package is active
    if (!pkg.isActive) {
      throw new Error("Package is not active");
    }

    // 2. Get the final price (discountPrice if available, otherwise price)
    const purchasePrice = pkg.discountPrice ?? pkg.price;
    if (purchasePrice == null || purchasePrice < 1) {
      throw new Error("Invalid package price");
    }

    // 3. Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    if (user.status !== "active") {
      throw new Error("User account is not active");
    }

    // Pre-check balance (will be validated again atomically)
    if (user.balance < purchasePrice) {
      throw new Error("Insufficient balance");
    }

    let selectedAccount = null;
    let order = null;

    // 4. Atomically claim an available account first (prevents multiple users getting same account)
    const accountFilter = buildAccountFilter(pkg);
    selectedAccount = await Account.findOneAndUpdate(
      accountFilter,
      { status: "SOLD" },
      {
        new: true,
        sort: sortAccount,
      }
    );

    if (!selectedAccount) {
      throw new Error("No available accounts in this package");
    }

    // Track what we've done for rollback
    let balanceDeducted = false;

    try {
      // 5. Atomically deduct user balance with validation
      // This prevents race condition - only succeeds if balance >= purchasePrice
      const updatedUser = await User.findOneAndUpdate(
        {
          _id: userId,
          balance: { $gte: purchasePrice },
          status: "active"
        },
        { $inc: { balance: -purchasePrice } },
        { new: true }
      );

      if (!updatedUser) {
        // Rollback: Revert account status back to AVAILABLE
        await Account.findByIdAndUpdate(selectedAccount._id, { status: "AVAILABLE" });
        throw new Error("Insufficient balance or user not active");
      }

      balanceDeducted = true;
      const balanceBefore = updatedUser.balance + purchasePrice;
      const balanceAfter = updatedUser.balance;

      // 6. Get account with credentials
      const accountWithCredentials = await Account.findById(selectedAccount._id)
        .select("+credentials.username +credentials.password +credentials.additionalInfo");

      if (!accountWithCredentials?.credentials?.username) {
        throw new Error("Account credentials not found");
      }

      // 7. Create Order with credentials snapshot
      order = await Order.create({
        userId,
        accountId: selectedAccount._id,
        price: purchasePrice,
        status: "completed",
        accountCredentials: {
          username: accountWithCredentials.credentials.username,
          password: accountWithCredentials.credentials.password,
          additionalInfo: accountWithCredentials.credentials.additionalInfo,
        },
        // Snapshot: For RANDOM/CLONE, use package image (not account image)
        accountSnapshot: {
          code: selectedAccount.code || null,
          packageTitle: pkg.title || null,
          image: pkg.image || null,
        },
      });

      // 8. Create Transaction record (non-critical, log error but don't fail)
      try {
        await Transaction.create({
          userId,
          type: "purchase",
          amount: purchasePrice,
          balanceBefore,
          balanceAfter,
          description: `${modeLabel} purchase from package "${pkg.title}"`,
          referenceId: order._id,
          referenceType: "order",
        });
      } catch (txError) {
        console.error(`[Purchase] Failed to create transaction log:`, txError.message);
      }

      // 9. Return result (without exposing credentials directly)
      return {
        success: true,
        order: {
          _id: order._id,
          price: order.price,
          status: order.status,
          createdAt: order.createdAt,
        },
        account: {
          _id: selectedAccount._id,
          code: selectedAccount.code,
          accountInfo: selectedAccount.accountInfo,
          images: selectedAccount.images,
        },
        package: {
          _id: pkg._id,
          title: pkg.title,
          mode: pkg.mode,
        },
        balanceAfter,
      };

    } catch (error) {
      // Full rollback: revert account + refund balance if deducted
      const rollbackPromises = [
        Account.findByIdAndUpdate(selectedAccount._id, { status: "AVAILABLE" }).catch(() => { }),
      ];

      if (balanceDeducted) {
        rollbackPromises.push(
          User.findByIdAndUpdate(userId, { $inc: { balance: purchasePrice } }).catch(() => { })
        );
      }

      await Promise.all(rollbackPromises);
      throw error;
    }
  },

  /**
   * Bulk delete packages
   * Note: Only deletes packages that have no accounts
   */
  async bulkDeletePackages(packageIds) {
    if (!Array.isArray(packageIds) || packageIds.length === 0) {
      throw new Error("Package IDs must be a non-empty array");
    }

    // Check which packages have accounts
    const packagesWithAccounts = await Account.aggregate([
      { $match: { packageId: { $in: packageIds.map(id => mongoose.Types.ObjectId.createFromHexString(id)) } } },
      { $group: { _id: "$packageId", count: { $sum: 1 } } },
    ]);

    const packageIdsWithAccounts = new Set(packagesWithAccounts.map(p => p._id.toString()));
    const safeToDeleteIds = packageIds.filter(id => !packageIdsWithAccounts.has(id.toString()));

    if (safeToDeleteIds.length === 0) {
      throw new Error("All selected packages have accounts. Delete accounts first.");
    }

    // Get packages to delete their images
    const packages = await AccountPackage.find({ _id: { $in: safeToDeleteIds } });

    // Collect image public IDs
    const publicIds = [];
    for (const pkg of packages) {
      if (pkg.image) {
        const publicId = cloudinaryService.extractPublicId(pkg.image);
        if (publicId) publicIds.push(publicId);
      }
    }

    // Delete images from Cloudinary
    if (publicIds.length > 0) {
      try {
        await cloudinaryService.deleteFiles(publicIds, "image");
      } catch (error) {
        console.error(`[Package] Failed to delete Cloudinary images:`, error.message);
      }
    }

    const result = await AccountPackage.deleteMany({
      _id: { $in: safeToDeleteIds },
    });

    return {
      deletedCount: result.deletedCount,
      imagesDeleted: publicIds.length,
      skippedCount: packageIds.length - safeToDeleteIds.length,
      skippedReason: packageIdsWithAccounts.size > 0 ? "Some packages have accounts" : null,
    };
  },
};
