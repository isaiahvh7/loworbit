/**
 * If this page is left open indefinitely (e.g. on a TV in a lobby), schedule
 * one full reload per day at a fixed, low-traffic local time. This:
 *
 *  - guarantees the tab eventually picks up new deploys (the in-app TLE/
 *    telemetry polling refreshes *data*, but only a reload picks up new
 *    JS/CSS)
 *  - resets any slow WebGL/three.js memory or GPU state drift that can
 *    build up over days of continuous rendering
 *
 * Safe to call once at app startup. Does nothing dramatic - just a plain
 * `location.reload()` on a timer, recalculated each time so it keeps firing
 * daily rather than only once.
 */
export function scheduleDailyKioskReload(hour = 4, minute = 0): void {
  function msUntilNextReload(): number {
    const now = new Date();
    const next = new Date(now);

    next.setHours(hour, minute, 0, 0);

    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }

    return next.getTime() - now.getTime();
  }

  function scheduleNext(): void {
    window.setTimeout(() => {
      window.location.reload();
    }, msUntilNextReload());
  }

  scheduleNext();
}
