import { User } from "../models/user.model.js";
import { Transaction } from "../models/transaction.model.js";
import { paginationUtils } from "../utils/pagination.util.js";

export const userService = {
  async getAllUsers(query) {
    const { page, limit, skip } = paginationUtils.getPaginationParams(query);

    const filter = {};
    if (query.status) filter.status = query.status;
    if (query.role) filter.role = query.role;
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: "i" } },
        { email: { $regex: query.search, $options: "i" } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    const meta = paginationUtils.createPaginationMeta(page, limit, total);

    return { users, meta };
  },

  async getUserById(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  },

  async updateUser(userId, updateData) {
    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  },

  async updateUserBalance(userId, amount, action, reason, adminId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const balanceBefore = user.balance;
    let balanceAfter = balanceBefore;

    if (action === "add") {
      balanceAfter = balanceBefore + amount;
    } else if (action === "subtract") {
      if (balanceBefore < amount) {
        throw new Error("Insufficient balance");
      }
      balanceAfter = balanceBefore - amount;
    }

    user.balance = balanceAfter;
    await user.save();

    await Transaction.create({
      userId,
      type: action === "add" ? "topup" : "purchase",
      amount,
      balanceBefore,
      balanceAfter,
      description: `${reason} (By admin)`,
    });

    return user;
  },

  async bulkUpdateUserStatus(userIds, status) {
    if (!Array.isArray(userIds) || userIds.length === 0) {
      throw new Error("User IDs must be a non-empty array");
    }

    const validStatuses = ["active", "banned"];
    if (!validStatuses.includes(status)) {
      throw new Error("Invalid status");
    }

    const result = await User.updateMany(
      { _id: { $in: userIds } },
      { status },
      { runValidators: true }
    );

    return { modifiedCount: result.modifiedCount };
  },
};
