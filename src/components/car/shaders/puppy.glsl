varying vec2 vUv;
varying float vTransition;
uniform float uTime;
uniform float uProgress;
uniform float uProgressSmoothness;
uniform float uProgressCurve;
uniform sampler2D uTexture1;
uniform sampler2D uTexture2;
uniform vec2 uResolution;
uniform vec2 uMouseCurrent;
uniform vec2 uMouseTransition;
uniform float uPace;
uniform float uInvertUV;
uniform float uTransition;
uniform float uNextStepProgress;
float rand(float n) {
    return fract(sin(n) * 43758.5453123);
}
float noise(float p) {
    float fl = floor(p);
    float fc = fract(p);
    return mix(rand(fl), rand(fl + 1.0), fc);
}
float map(float value, float min1, float max1, float min2, float max2) {
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}
void main() {
    vec2 uv = vUv;
    float pi = 3.14159265359;
    vec2 normalizedUV = vUv;
    normalizedUV -= 0.5;
    normalizedUV.x *= uResolution.x / uResolution.y;
    float radialGradient = distance(normalizedUV, vec2(0.0));
    float circleSize = 2.0;
    vec2 mouseCurrent = uMouseCurrent;
    vec2 mouseUV = vUv;
    mouseUV.x *= uResolution.x / uResolution.y;
    mouseCurrent.x *= uResolution.x / uResolution.y;
    float mouseCurrentDist = length(mouseUV - mouseCurrent) * circleSize;
    float progressAngle = 0.2;
    float progress = smoothstep(uProgress, uProgress + uProgressCurve * 0.25, vUv.y + vUv.x * (progressAngle - (progressAngle * 2.0 * uProgress)));
    uv.y *= 1.0 - uProgressCurve * 0.4;
    float defaultIntensity = 0.0015;
    float currentCircle = smoothstep(1.0, 0.0, mouseCurrentDist);
    float t1r = texture2D(uTexture1, uv + currentCircle * defaultIntensity * uPace).r;
    float t1g = texture2D(uTexture1, uv + currentCircle * defaultIntensity * uPace).g;
    float t1b = texture2D(uTexture1, uv + currentCircle * defaultIntensity * 0.5 * uPace + (uProgressCurve * 0.02)).b;
    vec4 texture1 = vec4(t1r, t1g, t1b, 1.0);
    float t2r = texture2D(uTexture2, uv + currentCircle * defaultIntensity * uPace).r;
    float t2g = texture2D(uTexture2, uv + currentCircle * defaultIntensity * uPace).g;
    float t2b = texture2D(uTexture2, uv + currentCircle * defaultIntensity * 0.5 * uPace + (uProgressCurve * 0.02)).b;
    vec4 texture2 = vec4(t2r, t2g, t2b, 1.0);
    vec4 combined = mix(texture2, texture1, progress);
    vec2 vignetteUV = vUv;
    vignetteUV *= 1.0 - vignetteUV.yx;
    float vignette = vignetteUV.x * vignetteUV.y * 15.0;
    vignette = pow(vignette, 0.25);
    float vignetteIntensity = 0.2;
    float curveIntensity = sin(uNextStepProgress * pi) * 0.025;
    float nextStep = step(1.0 - uNextStepProgress, map((round(vUv.x * 10.0) + noise(vUv.x)) / 10.0, -1.0, 2.0, 0.0, 1.0));
    vec4 nextCover = vec4(5.0, 5.0, 5.0, 1.0) * nextStep;
    gl_FragColor = combined + (sin(uTransition * pi) * 0.5) - abs(vTransition * 0.001) + ((vignette - 1.0) * vignetteIntensity) - nextStep + nextCover;
    gl_FragColor = vec4(1.0,0.0,0.0,1.0);
}