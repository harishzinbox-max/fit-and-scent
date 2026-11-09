import type { Occasion } from "../types";

export interface ImageEditSpec {
  occasion: Occasion;
  clothingDescription: string;
  hairstyleDescription?: string;
  footwearDescription?: string;
  accessoryDescription?: string;
  forbiddenItems: string[];
  changeHair: boolean;
  changeClothing: boolean;
}