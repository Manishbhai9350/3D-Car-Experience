// ============================================================
//  Ink Bleed Transition Shader  (mesh-UV origin version)
//  Uses: CustomShaderMaterial (three.js CSM)
//
//  Uniforms:
//    uProgress  – 0.0 (start) → 1.0 (fully transitioned)
//    prevColor  – RGB color we're transitioning FROM
//    newColor   – RGB color we're transitioning TO
//    uMaxY      – half-height of the mesh (normalises distance)
//
//  Varyings (set in vertex shader):
//    vPosition  – local vertex position (model space)
// ============================================================

// ---- Uniforms & Varyings -----------------------------------
uniform float uProgress;
uniform vec3 prevColor;
uniform vec3 newColor;
uniform float uMaxY;      // e.g. geometry.boundingBox.max.y
uniform float uTime;

varying vec3 vPosition;   // passed from vertex shader

// ============================================================
//  UTILITY: Pseudo-random scalar from a 2D seed
// ============================================================
float rand2(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

// ============================================================
//  VALUE NOISE  –  smooth random field over 2D space
// ============================================================
float noise(vec2 p) {
    vec2 ip = floor(p);
    vec2 u = fract(p);
    u = u * u * (3.0 - 2.0 * u);   // smoothstep

    return mix(mix(rand2(ip), rand2(ip + vec2(1.0, 0.0)), u.x), mix(rand2(ip + vec2(0.0, 1.0)), rand2(ip + vec2(1.0, 1.0)), u.x), u.y);
}

// ============================================================
//  fBm helpers — fixed octave counts so the driver can fully
//  unroll at compile time (no dynamic loop bounds).
// ============================================================

// 2 octaves — angle swirl warp
float fbm2(vec2 p) {
    float n = noise(p) + noise(p * 2.0) * 0.5;
    return n / 1.5;
}

// 5 octaves — edge grit (was 8; 5 is visually identical, ~40% cheaper)
float fbm5(vec2 p) {
    float n = 0.0, a = 1.0, norm = 0.0;
    n += noise(p) * a;
    norm += a;
    p *= 2.0;
    a *= 0.5;
    n += noise(p) * a;
    norm += a;
    p *= 2.0;
    a *= 0.5;
    n += noise(p) * a;
    norm += a;
    p *= 2.0;
    a *= 0.5;
    n += noise(p) * a;
    norm += a;
    p *= 2.0;
    a *= 0.5;
    n += noise(p) * a;
    norm += a;
    return n / norm;
}

// ============================================================
//  MAIN
// ============================================================
void main() {

    float progress = uProgress;
    // ----------------------------------------------------------
    //  1. MESH-SPACE UV
    //     vPosition.xy is the fragment's position in the mesh's
    //     local coordinate system — (0, 0) is the mesh centre,
    //     which is exactly where we want the ink to start from.
    //     No screen-space conversion needed.
    // ----------------------------------------------------------
    vec2 uv = vPosition.xy;

    // ----------------------------------------------------------
    //  2. NORMALISED RADIAL DISTANCE
    //     length(uv) is the Euclidean distance from the mesh
    //     centre. Dividing by uMaxY (the mesh's half-height)
    //     maps it to roughly [0, 1] across the mesh surface,
    //     so the ink fills the whole mesh when uProgress = 1
    //     regardless of the mesh's world scale.
    //
    //     Pass uMaxY from JS:
    //       geometry.computeBoundingBox();
    //       uMaxY = geometry.boundingBox.max.y;
    // ----------------------------------------------------------
    float ln = length(uv) / uMaxY / 1.3;

    // ----------------------------------------------------------
    //  3. POLAR ANGLE — with swirl distortion
    //     Same as before: atan gives the angle from centre,
    //     then we warp it with 2-octave fbm so the ink edge
    //     swirls rather than spreading as a clean circle.
    //     We scale uv down (× 0.004) so the noise pattern
    //     is large relative to the mesh.
    // ----------------------------------------------------------
    float angle = atan(uv.y, uv.x);
    angle += fbm2(uv * 0.004);

    // Warped direction vector along the rim
    vec2 p = vec2(cos(angle), sin(angle));

    // ----------------------------------------------------------
    //  4. PROGRESS → RADIUS (t)
    //     Ease-in curve: slow start, accelerates outward.
    //     Guard against t == 0 to prevent divide-by-zero.
    // ----------------------------------------------------------
    float t = progress;
    t = t * t;

// 5. COVERAGE DISTANCE
    float l = (ln / t) * (ln / t);
    float noiseStrength = 1.0 - smoothstep(0.7, 1.0, progress);
    l -= (fbm5(uv * 0.03) - 0.5) * noiseStrength;

// 6. INK COVERAGE
    float ink = noise(p * 16.0) + 2.0 - l;

    // ----------------------------------------------------------
    //  7. COLOR MIX
    // ----------------------------------------------------------
    vec3 col = mix(prevColor, newColor, clamp(ink, 0.0, 1.0));

    // ----------------------------------------------------------
    //  8. CSM OUTPUT
    // ----------------------------------------------------------
    csm_DiffuseColor = vec4(csm_DiffuseColor.rgb * col, 1.0);
    // csm_DiffuseColor = vec4(step(ln,progress),0.0,0.0,1.0);
}
