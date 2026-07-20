import mongoose from "mongoose";

const { Schema } = mongoose;

const auditLogSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        "REGISTER",
        "PASSWORD_CHANGE",
        "PURCHASE",
        "CREDENTIAL_ACCESS",
        "SUSPICIOUS_ACTIVITY",
        "BALANCE_UPDATE",
      ],
      index: true,
    },
    resource: {
      type: String,
      default: null,
    },
    resourceId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    details: {
      type: Schema.Types.Mixed,
      default: {},
    },
    ip: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      default: null,
    },
    requestId: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["success", "failure", "warning"],
      default: "success",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ userId: 1, action: 1, createdAt: -1 });

// TTL Index - Auto delete after 7 days
auditLogSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 7 * 24 * 60 * 60 }
);

export const AuditLog = mongoose.model("AuditLog", auditLogSchema);
