uniform float uTime;
varying vec2 vUv;

#include ../../includes/vNoise.glsl

void main() {
    vUv = uv;

    float intensity = smoothstep(0., .8, sin(vUv.x * PI));

    float offset = vNoise(uv, uTime);

    // offset.xy = offset.xy * 0.0;

    // csm_Position.y -= 50.0;
    csm_Position.xyz += offset * normal * intensity;
}