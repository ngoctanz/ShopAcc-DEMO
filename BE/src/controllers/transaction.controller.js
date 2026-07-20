import { transactionService } from "../services/transaction.service.js";
import { responseUtils } from "../utils/response.util.js";

export const transactionController = {
  async getUserTransactions(req, res, next) {
    try {
      const { transactions, meta } =
        await transactionService.getUserTransactions(
          req.query,
          req.user.userId,
          req.user.role
        );
      return responseUtils.successWithMeta(res, transactions, meta);
    } catch (error) {
      next(error);
    }
  },

  async getTransactionById(req, res, next) {
    try {
      const transaction = await transactionService.getTransactionById(
        req.params.id,
        req.user.userId,
        req.user.role
      );
      return responseUtils.success(res, transaction);
    } catch (error) {
      if (error.message === "Transaction not found") {
        return responseUtils.notFound(res, error.message);
      }
      if (error.message === "Unauthorized access") {
        return responseUtils.forbidden(res, error.message);
      }
      next(error);
    }
  },
};
