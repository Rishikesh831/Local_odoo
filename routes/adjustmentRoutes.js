import express from "express";
import {
  createAdjustment
} from "../controllers/adjustmentController.js";

const router = express.Router();

router.post("/", createAdjustment);

export default router;
