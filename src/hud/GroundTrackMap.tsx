import { useEffect, useMemo, useState } from "react";
import * as satellite from "satellite.js";
import { getTleByNoradId, type TleResponse } from "../api/SatelliteApi";
import { createSatrec } from "../scene/orbitMath";

const SELECTED_NORAD_CAT_ID = 25544; // ISS - keep in sync with GlobeScene
const MAP_W = 360;
const MAP_H = 180;
const MINUTES_BEFORE = 46;
const MINUTES_AFTER = 47;
const STEP_MINUTES = 1;

// Ground-track lat/lon of the satellite at a given time.
function groundPoint(satrec: satellite.SatRec, date: Date) {
  const pv = satellite.propagate(satrec, date);
  const eci = pv?.position;
  if (!eci || typeof eci !== "object") return null;
  const geo = satellite.eciToGeodetic(eci, satellite.gstime(date));
  return {
    x: (satellite.degreesLong(geo.longitude) + 180) * (MAP_W / 360),
    y: (90 - satellite.degreesLat(geo.latitude)) * (MAP_H / 180),
  };
}

// Equirectangular mini-map showing the predicted ground track.
export default function GroundTrackMap() {
  const [tle, setTle] = useState<TleResponse | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      getTleByNoradId(SELECTED_NORAD_CAT_ID)
        .then((t) => !cancelled && setTle(t))
        .catch(console.error);
    load();
    const id = window.setInterval(load, 15 * 60 * 1000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const { paths, current } = useMemo(() => {
    if (!tle) return { paths: [] as string[], current: null };
    const satrec = createSatrec(tle.line1, tle.line2);
    const paths: string[] = [];
    let segment: string[] = [];
    let prev: { x: number; y: number } | null = null;

    for (let m = -MINUTES_BEFORE; m <= MINUTES_AFTER; m += STEP_MINUTES) {
      const p = groundPoint(satrec, new Date(now + m * 60_000));
      if (!p) continue;
      // Break the polyline where it wraps across the dateline.
      if (prev && Math.abs(p.x - prev.x) > MAP_W / 2) {
        paths.push(segment.join(" "));
        segment = [];
      }
      segment.push(`${segment.length ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`);
      prev = p;
    }
    if (segment.length) paths.push(segment.join(" "));

    return { paths, current: groundPoint(satrec, new Date(now)) };
  }, [tle, now]);

  return (
    <svg
      className="ground-track-map"
      viewBox={`0 0 ${MAP_W} ${MAP_H}`}
      width={MAP_W}
      height={MAP_H}
    >
      <image
        href={`${import.meta.env.BASE_URL}textures/earth-outline.png`}
        width={MAP_W}
        height={MAP_H}
        opacity={0.6}
      />
      {/* 30° lat/lon grid */}
      {Array.from({ length: 11 }, (_, i) => (i + 1) * 30).map((lon) => (
        <line key={`lon${lon}`} x1={lon} y1={0} x2={lon} y2={MAP_H} className="grid" />
      ))}
      {[30, 60, 90, 120, 150].map((lat) => (
        <line key={`lat${lat}`} x1={0} y1={lat} x2={MAP_W} y2={lat} className="grid" />
      ))}
      {paths.map((d, i) => (
        <path key={i} d={d} className="track" />
      ))}
      {current && (
        <>
          <circle cx={current.x} cy={current.y} r={6} className="sat-glow" />
          <circle cx={current.x} cy={current.y} r={2.5} className="sat" />
        </>
      )}
    </svg>
  );
}
