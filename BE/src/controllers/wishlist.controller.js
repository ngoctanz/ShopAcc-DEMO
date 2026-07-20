import { wishlistService } from "../services/wishlist.service.js";
import { responseUtils } from "../utils/response.util.js";

export const wishlistController = {
  async getUserWishlist(req, res, next) {
    try {
      const wishlist = await wishlistService.getUserWishlist(req.user.userId);
      return responseUtils.success(res, wishlist);
    } catch (error) {
      next(error);
    }
  },

  async addToWishlist(req, res, next) {
    try {
      const { accountId } = req.body;
      const wishlist = await wishlistService.addToWishlist(
        req.user.userId,
        accountId
      );
      return responseUtils.success(res, wishlist, "Item added to wishlist");
    } catch (error) {
      if (error.message === "Account not found") {
        return responseUtils.notFound(res, error.message);
      }
      next(error);
    }
  },

  async removeFromWishlist(req, res, next) {
    try {
      const wishlist = await wishlistService.removeFromWishlist(
        req.user.userId,
        req.params.accountId
      );
      return responseUtils.success(res, wishlist, "Item removed from wishlist");
    } catch (error) {
      if (error.message === "Wishlist not found") {
        return responseUtils.notFound(res, error.message);
      }
      next(error);
    }
  },

  async clearWishlist(req, res, next) {
    try {
      const wishlist = await wishlistService.clearWishlist(req.user.userId);
      return responseUtils.success(
        res,
        wishlist,
        "Wishlist cleared successfully"
      );
    } catch (error) {
      if (error.message === "Wishlist not found") {
        return responseUtils.notFound(res, error.message);
      }
      next(error);
    }
  },
};
