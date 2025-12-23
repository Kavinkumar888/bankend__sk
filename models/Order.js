import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    amount: Number,
    status: { type: String, default: "PENDING" },
    paymentSessionId: String,
    customer: {
      name: String,
      phone: String,
      email: String,
      address: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
