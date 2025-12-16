import express from "express";
import axios from "axios";
import crypto from "crypto";

const router = express.Router();

/* ---------------- CREATE ORDER ---------------- */
router.post("/create-order", async (req, res) => {
  const { amount, customer } = req.body;

  try {
    const response = await axios.post(
      `${process.env.CASHFREE_BASE_URL}/pg/orders`,
      {
        order_id: "ORDER_" + Date.now(),
        order_amount: Math.round(Number(amount)),
        order_currency: "INR",
        customer_details: {
          customer_id: "CUST_" + Date.now(),
          customer_name: customer.name,
          customer_phone: customer.phone,
          customer_email: customer.email || "test@gmail.com",
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

    res.json(response.data);
  } catch (err) {
    console.error("CREATE ORDER ERROR:", err.response?.data || err.message);
    res.status(500).json({ error: "Order creation failed" });
  }
});

/* ---------------- WEBHOOK VERIFICATION ---------------- */
router.post("/webhook", express.json({ verify: rawBodySaver }), (req, res) => {
  try {
    const signature = req.headers["x-webhook-signature"];
    const timestamp = req.headers["x-webhook-timestamp"];

    const rawBody = req.rawBody;
    const secret = process.env.CASHFREE_WEBHOOK_SECRET;

    // Create expected signature
    const payload = timestamp + rawBody;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("base64");

    if (expectedSignature !== signature) {
      console.error("❌ Invalid Webhook Signature");
      return res.status(400).send("Invalid signature");
    }

    // ✅ VERIFIED WEBHOOK
    const event = req.body;

    console.log("✅ WEBHOOK VERIFIED");
    console.log("EVENT:", event.type);
    console.log("ORDER:", event.data.order.order_id);
    console.log("STATUS:", event.data.payment.payment_status);

    // 🔥 IMPORTANT DATA
    const orderId = event.data.order.order_id;
    const paymentStatus = event.data.payment.payment_status;

    /*
      payment_status values:
      - SUCCESS
      - FAILED
      - PENDING
    */

    // TODO:
    // 1️⃣ Save order in DB
    // 2️⃣ Update order status
    // 3️⃣ Send email / invoice

    res.status(200).send("Webhook processed");
  } catch (err) {
    console.error("WEBHOOK ERROR:", err.message);
    res.status(500).send("Webhook error");
  }
});

/* -------- RAW BODY HELPER (IMPORTANT) -------- */
function rawBodySaver(req, res, buf) {
  req.rawBody = buf.toString();
}

export default router;
