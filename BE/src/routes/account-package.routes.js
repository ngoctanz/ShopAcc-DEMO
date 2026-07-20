import express from "express";
import {
  getAllPackages,
  getPackagesGroupedByType,
  getPackageById,
  getAccountsByPackage,
  createPackage,
  updatePackage,
  deletePackage,
  randomPurchase,
  clonePurchase,
  clonePurchaseBulk,
  bulkDeletePackages,
} from "../controllers/account-package.controller.js";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
import { purchaseLimiter } from "../middlewares/rate-limit.middleware.js";

const router = express.Router();

// PUBLIC
router.get("/", getAllPackages);
router.get("/grouped", getPackagesGroupedByType);
router.get("/:id", getPackageById);
router.get("/:id/accounts", getAccountsByPackage);

// AUTHENTICATED - Package purchases (with rate limiting)
router.post("/:id/random-purchase", authenticate, purchaseLimiter, randomPurchase); // RANDOM mode only
router.post("/:id/clone-purchase", authenticate, purchaseLimiter, clonePurchase); // CLONE mode only
router.post("/:id/clone-purchase-bulk", authenticate, purchaseLimiter, clonePurchaseBulk); // CLONE bulk purchase

// ADMIN
router.post(
  "/",
  authenticate,
  requireAdmin,
  upload.single("image"),
  createPackage
);
router.patch(
  "/:id",
  authenticate,
  requireAdmin,
  upload.single("image"),
  updatePackage
);
router.delete("/:id", authenticate, requireAdmin, deletePackage);
router.post("/bulk-delete", authenticate, requireAdmin, bulkDeletePackages);

export default router;
