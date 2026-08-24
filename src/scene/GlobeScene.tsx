import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import OrbitLine from "./OrbitLine";
import SatelliteMarker from "./SatelliteMarker";
import Starfield from "./Starfield";
import { getTleByNoradId, type TleResponse } from "../api/SatelliteApi";
import { useEffect, useMemo, useState } from "react";
import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { createSatrec, getSatelliteThreePosition } from "./orbitMath";
import * as satellite from "satellite.js";
//import { useThree } from "@react-three/fiber";
import type { RefObject } from "react";
import "./GlobeScene.css";

const EARTH_TEXTURE_ROTATION_OFFSET = 0;

const GLOBE_RADIUS = 2.1;
const ORBIT_VISUAL_SCALE = 1.2; // keep in sync with SatelliteMarker / OrbitLine

function Globe() {
  const earthRef = useRef<THREE.Group>(null);
  const earthOutlineTexture = useTexture(import.meta.env.BASE_URL + "/textures/earth-outline.png");

  useFrame(() => {
    if (!earthRef.current) return;

    const gmst = satellite.gstime(new Date());

    earthRef.current.rotation.y =
      gmst + EARTH_TEXTURE_ROTATION_OFFSET;
  });

  return (
    <group ref={earthRef}>
      {/* Transparent wireframe Earth */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
        <meshStandardMaterial
          color="#00ffff"
          wireframe
          transparent
          opacity={0.05}
          depthWrite={false}
        />
      </mesh>
\
      {/* Back-side continent outlines, faded */}
      <mesh scale={1.01} renderOrder={1}>
        <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
        <meshBasicMaterial
          map={earthOutlineTexture}
          transparent
          opacity={0.22}
          color="#00ffff"
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Front-side continent outlines, bright */}
      <mesh scale={1.012} renderOrder={2}>
        <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
        <meshBasicMaterial
          map={earthOutlineTexture}
          transparent
          color="#00ffff"
          opacity={0.9}
          side={THREE.FrontSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
const SELECTED_NORAD_CAT_ID = 25544; // ISS


type CameraZoomWatcherProps = {
  overlayRef: RefObject<HTMLDivElement | null>;
};


function CameraZoomWatcher({ overlayRef }: CameraZoomWatcherProps) {
  const progressRef = useRef(0);

  useEffect(() => {
    function handleWheel(event: WheelEvent) {
      const zoomSensitivity = 0.000006;

      progressRef.current = THREE.MathUtils.clamp(
        progressRef.current + event.deltaY * zoomSensitivity,
        0,
        1
      );
    }

    window.addEventListener("wheel", handleWheel, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, []);

  useFrame(() => {
    const maxScale = 2000;
    const minScale = 1.15;

    const progress = progressRef.current;

    const targetScale = Math.exp(
      THREE.MathUtils.lerp(
        Math.log(maxScale),
        Math.log(minScale),
        progress
      )
    );

    overlayRef.current?.style.setProperty(
      "--professor-face-scale",
      targetScale.toString()
    );
  });

  return null;
}

const FOLLOW_DISTANCE = 5.5; // how far the camera sits from the satellite
// Where the camera sits along the satellite's path, in degrees:
//   0 = directly above, 90 = ahead of it, -90 = behind it, 180 = below.
const FOLLOW_ANGLE_DEG = -30
// Roll of the view around the line of sight, in degrees:
//   0 = orbit path runs vertically on screen, 90 = path runs horizontally.
const FOLLOW_ROLL_DEG = 140;
// Tilt of the camera out of the orbital plane, in degrees:
//   0 = in the plane (near/far sides of the path overlap),
//   +20 / -20 = above / below the line so both sides are visible.
const FOLLOW_TILT_DEG = -20;

// Chase-cam that follows the satellite marker from a fixed offset in the
// plane of its orbit, zoomed out and aimed toward Earth so both the globe
// and the marker stay on screen.
function SatelliteFollowCamera({ tle }: { tle: TleResponse }) {
  const { camera } = useThree();
  const satrec = useMemo(() => createSatrec(tle.line1, tle.line2), [tle]);

  // Restore the default up vector so OrbitControls isn't tilted afterwards.
  useEffect(() => () => void camera.up.set(0, 1, 0), [camera]);

  useFrame(() => {
    const now = new Date();
    const pos = getSatelliteThreePosition(satrec, now, GLOBE_RADIUS, ORBIT_VISUAL_SCALE);
    const next = getSatelliteThreePosition(
      satrec,
      new Date(now.getTime() + 1000),
      GLOBE_RADIUS,
      ORBIT_VISUAL_SCALE
    );
    if (!pos || !next) return;

    const up = pos.clone().normalize(); // away from Earth
    const forward = next.sub(pos).normalize(); // direction of travel

    const normal = new THREE.Vector3().crossVectors(up, forward).normalize();

    // Offset in the orbital plane, rotated FOLLOW_ANGLE_DEG from "up" toward
    // the direction of travel, then tilted FOLLOW_TILT_DEG out of the plane.
    const angle = THREE.MathUtils.degToRad(FOLLOW_ANGLE_DEG);
    const tilt = THREE.MathUtils.degToRad(FOLLOW_TILT_DEG);
    const offset = up
      .clone()
      .multiplyScalar(Math.cos(angle))
      .add(forward.clone().multiplyScalar(Math.sin(angle)))
      .multiplyScalar(Math.cos(tilt))
      .add(normal.clone().multiplyScalar(Math.sin(tilt)))
      .multiplyScalar(FOLLOW_DISTANCE);

    // Roll the screen "up" between radial-up and the orbit's normal.
    const roll = THREE.MathUtils.degToRad(FOLLOW_ROLL_DEG);
    const screenUp = up
      .clone()
      .multiplyScalar(Math.cos(roll))
      .add(normal.multiplyScalar(Math.sin(roll)));

    camera.position.lerp(pos.clone().add(offset), 0.08);
    camera.up.lerp(screenUp, 0.08);
    // Always aim at Earth's centre so the globe stays centred on screen;
    // the satellite sits off-centre according to the angle/tilt settings.
    camera.lookAt(0, 0, 0);
  });

  return null;
}

export default function GlobeScene() {
  
  const [tle, setTle] = useState<TleResponse | null>(null);
  const professorFaceRef = useRef<HTMLDivElement>(null);
  const [brightness, setBrightness] = useState(1);
  const [followSatellite, setFollowSatellite] = useState(false);

  // Press "C" to toggle between orbiting the globe and chasing the satellite.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "c") {
        setFollowSatellite((value) => !value);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    function updateBrightness() {
      const value = parseFloat(window.location.hash.slice(1));

      if (!isNaN(value)) {
        setBrightness(value);
      } else {
        setBrightness(1);
      }
    }

    updateBrightness();

    window.addEventListener("hashchange", updateBrightness);

    return () => {
      window.removeEventListener("hashchange", updateBrightness);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadTle() {
      try {
        const tleData = await getTleByNoradId(SELECTED_NORAD_CAT_ID);

        if (!cancelled) {
          setTle(tleData);
          console.log("Loaded TLE:", tleData);
        }
      } catch (error) {
        console.error("Failed to load selected satellite TLE:", error);
      }
    }

    const timeoutId = window.setTimeout(() => {
      loadTle();
    }, 0);

    const intervalId = window.setInterval(() => {
      loadTle();
    }, 15 * 60 * 1000);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="globe-scene">
        <Canvas
          camera={{ position: [0, 0, 8], fov: 45 }}
          style={{
            filter: `brightness(${brightness})`,
          }}
        >
        <color attach="background" args={["#020210"]} />

        <ambientLight intensity={0.6} />
        <pointLight position={[5, 5, 5]} intensity={1} />

        <Starfield />

        <Globe />

        {tle && (
          <>
            <OrbitLine tle={tle} globeRadius={GLOBE_RADIUS} />
            <SatelliteMarker tle={tle} globeRadius={GLOBE_RADIUS} />
          </>
        )}
        <CameraZoomWatcher overlayRef={professorFaceRef} />

        {followSatellite && tle ? (
          <SatelliteFollowCamera tle={tle} />
        ) : (
          <OrbitControls
            target={[0, 0, 0]}
            enableDamping
            dampingFactor={0.05}
            minDistance={3}
            maxDistance={50}
            autoRotate
            autoRotateSpeed={0.2}
          />
        )}
        
      </Canvas>
      {/*
      <div ref={professorFaceRef} className="professor-face-overlay">
        <img
          src="/textures/bigv2.png"
          className="professor-face-image"
          alt=""
        />
      </div>
      */}
    </div>
  );
}