import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * AccountPackage Model
 * Gói sản phẩm: "Acc Rank Bạc", "Túi Mù 29K"
 */
const accountPackageSchema = new Schema(
  {
    typeId: {
      type: Schema.Types.ObjectId,
      ref: "AccountType",
      required: [true, "Type is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },
    mode: {
      type: String,
      required: true,
      enum: ["LIST", "RANDOM", "CLONE"],
      default: "LIST",
    },
    // Giá bán (dùng cho RANDOM mode - LIST và CLONE không cần)
    price: {
      type: Number,
      default: null,
      min: [1, "Price must be at least 1"],
      set: (val) => (val && val > 0 ? Math.round(val) : null), // Return null for empty/0 values
    },
    discountPrice: {
      type: Number,
      default: null,
      min: [1, "Discount price must be at least 1"],
      set: (val) => (val && val > 0 ? Math.round(val) : null), // Return null for empty/0 values
    },
    // Price range để filter accounts (admin tùy chỉnh tỉ lệ)
    priceRange: {
      min: { type: Number, default: null },
      max: { type: Number, default: null },
    },
    image: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    order: {
      type: Number,
      default: 0,
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
accountPackageSchema.index({ typeId: 1, isActive: 1 });
accountPackageSchema.index({ order: 1 });

// Virtuals
accountPackageSchema.virtual("hasDiscount").get(function () {
  return this.discountPrice && this.discountPrice < this.price;
});

accountPackageSchema.virtual("finalPrice").get(function () {
  return this.discountPrice || this.price;
});

accountPackageSchema.set("toJSON", { virtuals: true });
accountPackageSchema.set("toObject", { virtuals: true });

// Auto generate slug
accountPackageSchema.pre("save", function (next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

// Validation
accountPackageSchema.pre("save", function (next) {
  // Price is required for RANDOM mode only (CLONE is like LIST - price per account)
  if (this.mode === "RANDOM" && !this.price) {
    return next(new Error("Price is required for RANDOM mode"));
  }
  if (this.discountPrice && this.discountPrice > this.price) {
    return next(new Error("Discount price must be less than or equal to price"));
  }
  if (this.priceRange?.min != null && this.priceRange?.max != null) {
    if (this.priceRange.min > this.priceRange.max) {
      return next(new Error("priceRange.min cannot be greater than max"));
    }
  }
  next();
});

export const AccountPackage = mongoose.model(
  "AccountPackage",
  accountPackageSchema
);
