import express from "express";
import {
  getAllDeliveries,
  getDeliveryById,
  createDelivery,
  addDeliveryItem,
  validateDelivery
} from "../controllers/deliveryController.js";

const router = express.Router();

router.get("/", getAllDeliveries);
router.get("/:deliveryId", getDeliveryById);
router.post("/", createDelivery);
router.post("/:deliveryId/item", addDeliveryItem);
router.post("/:deliveryId/validate", validateDelivery);

export default router;
