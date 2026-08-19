import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const PACK_CREDITS = 5;

export async function POST(req: NextRequest) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!keySecret || !supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: "Server is missing required keys." }, { status: 500 });
  }

  let body: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    userId: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId } = body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !userId) {
    return NextResponse.json({ error: "Missing payment details." }, { status: 400 });
  }

  // Verify the payment signature — this proves the payment actually happened
  // and wasn't faked by someone calling this route directly with made-up IDs.
  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
  }

  // Signature is valid — credit the user's account using the service role
  // key, which bypasses RLS since this is a trusted server-side operation.
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  const { data: existing, error: fetchError } = await supabaseAdmin
    .from("user_credits")
    .select("purchased_credits")
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json({ error: "Failed to fetch account." }, { status: 500 });
  }

  const currentCredits = existing?.purchased_credits ?? 0;

  const { error: updateError } = await supabaseAdmin
    .from("user_credits")
    .upsert({ user_id: userId, purchased_credits: currentCredits + PACK_CREDITS, updated_at: new Date().toISOString() });

  if (updateError) {
    return NextResponse.json({ error: "Payment verified but failed to credit account. Contact support." }, { status: 500 });
  }

  return NextResponse.json({ success: true, newCredits: currentCredits + PACK_CREDITS });
}