import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import paymentRoutes from "./routes/paymentRoutes.js";

dotenv.config();

const app = express();

/* Middleware */
app.use(cors({ origin: "*" }));
app.use(express.json());

/* MongoDB */
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error", err));

/* Routes */
app.use("/api/payment", paymentRoutes);

app.get("/", (req, res) => {
  res.send("Cashfree + MongoDB Backend Running ✅");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
