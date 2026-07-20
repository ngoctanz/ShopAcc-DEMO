import mongoose from "mongoose";

const { Schema } = mongoose;

const wishlistItemSchema = new Schema(
  {
    accountId: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: [true, "Account ID is required"],
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const wishlistSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      unique: true,
      index: true,
    },
    items: [wishlistItemSchema],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Index for faster queries
wishlistSchema.index({ "items.accountId": 1 });

// Virtual for total items count
wishlistSchema.virtual("itemCount").get(function () {
  return this.items.length;
});

// Instance method to add item
wishlistSchema.methods.addItem = async function (accountId) {
  const exists = this.items.some(
    (item) => item.accountId.toString() === accountId.toString()
  );
  if (!exists) {
    this.items.push({ accountId });
    await this.save();
  }
  return this;
};

// Instance method to remove item
wishlistSchema.methods.removeItem = async function (accountId) {
  this.items = this.items.filter(
    (item) => item.accountId.toString() !== accountId.toString()
  );
  await this.save();
  return this;
};

// Instance method to clear wishlist
wishlistSchema.methods.clearWishlist = async function () {
  this.items = [];
  await this.save();
  return this;
};

// Ensure virtuals are included in JSON
wishlistSchema.set("toJSON", { virtuals: true });
wishlistSchema.set("toObject", { virtuals: true });

export const Wishlist = mongoose.model("Wishlist", wishlistSchema);
