export interface HairstyleOption {
  value: string;
  label: string;
}

// `value` doubles as the style phrase used directly in prompts/reasoning,
// so keep it lowercase and descriptive rather than a short label.
export const WOMEN_HAIRSTYLE_OPTIONS: HairstyleOption[] = [
  { value: "long layers with movement", label: "Long layers" },
  { value: "a sleek, straight finish", label: "Sleek straight" },
  { value: "loose waves or curls", label: "Waves/curls" },
  { value: "a braided style", label: "Braids" },
  { value: "an updo or bun", label: "Updo/bun" },
  { value: "natural texture, unstyled", label: "Natural texture" },
];

export const MEN_HAIRSTYLE_OPTIONS: HairstyleOption[] = [
  { value: "a textured crop", label: "Textured crop" },
  { value: "a fade with length on top", label: "Fade" },
  { value: "a slicked-back style", label: "Slicked back" },
  { value: "natural texture, unstyled", label: "Natural texture" },
  { value: "a close buzz cut", label: "Buzz cut" },
];