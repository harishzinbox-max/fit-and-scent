import type { SavedLook } from "./types";

const STORAGE_KEY = "fitandscent_wardrobe";
const MAX_LOOKS = 12;

export function getSavedLooks(): SavedLook[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedLook[]) : [];
  } catch {
    return [];
  }
}

export function saveLook(look: Omit<SavedLook, "id" | "createdAt">): SavedLook {
  const existing = getSavedLooks();
  const newLook: SavedLook = {
    ...look,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
  const updated = [newLook, ...existing].slice(0, MAX_LOOKS);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Likely hit localStorage's size quota — drop older entries and retry once.
    const trimmed = updated.slice(0, Math.max(1, Math.floor(updated.length / 2)));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
      // Give up silently rather than crash the generate flow.
    }
  }

  return newLook;
}

export function deleteLook(id: string): void {
  const remaining = getSavedLooks().filter((look) => look.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
  } catch {
    // no-op
  }
}