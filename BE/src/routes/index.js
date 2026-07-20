import express from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import accountRoutes from "./account.routes.js";
import wishlistRoutes from "./wishlist.routes.js";
import orderRoutes from "./order.routes.js";
import transactionRoutes from "./transaction.routes.js";
import notificationRoutes from "./notification.routes.js";
import accountTypeRoutes from "./account-type.routes.js";
import accountPackageRoutes from "./account-package.routes.js";
import uploadRoutes from "./upload.routes.js";
import auditRoutes from "./audit.routes.js";
import discountRoutes from "./discount.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import cleanupRoutes from "./cleanup.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/accounts", accountRoutes);
router.use("/account-types", accountTypeRoutes);
router.use("/account-packages", accountPackageRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/orders", orderRoutes);
router.use("/transactions", transactionRoutes);
router.use("/notifications", notificationRoutes);
router.use("/upload", uploadRoutes);
router.use("/logs", auditRoutes);
router.use("/discounts", discountRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/cleanup", cleanupRoutes);

router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

export default router;
