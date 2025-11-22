import express from "express";
import {
  createReceipt,
  addReceiptItem,
  validateReceipt
} from "../controllers/receiptController.js";

const router = express.Router();

router.post("/", createReceipt);
router.post("/:receiptId/item", addReceiptItem);
router.post("/:receiptId/validate", validateReceipt);

export default router;
