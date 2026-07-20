import express from "express";
import { accountTypeController } from "../controllers/account-type.controller.js";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { accountTypeValidation } from "../validations/account-type.validation.js";

const router = express.Router();

// PUBLIC - List account types
router.get("/", accountTypeController.getAllAccountTypes);

// PUBLIC - Get single account type
router.get("/:id", accountTypeController.getAccountTypeById);

// ADMIN ONLY - Create account type
router.post(
  "/",
  authenticate,
  requireAdmin,
  validateRequest(accountTypeValidation.create),
  accountTypeController.createAccountType
);

// ADMIN ONLY - Update account type
router.patch(
  "/:id",
  authenticate,
  requireAdmin,
  validateRequest(accountTypeValidation.update),
  accountTypeController.updateAccountType
);

// ADMIN ONLY - Delete account type
router.delete(
  "/:id",
  authenticate,
  requireAdmin,
  accountTypeController.deleteAccountType
);

// ADMIN ONLY - Bulk delete account types
router.post(
  "/bulk-delete",
  authenticate,
  requireAdmin,
  accountTypeController.bulkDeleteAccountTypes
);

export default router;
