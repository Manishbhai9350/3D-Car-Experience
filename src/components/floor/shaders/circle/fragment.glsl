uniform sampler2D uAudioTexture;
uniform float uAudioAverage;
uniform float uTime;
uniform vec3 uColorFrom;
uniform vec3 uColorTo;
uniform float uColorProgress;

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

#include ../includes/blade.utils.glsl

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
    float radius = length(centeredUV);

    float angle01 = getAngle01(centeredUV);
    float bladeIndex = getBladeIndex(angle01, BLADE_COUNT);
    float segmentProgress = getSegmentProgress(angle01, BLADE_COUNT);

    float bladeShape = getBladeShapeMask(segmentProgress);
    float isOutsideHub = 1.0 - step(radius, INNER_RADIUS);

    float bladeAudio = getBladeAudio(bladeIndex, BLADE_COUNT);
    float bladeOuter = getBladeOuterRadius(bladeAudio);
    float outerMask = getOuterEdgeMask(radius, bladeOuter);

    float bladeMask = bladeShape * isOutsideHub * outerMask;

    // --- Compose final color, per-blade transition timing ---
    float bladeProgress = getBladeColorProgress(bladeIndex, uColorProgress);
    vec3 color = mix(uColorFrom, uColorTo, bladeProgress);
    color = clampMinBrightness(color, 0.1);

    float alpha = bladeMask;

    csm_FragColor = vec4(color, alpha);

    // csm_FragColor = vec4(vec3(.7,1.0,.4),1.0);
}