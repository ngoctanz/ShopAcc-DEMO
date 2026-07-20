import express from "express";
import { userController } from "../controllers/user.controller.js";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { userValidation } from "../validations/user.validation.js";
import { balanceUpdateLimiter } from "../middlewares/rate-limit.middleware.js";

const router = express.Router();

router.get("/", authenticate, requireAdmin, userController.getAllUsers);

router.get("/:id", authenticate, requireAdmin, userController.getUserById);

router.patch(
  "/:id",
  authenticate,
  requireAdmin,
  validateRequest(userValidation.update),
  userController.updateUser
);

router.patch(
  "/:id/balance",
  authenticate,
  requireAdmin,
  balanceUpdateLimiter,
  validateRequest(userValidation.updateBalance),
  userController.updateUserBalance
);

router.post(
  "/bulk-update-status",
  authenticate,
  requireAdmin,
  userController.bulkUpdateUserStatus
);

export default router;
