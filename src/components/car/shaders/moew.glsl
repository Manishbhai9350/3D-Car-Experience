varying vec2 vUv;
varying vec3 vWorldPosition;
varying float vTransition;
uniform float uTransition;
uniform float uTime;
uniform float uScaleTransition;
const float pi = 3.1415926535897932384626433832795;
void main() {
    vUv = uv;
    vec3 p = position;
    vTransition = sin(p.x * 4.0 + p.y * 4.0) * 100.0 * sin(uTransition * pi);
    p.z += vTransition;
    p.z -= (sin(vUv.x * pi) + sin(vUv.y * pi)) * 50.0 * sin(uScaleTransition * pi);
    p.z = position.z;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}