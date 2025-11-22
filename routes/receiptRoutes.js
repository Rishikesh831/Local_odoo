import express from "express";
import {
  createReceipt,
  addReceiptItem,
  validateReceipt,
  getAllReceipts,
  getReceiptById
} from "../controllers/receiptController.js";

const router = express.Router();

router.get("/", getAllReceipts);
router.get("/:receiptId", getReceiptById);
router.post("/", createReceipt);
router.post("/:receiptId/item", addReceiptItem);
router.post("/:receiptId/validate", validateReceipt);

export default router;
