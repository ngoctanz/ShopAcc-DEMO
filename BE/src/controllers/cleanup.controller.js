import { runCleanupManually, isCleanupRunning } from "../services/cleanup.service.js";
import { getSchedulerStatus } from "../services/scheduler.service.js";
import { responseUtils } from "../utils/response.util.js";

export const cleanupController = {
  /**
   * Get scheduler status
   * GET /cleanup/status
   */
  async getStatus(req, res, next) {
    try {
      const status = getSchedulerStatus();
      status.isRunning = isCleanupRunning();
      return responseUtils.success(res, status);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Manually trigger cleanup (Admin only)
   * POST /cleanup/run
   */
  async runCleanup(req, res, next) {
    try {
      // Check if already running
      if (isCleanupRunning()) {
        return responseUtils.badRequest(res, "Cleanup job is already running");
      }
      
      console.log(`[Cleanup] Manual trigger by admin: ${req.user.userId}`);
      
      // Run cleanup in background, return immediately
      runCleanupManually()
        .then((stats) => {
          console.log("[Cleanup] Manual cleanup completed:", stats);
        })
        .catch((error) => {
          console.error("[Cleanup] Manual cleanup failed:", error);
        });

      return responseUtils.success(res, {
        message: "Cleanup job started in background",
        note: "Check server logs for progress or call GET /cleanup/status",
      });
    } catch (error) {
      next(error);
    }
  },
};
