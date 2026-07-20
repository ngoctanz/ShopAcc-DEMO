
import { dashboardService } from "../services/dashboard.service.js";
import { responseUtils } from "../utils/response.util.js";

export const dashboardController = {
  async getDashboardStats(req, res, next) {
    try {
      const stats = await dashboardService.getDashboardStats();
      return responseUtils.success(res, stats);
    } catch (error) {
      next(error);
    }
  }
};
