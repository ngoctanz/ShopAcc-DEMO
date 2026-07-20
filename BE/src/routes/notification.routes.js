import express from "express";
import { notificationController } from "../controllers/notification.controller.js";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Route for latest notification
router.get("/latest", notificationController.getLatestNotification);

// Get all notifications (public)
router.get("/", authenticate, requireAdmin, notificationController.getNotifications);

router.get("/:id", authenticate, requireAdmin, notificationController.getNotificationById);

// ADMIN ROUTES
router.post("/", authenticate, requireAdmin, notificationController.createNotification);
router.patch("/:id", authenticate, requireAdmin, notificationController.updateNotification);
router.delete("/:id", authenticate, requireAdmin, notificationController.deleteNotification);

export default router;

// ADMIN ROUTES - Bulk Delete
router.post("/bulk-delete", authenticate, requireAdmin, notificationController.bulkDeleteNotifications);
