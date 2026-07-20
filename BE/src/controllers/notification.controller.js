import { notificationService } from "../services/notification.service.js";
import { responseUtils } from "../utils/response.util.js";

export const notificationController = {
  async getNotifications(req, res, next) {
    try {
      const { notifications, meta } =
        await notificationService.getNotifications(req.query);
      return responseUtils.successWithMeta(res, notifications, meta);
    } catch (error) {
      next(error);
    }
  },

  async getNotificationById(req, res, next) {
    try {
      const notification = await notificationService.getNotificationById(
        req.params.id
      );
      return responseUtils.success(res, notification);
    } catch (error) {
      if (error.message === "Notification not found") {
        return responseUtils.notFound(res, error.message);
      }
      next(error);
    }
  },

  async getLatestNotification(req, res, next) {
    try {
      const notification = await notificationService.getLatestNotification();
      return responseUtils.success(res, notification);
    } catch (error) {
      next(error);
    }
  },

  async createNotification(req, res, next) {
    try {
      const notification = await notificationService.createNotification(req.body);
      return responseUtils.success(res, notification, "Notification created successfully", 201);
    } catch (error) {
      console.error("Create Notification Error:", error);
      next(error);
    }
  },

  async updateNotification(req, res, next) {
    try {
      const notification = await notificationService.updateNotification(
        req.params.id,
        req.body
      );
      return responseUtils.success(res, notification);
    } catch (error) {
       if (error.message === "Notification not found") {
        return responseUtils.notFound(res, error.message);
      }
      next(error);
    }
  },

  async deleteNotification(req, res, next) {
    try {
      await notificationService.deleteNotification(req.params.id);
      return responseUtils.success(res, null, "Notification deleted successfully");
    } catch (error) {
       if (error.message === "Notification not found") {
        return responseUtils.notFound(res, error.message);
      }
      next(error);
    }
  },
  async bulkDeleteNotifications(req, res, next) {
    try {
      const { ids } = req.body;
      const result = await notificationService.bulkDeleteNotifications(ids);
      return responseUtils.success(
        res, 
        result, 
        `Deleted ${result.deletedCount} notification(s) successfully`
      );
    } catch (error) {
      if (error.message.includes("must be a non-empty array")) {
        return responseUtils.badRequest(res, error.message);
      }
      next(error);
    }
  },
};
