import express from "express";
import { auditController } from "../controllers/audit.controller.js";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All routes require admin
router.use(authenticate, requireAdmin);

// Get all logs
router.get("/", auditController.getLogs);

// Delete logs
router.delete("/:id", auditController.deleteLog);
router.delete("/", auditController.bulkDeleteLogs);

export default router;
