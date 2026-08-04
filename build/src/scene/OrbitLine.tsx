import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Line } from "@react-three/drei";

import type { TleResponse } from "../api/SatelliteApi";
import { createSatrec, getSatelliteThreePosition } from "./orbitMath";

type OrbitLineProps = {
  tle: TleResponse;
  globeRadius: number;
};

type Point3 = [number, number, number];

type LineObject = THREE.Object3D & {
  material?: THREE.Material | THREE.Material[];
};

const SEGMENT_COUNT = 180;
const MINUTES_BEFORE = 46;
const MINUTES_AFTER = 47;
const ORBIT_VISUAL_SCALE = 1.20;

function setLineOpacity(ref: RefObject<LineObject | null>, opacity: number) {
  const line = ref.current;

  if (!line?.material) return;

  if (Array.isArray(line.material)) {
    line.material.forEach((material) => {
      material.opacity = opacity;
      material.transparent = true;
    });
  } else {
    line.material.opacity = opacity;
    line.material.transparent = true;
  }
}

function OrbitSegment({
  start,
  end,
}: {
  start: THREE.Vector3;
  end: THREE.Vector3;
}) {
  const coreRef = useRef<LineObject | null>(null);
  const glowRef = useRef<LineObject | null>(null);
  const { camera } = useThree();

  const points: Point3[] = [
    [start.x, start.y, start.z],
    [end.x, end.y, end.z],
  ];

  const midpoint = useMemo(() => {
    return start.clone().add(end).multiplyScalar(0.5);
  }, [start, end]);

  useFrame(() => {
    const cameraDistanceFromCenter = camera.position.length();
    const segmentDistanceFromCamera = camera.position.distanceTo(midpoint);
    const segmentDistanceFromCenter = midpoint.length();

    const closestPossibleDistance = Math.max(
      0.001,
      cameraDistanceFromCenter - segmentDistanceFromCenter
    );

    const farthestPossibleDistance =
      cameraDistanceFromCenter + segmentDistanceFromCenter;

    const depthAmount = THREE.MathUtils.clamp(
      (segmentDistanceFromCamera - closestPossibleDistance) /
        (farthestPossibleDistance - closestPossibleDistance),
      0,
      1
    );

    const coreOpacity = THREE.MathUtils.lerp(0.95, 0.08, depthAmount);
    const glowOpacity = THREE.MathUtils.lerp(0.2, 0.02, depthAmount);

    setLineOpacity(coreRef, coreOpacity);
    setLineOpacity(glowRef, glowOpacity);
  });

  return (
    <>
      <Line
        ref={(node) => {
          glowRef.current = node as LineObject | null;
        }}
        points={points}
        color="#00ffff"
        lineWidth={5}
        transparent
        opacity={0.2}
        depthWrite={false}
      />

      <Line
        ref={(node) => {
          coreRef.current = node as LineObject | null;
        }}
        points={points}
        color="#00ffff"
        lineWidth={2}
        transparent
        opacity={0.95}
        depthWrite={false}
      />
    </>
  );
}

export default function OrbitLine({ tle, globeRadius }: OrbitLineProps) {
  const [pathCenterTimeMs, setPathCenterTimeMs] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    function updatePathCenterTime() {
      if (!cancelled) {
        setPathCenterTimeMs(Date.now());
      }
    }

    const timeoutId = window.setTimeout(updatePathCenterTime, 0);
    const intervalId = window.setInterval(updatePathCenterTime, 60 * 1000);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, [tle]);

  const segments = useMemo(() => {
    if (pathCenterTimeMs === null) {
      return [];
    }

    const satrec = createSatrec(tle.line1, tle.line2);
    const totalMinutes = MINUTES_BEFORE + MINUTES_AFTER;
    const positions: THREE.Vector3[] = [];

    for (let i = 0; i <= SEGMENT_COUNT; i++) {
      const minutesOffset =
        -MINUTES_BEFORE + (i / SEGMENT_COUNT) * totalMinutes;

      const date = new Date(pathCenterTimeMs + minutesOffset * 60 * 1000);

      const position = getSatelliteThreePosition(
        satrec,
        date,
        globeRadius,
        ORBIT_VISUAL_SCALE
      );

      if (position) {
        positions.push(position);
      }
    }

    const orbitSegments: { start: THREE.Vector3; end: THREE.Vector3 }[] = [];

    for (let i = 0; i < positions.length - 1; i++) {
      orbitSegments.push({
        start: positions[i],
        end: positions[i + 1],
      });
    }

    return orbitSegments;
  }, [tle, globeRadius, pathCenterTimeMs]);

  return (
    <>
      {segments.map((segment, index) => (
        <OrbitSegment key={index} start={segment.start} end={segment.end} />
      ))}
    </>
  );
}