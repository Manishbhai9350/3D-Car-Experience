varying vec2 vUv;
varying vec3 vPosition;

uniform float uNoiseUvYOffset;
uniform float uTime;

#include ../../includes/vNoise.glsl

void main() {
    vUv = uv;

    vec3 worldPos = (modelMatrix * vec4(position, 1.0)).xyz;
    vPosition = worldPos;

    float intensity = smoothstep(0., .8, sin(vUv.x * PI));

    vec2 noiseUV = vUv + vec2(0.0, uNoiseUvYOffset);

    float offset = (vNoise(noiseUV, uTime) * .5 + .5) * intensity * 2.5;

    // offset.xy = offset.xy * 0.0;

    // csm_Position.y -= 50.0;
    csm_Position.xyz += offset * normal;
}