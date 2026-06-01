// ============================================================
//  Ink Bleed Transition Shader
//  Uses: CustomShaderMaterial (three.js CSM)
//  Uniforms:
//    uProgress  – 0.0 (start) → 1.0 (fully transitioned)
//    prevColor  – RGB color we're transitioning FROM
//    newColor   – RGB color we're transitioning TO
//    uResolution– viewport size in pixels (width, height)
// ============================================================

// ---- Uniforms & Varyings -----------------------------------
uniform float uProgress;
uniform vec3  prevColor;
uniform vec3  newColor;
uniform vec2  uResolution;

// CSM provides these — we only need vUv here
// varying vec3 csm_vPosition;  // declared but unused — can remove
varying vec2 vUv;


// ============================================================
//  UTILITY: Pseudo-random scalar from a 2D seed
//  Returns a value in [0, 1) that looks random but is stable
//  (same seed always gives the same value — no real entropy).
// ============================================================
float rand2(vec2 n) {
    return fract(
        sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453
    );
}


// ============================================================
//  VALUE NOISE
//  Smooth random field over 2D space.
//  - Splits uv into integer cell (ip) + fractional offset (u)
//  - Smoothstep-blends the four corner random values
//  Returns [0, 1]
// ============================================================
float noise(vec2 p) {
    vec2 ip = floor(p);          // which cell are we in?
    vec2 u  = fract(p);          // where inside the cell?

    // Smoothstep: replaces the default linear mix with a
    // smooth S-curve so the noise doesn't look blocky.
    u = u * u * (3.0 - 2.0 * u);

    // Bilinear blend of the four corner samples
    return mix(
        mix(rand2(ip),                    // bottom-left
            rand2(ip + vec2(1.0, 0.0)),   // bottom-right
            u.x),
        mix(rand2(ip + vec2(0.0, 1.0)),   // top-left
            rand2(ip + vec2(1.0, 1.0)),   // top-right
            u.x),
        u.y
    );
}


// ============================================================
//  FRACTAL BROWNIAN MOTION (fBm)
//  Stacks multiple noise "octaves" at increasing frequencies
//  and decreasing amplitudes to create a natural, fractal look.
//
//  p       – 2D position to sample
//  octaves – how many layers to add (more = finer detail,
//            but also more expensive)
//
//  Each octave:
//    frequency doubles  (p *= 2)
//    amplitude halves   (a *= 0.5)
//  Result is normalized so it always returns [0, 1].
// ============================================================
float fbm(vec2 p, int octaves) {
    float n    = 0.0;   // accumulated noise
    float a    = 1.0;   // current amplitude
    float norm = 0.0;   // sum of amplitudes (for normalization)

    for (int i = 0; i < octaves; ++i) {
        n    += noise(p) * a;
        norm += a;
        p    *= 2.0;    // zoom in (higher frequency)
        a    *= 0.5;    // quieter (lower amplitude)
    }

    return n / norm;    // normalize to [0, 1]
}


// ============================================================
//  MAIN
// ============================================================
void main() {

    // ----------------------------------------------------------
    //  1. CENTERED, ASPECT-CORRECTED UV
    //     gl_FragCoord.xy is in pixels (0..width, 0..height).
    //     Dividing by resolution gives [0,1], then subtracting
    //     0.5 moves the origin to the centre of the screen.
    //     Multiplying y by the aspect ratio makes circles look
    //     circular instead of oval.
    // ----------------------------------------------------------
    vec2 uv = gl_FragCoord.xy / uResolution.xy - 0.5;
    uv.y   *= uResolution.y / uResolution.x;


    // ----------------------------------------------------------
    //  2. POLAR ANGLE — with swirl distortion
    //     atan(y, x) gives the angle of each pixel relative to
    //     the centre in radians (-π .. π).
    //     Adding fbm noise to the angle warps it organically,
    //     so the "radial" direction becomes a living swirl
    //     rather than a clean spoke.
    // ----------------------------------------------------------
    float angle  = atan(uv.y, uv.x);
    angle       += fbm(uv * 4.0, 2) * 0.5;   // 2-octave warp

    // Convert the warped angle back to a unit-circle direction
    // vector — used later to sample the ink texture along the
    // swirled rim rather than along raw uv.
    vec2 p = vec2(cos(angle), sin(angle));


    // ----------------------------------------------------------
    //  3. PROGRESS → RADIUS MAPPING
    //     We want the ink to start as a point and grow outward.
    //     t is a scaled, eased version of uProgress:
    //       t = (uProgress * 0.5)²  * 2
    //     The squaring creates an ease-in curve — the ink
    //     starts slowly then accelerates as it spreads.
    //
    //  SAFETY: clamp to a tiny minimum to prevent divide-by-zero
    //     when uProgress == 0.
    // ----------------------------------------------------------
    float t = uProgress * 0.5;
    t       = t * t * 2.0;
    t       = max(t, 0.001);   // ← divide-by-zero guard


    // ----------------------------------------------------------
    //  4. SCALED DISTANCE FROM CENTRE
    //     dot(v, v) == length²  (cheaper than length()).
    //     Dividing uv by t stretches the coordinate space —
    //     as t grows, l shrinks, meaning "this pixel is now
    //     inside the ink radius".
    //     When l < 1  → inside the spreading ink blob.
    //     When l > 1  → outside (still showing prevColor).
    // ----------------------------------------------------------
    float l = dot(uv / t, uv / t);


    // ----------------------------------------------------------
    //  5. GRITTY EDGE NOISE
    //     Subtract high-frequency fBm (8 octaves at uv*30) from
    //     l. The noise oscillates around 0.5, so subtracting
    //     (fbm - 0.5) nudges the threshold up and down —
    //     creating a ragged, ink-bleed edge rather than a sharp
    //     disc boundary.
    // ----------------------------------------------------------
    l -= (fbm(uv * 30.0, 8) - 0.5);


    // ----------------------------------------------------------
    //  6. INK COVERAGE VALUE
    //     Sample fBm along the warped angular direction p
    //     to add variation around the rim (some spokes of ink
    //     race ahead, others lag behind).
    //     1.5 is a bias that pushes ink > 0 before the disc
    //     edge fully arrives, giving a soft leading splash.
    //
    //     ink > 1  → fully covered in newColor
    //     ink < 0  → still showing prevColor
    //     0..1     → the blended transition zone
    // ----------------------------------------------------------
    float ink = fbm(p * 16.0, 1) + 1.5 - l;


    // ----------------------------------------------------------
    //  7. COLOR MIX
    //     mix(a, b, t) linearly interpolates from a to b.
    //     We clamp ink to [0,1] so it acts as a clean mask.
    //     Where ink == 1 → full newColor
    //     Where ink == 0 → full prevColor
    // ----------------------------------------------------------
    vec3 col = mix(prevColor, newColor, clamp(ink, 0.0, 1.0));


    // ----------------------------------------------------------
    //  8. CSM OUTPUT
    //     csm_DiffuseColor.rgb carries the material's existing
    //     base color (lighting, textures etc. already baked in).
    //     Multiplying by col tints it with our transition colors.
    //     Alpha is locked to 1 — no transparency needed here.
    // ----------------------------------------------------------
    csm_DiffuseColor = vec4(csm_DiffuseColor.rgb * col, 1.0);
}
