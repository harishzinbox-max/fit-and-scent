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

  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  const { data: existing, error: fetchError } = await supabaseAdmin
    .from("user_credits")
    .select("purchased_credits")
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchError) {
    console.error("verify-payment fetchError:", JSON.stringify(fetchError));
    return NextResponse.json(
      { error: "Failed to fetch account.", detail: fetchError.message, code: fetchError.code, hint: fetchError.hint },
      { status: 500 }
    );
  }

  const currentCredits = existing?.purchased_credits ?? 0;

  const { error: updateError } = await supabaseAdmin
    .from("user_credits")
    .upsert({ user_id: userId, purchased_credits: currentCredits + PACK_CREDITS, updated_at: new Date().toISOString() });

  if (updateError) {
    console.error("verify-payment updateError:", JSON.stringify(updateError));
    return NextResponse.json(
      { error: "Payment verified but failed to credit account. Contact support.", detail: updateError.message, code: updateError.code },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, newCredits: currentCredits + PACK_CREDITS });
}
