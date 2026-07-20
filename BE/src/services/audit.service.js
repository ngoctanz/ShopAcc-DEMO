import { AuditLog } from "../models/audit-log.model.js";

// Helper to get real client IP (handles proxies)
const getClientIp = (req) => {
  let ip;

  // Check X-Forwarded-For header (common for proxies/load balancers)
  const forwardedFor = req.headers?.["x-forwarded-for"];
  if (forwardedFor) {
    // X-Forwarded-For can contain multiple IPs, first one is the client
    const ips = forwardedFor.split(",").map((ip) => ip.trim());
    ip = ips[0];
  }

  // Check X-Real-IP header (nginx)
  if (!ip) {
    ip = req.headers?.["x-real-ip"];
  }

  // Check CF-Connecting-IP (Cloudflare)
  if (!ip) {
    ip = req.headers?.["cf-connecting-ip"];
  }

  // Fallback to req.ip or socket address
  if (!ip) {
    ip = req.ip || req.socket?.remoteAddress || req.connection?.remoteAddress || "unknown";
  }

  // Clean up IPv6-mapped IPv4 addresses (::ffff:192.168.1.1 -> 192.168.1.1)
  if (ip && ip.startsWith("::ffff:")) {
    ip = ip.substring(7);
  }

  // Convert localhost IPv6 to readable format
  if (ip === "::1") {
    ip = "127.0.0.1";
  }

  return ip;
};

export const auditService = {
  async log(req, action, options = {}) {
    try {
      const logData = {
        userId: req.user?.userId || options.userId || null,
        action,
        resource: options.resource || null,
        resourceId: options.resourceId || null,
        details: options.details || {},
        ip: getClientIp(req),
        userAgent: req.headers?.["user-agent"] || null,
        requestId: req.requestId || null,
        status: options.status || "success",
      };

      await AuditLog.create(logData);
    } catch (error) {
      console.error("Failed to create audit log:", error);
    }
  },

  // Quick helpers for important actions only
  async logRegister(req, userId) {
    await this.log(req, "REGISTER", {
      userId,
      details: { email: req.body?.email },
    });
  },

  async logPasswordChange(req) {
    await this.log(req, "PASSWORD_CHANGE");
  },

  async logPurchase(req, orderId, accountId, amount) {
    await this.log(req, "PURCHASE", {
      resource: "Order",
      resourceId: orderId,
      details: { accountId, amount },
    });
  },

  async logCredentialAccess(req, orderId) {
    await this.log(req, "CREDENTIAL_ACCESS", {
      resource: "Order",
      resourceId: orderId,
    });
  },

  async logSuspiciousActivity(req, reason, details = {}) {
    await this.log(req, "SUSPICIOUS_ACTIVITY", {
      status: "warning",
      details: { reason, ...details },
    });
  },

  async logBalanceUpdate(req, targetUserId, targetUserName, amount, action, reason) {
    await this.log(req, "BALANCE_UPDATE", {
      resource: "User",
      resourceId: targetUserId,
      details: { targetUser: targetUserName, amount, action, reason },
    });
  },

  /**
   * Get all logs
   */
  async getAllLogs(query) {
    return this.getRecentLogs(query);
  },

  // Internal helper: Get logs with filter
  async getRecentLogs(query = {}) {
    const { page = 1, limit = 50, action, userId, status } = query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (action) filter.action = action;
    if (userId) filter.userId = userId;
    if (status) filter.status = status;

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      AuditLog.countDocuments(filter),
    ]);

    return { logs, total, page, limit };
  },

  /**
   * Delete a log by ID
   */
  async deleteLog(logId) {
    const log = await AuditLog.findByIdAndDelete(logId);
    if (!log) {
      throw new Error("Log not found");
    }
    return log;
  },

  /**
   * Bulk delete logs
   */
  async bulkDeleteLogs(logIds) {
    if (!Array.isArray(logIds) || logIds.length === 0) {
      throw new Error("Log IDs must be a non-empty array");
    }

    const result = await AuditLog.deleteMany({ _id: { $in: logIds } });
    return { deletedCount: result.deletedCount };
  },
};
