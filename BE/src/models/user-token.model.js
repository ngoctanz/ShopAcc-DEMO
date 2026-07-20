import mongoose from "mongoose";

const { Schema } = mongoose;

const userTokenSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    refreshToken: {
      type: String,
      required: [true, "Refresh token is required"],
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: [true, "Expiration date is required"],
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

userTokenSchema.index({ userId: 1, isRevoked: 1 });
userTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

userTokenSchema.statics.cleanExpiredTokens = async function () {
  const now = new Date();
  const result = await this.deleteMany({ expiresAt: { $lt: now } });
  return result.deletedCount;
};

userTokenSchema.statics.revokeAllForUser = async function (userId) {
  return await this.updateMany(
    { userId, isRevoked: false },
    { isRevoked: true }
  );
};

export const UserToken = mongoose.model("UserToken", userTokenSchema);
