varying vec2 vUv;
varying vec3 vPosition;
varying float vOffset;
varying float vAudioSmoothness;
varying float vAudioIntensity;

uniform float uDepth;
uniform float uTime;
uniform float uAudioAverage;
uniform float uNoiseUvYOffset;
uniform sampler2D uAudioTexture;

#include ../../includes/vNoise.glsl
#include ../../includes/utils.glsl

void main() {
    vUv = uv;

    vec3 worldPos = (modelMatrix * vec4(position, 1.0)).xyz;
    vPosition = worldPos;

    float z = maprange(abs(worldPos.z), 0.0, uDepth, 0.0, 1.0);
    float AudioIntensity = texture(uAudioTexture, vec2(0.0, fract(z + 1.0))).r;
    float RemapedAudioIntensity = maprange(uAudioAverage, 0.0, 1.0, -1.0, 1.0);

    float intensity = smoothstep(0., .8, sin(vUv.x * PI));

    vec2 noiseUV = vUv + vec2(0.0, uNoiseUvYOffset) * 2.0;
    float offset = (vNoise(noiseUV * .3, 0.0, vec2(RemapedAudioIntensity * 5.0, 0.0)) * .5 + .5) * intensity;

    float AudioSmoothnessThreshold = .03;
    float AudioSmoothness = smoothstep(vUv.y, 0.0, AudioSmoothnessThreshold);
    AudioSmoothness = min(AudioSmoothness, smoothstep(vUv.y, 1.0, 1.0 - AudioSmoothnessThreshold));

    // Pass to fragment so it stays perfectly in sync
    vOffset = offset;
    vAudioSmoothness = AudioSmoothness;
    vAudioIntensity = AudioIntensity;

    vec3 deviation = offset * 1.5 * normal * (1.0 + AudioIntensity) * AudioSmoothness;

    deviation = clamp(deviation,-1.5,1.5);

    csm_Position.xyz += deviation;
}