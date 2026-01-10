// frontend/js/api/marketApi.js

const ALPHA_VANTAGE_KEY = "9HDUU4OWY70JH6OT";



/* ============================
   VIX CACHE (GLOBAL)
   ============================ */

// Cache VIX to avoid Alpha Vantage rate limits
let cachedVIX = null;
let lastFetchTime = 0;

// Cache duration (30 minutes is safe for free tier)
const CACHE_DURATION = 30 * 60 * 1000;

/* ============================
   FETCH VIX (Alpha Vantage)
   ============================ */

/**
 * Fetch real-time VIX (Volatility Index)
 * Uses Alpha Vantage free API
 * Includes caching + rate-limit protection
 */
export async function fetchVIX() {
  const now = Date.now();

  // 🔁 Use cache if valid
  if (cachedVIX && now - lastFetchTime < CACHE_DURATION) {
    return cachedVIX;
  }

  const response = await fetch(
    `https://www.alphavantage.co/query?function=VIX&apikey=${ALPHA_VANTAGE_KEY}`
  );

  const data = await response.json();

  // ❌ Rate limit or API failure
  if (data?.Note || !data?.data || data.data.length === 0) {
    throw new Error("Alpha Vantage VIX unavailable or rate limit hit");
  }

  // ✅ Latest VIX value (last entry)
  const latestVIX = parseFloat(
    data.data[data.data.length - 1].value
  );

  if (Number.isNaN(latestVIX)) {
    throw new Error("Invalid VIX value received");
  }

  // Save to cache
  cachedVIX = latestVIX;
  lastFetchTime = now;

  return latestVIX;
}

/* ============================
   OPTIONAL: CLEAR CACHE (DEBUG)
   ============================ */

/**
 * Clears VIX cache manually
 * Useful for testing
 */
export function clearVIXCache() {
  cachedVIX = null;
  lastFetchTime = 0;
}
