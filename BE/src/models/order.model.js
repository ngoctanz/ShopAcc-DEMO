import mongoose from "mongoose";

const { Schema } = mongoose;

const orderSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    accountId: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: [true, "Account ID is required"],
      index: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    status: {
      type: String,
      enum: ["completed", "cancelled", "refunded"],
      default: "completed",
      index: true,
    },
    // Batch ID for grouping bulk purchases
    batchId: {
      type: String,
      default: null,
      index: true,
    },
    // SENSITIVE - Only owner can view
    accountCredentials: {
      username: {
        type: String,
        trim: true,
        required: [true, "Account username is required"],
      },
      password: {
        type: String,
        required: [true, "Account password is required"],
      },
      additionalInfo: {
        type: String,
        trim: true,
        default: null,
      },
    },
    // Snapshot data - populated when account is deleted
    accountSnapshot: {
      code: { type: String, default: null },
      packageTitle: { type: String, default: null },
      image: { type: String, default: null },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Compound indexes for common queries
orderSchema.index({ userId: 1, status: 1 });
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ batchId: 1, createdAt: -1 });

export const Order = mongoose.model("Order", orderSchema);
