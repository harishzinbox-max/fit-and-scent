import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

const PACK_AMOUNT_PAISE = 19900; // ₹199, in paise (Razorpay uses the smallest currency unit)
const PACK_CREDITS = 5;

export async function POST(req: NextRequest) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return NextResponse.json({ error: "Server is missing Razorpay keys." }, { status: 500 });
  }

  try {
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const order = await razorpay.orders.create({
      amount: PACK_AMOUNT_PAISE,
      currency: "INR",
      receipt: `credits_${Date.now()}`,
      notes: { credits: String(PACK_CREDITS) },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create order." },
      { status: 500 }
    );
  }
}