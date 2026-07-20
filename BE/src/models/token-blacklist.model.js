import mongoose from "mongoose";

const { Schema } = mongoose;

const tokenBlacklistSchema = new Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    reason: {
      type: String,
      enum: [
        "logout",
        "password_change",
        "admin_revoke",
        "suspicious_activity",
      ],
      default: "logout",
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

tokenBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const TokenBlacklist = mongoose.model(
  "TokenBlacklist",
  tokenBlacklistSchema
);
