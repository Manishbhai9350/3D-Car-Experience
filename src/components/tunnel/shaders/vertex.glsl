uniform float uTime;

varying vec2 vUv;
varying vec3 vOffset;

#include ../../includes/SimplexNoise.glsl
#include ../../includes/Perlin3d.glsl

float Noise(vec3 v) {
    return Perlin3d(v);
    // return SimplexNoise(v);
}

void main(){
    vUv = uv; 

    float intensity = smoothstep(0.,.8,sin(vUv.x * PI));

    vec3 NoiseVal = csm_Position;
    NoiseVal.y += uTime;

    vec3 offset = vec3(
        Noise(NoiseVal * .40),
        0.0,
        Noise(NoiseVal * .40  + 6.0)
    );


    vOffset = offset * intensity;



    // offset.xy = offset.xy * 0.0;

    // csm_Position.y -= 50.0;
    csm_Position.xyz += offset * normal * intensity;
}