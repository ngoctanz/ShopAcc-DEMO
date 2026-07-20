
import express from "express";
import { dashboardController } from "../controllers/dashboard.controller.js";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Get dashboard stats (Admin only)
router.get("/stats", authenticate, requireAdmin, dashboardController.getDashboardStats);

export default router;
