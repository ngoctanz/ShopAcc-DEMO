import { orderService } from "../services/order.service.js";
import { responseUtils } from "../utils/response.util.js";

export const orderController = {
  // List orders - NO credentials exposed
  async getUserOrders(req, res, next) {
    try {
      const { orders, meta } = await orderService.getUserOrders(
        req.query,
        req.user.userId,
        req.user.role
      );
      return responseUtils.successWithMeta(res, orders, meta);
    } catch (error) {
      next(error);
    }
  },

  // Single order - WITH credentials (only owner/admin)
  async getOrderById(req, res, next) {
    try {
      const order = await orderService.getOrderById(
        req.params.id,
        req.user.userId,
        req.user.role
      );
      return responseUtils.success(res, order);
    } catch (error) {
      if (error.message === "Order not found") {
        return responseUtils.notFound(res, error.message);
      }
      if (error.message === "Unauthorized access") {
        return responseUtils.forbidden(res, error.message);
      }
      next(error);
    }
  },

  // Get credentials only
  async getOrderCredentials(req, res, next) {
    try {
      const credentials = await orderService.getOrderCredentials(
        req.params.id,
        req.user.userId,
        req.user.role
      );
      return responseUtils.success(res, credentials);
    } catch (error) {
      if (error.message === "Order not found") {
        return responseUtils.notFound(res, error.message);
      }
      if (error.message === "Unauthorized access") {
        return responseUtils.forbidden(res, error.message);
      }
      next(error);
    }
  },


  // Delete order (Admin only)
  async deleteOrder(req, res, next) {
    try {
      await orderService.deleteOrder(req.params.id);
      return responseUtils.success(res, null, "Order deleted successfully");
    } catch (error) {
      if (error.message === "Order not found") {
        return responseUtils.notFound(res, error.message);
      }
      next(error);
    }
  },

  // Bulk delete orders (Admin only)
  async bulkDeleteOrders(req, res, next) {
    try {
      const { ids } = req.body;
      const result = await orderService.bulkDeleteOrders(ids);
      return responseUtils.success(
        res,
        result,
        `Deleted ${result.deletedCount} order(s) successfully`
      );
    } catch (error) {
      if (error.message.includes("must be a non-empty array")) {
        return responseUtils.badRequest(res, error.message);
      }
      next(error);
    }
  },

  // Get recent purchases for banner ticker (public)
  async getRecentPurchases(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 20;
      const purchases = await orderService.getRecentPurchases(limit);
      return responseUtils.success(res, purchases);
    } catch (error) {
      next(error);
    }
  },
};
