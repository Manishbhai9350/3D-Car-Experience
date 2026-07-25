import * as THREE from "three";

export function createCubeWithPerFaceUVs() {
  const geo = new THREE.BoxGeometry(1, 1, 1).toNonIndexed();

  const uv = geo.attributes.uv.array;
  const pos = geo.attributes.position.array;

  for (let i = 0; i < pos.length; i += 18) {
    // 6 vertices per face (each vertex = 3 position values → 18 total)

    // assign UVs per vertex in correct winding
    const faceUVs = [
      0, 0, 1, 0, 1, 1,

      0, 0, 1, 1, 0, 1,
    ];

    uv.set(faceUVs, (i / 3) * 2);
  }

  geo.attributes.uv.needsUpdate = true;

  return geo;
}

export const CircleVertexCube = `
        varying vec2 vUv;

         vec2 getFaceUV(vec3 p, vec3 n) {
        vec3 absN = abs(n);

        if (absN.x > 0.5) return p.yz;
        if (absN.y > 0.5) return p.xz;
        return p.xy;
        }

      void main() {
        vec2 nUv = getFaceUV(position, normal);
        vUv = nUv * 0.5 + 0.5;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
        

`;

const fncs = ` 

// Cheap deterministic hash: same bladeIndex always gives the same value
float hash11(float p) {
    p = fract(p * 0.1031);
    p *= p + 33.33;
    p *= p + p;
    return fract(p);
}

// Angle around the circle, remapped from [-PI, PI] to [0, 1]
float getAngle01(vec2 centeredUV) {
    return (atan(centeredUV.y, centeredUV.x) + PI) / (2.0 * PI);
}

// Which blade (0 .. BLADE_COUNT-1) this pixel belongs to
float getBladeIndex(float angle01, float bladeCount) {
    return floor(angle01 * bladeCount);
}

// Position within the current blade's segment, 0..1
float getSegmentProgress(float angle01, float bladeCount) {
    return fract(angle01 * bladeCount);
}

// 1.0 if inside the "blade" part of the segment, 0.0 if inside the gap
float getBladeShapeMask(float segmentProgress) {
    return step(segmentProgress, GAP_FACTOR);
}

// Sample the audio texture for a specific blade index
float getBladeAudio(float bladeIndex, float bladeCount) {
    float u = (bladeIndex + 0.5) / bladeCount; // sample the center of that bin
    return texture(uAudioTexture, vec2(0.0, u)).r * .5;
}

// Push a blade's outer radius in/out based on its audio value
float getBladeOuterRadius(float bladeAudio) {
    return mix(INNER_RADIUS, OUTER_RADIUS, bladeAudio);
}

float getOuterEdgeMask(float radius, float outerRadius) {
    float soften = outerRadius - (OUTER_RADIUS - OUTER_SOFTEN);
    return smoothstep(outerRadius, soften, radius);
}


`;

export const CircleFragmentCube = `
uniform sampler2D uAudioTexture;
uniform float uAudioAverage;
uniform float uTime;
uniform vec3 uColorFrom;
uniform vec3 uColorTo;
uniform float uColorProgress;
uniform float uRadial;

varying vec2 vUv;

// ---- Tunables -----------------------------------------------------------
const float BLADE_COUNT = 15.0;
const float GAP_FACTOR = 0.7;
const float OUTER_RADIUS = 0.5;
const float OUTER_SOFTEN = 0.492;
const float INNER_RADIUS = 0.12;

const float MAX_START_OFFSET = 0.5; // latest a blade can start, as fraction of timeline
const float MIN_DURATION = 0.3;     // shortest a blade's own transition can take
const float MAX_DURATION = 0.8;     // longest a blade's own transition can take
// ---------------------------------------------------------------------



${ fncs }



vec3 clampMinBrightness(vec3 color, float minValue) {
    if(color.x <= minValue && color.y <= minValue && color.z <= minValue) {
        return vec3(minValue);
    }
    return color;
}

// Gives each blade its own start point + duration within the global
// 0..1 progress, so blades start/end at different, randomized times.
float getBladeColorProgress(float bladeIndex, float globalProgress) {
    float startSeed = hash11(bladeIndex * 13.37);
    float durationSeed = hash11(bladeIndex * 7.91 + 4.0);

    float startOffset = startSeed * MAX_START_OFFSET;
    float duration = mix(MIN_DURATION, MAX_DURATION, durationSeed);

    // keep the blade's window from running past the end of the timeline
    duration = min(duration, 1.0 - startOffset);

    float localT = clamp((globalProgress - startOffset) / duration, 0.0, 1.0);
    return smoothstep(0.0, 1.0, localT); // ease in/out instead of linear
}

void main() {
    vec2 centeredUV = vUv - vec2(0.5);
    centeredUV /= 2.0;
    float radius = length(centeredUV) * 2.0;

    float angle01 = getAngle01(centeredUV);
    float bladeIndex = getBladeIndex(angle01, BLADE_COUNT);
    float segmentProgress = getSegmentProgress(angle01, BLADE_COUNT);

    float bladeShape = getBladeShapeMask(segmentProgress);
    float isOutsideHub = 1.0 - step(radius, INNER_RADIUS);

    float bladeAudio = getBladeAudio(bladeIndex, BLADE_COUNT) * uRadial;
    float bladeOuter = getBladeOuterRadius(bladeAudio);
    float outerMask = getOuterEdgeMask(radius, bladeOuter);

    float bladeMask = bladeShape * isOutsideHub * outerMask;

    // --- Compose final color, per-blade transition timing ---
    float bladeProgress = getBladeColorProgress(bladeIndex, uColorProgress);
    vec3 color = mix(uColorFrom, uColorTo, bladeProgress);
    color = clampMinBrightness(color, 0.1);

    float alpha = bladeMask;

    // csm_FragColor = vec4(color, alpha);
    csm_DiffuseColor = vec4(mix(vec3(0.0),color * .4,alpha), 1.0);

    // csm_FragColor = vec4(vec3(.7,1.0,.4),1.0);
}
`;
