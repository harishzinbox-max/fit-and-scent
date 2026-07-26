# Fit & Scent — MVP

An occasion-based styling advisor: upload a photo, answer a short quiz, and get
an **explained** dress + fragrance recommendation, plus a live accessory
try-on. Built to lead with the differentiator we scoped — explainable
recommendations and the fragrance module no competitor offers — before the
expensive generative hair/attire try-on.

## What's implemented (MVP scope)

- **Face-shape + skin-tone reading** (`src/lib/faceAnalysis.ts`) — runs
  entirely client-side using MediaPipe FaceLandmarker (468-point mesh). Computes
  4 explainable ratios (jaw-to-cheek, length-to-width, forehead-to-jaw, jaw
  angle) and buckets into 6 standard face shapes with a confidence score.
  Skin tone is sampled from cheek/forehead pixels and bucketed by
  depth x undertone.
- **Dress recommendation engine** (`src/lib/rules/dressRules.ts`) — a rules
  table, not a model. Combines face shape (neckline) x body build
  (silhouette) x occasion (category), and returns the *reasoning*, not just
  the answer.
- **Fragrance recommendation engine** (`src/lib/rules/fragranceRules.ts`) —
  the unclaimed-territory module. Maps occasion x season x time-of-day x
  stated scent preference to a fragrance family, intensity, and example
  notes, again with reasoning shown.
- **Accessory try-on** (`src/components/AccessoryOverlay.tsx`) — SVG glasses
  and earrings positioned live from face-mesh eye/ear landmarks. Zero
  inference cost (no generative model), works instantly.
- **Body build** is self-reported in the quiz for this MVP (see "Next" below
  for why, and how to upgrade it).

## What's intentionally deferred

Per the sequencing we agreed on — cheap/explainable first, expensive/generative
last:

1. **Hairstyle & attire generation** (photorealistic try-on) — needs a hosted
   diffusion API (e.g. Replicate's `idm-vton` for clothing, or an
   InstantID/ControlNet pipeline for hair). Costs ~$0.01-0.05/generation, so
   validate demand with the free modules above before adding this spend.
2. **Body-build classification from photo** — currently self-reported by the
   user. To automate: add MediaPipe Pose (33 landmarks) on a full-body photo,
   compute shoulder-width : waist-width : hip-width ratios, and classify with
   the same threshold pattern used in `faceAnalysis.ts`.
3. **Skin texture** (oily/dry/combination) — deliberately left out of computer
   vision (unreliable from a single photo) and left as a future 2-3 question
   addition to the quiz instead.

## Running it

```bash
npm install
npm run dev
```

Note: the face-landmark model and WASM runtime load from a CDN
(`cdn.jsdelivr.net` and `storage.googleapis.com`) at runtime in the *user's*
browser — this needs internet access in production but has no server-side
inference cost to you.

## Extending with Cursor

The rules engines (`src/lib/rules/*.ts`) are plain, well-typed data + a
function — the natural place to hand Cursor a prompt like "add an hourglass
+ heart combination row for winter formal-evening" without touching UI code.
`src/lib/types.ts` is the single source of truth for the domain vocabulary
(occasions, face shapes, body builds) — extend enums there first and
TypeScript will flag every place that needs a new case.
