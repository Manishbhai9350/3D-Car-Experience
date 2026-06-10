varying vec2 vUv;
varying vec3 vPosition;

uniform float uTime;
uniform float uDepth;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColorT1;
uniform vec3 uColorT2;
uniform float uTProgress;
uniform float uNoiseUvYOffset;

#include ../../includes/vNoise.glsl

void main() {

    float progress = pow(uTProgress,4.0);
    // Interpolate between current and target colors
    vec3 dark = mix(uColor1, uColorT1, progress);
    vec3 light = mix(uColor2, uColorT2, progress);

    float intensity = smoothstep(0., .8, sin(vUv.x * PI));

    vec2 noiseUV = vUv + vec2(0.0, uNoiseUvYOffset);

    float offset = (vNoise(noiseUV, uTime) * .5 + .5) * intensity;

    vec3 color = mix(dark, light, offset);

    csm_FragColor = vec4(color, 1.0);

    float fade = (vPosition.z - uDepth / 2.0) / uDepth;
    fade = (vPosition.z + uDepth / 2.0) / uDepth;
    fade = smoothstep(.0, 1.0, fade);
    fade = sin(fade * PI);
    fade *= abs(sin((dot(vPosition,vec3(0.1,1.0,.4 - offset * .1 + vNoise(noiseUV, uTime) * .2 + .1)) + uTime * 1.5) * 10.0));

    csm_FragColor = mix(vec4(0, 0, 0, 1.0), csm_FragColor, fade * intensity);

    // csm_FragColor = mix(vec4(light,1.0),mix(vec4(0, 0, 0, 1.0), csm_FragColor, fade * intensity),(1.0 - fade * intensity));
}