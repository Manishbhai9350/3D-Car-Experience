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

    // Position with updated model matrix;
    vec3 worldPos = (modelMatrix * vec4(position, 1.0)).xyz;
    vPosition = worldPos;

    // Audio Remaped Z
    float z = maprange(abs(worldPos.z), 0.0, uDepth, 0.0, 1.0);

    // Audio Reactive Intensity
    float AudioIntensity = texture(uAudioTexture, vec2(0.0, fract(z + 1.0))).r;
    float RemapedAudioIntensity = maprange(AudioIntensity,0.0,1.0,-1.0,1.0);

    // Tunnel Intensity to make it smoothly blend with floor
    float intensity = smoothstep(0., .8, sin(vUv.x * PI));

    // Uvs for Noise Function
    vec2 noiseUV = vUv + vec2(0.0, uNoiseUvYOffset) * 2.0;

    // Offset
    float offset = (vNoise(noiseUV, uTime, vec2(RemapedAudioIntensity * 5.0 , 0.0)) * .5 + .5) * intensity * 1.5;

    // Removing Jagged Edges Where Tunnels Meet
        // float AudioSmoothnessThreshold = .1;
        // // Start Of Tunnel First
        // float AudioSmoothness = smoothstep(vUv.y, 0.0, AudioSmoothnessThreshold);
        // // End Of Tunnel Second
        // AudioSmoothness = min(AudioSmoothness, smoothstep(vUv.y, 1.0, 1.0 - AudioSmoothnessThreshold));

    float AudioSmoothness = smoothstep(vUv.y, 0.0, .1 / 2.0);
    AudioSmoothness = min(AudioSmoothness, smoothstep(vUv.y, 1.0, 1.0 - .1 / 2.0));
    AudioSmoothness = pow(AudioSmoothness, 5.0);

    // AudioIntensity *= AudioSmoothness;

    // AudioIntensity = pow(AudioIntensity,5.0);

    // csm_Position.y -= 50.0;
    csm_Position.xyz += offset * normal * (1.0 + AudioIntensity) * AudioSmoothness;
}