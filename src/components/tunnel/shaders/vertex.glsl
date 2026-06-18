varying vec2 vUv;
varying vec3 vPosition;

uniform float uDepth;
uniform float uTime;
uniform float uNoiseUvYOffset;
uniform sampler2D uAudioTexture;

#include ../../includes/vNoise.glsl
#include ../../includes/utils.glsl

void main() {
    vUv = uv;

    vec3 worldPos = (modelMatrix * vec4(position, 1.0)).xyz;
    vPosition = worldPos;

    float intensity = smoothstep(0., .8, sin(vUv.x * PI));

    vec2 noiseUV = vUv + vec2(0.0, uNoiseUvYOffset);

    float offset = (vNoise(noiseUV, uTime) * .5 + .5) * intensity * 2.5;
    float z = maprange(abs(worldPos.z), 0.0, uDepth, 0.0, 1.0);
    float AudioIntensity = texture(uAudioTexture, vec2(0.0,fract(z + 1.0))).r;

    // csm_Position.y -= 50.0;
    csm_Position.xyz += offset * normal * max(AudioIntensity * 2.0, 1.0);
}