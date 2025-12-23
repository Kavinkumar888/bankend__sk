import express from "express";
import axios from "axios";
import Order from "../models/Order.js";

const router = express.Router();

/* CREATE ORDER */
router.post("/create-order", async (req, res) => {
  try {
    const { amount, customer } = req.body;
    const orderId = "ORDER_" + Date.now();

    const response = await axios.post(
      `${process.env.CASHFREE_BASE_URL}/orders`,
      {
        order_id: orderId,
        order_amount: amount,
        order_currency: "INR",
        customer_details: {
          customer_id: "CUST_" + Date.now(),
          customer_name: customer.name,
          customer_phone: customer.phone,
          customer_email: customer.email,
        },
        order_meta: {
          return_url:
            "http://localhost:5173/payment-success?order_id={order_id}",
        },
      },
      {
        headers: {
          "x-api-version": "2023-08-01",
          "x-client-id": process.env.CASHFREE_APP_ID,
          "x-client-secret": process.env.CASHFREE_SECRET_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    await Order.create({
      orderId,
      amount,
      customer,
      paymentSessionId: response.data.payment_session_id,
      status: "PENDING",
    });

    res.json({
      payment_session_id: response.data.payment_session_id,
    });
  } catch (err) {
    console.error("❌ Cashfree Error:", err.response?.data || err.message);
    res.status(500).json({ error: "Order creation failed" });
  }
});

/* MARK SUCCESS */
router.post("/mark-success", async (req, res) => {
  const { orderId } = req.body;
  await Order.findOneAndUpdate({ orderId }, { status: "SUCCESS" });
  res.json({ message: "Order updated" });
});

export default router;
