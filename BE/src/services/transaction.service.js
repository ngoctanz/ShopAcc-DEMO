import { Transaction } from "../models/transaction.model.js";
import { paginationUtils } from "../utils/pagination.util.js";

export const transactionService = {
  async getUserTransactions(query, userId, userRole) {
    const { page, limit, skip } = paginationUtils.getPaginationParams(query);

    const filter = {};
    if (userRole !== "admin") {
      filter.userId = userId;
    }

    if (query.type) filter.type = query.type;
    if (query.userId && userRole === "admin") filter.userId = query.userId;

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Transaction.countDocuments(filter),
    ]);

    const meta = paginationUtils.createPaginationMeta(page, limit, total);

    return { transactions, meta };
  },

  async getTransactionById(transactionId, userId, userRole) {
    const transaction = await Transaction.findById(transactionId).populate(
      "userId",
      "name email"
    );

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    if (
      userRole !== "admin" &&
      transaction.userId._id.toString() !== userId.toString()
    ) {
      throw new Error("Unauthorized access");
    }

    return transaction;
  },
};
