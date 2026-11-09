import type { ImageEditSpec } from "./types";

function forbiddenBlock(items: string[]) {
  if (!items.length) return "";
  return `FORBIDDEN ITEMS:
- ${items.join("\n- ")}
`;
}

export function buildClothingEditPrompt(spec: ImageEditSpec): string {
  return `
Edit the supplied photograph of the SAME PERSON.

This is a photo-editing task, not a request to create a new person,
new model, or new scene.

PRIMARY GOAL:
Replace the person's clothing with the specified outfit.

CLOTHING TO APPLY:
${spec.clothingDescription}

FOOTWEAR:
${spec.footwearDescription || "keep appropriate footwear consistent with the outfit"}

ACCESSORIES:
${spec.accessoryDescription || "do not add unnecessary accessories"}

STRICT PRESERVATION RULES:
- Preserve the exact same person's face and identity.
- Preserve the exact same skin tone.
- Preserve the exact same body proportions.
- Preserve the exact same pose and hand positions.
- Preserve the exact same background and lighting.
- Preserve the original hairstyle in this clothing-editing pass.
- Preserve the original facial hair.
- Keep the full body visible from head to toe.
- Produce a natural, photorealistic edit.

STRICT CHANGE RULES:
- Replace the outfit so that the clothing visibly changes.
- Apply the requested clothing clearly and unambiguously.
- Do not leave the original clothing unchanged.
- Do not substitute a different person.
- Do not change the person's age or facial appearance.

${forbiddenBlock(spec.forbiddenItems)}
If clothing boundaries require small adjustments, make only those necessary adjustments.
`.trim();
}

export function buildHairEditPrompt(spec: ImageEditSpec): string {
  return `
Edit the supplied photograph of the SAME PERSON.

This is a photo-editing task, not a request to create a new person,
new model, or new scene.

PRIMARY GOAL:
Change the hairstyle only.

REQUIRED HAIRSTYLE:
${spec.hairstyleDescription || "well-groomed natural styling"}

STRICT PRESERVATION RULES:
- Preserve the exact same person's face and identity.
- Preserve the exact same skin tone.
- Preserve the exact same body proportions.
- Preserve the exact same pose and hand positions.
- Preserve the exact same background and lighting.
- Preserve the already-edited clothing exactly as it is.
- Preserve the original facial hair unless facial-hair change was explicitly requested.
- Keep the full body visible from head to toe.
- Produce a natural, photorealistic edit.

STRICT CHANGE RULES:
- Modify the hairstyle clearly so the change is visible.
- Do not add caps, hats, or sunglasses.
- Do not alter the face, jawline, nose, lips, or eyes.
- Do not substitute a different person.
- Do not change the person's age or facial appearance.
`.trim();
}