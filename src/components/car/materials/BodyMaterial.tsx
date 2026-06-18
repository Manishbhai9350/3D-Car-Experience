import { Color, MeshBasicMaterial, MeshPhysicalMaterial, Vector2 } from "three";
import CustomShaderMaterial from "three-custom-shader-material";
import CSM from "three-custom-shader-material/vanilla";
import bodyVertex from "../shaders/bodyshader/vertex.glsl";
import inkFragment1 from "../shaders/bodyshader/ink_transition_1.glsl";

import gsap from "gsap";
import { useRef, useEffect } from "react";
import { useCar } from "../../../context/car/car.hook";

interface BodyMaterialProps {
  minY: number;
  maxY: number;
}

const BodyMaterial = ({ maxY, minY }: BodyMaterialProps) => {
  const CSMRef = useRef<CSM<typeof MeshBasicMaterial>>(null);

  const { colors, currentColorIndex, isAnimatingRef } = useCar();

  const prevColorIndexRef = useRef(currentColorIndex);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const progressProxy = useRef({ value: 0 });

  // -------------------------------
  // 🎨 COLOR TRANSITION (GSAP)
  // -------------------------------
  useEffect(() => {
    if (!CSMRef.current) return;

    const prevIndex = prevColorIndexRef.current;
    const nextIndex = currentColorIndex;

    if (prevIndex === nextIndex) return;
    if (!isAnimatingRef || isAnimatingRef.current) return;

    isAnimatingRef.current = true;

    CSMRef.current.uniforms.prevColor.value = new Color(colors[prevIndex].body);
    CSMRef.current.uniforms.newColor.value = new Color(colors[nextIndex].body);

    progressProxy.current.value = 0;
    CSMRef.current.uniforms.uProgress.value = 0;

    tweenRef.current?.kill();

    tweenRef.current = gsap.to(progressProxy.current, {
      value: 1,
      duration: 2,
      ease: "power2.inOut",
      onUpdate() {
        if (!CSMRef.current) return;

        CSMRef.current.uniforms.uProgress.value = progressProxy.current.value;

        gsap.set(".color-progress-line", {
          scaleX: progressProxy.current.value,
          transformOrigin: "left center",
        });
      },
      onComplete() {
        prevColorIndexRef.current = nextIndex;

        gsap.to(".color-progress-line", {
          scaleX: 0,
          duration: 0.5,
          ease: "power2.inOut",
          transformOrigin: "right center",
          onComplete() {
            gsap.set(".color-progress-line", {
              transformOrigin: "left center",
            });
            isAnimatingRef.current = false;
          },
        });
      },
    });
  }, [currentColorIndex, colors, isAnimatingRef]);

  // Cleanup
  useEffect(() => {
    return () => {
      tweenRef.current?.kill();
      gsap.killTweensOf(".color-progress-line");
      gsap.set(".color-progress-line", {
        scaleX: 0,
        transformOrigin: "left center",
      });
    };
  }, []);

  // -------------------------------
  // 🎯 RETURN MATERIAL
  // -------------------------------
  return (
    <CustomShaderMaterial
      ref={CSMRef}
      baseMaterial={MeshPhysicalMaterial}
      roughness={0.45}
      metalness={1}
      color={0xffffff}
      vertexShader={bodyVertex}
      fragmentShader={inkFragment1}
      uniforms={{
        uMinY: { value: minY },
        uMaxY: { value: maxY },
        uProgress: { value: 0 },
        uTime: { value: 0 },
        prevColor: { value: new Color(colors[currentColorIndex].body) },
        newColor: { value: new Color(colors[currentColorIndex].body) },
        uResolution: { value: new Vector2(innerWidth, innerHeight) },
      }}
    />
  );
};

export default BodyMaterial;
