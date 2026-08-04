export type TleResponse = {
  satelliteName: string;
  line1: string;
  line2: string;
  noradCatId: number;
  satId: string;
  tleSource: string;
  updatedAt: string;
  fetchedAt?: string;
};

export type TelemetryResponse = {
  timestamp: string;
  batteryVoltage: number;
  batteryPercent: number;
  temperatureC: number;
  radioStatus: string;
  mode: string;
};

// These live under public/data/ and ship as static files with the build -
// no server involved. tle.json is regenerated on every build by
// scripts/fetch-tle.mjs (see that file for why it isn't fetched live from
// the browser). telemetry.json is a static sample reading.
//
// import.meta.env.BASE_URL respects the `base` set in vite.config.ts, so
// this still works when the site is served from a GitHub Pages subpath
// like https://<user>.github.io/low-orbit/.
const DATA_BASE_URL = `${import.meta.env.BASE_URL}data`;

async function fetchJsonNoCache<T>(path: string): Promise<T> {
  // cache: "no-store" + a cache-busting query param ensures a long-lived
  // tab (e.g. running on a TV) actually sees new data once it's deployed,
  // instead of holding on to whatever the browser cached on first load.
  const response = await fetch(`${path}?t=${Date.now()}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${path} (${response.status})`);
  }

  return response.json();
}

export async function getTleByNoradId(
  noradCatId: number
): Promise<TleResponse> {
  const tle = await fetchJsonNoCache<TleResponse>(`${DATA_BASE_URL}/tle.json`);

  if (tle.noradCatId !== noradCatId) {
    console.warn(
      `Requested TLE for NORAD ID ${noradCatId} but tle.json contains ${tle.noradCatId}. ` +
        `Update SELECTED_NORAD_CAT_ID in scripts/fetch-tle.mjs and GlobeScene.tsx if you want to track a different satellite.`
    );
  }

  return tle;
}

export async function getTelemetry(): Promise<TelemetryResponse> {
  return fetchJsonNoCache<TelemetryResponse>(`${DATA_BASE_URL}/telemetry.json`);
}
