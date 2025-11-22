import express from "express";
import { getDetailedStock, getLocationsByWarehouse, createStock } from "../controllers/stockController.js";

const router = express.Router();

router.get("/detailed", getDetailedStock);
router.get("/locations/:warehouseId", getLocationsByWarehouse);
router.post("/", createStock);

export default router;
