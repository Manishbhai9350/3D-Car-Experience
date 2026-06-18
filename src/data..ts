import { createColorSet } from "./utils";

// ─── 10 vivid ping-pong colors ───────────────────────────────────────────────
const RAW_COLORS = [
  "#ffd60a", // yellow
  "#111111", // almost black (dark anchor)
  "#1c6eff", // electric blue
  "#ff1744", // pure red
  "#e040fb", // vivid orchid
  "#ff6b35", // orange
  "#76ff03", // chartreuse
  "#00e5ff", // cyan
  "#ff9f0a", // amber
  "#00ff88", // mint green
  "#fdfdfd", // almost white (light anchor)
];
export const COLORS = RAW_COLORS.map(createColorSet);
