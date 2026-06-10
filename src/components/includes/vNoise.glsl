


#include ./SimplexNoise.glsl
#include ./Perlin3d.glsl


// float fbm(vec3 v) {
//     float sum = 0.0;
//     float amp = 1.0;
//     float freq = 1.0;

//     for(int i = 0; i < 1; i++) {
//         sum += Perlin3d(v * freq) * amp;
//         freq *= 2.0;
//         amp *= .3;
//     }

//     return sum;
// }

float vNoise(vec2 v, float t) {
    // return Perlin3d(v);
    // return SimplexNoise(v);
    vec3 vV = vec3((v + vec2(0.0,t * .0002)) * vec2(5.0,200.0),0.0);
    return Perlin3d(vV) * .5;
}