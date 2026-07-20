import express from "express";
import { transactionController } from "../controllers/transaction.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authenticate, transactionController.getUserTransactions);

router.get("/:id", authenticate, transactionController.getTransactionById);

export default router;
