export interface HairstyleOption {
  value: string;
  label: string;
  icon: string;
}

// `value` doubles as the style phrase used directly in prompts/reasoning,
// so keep it lowercase and descriptive rather than a short label.
export const WOMEN_HAIRSTYLE_OPTIONS: HairstyleOption[] = [
  { value: "long layers with movement", label: "Long layers", icon: "long-layers" },
  { value: "a sleek, straight finish", label: "Sleek straight", icon: "sleek-straight" },
  { value: "loose waves or curls", label: "Waves/curls", icon: "waves-curls" },
  { value: "a braided style", label: "Braids", icon: "braids" },
  { value: "an updo or bun", label: "Updo/bun", icon: "updo-bun" },
  { value: "natural texture, unstyled", label: "Natural texture", icon: "natural-texture" },
];

export const MEN_HAIRSTYLE_OPTIONS: HairstyleOption[] = [
  { value: "a textured crop", label: "Textured crop", icon: "textured-crop" },
  { value: "a fade with length on top", label: "Fade", icon: "fade" },
  { value: "a slicked-back style", label: "Slicked back", icon: "slicked-back" },
  { value: "natural texture, unstyled", label: "Natural texture", icon: "natural-texture" },
  { value: "a close buzz cut", label: "Buzz cut", icon: "buzz-cut" },
];