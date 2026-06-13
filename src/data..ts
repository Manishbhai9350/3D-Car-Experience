import { createColorSet } from "./utils";

// ─── 10 vivid ping-pong colors ───────────────────────────────────────────────
const RAW_COLORS = [
  "#ff2d55", // red-pink — keep one from that family
  "#ff6b35", // orange — distinct enough to keep
  "#ffd60a", // yellow — brighter of the two yellows
  "#46ff1c", // green — keep one green
  "#00e5ff", // cyan — slightly deeper than #0af5ff
  "#bf5af2", // purple — already unique, keep
  "#ff375f", // swap with hot magenta for more separation
  "#1c6eff", // electric blue — was missing entirely
  "#ff9f0a", // amber — distinct from yellow
  "#00ff88", // mint green — different enough from lime
  "#e040fb", // vivid orchid — fills pink-purple gap
  "#00bcd4", // teal — sits between cyan and green
  "#ff1744", // pure red — was missing
  "#76ff03", // chartreuse — yellow-green gap
];
export const COLORS = RAW_COLORS.map(createColorSet);
