import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import productRoutes from "./routes/productRoutes.js";
import receiptRoutes from "./routes/receiptRoutes.js";
import deliveryRoutes from "./routes/deliveryRoutes.js";
import transferRoutes from "./routes/transferRoutes.js";
import adjustmentRoutes from "./routes/adjustmentRoutes.js";
import warehouseRoutes from "./routes/warehouseRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// ROUTES
app.use("/api/products", productRoutes);
app.use("/api/receipts", receiptRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/transfers", transferRoutes);
app.use("/api/adjustments", adjustmentRoutes);
app.use("/api/warehouses", warehouseRoutes);

app.get("/", (req, res) => {
  res.send("IMS Backend Running...");
});

app.listen(process.env.PORT || 5000, () =>
  console.log("Server running on port", process.env.PORT)
);
