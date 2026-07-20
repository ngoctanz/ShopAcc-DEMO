/**
 * Script to fix duplicate topup credits
 *
 * Cách chạy:
 * cd BE
 * node scripts/fix-duplicate-topup.js
 *
 * Hoặc với dry-run (chỉ xem, không sửa):
 * node scripts/fix-duplicate-topup.js --dry-run
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
dotenv.config({ path: path.join(__dirname, "../.env") });

const MONGODB_URI = process.env.MONGODB_URI;
const isDryRun = process.argv.includes("--dry-run");

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not found in .env");
  process.exit(1);
}

// Define schemas inline to avoid import issues
const transactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: String,
    amount: Number,
    description: String,
    balanceBefore: Number,
    balanceAfter: Number,
    referenceId: mongoose.Schema.Types.ObjectId,
    referenceType: String,
  },
  { timestamps: true },
);

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  balance: { type: Number, default: 0 },
});

const Transaction = mongoose.model("Transaction", transactionSchema);
const User = mongoose.model("User", userSchema);

async function fixDuplicateTopups() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    if (isDryRun) {
      console.log("🔍 DRY RUN MODE - No changes will be made\n");
    }

    // Find duplicate transactions (same referenceId for topup types)
    console.log("🔍 Finding duplicate transactions...\n");

    const duplicates = await Transaction.aggregate([
      {
        $match: {
          referenceType: { $in: ["topup", "card_topup"] },
          referenceId: { $ne: null },
        },
      },
      {
        $group: {
          _id: "$referenceId",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
          transactions: { $push: "$$ROOT" },
        },
      },
      {
        $match: {
          count: { $gt: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    if (duplicates.length === 0) {
      console.log("✅ No duplicate transactions found! Database is clean.\n");
      return;
    }

    console.log(
      `⚠️  Found ${duplicates.length} topups with duplicate transactions:\n`,
    );

    let totalDuplicateAmount = 0;
    let totalDuplicateCount = 0;

    for (const dup of duplicates) {
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`📦 Topup ID: ${dup._id}`);
      console.log(`   Duplicate count: ${dup.count} transactions`);
      console.log(
        `   Total credited: ${dup.totalAmount.toLocaleString("vi-VN")}đ`,
      );

      // Sort by createdAt, keep the first one
      const sorted = dup.transactions.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      );

      const keepTransaction = sorted[0];
      const removeTransactions = sorted.slice(1);

      console.log(`\n   ✅ KEEP: ${keepTransaction._id}`);
      console.log(
        `      Amount: ${keepTransaction.amount.toLocaleString("vi-VN")}đ`,
      );
      console.log(`      Created: ${keepTransaction.createdAt}`);

      console.log(`\n   ❌ REMOVE (${removeTransactions.length}):`);

      let dupAmount = 0;
      for (const tx of removeTransactions) {
        dupAmount += tx.amount;
        console.log(
          `      - ${tx._id}: ${tx.amount.toLocaleString("vi-VN")}đ at ${tx.createdAt}`,
        );
      }

      totalDuplicateAmount += dupAmount;
      totalDuplicateCount += removeTransactions.length;

      if (!isDryRun) {
        // Remove duplicate transactions
        const removeIds = removeTransactions.map((tx) => tx._id);
        await Transaction.deleteMany({ _id: { $in: removeIds } });

        // Adjust user balance
        const user = await User.findById(keepTransaction.userId);
        if (user) {
          const oldBalance = user.balance;
          user.balance = Math.max(0, user.balance - dupAmount); // Prevent negative
          await user.save();
          console.log(`\n   💰 User ${user.email}:`);
          console.log(
            `      Balance: ${oldBalance.toLocaleString("vi-VN")}đ → ${user.balance.toLocaleString("vi-VN")}đ`,
          );
          console.log(`      Deducted: -${dupAmount.toLocaleString("vi-VN")}đ`);
        }
      }
    }

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`\n📊 SUMMARY:`);
    console.log(`   Topups with duplicates: ${duplicates.length}`);
    console.log(`   Total duplicate transactions: ${totalDuplicateCount}`);
    console.log(
      `   Total duplicate amount: ${totalDuplicateAmount.toLocaleString("vi-VN")}đ`,
    );

    if (isDryRun) {
      console.log(
        `\n⚠️  DRY RUN - No changes made. Run without --dry-run to fix.`,
      );
    } else {
      console.log(`\n✅ Fixed all duplicate topups!`);
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB");
  }
}

fixDuplicateTopups();
