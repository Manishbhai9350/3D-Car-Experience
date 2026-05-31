varying vec3 vPosition;

uniform float uMinY;
uniform float uMaxY;
uniform float uProgress;
uniform float uTime;
uniform float uNoiseScale;
uniform float uNoiseStrength;

#include ../includes/SimplexNoise.glsl

void main() {
    float ln = length(vPosition.xy) / uMaxY;
    // float ln = sin(uTime) * 0.5 + 0.5;

    // float p = -.3 * ( 1.0 - uProgress) + uProgress;
    float p = uProgress;

    float noise = SimplexNoise(vPosition * uNoiseScale * 30.0) * .1;
    float n = noise * 0.5 + 0.5; // 0 to 1

    // distort the surface position with noise, then threshold against progress
    float distorted = length(vPosition.xy) / uMaxY + (n - 0.5) * uNoiseStrength;

    // uProgress goes 0 to 1, smoothstep gives clean 0 and 1 at the edges
    // float mixValue = smoothstep(p  - 0.05, p  + 0.05, distorted);
    float mixValue = step(ln ,min(1.0,p + n * uProgress));
    mixValue = 1.0 - mixValue; // 👈 flip it

    vec3 blue = vec3(0.0, 0.2, 1.0);
    vec3 white = vec3(1.0, 1.0, 1.0);

    vec3 color = mix(blue, white, mixValue);

    csm_DiffuseColor = vec4(color, 1.0);
}