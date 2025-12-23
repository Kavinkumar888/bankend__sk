import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import paymentRoutes from "./routes/paymentRoutes.js";

dotenv.config();

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error", err));

app.use("/api/payment", paymentRoutes);

app.get("/", (req, res) => {
  res.send("Cashfree Sandbox Backend Running ✅");
});

app.listen(process.env.PORT || 5000, () =>
  console.log("🚀 Server running")
);
