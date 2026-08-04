import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import OrbitLine from "./OrbitLine";
import SatelliteMarker from "./SatelliteMarker";
import Starfield from "./Starfield";
import { getTleByNoradId, type TleResponse } from "../api/SatelliteApi";
import { useEffect, useState } from "react";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as satellite from "satellite.js";
//import { useThree } from "@react-three/fiber";
import type { RefObject } from "react";

const EARTH_TEXTURE_ROTATION_OFFSET = 0;

const GLOBE_RADIUS = 2.1;

function Globe() {
  const earthRef = useRef<THREE.Group>(null);
  const earthOutlineTexture = useTexture("/textures/earth-outline.png");

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

export default function GlobeScene() {
  
  const [tle, setTle] = useState<TleResponse | null>(null);
  const professorFaceRef = useRef<HTMLDivElement>(null);
 

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
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <color attach="background" args={["#000008"]} />

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
        

        <OrbitControls 
          maxDistance={2000000}
        />
        
      </Canvas>
      <div ref={professorFaceRef} className="professor-face-overlay">
        <img
          src="/textures/bigv2.png"
          className="professor-face-image"
          alt=""
        />
      </div>
    </div>
  );
}