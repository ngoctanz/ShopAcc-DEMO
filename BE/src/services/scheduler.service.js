import cron from "node-cron";
import { cleanupSoldAccounts } from "./cleanup.service.js";


let cleanupJob = null;

/**
 * Initialize all scheduled jobs
 */
export const initScheduler = () => {
  console.log("[Scheduler] Initializing scheduled jobs...");

  cleanupJob = cron.schedule("0 3 1 * *", async () => {
    console.log("[Scheduler] Running monthly cleanup job...");
    try {
      const stats = await cleanupSoldAccounts();
      console.log("[Scheduler] Cleanup job completed:", stats);
    } catch (error) {
      console.error("[Scheduler] Cleanup job failed:", error);
    }
  }, {
    scheduled: true,
    timezone: "Asia/Ho_Chi_Minh", // Vietnam timezone
  });

  console.log("[Scheduler] Cleanup job scheduled: 1st of every month at 3:00 AM (Asia/Ho_Chi_Minh)");
};

/**
 * Stop all scheduled jobs (for graceful shutdown)
 */
export const stopScheduler = () => {
  if (cleanupJob) {
    cleanupJob.stop();
    console.log("[Scheduler] Cleanup job stopped");
  }
};

/**
 * Get scheduler status
 */
export const getSchedulerStatus = () => {
  return {
    cleanup: {
      running: cleanupJob?.running ?? false,
      nextRun: getNextFirstOfMonth(),
    },
  };
};

/**
 * Helper: Get next 1st of month at 3AM
 */
const getNextFirstOfMonth = () => {
  const now = new Date();
  const nextFirst = new Date(now.getFullYear(), now.getMonth() + 1, 1, 3, 0, 0, 0);

  // If today is 1st and before 3AM, use today
  if (now.getDate() === 1 && now.getHours() < 3) {
    return new Date(now.getFullYear(), now.getMonth(), 1, 3, 0, 0, 0).toISOString();
  }

  return nextFirst.toISOString();
};

export default {
  initScheduler,
  stopScheduler,
  getSchedulerStatus,
};
