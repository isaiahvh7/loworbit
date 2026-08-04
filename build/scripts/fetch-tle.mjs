// Fetches the latest TLE for our tracked satellite from SatNOGS DB and writes
// it to public/data/tle.json so it gets bundled as a static asset.
//
// Why this exists: db.satnogs.org's API doesn't send CORS headers, so a
// browser on GitHub Pages can't fetch it directly. Doing the fetch here,
// at build time (in CI, server-side), sidesteps that entirely — the
// deployed site just reads its own static JSON file.
//
// Run manually with: node scripts/fetch-tle.mjs
// Run automatically before every `npm run build` (see package.json "prebuild").

import { writeFile, readFile, mkdir } from "fs/promises";
import path from "path";

const SATNOGS_TLE_URL = "https://db.satnogs.org/api/tle/";
const SELECTED_NORAD_CAT_ID = 25544; // ISS - keep in sync with src/scene/GlobeScene.tsx
const OUTPUT_PATH = path.join(process.cwd(), "public", "data", "tle.json");

function normalizeSatelliteName(tle0) {
  return tle0.replace(/^0\s+/, "").trim();
}

async function main() {
  console.log(`Fetching TLE data from ${SATNOGS_TLE_URL} ...`);

  const response = await fetch(SATNOGS_TLE_URL, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`SatNOGS TLE request failed: ${response.status}`);
  }

  const allTles = await response.json();
  const match = allTles.find(
    (tle) => tle.norad_cat_id === SELECTED_NORAD_CAT_ID
  );

  if (!match) {
    throw new Error(
      `No TLE found for NORAD catalog ID ${SELECTED_NORAD_CAT_ID}`
    );
  }

  const tleResponse = {
    satelliteName: normalizeSatelliteName(match.tle0),
    line1: match.tle1,
    line2: match.tle2,
    noradCatId: match.norad_cat_id,
    satId: match.sat_id,
    tleSource: match.tle_source,
    updatedAt: match.updated,
    fetchedAt: new Date().toISOString(),
  };

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, JSON.stringify(tleResponse, null, 2), "utf-8");

  console.log(`Wrote fresh TLE for ${tleResponse.satelliteName} to ${OUTPUT_PATH}`);
}

main().catch(async (error) => {
  console.error("Failed to fetch fresh TLE data:", error.message);

  // Don't fail the whole build over a network hiccup - fall back to
  // whatever TLE is already committed in public/data/tle.json, if any.
  try {
    await readFile(OUTPUT_PATH, "utf-8");
    console.warn(
      "Continuing build with the existing committed public/data/tle.json (may be stale)."
    );
  } catch {
    console.error(
      "No existing public/data/tle.json to fall back to. Build will continue, but the globe will have no satellite to show until this succeeds."
    );
  }
});
