varying vec2 vUv;

uniform float uTime;
uniform vec3 uColor1;
uniform vec3 uColor2;

#include ../../includes/vNoise.glsl

void main() {

    float intensity = 1.0 - smoothstep(.5, .0, sin(vUv.x * PI));
    float offset = (vNoise(vUv, uTime) * .5 + .5) * 2.0 * intensity;

    vec3 color = mix(uColor1, uColor2, offset);

    // csm_Emissive = vec3(1.0, 0.32, 0.77);
    // csm_Emissive = vNormal;
    // csm_Emissive = vec3(offset);
    csm_FragColor = vec4(color, 1.0);

    float fade = sin(vUv.y * PI);
    fade = smoothstep(.2, 1.0, fade);
    fade *= fade;
    fade = min(fade, 1.0);

    csm_FragColor = mix(vec4(0, 0, 0, 1.0), csm_FragColor, fade * intensity);
}