import { Order } from "../models/order.model.js";
import { paginationUtils } from "../utils/pagination.util.js";

export const orderService = {
  // Get user's orders (list view - NO credentials)
  async getUserOrders(query, userId, userRole) {
    const { page, limit, skip } = paginationUtils.getPaginationParams(query);

    const filter = {};

    // Users can only see their own orders
    if (userRole !== "admin") {
      filter.userId = userId;
    } else if (query.userId) {
      filter.userId = query.userId;
    }

    if (query.status) filter.status = query.status;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .select("-accountCredentials") // NEVER expose credentials in list
        .populate("userId", "name email")
        .populate({
          path: "accountId",
          select: "code accountInfo images coverImage packageId price",
          populate: {
            path: "packageId",
            select: "title slug image mode typeId",
            populate: { path: "typeId", select: "name slug" },
          },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter),
    ]);

    const meta = paginationUtils.createPaginationMeta(page, limit, total);

    return { orders, meta };
  },

  // Get single order - WITHOUT credentials (for order detail view)
  async getOrderById(orderId, userId, userRole) {
    const order = await Order.findById(orderId)
      .select("-accountCredentials") // Don't expose credentials here
      .populate("userId", "name email")
      .populate({
        path: "accountId",
        select: "code accountInfo images coverImage packageId price featuredSkins",
        populate: {
          path: "packageId",
          select: "title slug image mode typeId",
          populate: { path: "typeId", select: "name slug" },
        },
      });

    if (!order) {
      throw new Error("Order not found");
    }

    // SECURITY: Only owner or admin can view order details
    const isOwner = order.userId._id.toString() === userId.toString();
    const isAdmin = userRole === "admin";

    if (!isOwner && !isAdmin) {
      throw new Error("Unauthorized access");
    }

    return order;
  },

  // Get credentials ONLY (separate API for security)
  async getOrderCredentials(orderId, userId, userRole) {
    const order = await Order.findById(orderId).select("accountCredentials userId");
    if (!order) throw new Error("Order not found");

    const isOwner = order.userId.toString() === userId.toString();
    const isAdmin = userRole === "admin";

    if (!isOwner && !isAdmin) throw new Error("Unauthorized access");

    return order.accountCredentials;
  },

  // Get order WITHOUT credentials (for public references)
  async getOrderByIdPublic(orderId) {
    const order = await Order.findById(orderId)
      .select("-accountCredentials")
      .populate({
        path: "accountId",
        select: "code accountInfo images coverImage packageId price",
        populate: {
          path: "packageId",
          select: "title slug image mode typeId",
          populate: { path: "typeId", select: "name slug" },
        },
      });

    if (!order) {
      throw new Error("Order not found");
    }

    return order;
  },

  // Delete order (Admin)
  async deleteOrder(orderId) {
    const order = await Order.findByIdAndDelete(orderId);
    if (!order) {
      throw new Error("Order not found");
    }
    return order;
  },

  // Bulk delete orders (Admin)
  async bulkDeleteOrders(orderIds) {
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      throw new Error("Order IDs must be a non-empty array");
    }
    const result = await Order.deleteMany({ _id: { $in: orderIds } });
    return { deletedCount: result.deletedCount };
  },

  // Get recent purchases for banner ticker (public, masked data)
  async getRecentPurchases(limit = 20) {
    const orders = await Order.find({ status: "completed" })
      .select("userId price createdAt")
      .populate("userId", "name")
      .populate({
        path: "accountId",
        select: "code packageId",
        populate: {
          path: "packageId",
          select: "title",
        },
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Transform data: mask username, get package title
    return orders.map((order) => {
      let maskedName = "User***";
      if (order.userId?.name) {
        const name = order.userId.name;
        if (name.length > 4) {
          maskedName = name.substring(0, 2) + "***" + name.substring(name.length - 2);
        } else if (name.length > 2) {
          maskedName = name[0] + "***" + name[name.length - 1];
        } else {
          maskedName = name + "***";
        }
      }

      const packageTitle = order.accountId?.packageId?.title || "Tài khoản VIP";
      const accountCode = order.accountId?.code || "";

      return {
        userName: maskedName,
        description: accountCode ? `${packageTitle} #${accountCode}` : packageTitle,
        price: order.price,
        createdAt: order.createdAt,
      };
    });
  },
};
