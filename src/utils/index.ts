import { Color } from "three";



export function createColorSet(hex: string) {
  const base = new Color(hex);

  const dark = base.clone().lerp(new Color("#000000"), 0.6); // deeper
  const light = base.clone().lerp(new Color("#ffffff"), 0.4); // brighter

  return {
    body: base,
    dark,
    light,
  };
}