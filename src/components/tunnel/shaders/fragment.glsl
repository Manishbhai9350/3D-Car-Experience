varying vec2 vUv;
varying vec3 vPosition;
varying float vOffset;
varying float vAudioSmoothness;
varying float vAudioIntensity;

uniform float uTime;
uniform float uDepth;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColorT1;
uniform vec3 uColorT2;
uniform float uTProgress;

#include ../../includes/utils.glsl

void main() {
    float progress = pow(uTProgress, 4.0);
    vec3 dark = mix(uColor1, uColorT1, progress);
    vec3 light = mix(uColor2, uColorT2, progress);

    float intensity = smoothstep(0., .8, sin(vUv.x * PI));

    vec3 color = mix(dark, light, vOffset);

    float fade = (vPosition.z + uDepth / 2.0) / uDepth;
    fade = smoothstep(0.0, 1.0, fade);
    fade = sin(fade * PI);

    csm_FragColor = mix(vec4(0.0, 0.0, 0.0, 1.0), vec4(color, 1.0), fade * intensity);
}