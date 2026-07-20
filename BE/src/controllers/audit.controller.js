import { auditService } from "../services/audit.service.js";
import { responseUtils } from "../utils/response.util.js";
import { paginationUtils } from "../utils/pagination.util.js";

export const auditController = {
  /**
   * Get all audit logs
   * GET /logs
   */
  async getLogs(req, res, next) {
    try {
      const { logs, total, page, limit } = await auditService.getAllLogs(req.query);
      const meta = paginationUtils.createPaginationMeta(page, limit, total);
      return responseUtils.success(res, { logs, meta });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete a log by ID
   * DELETE /logs/:id
   */
  async deleteLog(req, res, next) {
    try {
      await auditService.deleteLog(req.params.id);
      return responseUtils.success(res, null, "Log deleted successfully");
    } catch (error) {
      if (error.message === "Log not found") {
        return responseUtils.notFound(res, error.message);
      }
      next(error);
    }
  },

  /**
   * Bulk delete logs
   * DELETE /logs
   */
  async bulkDeleteLogs(req, res, next) {
    try {
      const { ids } = req.body;
      const result = await auditService.bulkDeleteLogs(ids);
      return responseUtils.success(
        res,
        result,
        `Deleted ${result.deletedCount} log(s) successfully`
      );
    } catch (error) {
      if (error.message.includes("must be a non-empty array")) {
        return responseUtils.badRequest(res, error.message);
      }
      next(error);
    }
  },
};
