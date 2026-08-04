import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

import type { TleResponse } from "../api/SatelliteApi";
import { createSatrec, getSatelliteThreePosition } from "./orbitMath";

const ORBIT_VISUAL_SCALE = 1.20;

type SatelliteMarkerProps = {
  tle: TleResponse;
  globeRadius: number;
};

export default function SatelliteMarker({
  tle,
  globeRadius,
}: SatelliteMarkerProps) {
  const satelliteRef = useRef<THREE.Group>(null);

  const satrec = useMemo(() => {
    return createSatrec(tle.line1, tle.line2);
  }, [tle]);

  useFrame(() => {
    if (!satelliteRef.current) return;

    const position = getSatelliteThreePosition(
      satrec,
      new Date(),
      globeRadius,
      ORBIT_VISUAL_SCALE
    );

    if (!position) {
      satelliteRef.current.visible = false;
      return;
    }

    satelliteRef.current.visible = true;
    satelliteRef.current.position.copy(position);
  });

  return (
    <group ref={satelliteRef}>
      {/* Outer red glow */}
      <mesh>
        <sphereGeometry args={[0.18, 32, 32]} />
        <meshBasicMaterial
          color="#ff0033"
          transparent
          opacity={0.28}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Main satellite dot */}
      <mesh>
        <sphereGeometry args={[0.07, 32, 32]} />
        <meshBasicMaterial color="#ff0033" />
      </mesh>
    </group>
  );
}