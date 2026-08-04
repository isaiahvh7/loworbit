import * as THREE from "three";
import * as satellite from "satellite.js";

const EARTH_RADIUS_KM = 6371;

type EciPosition = {
  x: number;
  y: number;
  z: number;
};

function isEciPosition(position: unknown): position is EciPosition {
  if (!position || typeof position !== "object") return false;

  const maybePosition = position as Partial<EciPosition>;

  return (
    typeof maybePosition.x === "number" &&
    typeof maybePosition.y === "number" &&
    typeof maybePosition.z === "number"
  );
}

export function createSatrec(line1: string, line2: string): satellite.SatRec {
  return satellite.twoline2satrec(line1, line2);
}

export function getSatelliteThreePosition(
  satrec: satellite.SatRec,
  date: Date,
  globeRadius: number,
  orbitScale = 1
): THREE.Vector3 | null {
  const positionAndVelocity = satellite.propagate(satrec, date);

  if (!positionAndVelocity) {
    return null;
  }

  const position = positionAndVelocity.position;

  if (!isEciPosition(position)) {
    return null;
  }

  const scale = globeRadius / EARTH_RADIUS_KM;

  const threePosition = new THREE.Vector3(
    position.x * scale,
    position.z * scale,
    -position.y * scale
  );

  return threePosition.multiplyScalar(orbitScale);
}