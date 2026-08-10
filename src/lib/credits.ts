import { supabase } from "./supabaseClient";

export interface CreditStatus {
  freeTryUsed: boolean;
  purchasedCredits: number;
}

export async function getCreditStatus(): Promise<CreditStatus | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("user_credits")
    .select("free_try_used, purchased_credits")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch credit status:", error);
    return null;
  }

  if (!data) {
    // First time we've seen this user — create their credit row.
    const { error: insertError } = await supabase
      .from("user_credits")
      .insert({ user_id: user.id });
    if (insertError) {
      console.error("Failed to create credit row:", insertError);
      return null;
    }
    return { freeTryUsed: false, purchasedCredits: 0 };
  }

  return { freeTryUsed: data.free_try_used, purchasedCredits: data.purchased_credits };
}

export async function consumeCredit(status: CreditStatus): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  if (!status.freeTryUsed) {
    const { error } = await supabase
      .from("user_credits")
      .update({ free_try_used: true, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);
    return !error;
  }

  if (status.purchasedCredits > 0) {
    const { error } = await supabase
      .from("user_credits")
      .update({ purchased_credits: status.purchasedCredits - 1, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);
    return !error;
  }

  return false;
}