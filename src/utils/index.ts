import { Color } from "three";

export function deriveHslVariants(base: Color) {
  // convert to hsl
  const hsl = { h: 0, s: 0, l: 0 };
  base.getHSL(hsl);

  // dark — drop lightness, boost saturation slightly so it stays vivid
  const dark = new Color().setHSL(
    hsl.h,
    Math.min(hsl.s * 1.1, 1), // slightly more saturated
    hsl.l * 0.25, // much darker
  );

  // light — raise lightness, pull saturation back slightly
  const light = new Color().setHSL(
    hsl.h,
    hsl.s * 0.85, // slightly less saturated
    Math.min(hsl.l * 1.4, 0.92), // brighter but never pure white
  );

  // emissive — for bloom/glow effect, saturated mid tone
  const emissive = new Color().setHSL(
    hsl.h,
    Math.min(hsl.s * 1.2, 1),
    hsl.l * 0.6,
  );

  return {
    body: base,
    dark,
    light,
    emissive, // useful for MeshPhysicalMaterial emissive property
  };
}

export function lerpShader(base: Color) {
  const dark = base.clone().lerp(new Color("#000000"), 0.8); // deeper
  const light = base.clone().lerp(new Color("#ffffff"), 0.2); // brighter

  return {
    body: base,
    dark,
    light,
  };
}

export function createColorSet(hex: string) {
  const base = new Color(hex);

  return lerpShader(base);
  // return deriveHslVariants(base);
}
