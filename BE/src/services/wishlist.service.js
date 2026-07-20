import { Wishlist } from "../models/wishlist.model.js";
import { Account } from "../models/account.model.js";

export const wishlistService = {
  async getUserWishlist(userId) {
    let wishlist = await Wishlist.findOne({ userId }).populate({
      path: "items.accountId",
      populate: { path: "packageId", populate: { path: "typeId" } },
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ userId, items: [] });
    }

    // Filter out items where the account document no longer exists (deleted from DB)
    const validItems = wishlist.items.filter((item) => item.accountId);

    if (validItems.length !== wishlist.items.length) {
      wishlist.items = validItems;
      await wishlist.save();
    }

    return wishlist;
  },

  async addToWishlist(userId, accountId) {
    const account = await Account.findById(accountId);
    if (!account) {
      throw new Error("Account not found");
    }

    let wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      wishlist = await Wishlist.create({ userId, items: [] });
    }

    await wishlist.addItem(accountId);

    return await Wishlist.findById(wishlist._id).populate({
      path: "items.accountId",
      populate: { path: "packageId", populate: { path: "typeId" } },
    });
  },

  async removeFromWishlist(userId, accountId) {
    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      throw new Error("Wishlist not found");
    }

    await wishlist.removeItem(accountId);

    return await Wishlist.findById(wishlist._id).populate({
      path: "items.accountId",
      populate: { path: "packageId", populate: { path: "typeId" } },
    });
  },

  async clearWishlist(userId) {
    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      throw new Error("Wishlist not found");
    }

    await wishlist.clearWishlist();

    return wishlist;
  },
};
