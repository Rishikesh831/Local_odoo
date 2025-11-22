import express from "express";
import {
  createDelivery,
  addDeliveryItem,
  validateDelivery
} from "../controllers/deliveryController.js";

const router = express.Router();

router.post("/", createDelivery);
router.post("/:deliveryId/item", addDeliveryItem);
router.post("/:deliveryId/validate", validateDelivery);

export default router;
