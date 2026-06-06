varying vec2 vUv;
varying vec3 vOffset;

void main() {

    csm_Emissive = vec3(1.0, 0.32, 0.77);
    csm_Emissive = vNormal;
    csm_Emissive = vOffset.rrr;
    // csm_FragColor = vec4(smoothstep(0.,.8,sin(vUv.x * PI)),0.0, 0.0, 1.0);
}