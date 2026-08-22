import type { Gender } from "../types";

export interface StateOption {
  value: string;
  label: string;
}

export const INDIAN_STATE_OPTIONS: StateOption[] = [
  { value: "punjab", label: "Punjab" },
  { value: "gujarat", label: "Gujarat" },
  { value: "rajasthan", label: "Rajasthan" },
  { value: "kerala", label: "Kerala" },
  { value: "tamil-nadu", label: "Tamil Nadu" },
  { value: "west-bengal", label: "West Bengal" },
  { value: "maharashtra", label: "Maharashtra" },
  { value: "karnataka", label: "Karnataka" },
  { value: "assam", label: "Assam" },
  { value: "uttar-pradesh", label: "Uttar Pradesh" },
];

const WOMEN_STATE_OUTFIT: Record<string, string> = {
  punjab: "a Punjabi suit (salwar kameez) with a phulkari-embroidered dupatta",
  gujarat: "a Gujarati chaniya choli with mirror-work embroidery",
  rajasthan: "a Rajasthani ghagra choli in bandhani print with statement silver jewelry",
  kerala: "a Kerala kasavu saree in cream with a gold-bordered pallu",
  "tamil-nadu": "a Kanjeevaram silk saree paired with temple jewelry",
  "west-bengal": "a red-and-white Bengali tant or garad saree with traditional gold jewelry",
  maharashtra: "a Paithani saree draped in the traditional Maharashtrian nauvari style",
  karnataka: "a Mysore silk saree with traditional Karnataka jewelry",
  assam: "an Assamese mekhela chador in handwoven silk",
  "uttar-pradesh": "a Lucknawi chikankari suit or saree",
};

const MEN_STATE_OUTFIT: Record<string, string> = {
  punjab: "a kurta pajama with a Punjabi jutti and a colorful pagri (turban)",
  gujarat: "a kediyu (Gujarati angarkha) with a dhoti and a colorful pagh",
  rajasthan: "a bandhgala or angrakha with a vibrant Rajasthani safa (turban)",
  kerala: "a traditional Kerala mundu (white dhoti) with an angavastram shawl",
  "tamil-nadu": "a veshti (dhoti) with an angavastram and a gold-bordered traditional shirt",
  "west-bengal": "a dhoti-kurta paired with a traditional Bengali shawl",
  maharashtra: "a dhoti with a Maharashtrian pheta (turban) and a bandi jacket",
  karnataka: "a Mysore peta (turban) with a traditional silk kurta and dhoti",
  assam: "a dhoti-kurta with a traditional Assamese gamosa",
  "uttar-pradesh": "a sherwani or kurta with a traditional Awadhi-style turban",
};

export function getStateOutfit(gender: Gender, state: string): string {
  const table = gender === "male" ? MEN_STATE_OUTFIT : WOMEN_STATE_OUTFIT;
  return table[state] ?? (gender === "male" ? "a kurta with regional traditional detailing" : "a saree with regional traditional detailing");
}

export function stateLabel(state: string): string {
  return INDIAN_STATE_OPTIONS.find((s) => s.value === state)?.label ?? state;
}
