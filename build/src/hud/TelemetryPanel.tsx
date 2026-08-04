import { useEffect, useState } from "react";
import { getTelemetry, type TelemetryResponse } from "../api/SatelliteApi";

export default function TelemetryPanel() {
  const [telemetry, setTelemetry] = useState<TelemetryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchTelemetry() {
      try {
        const telemetryData = await getTelemetry();

        if (!cancelled) {
          setTelemetry(telemetryData);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError("Could not load satellite data");
        }

        console.error(err);
      }
    }

    const timeoutId = window.setTimeout(() => {
      fetchTelemetry();
    }, 0);

    const intervalId = window.setInterval(() => {
      fetchTelemetry();
    }, 5000);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="TelemetryPanel">
      {error && <p style={{ color: "red" }}>{error}</p>}

      <p>MODE: {telemetry?.mode ?? "Loading..."}</p>
      <p>RADIO: {telemetry?.radioStatus ?? "Loading..."}</p>
      <p>BATTERY: {telemetry ? `${telemetry.batteryPercent}%` : "Loading..."}</p>
      <p>VOLTAGE: {telemetry ? `${telemetry.batteryVoltage} V` : "Loading..."}</p>
      <p>TEMP: {telemetry ? `${telemetry.temperatureC} °C` : "Loading..."}</p>
    </div>
  );
}