import express from "express";
import { wishlistController } from "../controllers/wishlist.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authenticate, wishlistController.getUserWishlist);

router.post("/items", authenticate, wishlistController.addToWishlist);

router.delete(
  "/items/:accountId",
  authenticate,
  wishlistController.removeFromWishlist
);

router.delete("/clear", authenticate, wishlistController.clearWishlist);

export default router;
