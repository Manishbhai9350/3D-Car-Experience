import { useMemo } from "react";

/**
 * RadialWheel
 * A ring of trapezoidal "blades" with curved outer edges and per-blade
 * radius variation, rendered as a transparent SVG (only the blades are visible).
 * Props:
 *  - numBlades: how many blades in the ring
 *  - innerRadius: radius of the inner hole
 *  - outerRadius: base outer radius of the blades
 *  - radiusVariation: max +/- amount each blade's outer radius can vary
 *  - bladeWidth: 0-1, how much of each angular segment the blade fills (rest is gap)
 *  - color: fill color of the blades
 *  - seed: change this to get a different random variation pattern
 *  - size: pixel size of the rendered square SVG
 */
export default function RadialWheel({
  numBlades = 12,
  innerRadius = 300,
  outerRadius = 600,
  radiusVariation = 150,
  bladeWidth = 0.62,
  color = "#e0e0e0",
  seed = 100,
  size = 40,
}) {
  const paths = useMemo(() => {
    // simple seeded PRNG so the variation is stable across re-renders
    // for a given seed, instead of re-randomizing on every render
    let s = seed;
    const rand = () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };

    const cx = 800;
    const cy = 800;
    const segment = 360 / numBlades;
    const bladeAngle = segment * bladeWidth;

    const pt = (r, deg) => {
      const rad = ((deg - 90) * Math.PI) / 180;
      return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
    };

    const result = [];
    for (let i = 0; i < numBlades; i++) {
      const center = i * segment;
      const half = bladeAngle / 2;
      const a1 = center - half;
      const a2 = center + half;

      const thisOuterRadius = outerRadius + (rand() * 2 - 1) * radiusVariation;

      const [p1x, p1y] = pt(innerRadius, a1);
      const [p2x, p2y] = pt(thisOuterRadius, a1);
      const [p3x, p3y] = pt(thisOuterRadius, a2);
      const [p4x, p4y] = pt(innerRadius, a2);

      const d = [
        `M ${p1x.toFixed(2)},${p1y.toFixed(2)}`,
        `L ${p2x.toFixed(2)},${p2y.toFixed(2)}`,
        `A ${thisOuterRadius.toFixed(2)},${thisOuterRadius.toFixed(2)} 0 0 1 ${p3x.toFixed(2)},${p3y.toFixed(2)}`,
        `L ${p4x.toFixed(2)},${p4y.toFixed(2)}`,
        "Z",
      ].join(" ");

      result.push(d);
    }
    return result;
  }, [numBlades, innerRadius, outerRadius, radiusVariation, bladeWidth, seed]);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 1600 1600"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={color}>
        {paths.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
    </svg>
  );
}
