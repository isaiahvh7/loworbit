import { useEffect, useMemo, useState } from "react";
import * as satellite from "satellite.js";
import { getTleByNoradId, type TleResponse } from "../api/SatelliteApi";
import { createSatrec } from "../scene/orbitMath";

const SELECTED_NORAD_CAT_ID = 25544; // ISS - keep in sync with GlobeScene

type Orbit = {
  lat: number;
  lon: number;
  altKm: number;
  velKmS: number;
  periodMin: number;
};

function computeOrbit(satrec: satellite.SatRec, date: Date): Orbit | null {
  const pv = satellite.propagate(satrec, date);
  const pos = pv?.position;
  const vel = pv?.velocity;
  if (!pos || !vel || typeof pos !== "object" || typeof vel !== "object") return null;

  const geo = satellite.eciToGeodetic(pos, satellite.gstime(date));
  return {
    lat: satellite.degreesLat(geo.latitude),
    lon: satellite.degreesLong(geo.longitude),
    altKm: geo.height,
    velKmS: Math.hypot(vel.x, vel.y, vel.z),
    periodMin: (2 * Math.PI) / satrec.no, // satrec.no is rad/min
  };
}

// Live orbital readout for the tracked satellite, propagated from the TLE.
export default function StatusPanel() {
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

  const satrec = useMemo(
    () => (tle ? createSatrec(tle.line1, tle.line2) : null),
    [tle]
  );
  const orbit = satrec ? computeOrbit(satrec, new Date(now)) : null;

  const fmt = (n: number, digits: number, unit = "") =>
    orbit ? `${n.toFixed(digits)}${unit}` : "...";

  return (
    <div className="StatusPanel">
      <p className="panel-label">Orbital Statistics</p>
      <p>LAT: {orbit ? fmt(orbit.lat, 2, "°") : "..."}</p>
      <p>LON: {orbit ? fmt(orbit.lon, 2, "°") : "..."}</p>
      <p>ALT: {orbit ? fmt(orbit.altKm, 0, " km") : "..."}</p>
      <p>VEL: {orbit ? fmt(orbit.velKmS, 2, " km/s") : "..."}</p>
      <p>PERIOD: {orbit ? fmt(orbit.periodMin, 1, " min") : "..."}</p>
    </div>
  );
}
