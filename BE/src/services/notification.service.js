import { Notification } from "../models/notification.model.js";
import { paginationUtils } from "../utils/pagination.util.js";

export const notificationService = {
  async getNotifications(query) {
    const { page, limit, skip } = paginationUtils.getPaginationParams(query);

    const filter = {};
    if (query.type) filter.type = query.type;

    const [notifications, total] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Notification.countDocuments(filter),
    ]);

    const meta = paginationUtils.createPaginationMeta(page, limit, total);

    return { notifications, meta };
  },

  async getNotificationById(notificationId) {
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      throw new Error("Notification not found");
    }

    return notification;
  },

  async getLatestNotification() {
    return Notification.findOne().sort({ createdAt: -1 });
  },

  async createNotification(data) {
    const notification = await Notification.create(data);
    return notification;
  },

  async updateNotification(id, data) {
    const notification = await Notification.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!notification) {
      throw new Error("Notification not found");
    }
    return notification;
  },

  async deleteNotification(id) {
    const notification = await Notification.findByIdAndDelete(id);
    if (!notification) {
      throw new Error("Notification not found");
    }
    return notification;
  },

  async bulkDeleteNotifications(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error("Notification IDs must be a non-empty array");
    }
    const result = await Notification.deleteMany({ _id: { $in: ids } });
    return { deletedCount: result.deletedCount };
  },
};
