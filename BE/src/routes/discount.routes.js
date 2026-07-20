import express from "express";
import { discountController } from "../controllers/discount.controller.js";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { discountValidation } from "../validations/discount.validation.js";

const router = express.Router();

// All discount routes require admin authentication

// Get all discounts
router.get(
  "/",
  authenticate,
  requireAdmin,
  discountController.getAllDiscounts
);

// Get discount by ID
router.get(
  "/:id",
  authenticate,
  requireAdmin,
  discountController.getDiscountById
);

// Create discount
router.post(
  "/",
  authenticate,
  requireAdmin,
  validateRequest(discountValidation.create),
  discountController.createDiscount
);

// Update discount
router.patch(
  "/:id",
  authenticate,
  requireAdmin,
  validateRequest(discountValidation.update),
  discountController.updateDiscount
);

// Delete discount
router.delete(
  "/:id",
  authenticate,
  requireAdmin,
  discountController.deleteDiscount
);

// Bulk delete discounts
router.post(
  "/bulk-delete",
  authenticate,
  requireAdmin,
  discountController.bulkDeleteDiscounts
);

export default router;
