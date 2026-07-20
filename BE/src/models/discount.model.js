import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * Discount Model
 * Mã giảm giá áp dụng cho các gói account-package
 */
const discountSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    discountPercent: {
      type: Number,
      required: [true, "Discount percent is required"],
      min: [0, "Discount percent cannot be negative"],
      max: [100, "Discount percent cannot exceed 100"],
    },
    // Danh sách các account-package áp dụng giảm giá
    applicablePackages: [
      {
        type: Schema.Types.ObjectId,
        ref: "AccountPackage",
      },
    ],
    // Thời gian kết thúc
    endDate: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes
discountSchema.index({ isActive: 1, endDate: 1 });
discountSchema.index({ applicablePackages: 1 });

// Pre-save hook: Auto set isActive = false if expired
discountSchema.pre("save", function (next) {
  const now = new Date();
  
  // If endDate is set and has passed, set isActive to false
  if (this.endDate && this.endDate < now) {
    this.isActive = false;
  }
  
  next();
});

// Virtuals
discountSchema.virtual("isValid").get(function () {
  const now = new Date();
  const isNotExpired = !this.endDate || this.endDate >= now;
  return this.isActive && isNotExpired;
});

discountSchema.set("toJSON", { virtuals: true });
discountSchema.set("toObject", { virtuals: true });

export const Discount = mongoose.model("Discount", discountSchema);
