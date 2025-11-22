import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authroutes.js";
import productRoutes from "./routes/productRoutes.js";
import receiptRoutes from "./routes/receiptRoutes.js";
import deliveryRoutes from "./routes/deliveryRoutes.js";
import transferRoutes from "./routes/transferRoutes.js";
import adjustmentRoutes from "./routes/adjustmentRoutes.js";
import warehouseRoutes from "./routes/warehouseRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import stockRoutes from "./routes/stockRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Logging middleware to see incoming requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/receipts", receiptRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/transfers", transferRoutes);
app.use("/api/adjustments", adjustmentRoutes);
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/moves", moveHistoryRoutes);

app.use("/api/stock", stockRoutes);
  res.send("IMS Backend Running...");

app.listen(process.env.PORT || 5000, () => {
  console.log("Server running on port", process.env.PORT || 5000);
  console.log("Registered routes:");
  console.log("- /api/auth");
  console.log("- /api/products");
  console.log("- /api/receipts");
  console.log("- /api/deliveries");
  console.log("- /api/transfers");
  console.log("- /api/adjustments");
  console.log("- /api/warehouses");
  console.log("- /api/inventory");
  console.log("- /api/moves");
});
