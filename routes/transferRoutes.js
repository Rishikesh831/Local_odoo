import express from "express";
import {
  createTransfer,
  addTransferItem,
  validateTransfer
} from "../controllers/transferController.js";

const router = express.Router();

router.post("/", createTransfer);
router.post("/:transferId/item", addTransferItem);
router.post("/:transferId/validate", validateTransfer);

export default router;
