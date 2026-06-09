import { createColorSet } from "./utils";

// ─── 10 vivid ping-pong colors ───────────────────────────────────────────────
const RAW_COLORS = [
  "#ff2d55",
  "#ff9f0a",
  "#46ff1c",
  "#0af5ff",
  "#bf5af2",
  "#ff6b35",
  "#00ff88",
  "#ff375f",
  "#ffd60a",
  "#30d5c8",
  "#ff2d95",
];

export const COLORS = RAW_COLORS.map(createColorSet);
