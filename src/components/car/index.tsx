import * as THREE from "three";
import { useEffect, useMemo, useRef, useState, type JSX } from "react";
import { useGLTF } from "@react-three/drei";
import { type GLTF } from "three-stdlib";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import BodyMaterial from "./materials/BodyMaterial";
import { useFrame } from "@react-three/fiber";

// ...GLTFResult type unchanged...

const TYRE_ROTATE_SPEED = 12;

export default function Car(props: JSX.IntrinsicElements["group"]) {
  const { nodes, materials } = useGLTF("/models/car.glb") as unknown as GLTFResult;

  const groupRef = useRef<THREE.Group>(null);
  const tyresRef = useRef<(THREE.Group<THREE.Object3DEventMap> | null)[]>([]);
  const [bounds, setBounds] = useState({ min: 0, max: 2 });

  useEffect(() => {
    if (!groupRef.current) return;
    const box = new THREE.Box3().setFromObject(groupRef.current);
    setBounds({ min: box.min.y, max: box.max.y });
  }, [nodes]);

  useFrame((_, dt) => {
    tyresRef.current.forEach((tyre) => {
      if (tyre) tyre.rotation.x += TYRE_ROTATE_SPEED * dt;
    });
  });

  // Build the merged static body-attached mesh group ONCE per model load
  const mergedStatic = useMemo(() => {
    const staticEntries: { geometry: THREE.BufferGeometry; material: THREE.Material }[] = [
      { geometry: nodes.Object_10.geometry, material: materials.REDFRONTPLandspoilers_pl_tex5 },
      { geometry: nodes.Object_11.geometry, material: materials.bac_tex2 },
      { geometry: nodes.Object_12.geometry, material: nodes.Object_12.material },
      { geometry: nodes.Object_13.geometry, material: materials.black_chrome },
      { geometry: nodes.Object_14.geometry, material: nodes.Object_14.material },
      { geometry: nodes.Object_15.geometry, material: materials.black_plastic },
      { geometry: nodes.Object_16012.geometry, material: materials.bolts },
      { geometry: nodes.Object_16013.geometry, material: materials.bolts },
      { geometry: nodes.Object_16014.geometry, material: materials.bolts },
      { geometry: nodes.Object_16015.geometry, material: materials.bolts },
      { geometry: nodes.Object_17.geometry, material: nodes.Object_17.material },
      { geometry: nodes.Object_18016.geometry, material: materials.brakedisc_tex5 },
      { geometry: nodes.Object_18017.geometry, material: materials.brakedisc_tex5 },
      { geometry: nodes.Object_18018.geometry, material: materials.brakedisc_tex5 },
      { geometry: nodes.Object_18019.geometry, material: materials.brakedisc_tex5 },
      { geometry: nodes.Object_18020.geometry, material: materials.brakedisc_tex5 },
      { geometry: nodes.Object_18021.geometry, material: materials.brakedisc_tex5 },
      { geometry: nodes.Object_18022.geometry, material: materials.brakedisc_tex5 },
      { geometry: nodes.Object_18023.geometry, material: materials.brakedisc_tex5 },
      { geometry: nodes.Object_19.geometry, material: materials.carbon },
      { geometry: nodes.Object_2.geometry, material: materials.CASPITAspoiler },
      { geometry: nodes.Object_22.geometry, material: materials.emb_R },
      { geometry: nodes.Object_23.geometry, material: materials.grill_2 },
      { geometry: nodes.Object_24.geometry, material: materials.grill_tex3 },
      { geometry: nodes.Object_25.geometry, material: materials.headlight_glass },
      { geometry: nodes.Object_26.geometry, material: materials.headlights_tex1 },
      { geometry: nodes.Object_27.geometry, material: materials.material },
      { geometry: nodes.Object_28.geometry, material: materials.intPL },
      { geometry: nodes.Object_29.geometry, material: materials.intlamp_gls_tex2 },
      { geometry: nodes.Object_3.geometry, material: materials.JiottoCHRM_tex1 },
      { geometry: nodes.Object_30.geometry, material: materials.keylock_tex1 },
      { geometry: nodes.Object_31.geometry, material: materials.kvrrem_tex4 },
      { geometry: nodes.Object_32.geometry, material: materials.lampBUTTON_pl_tex1 },
      { geometry: nodes.Object_33.geometry, material: materials.lampBUTTON_tex1 },
      { geometry: nodes.Object_34.geometry, material: materials.lockRED_tex5 },
      { geometry: nodes.Object_35.geometry, material: materials.mirrors_tex5 },
      { geometry: nodes.Object_36.geometry, material: materials.need_for_speed_tex2 },
      { geometry: nodes.Object_37.geometry, material: materials.pbronze_tex5 },
      { geometry: nodes.Object_38.geometry, material: materials.pchrome_tex5 },
      { geometry: nodes.Object_39.geometry, material: materials.pexhachrome_tex5 },
      { geometry: nodes.Object_4.geometry, material: materials.JiottoPL_tex1 },
      { geometry: nodes.Object_40.geometry, material: materials.phole_tex5 },
      { geometry: nodes.Object_41.geometry, material: materials.plate },
      { geometry: nodes.Object_42.geometry, material: materials.pmate_tex5 },
      { geometry: nodes.Object_43.geometry, material: materials.ppl_tex5 },
      { geometry: nodes.Object_44.geometry, material: materials.radiator2_tex3 },
      { geometry: nodes.Object_45.geometry, material: materials.radiator_tex1 },
      { geometry: nodes.Object_46.geometry, material: materials.redtriangle_pl_tex1 },
      { geometry: nodes.Object_50.geometry, material: materials.spd_gls_tex3 },
      { geometry: nodes.Object_51.geometry, material: materials.stickbuttons_pl_tex2 },
      { geometry: nodes.Object_52.geometry, material: materials.suport_tex5 },
      { geometry: nodes.Object_53.geometry, material: materials.tex1 },
      { geometry: nodes.Object_54.geometry, material: materials.tex1_brakelights },
      { geometry: nodes.Object_55.geometry, material: materials.tex2 },
      { geometry: nodes.Object_56028.geometry, material: materials.tire },
      { geometry: nodes.Object_56029.geometry, material: materials.tire },
      { geometry: nodes.Object_56030.geometry, material: materials.tire },
      { geometry: nodes.Object_56031.geometry, material: materials.tire },
      { geometry: nodes.Object_57002.geometry, material: materials.tire_L },
      { geometry: nodes.Object_59.geometry, material: materials.voofer_tex1 },
      { geometry: nodes.Object_6.geometry, material: materials.LOGOhoodCHRM_tex2 },
      { geometry: nodes.Object_60.geometry, material: materials.material_58 },
      { geometry: nodes.Object_61.geometry, material: materials.material_59 },
      { geometry: nodes.Object_7.geometry, material: materials.LOGOhood_tex2 },
      { geometry: nodes.Object_8.geometry, material: materials.PLlogo_tex2 },
      { geometry: nodes.Object_9.geometry, material: materials.POWEREDBYSUBARU },
    ];

    // group by material identity
    const byMaterial = new Map<THREE.Material, THREE.BufferGeometry[]>();
    staticEntries.forEach(({ geometry, material }) => {
      const arr = byMaterial.get(material) ?? [];
      arr.push(geometry);
      byMaterial.set(material, arr);
    });

    const group = new THREE.Group();
    byMaterial.forEach((geometries, material) => {
      const geo = geometries.length > 1 ? mergeGeometries(geometries, false) : geometries[0];
      const mesh = new THREE.Mesh(geo, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
    });

    return group;
  }, [nodes, materials]);

  return (
    <group
      {...props}
      dispose={null}
      ref={(group) => {
        groupRef.current = group;
      }}
    >
      <group name="Sketchfab_model" rotation={[-Math.PI / 2, 0, 0]} scale={1.053}>
        {/* body — kept separate, custom shader */}
        <mesh name="body" geometry={nodes.body.geometry} castShadow receiveShadow>
          <BodyMaterial minY={bounds.min} maxY={bounds.max * 1.5} />
        </mesh>

        {/* everything else — merged by material, rendered as one prebuilt Object3D */}
        <primitive object={mergedStatic} />

        {/* wheels — kept separate groups, each spins independently */}
        <group ref={(el) => (tyresRef.current[0] = el)} name="tyre-1" position={[0.963, -1.254, 0.331]}>
          <mesh geometry={nodes.Object_55001.geometry} material={materials.tire_L} castShadow receiveShadow />
          <mesh geometry={nodes.Object_55001_1.geometry} material={materials.bolts} castShadow receiveShadow />
          <mesh geometry={nodes.Object_55001_2.geometry} material={materials.brakedisc_tex5} castShadow receiveShadow />
          <mesh geometry={nodes.Object_55001_3.geometry} material={materials.emb_L} castShadow receiveShadow />
          <mesh geometry={nodes.Object_55001_4.geometry} material={materials.material_45} castShadow receiveShadow />
          <mesh geometry={nodes.Object_55001_5.geometry} material={materials.rimins1} castShadow receiveShadow />
          <mesh geometry={nodes.Object_55001_6.geometry} material={materials.rimins2} castShadow receiveShadow />
          <mesh geometry={nodes.Object_55001_7.geometry} material={materials.tire} castShadow receiveShadow />
        </group>
        {/* repeat identically for tyre-2 / tyre-3 / tyre-4 with their existing positions/rotations */}
      </group>
    </group>
  );
}

useGLTF.preload("/models/car.glb");