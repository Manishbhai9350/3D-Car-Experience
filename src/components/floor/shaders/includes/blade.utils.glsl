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
    return texture(uAudioTexture, vec2(0.0, u)).r;
}

// Push a blade's outer radius in/out based on its audio value
float getBladeOuterRadius(float bladeAudio) {
    return mix(INNER_RADIUS, OUTER_RADIUS, bladeAudio);
}

float getOuterEdgeMask(float radius, float outerRadius) {
    float soften = outerRadius - (OUTER_RADIUS - OUTER_SOFTEN);
    return smoothstep(outerRadius, soften, radius);
}
