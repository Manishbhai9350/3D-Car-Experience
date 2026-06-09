varying vec2 vUv;

uniform float uTime;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColorT1;
uniform vec3 uColorT2;
uniform float uTProgress;

#include ../../includes/vNoise.glsl

void main() {

    float progress = uTProgress * uTProgress;
    // Interpolate between current and target colors
    vec3 dark  = mix(uColor1, uColorT1, progress);
    vec3 light = mix(uColor2, uColorT2, progress);

    float intensity = 1.0 - smoothstep(.6, .0, sin(vUv.x * PI));
    float offset = (vNoise(vUv, uTime) * .5 + .5) * 2.0 * intensity;

    vec3 color = mix(dark, light, offset);

    csm_FragColor = vec4(color, 1.0);

    float fade = sin(vUv.y * PI);
    fade = smoothstep(.2, 1.0, fade);
    fade *= fade;
    fade = min(fade, 1.0);

    csm_FragColor = mix(vec4(0, 0, 0, 1.0), csm_FragColor, fade * intensity);

    // csm_FragColor = vec4(vec3(uTProgress * uTProgress),1.0);
    // csm_FragColor = vec4(vec3(uColorT1),1.0);
}