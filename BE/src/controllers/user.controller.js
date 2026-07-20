import { userService } from "../services/user.service.js";
import { responseUtils } from "../utils/response.util.js";
import { auditService } from "../services/audit.service.js";

export const userController = {
  async getAllUsers(req, res, next) {
    try {
      const { users, meta } = await userService.getAllUsers(req.query);
      return responseUtils.successWithMeta(res, users, meta);
    } catch (error) {
      next(error);
    }
  },

  async getUserById(req, res, next) {
    try {
      const user = await userService.getUserById(req.params.id);
      return responseUtils.success(res, user);
    } catch (error) {
      if (error.message === "User not found") {
        return responseUtils.notFound(res, error.message);
      }
      next(error);
    }
  },

  async updateUser(req, res, next) {
    try {
      const userId = req.params.id;

      if (req.user.role !== "admin" && req.user.userId.toString() !== userId) {
        return responseUtils.forbidden(
          res,
          "Cannot update other user's profile"
        );
      }

      // Only admin can update status
      if (req.body.status && req.user.role !== "admin") {
        return responseUtils.forbidden(
          res,
          "Only admin can update user status"
        );
      }

      const user = await userService.updateUser(userId, req.body);
      return responseUtils.success(res, user, "User updated successfully");
    } catch (error) {
      if (error.message === "User not found") {
        return responseUtils.notFound(res, error.message);
      }
      next(error);
    }
  },

  async updateUserBalance(req, res, next) {
    try {
      const { amount, action, reason } = req.body;
      const user = await userService.updateUserBalance(
        req.params.id,
        amount,
        action,
        reason,
        req.user.userId
      );
      await auditService.logBalanceUpdate(
        req,
        req.params.id,
        user.name, // Pass target user name
        amount,
        action,
        reason
      );

      return responseUtils.success(res, user, "Balance updated successfully");
    } catch (error) {
      if (error.message === "User not found") {
        return responseUtils.notFound(res, error.message);
      }
      if (error.message === "Insufficient balance") {
        return responseUtils.badRequest(res, error.message);
      }
      next(error);
    }
  },

  async bulkUpdateUserStatus(req, res, next) {
    try {
      const { ids, status } = req.body;
      const result = await userService.bulkUpdateUserStatus(ids, status);
      return responseUtils.success(
        res,
        result,
        `Updated ${result.modifiedCount} user(s) successfully`
      );
    } catch (error) {
      if (error.message.includes("must be a non-empty array") || error.message === "Invalid status") {
        return responseUtils.badRequest(res, error.message);
      }
      next(error);
    }
  },
};
