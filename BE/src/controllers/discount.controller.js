import { discountService } from "../services/discount.service.js";
import { responseUtils } from "../utils/response.util.js";

export const discountController = {
  /**
   * Get all discounts
   */
  async getAllDiscounts(req, res, next) {
    try {
      const { discounts, meta } = await discountService.getAllDiscounts(
        req.query
      );
      return responseUtils.successWithMeta(res, discounts, meta);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get discount by ID
   */
  async getDiscountById(req, res, next) {
    try {
      const discount = await discountService.getDiscountById(req.params.id);
      return responseUtils.success(res, discount);
    } catch (error) {
      if (error.message === "Discount not found") {
        return responseUtils.notFound(res, error.message);
      }
      next(error);
    }
  },

  /**
   * Create discount
   */
  async createDiscount(req, res, next) {
    try {
      const discount = await discountService.createDiscount(req.body);
      return responseUtils.success(
        res,
        discount,
        "Discount created and applied successfully",
        201
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update discount
   */
  async updateDiscount(req, res, next) {
    try {
      const discount = await discountService.updateDiscount(
        req.params.id,
        req.body
      );
      return responseUtils.success(
        res,
        discount,
        "Discount updated and reapplied successfully"
      );
    } catch (error) {
      if (error.message === "Discount not found") {
        return responseUtils.notFound(res, error.message);
      }
      next(error);
    }
  },

  /**
   * Delete discount
   */
  async deleteDiscount(req, res, next) {
    try {
      await discountService.deleteDiscount(req.params.id);
      return responseUtils.success(
        res,
        null,
        "Discount deleted and prices reverted successfully"
      );
    } catch (error) {
      if (error.message === "Discount not found") {
        return responseUtils.notFound(res, error.message);
      }
      next(error);
    }
  },

  /**
   * Bulk delete discounts
   */
  async bulkDeleteDiscounts(req, res, next) {
    try {
      const { ids } = req.body;
      const result = await discountService.bulkDeleteDiscounts(ids);
      return responseUtils.success(
        res,
        result,
        `Deleted ${result.deletedCount} discount(s) successfully`
      );
    } catch (error) {
      if (error.message.includes("must be a non-empty array")) {
        return responseUtils.badRequest(res, error.message);
      }
      next(error);
    }
  },
};
