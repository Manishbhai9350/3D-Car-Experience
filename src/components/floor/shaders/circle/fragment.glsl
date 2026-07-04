uniform sampler2D uAudioTexture;
uniform float uAudioAverage;
uniform float uTime;

varying vec2 vUv;

// ---- Tunables -----------------------------------------------------------
const float BLADE_COUNT = 15.0; // number of spokes around the circle
const float GAP_FACTOR = 0.7;  // fraction of each segment that is "blade" vs gap
const float OUTER_RADIUS = 0.5;  // max possible outer edge of a blade
const float OUTER_SOFTEN = 0.492; // where the outer edge starts smoothing out
const float INNER_RADIUS = 0.14;  // radius of the empty hub in the middle
// ---------------------------------------------------------------------

#include ../includes/blade.utils.glsl

void main() {
    vec2 centeredUV = vUv - vec2(0.5);
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

    // --- Compose final color ---
    vec3 color = vec3(bladeMask);
    float alpha = bladeMask;

    csm_FragColor = vec4(color, alpha);

    csm_FragColor = vec4(texture(uAudioTexture,vec2(0.0,vUv.x)).rr,1.0,1.0);

    // csm_FragColor = vec4(vec3(bladeAudio),1.0);
}