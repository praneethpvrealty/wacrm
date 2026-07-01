/**
 * Best-effort location derivation from a Google Maps link, for WhatsApp
 * listing intake when a lister shares a map pin instead of typing an
 * address. Google Maps share links are almost always the short
 * `maps.app.goo.gl/...` form, which is an opaque token — an LLM can't
 * extract anything from it directly. This resolves the redirect chain to
 * the canonical Maps URL, then either reads an embedded place name from
 * the URL path or reverse-geocodes embedded coordinates.
 *
 * No Google Maps API key is configured anywhere in this project, so
 * reverse geocoding uses OpenStreetMap's free Nominatim API instead of
 * Google's (paid) Geocoding API. Nominatim's usage policy caps this at
 * ~1 request/second and requires a descriptive User-Agent — fine for
 * this app's per-listing lookup volume, but not for bulk/high-volume use.
 */

const FETCH_TIMEOUT_MS = 5000;
const NOMINATIM_USER_AGENT = "ConvoRealCRM/1.0 (WhatsApp property listing intake)";

async function fetchWithTimeout(url: string, init: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Resolves a Google Maps URL (short or canonical) to a human-readable
 * location string. Returns null on any failure or when nothing usable
 * could be derived — callers should treat this as best-effort, not a
 * guaranteed result.
 */
export async function resolveLocationFromGoogleMapLink(url: string): Promise<string | null> {
  try {
    const res = await fetchWithTimeout(url, { redirect: "follow" });
    const resolvedUrl = res.url || url;

    // Canonical "place" URLs embed the name directly, e.g.
    // https://www.google.com/maps/place/Jayanagar,+Bengaluru,+Karnataka/@12.925,77.593,15z/...
    const placeMatch = resolvedUrl.match(/\/maps\/place\/([^/@]+)/);
    if (placeMatch) {
      const placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, " ")).trim();
      // Guard against a bare coordinate pair or empty segment slipping
      // through as a "place name".
      if (placeName && !/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(placeName)) {
        return placeName;
      }
    }

    // Fall back to embedded coordinates -> free reverse geocoding.
    const coordMatch = resolvedUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordMatch) {
      const [, lat, lon] = coordMatch;
      const geoRes = await fetchWithTimeout(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=16`,
        { headers: { "User-Agent": NOMINATIM_USER_AGENT } },
      );
      if (geoRes.ok) {
        const geo = (await geoRes.json()) as { display_name?: string };
        if (geo.display_name) return geo.display_name;
      }
    }

    return null;
  } catch (err) {
    console.error("[maps] resolveLocationFromGoogleMapLink failed:", err);
    return null;
  }
}
