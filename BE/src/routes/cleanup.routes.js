import express from "express";
import { cleanupController } from "../controllers/cleanup.controller.js";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Get scheduler status (Admin only)
router.get("/status", authenticate, requireAdmin, cleanupController.getStatus);

// Manually trigger cleanup (Admin only)
router.post("/run", authenticate, requireAdmin, cleanupController.runCleanup);

export default router;
