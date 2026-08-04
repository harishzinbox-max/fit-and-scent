import type { SavedLook } from "./types";
import { supabase } from "./supabaseClient";

const STORAGE_KEY = "fitandscent_wardrobe";
const MAX_LOOKS = 12;

// ---------- localStorage fallback (used when signed out) ----------

function getLocalLooks(): SavedLook[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedLook[]) : [];
  } catch {
    return [];
  }
}

function setLocalLooks(looks: SavedLook[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(looks));
  } catch {
    const trimmed = looks.slice(0, Math.max(1, Math.floor(looks.length / 2)));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
      // give up silently rather than crash the generate flow
    }
  }
}

// ---------- Supabase-backed storage (used when signed in) ----------

function rowToLook(row: { id: string; created_at: string; look_data: Omit<SavedLook, "id" | "createdAt"> }): SavedLook {
  return {
    id: row.id,
    createdAt: new Date(row.created_at).getTime(),
    ...row.look_data,
  };
}

export async function getSavedLooks(): Promise<SavedLook[]> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return getLocalLooks();
  }

  const { data, error } = await supabase
    .from("wardrobe_looks")
    .select("id, created_at, look_data")
    .order("created_at", { ascending: false })
    .limit(MAX_LOOKS);

  if (error || !data) {
    console.error("Failed to fetch wardrobe looks:", JSON.stringify(error, null, 2));
    return [];
  }

  return data.map(rowToLook);
}

export async function saveLook(look: Omit<SavedLook, "id" | "createdAt">): Promise<SavedLook> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const existing = getLocalLooks();
    const newLook: SavedLook = {
      ...look,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setLocalLooks([newLook, ...existing].slice(0, MAX_LOOKS));
    return newLook;
  }

  const { data, error } = await supabase
    .from("wardrobe_looks")
    .insert({ user_id: user.id, look_data: look })
    .select("id, created_at, look_data")
    .single();

  if (error || !data) {
    console.error("Failed to save wardrobe look:", error);
    throw error;
  }

  return rowToLook(data);
}

export async function deleteLook(id: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    setLocalLooks(getLocalLooks().filter((look) => look.id !== id));
    return;
  }

  const { error } = await supabase.from("wardrobe_looks").delete().eq("id", id);
  if (error) {
    console.error("Failed to delete wardrobe look:", error);
  }
}