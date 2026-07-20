import express from "express";
import { orderController } from "../controllers/order.controller.js";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware.js";
import { credentialViewLimiter } from "../middlewares/rate-limit.middleware.js";

const router = express.Router();

// PUBLIC - Get recent purchases for banner ticker
router.get("/recent-purchases", orderController.getRecentPurchases);

// Get user's orders (list - no credentials)
router.get("/", authenticate, orderController.getUserOrders);

// Get credentials only (click-to-reveal) - rate limited to prevent brute force
router.get("/:id/credentials", authenticate, credentialViewLimiter, orderController.getOrderCredentials);

// Get single order (with credentials - owner only)
router.get("/:id", authenticate, orderController.getOrderById);



// ADMIN ONLY - Delete order
router.delete("/:id", authenticate, requireAdmin, orderController.deleteOrder);

// ADMIN ONLY - Bulk delete orders
router.post("/bulk-delete", authenticate, requireAdmin, orderController.bulkDeleteOrders);

export default router;
