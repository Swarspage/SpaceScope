import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import mongoose from "mongoose"; // ADD THIS
import authRoutes from "./Routes/authRoutes.js"; // ADD THIS
import notificationRoutes from "./Routes/notificationRoutes.js"; // ADD THIS
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load NASA backup data
const NASABackupData = JSON.parse(readFileSync(join(__dirname, 'data', 'NASA.json'), 'utf-8'));

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());


// MongoDB Connection - ADD THIS
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/spacescope', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));


// Auth Routes - ADD THIS
app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);

import postRoutes from "./Routes/postRoutes.js";
app.use('/api/posts', postRoutes);

import aiRoutes from "./Routes/aiRoutes.js";
app.use('/api/ai', aiRoutes);


// Basic logger for visibility
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

/* -------------------------
   Config / base URLs
   ------------------------- */
const SPACEX_BASE = process.env.SPACEX_BASE || "https://api.spacexdata.com";
const ISRO_BASE = process.env.ISRO_BASE || "https://isro.vercel.app";
const NASA_API_KEY = process.env.NASA_API_KEY || "";
const AGGREGATE_CACHE_TTL_SECONDS = Number(process.env.AGGREGATE_CACHE_TTL_SECONDS) || 30;
const SPACEX_CACHE_TTL_SECONDS = Number(process.env.SPACEX_CACHE_TTL_SECONDS) || 60;

/* -------------------------
   Simple in-memory cache
   ------------------------- */
const cache = new Map();

function setCache(key, data, ttlSeconds = SPACEX_CACHE_TTL_SECONDS) {
  const expiresAt = Date.now() + ttlSeconds * 1000;
  cache.set(key, { data, expiresAt });
}
function getCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}
function clearExpiredCache() {
  const now = Date.now();
  for (const [k, v] of cache.entries()) {
    if (v.expiresAt <= now) cache.delete(k);
  }
}
setInterval(clearExpiredCache, 30 * 1000);

/* -------------------------
   Utility: safe axios GET
   ------------------------- */
async function safeGet(url, opts = {}) {
  try {
    // Enforce 5s timeout unless specified
    const config = { timeout: 5000, ...opts };
    const r = await axios.get(url, config);
    return r.data;
  } catch (err) {
    console.error(`GET ${url} failed:`, err?.message || err.code);
    throw err;
  }
}

/* -------------------------
   Solar Flares Endpoint
   ------------------------- */
app.get("/api/solar-flares", async (req, res) => {
  try {
    const cacheKey = "noaa:solar-flares";
    const cached = getCache(cacheKey);
    if (cached) return res.json(cached);

    // Fetch 6-hour X-ray flux (good for real-time dashboard)
    const data = await safeGet("https://services.swpc.noaa.gov/json/goes/primary/xrays-6-hour.json");
    setCache(cacheKey, data, 300); // 5 min cache
    res.json(data);
  } catch (e) {
    // Return dummy/empty data on failure to prevent frontend crash
    // Sending 2.4 flux (typical background)
    res.json([{ time_tag: new Date().toISOString(), flux: 1e-7 }]);
  }
});

/* -------------------------
   Existing basic endpoints
   ------------------------- */

app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is working" });
});

app.get("/api/iss", async (req, res) => {
  try {
    const data = await safeGet("http://api.open-notify.org/iss-now.json");
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "Failed to get ISS data" });
  }
});

app.get("/api/iss-pass", async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: "lat and lon required" });

    // OpenNotify requires 'lat' and 'lon', order doesn't explicitly matter but let's be safe.
    // It returns JSON.
    const response = await axios.get(`http://api.open-notify.org/iss-pass.json`, {
      params: { lat, lon }
    });

    res.json(response.data);
  } catch (e) {
    console.error("ISS Pass Error:", e.message);
    // Return empty data structure to prevent frontend crash if API fails
    res.status(200).json({ response: [] });
  }
});

app.get("/api/aurora", async (req, res) => {
  try {
    const cacheKey = "noaa:aurora";
    const force = req.query.force === "true";
    const cached = getCache(cacheKey);

    if (cached && !force) {
      return res.json(cached);
    }

    const data = await safeGet("https://services.swpc.noaa.gov/json/ovation_aurora_latest.json");

    // Validate and Optimize Data
    if (data && Array.isArray(data.coordinates)) {
      // 1. Filter: Remove low intensity points (<= 2)
      // This removes the "background noise" that isn't really visible anyway
      let optimizedCoords = data.coordinates.filter(p => p[2] > 2);

      // 2. Downsample: Ensure we don't send too many points (Target < 2000)
      const MAX_POINTS = 2000;
      if (optimizedCoords.length > MAX_POINTS) {
        const step = Math.ceil(optimizedCoords.length / MAX_POINTS);
        optimizedCoords = optimizedCoords.filter((_, i) => i % step === 0);
      }

      data.coordinates = optimizedCoords;

      // Cache for 5 minutes (300 seconds)
      setCache(cacheKey, data, 300);
    }

    // 3. Fetch Real Kp Index (Planetary K-index)
    try {
      const kpUrl = "https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json";
      const kpRes = await axios.get(kpUrl, { timeout: 3000 });
      if (kpRes.data && Array.isArray(kpRes.data)) {
        // Format: [time, kp, a_running, station_count]
        // Get the last valid entry
        const latest = kpRes.data[kpRes.data.length - 1];
        if (latest && latest.length >= 2) {
          data.kp_index = Number(latest[1]);
        }
      }
    } catch (kpErr) {
      console.warn("Failed to fetch Kp index:", kpErr.message);
      // Fallback if needed, but dashboard has its own default
    }

    res.json(data);
  } catch (e) {
    console.error("Aurora fetch error:", e?.message);
    res.status(500).json({ error: "Failed to get aurora data" });
  }
});

/* -------------------------
   SpaceX proxy endpoints (kept from previous)
   ------------------------- */

app.get("/api/spacex/launches", async (req, res) => {
  try {
    const cacheKey = "spacex:launches";
    const cached = getCache(cacheKey);
    if (cached) return res.json(cached);

    const url = `${SPACEX_BASE}/v4/launches`;
    const data = await safeGet(url);
    setCache(cacheKey, data, SPACEX_CACHE_TTL_SECONDS);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch SpaceX launches" });
  }
});

app.get("/api/spacex/launches/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const url = `${SPACEX_BASE}/v4/launches/${encodeURIComponent(id)}`;
    const data = await safeGet(url);
    res.json(data);
  } catch (e) {
    res.status(e.response?.status || 500).json({ error: "Failed to fetch SpaceX launch" });
  }
});

app.get("/api/spacex/launches/latest", async (req, res) => {
  try {
    // try v5 then v4 fallback
    try {
      const urlV5 = `${SPACEX_BASE}/v5/launches/latest`;
      const d = await safeGet(urlV5);
      return res.json(d);
    } catch (err) {
      const urlV4 = `${SPACEX_BASE}/v4/launches/latest`;
      const d2 = await safeGet(urlV4);
      return res.json(d2);
    }
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch latest SpaceX launch" });
  }
});

app.post("/api/spacex/launches/query", async (req, res) => {
  try {
    const url = `${SPACEX_BASE}/v4/launches/query`;
    const r = await axios.post(url, req.body, { headers: { "Content-Type": "application/json" } });
    res.json(r.data);
  } catch (e) {
    res.status(e.response?.status || 500).json({ error: "Failed to query SpaceX launches" });
  }
});

app.get("/api/spacex/rockets", async (req, res) => {
  try {
    const cacheKey = "spacex:rockets";
    const cached = getCache(cacheKey);
    if (cached) return res.json(cached);

    const url = `${SPACEX_BASE}/v4/rockets`;
    const data = await safeGet(url);
    setCache(cacheKey, data, SPACEX_CACHE_TTL_SECONDS);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch rockets" });
  }
});

app.get("/api/spacex/rockets/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const url = `${SPACEX_BASE}/v4/rockets/${encodeURIComponent(id)}`;
    const data = await safeGet(url);
    res.json(data);
  } catch (e) {
    res.status(e.response?.status || 500).json({ error: "Failed to fetch rocket" });
  }
});

app.get("/api/spacex/company", async (req, res) => {
  try {
    const cacheKey = "spacex:company";
    const cached = getCache(cacheKey);
    if (cached) return res.json(cached);

    const url = `${SPACEX_BASE}/v4/company`;
    const data = await safeGet(url);
    setCache(cacheKey, data, SPACEX_CACHE_TTL_SECONDS);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch company info" });
  }
});

/* -------------------------
   ISRO proxy endpoints
   - ISRO open-source repo exposes endpoints such as:
     /api/spacecrafts, /api/launchers, /api/spacecraft_missions, /api/centres, /api/customer_satellites
   - Base can be overridden via ISRO_BASE in .env
   ------------------------- */

app.get("/api/isro/spacecrafts", async (req, res) => {
  try {
    const cacheKey = "isro:spacecrafts";
    const cached = getCache(cacheKey);
    if (cached) return res.json(cached);

    const url = `${ISRO_BASE}/api/spacecrafts`;
    const data = await safeGet(url);
    setCache(cacheKey, data, SPACEX_CACHE_TTL_SECONDS);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch ISRO spacecrafts" });
  }
});

app.get("/api/isro/launchers", async (req, res) => {
  try {
    const cacheKey = "isro:launchers";
    const cached = getCache(cacheKey);
    if (cached) return res.json(cached);

    const url = `${ISRO_BASE}/api/launchers`;
    const data = await safeGet(url);
    setCache(cacheKey, data, SPACEX_CACHE_TTL_SECONDS);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch ISRO launchers" });
  }
});

app.get("/api/isro/missions", async (req, res) => {
  try {
    const cacheKey = "isro:missions";
    const cached = getCache(cacheKey);
    if (cached) return res.json(cached);

    // repo sometimes uses /api/spacecraft_missions
    const urlCandidates = [
      `${ISRO_BASE}/api/spacecraft_missions`,
      `${ISRO_BASE}/api/spacecraft_mission`,
      `${ISRO_BASE}/api/spacecraft-missions`,
      `${ISRO_BASE}/api/spacecrafts/missions`
    ];

    let data = null;
    for (const u of urlCandidates) {
      try {
        data = await safeGet(u);
        if (data) break;
      } catch (err) {
        // try next candidate
      }
    }
    if (!data) throw new Error("No ISRO missions endpoint found at ISRO_BASE");
    setCache(cacheKey, data, SPACEX_CACHE_TTL_SECONDS);
    res.json(data);
  } catch (e) {
    console.error("ISRO missions error:", e?.message || e);
    res.status(500).json({ error: "Failed to fetch ISRO missions" });
  }
});

/* -------------------------
   NASA endpoints
   - APOD (requires NASA_API_KEY)
   - NASA launches (uses Launch Library to collect launches from providers that match 'NASA' name)
   ------------------------- */

app.get("/api/nasa/apod", async (req, res) => {
  try {
    if (!NASA_API_KEY) return res.status(400).json({ error: "NASA_API_KEY not set in .env" });
    const url = `https://api.nasa.gov/planetary/apod?api_key=${encodeURIComponent(NASA_API_KEY)}`;
    const data = await safeGet(url);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch NASA APOD" });
  }
});

app.get("/api/nasa/launches", async (req, res) => {
  try {
    // We use the public Launch Library to fetch upcoming/past launches and filter by provider name containing "NASA"
    // This is a practical way to get a collection of NASA-related launches in a consistent schema
    const cacheKey = "nasa:launches";
    const cached = getCache(cacheKey);
    if (cached) return res.json(cached);

    const limit = Number(req.query.limit) || 100;
    const url = `https://ll.thespacedevs.com/2.2.0/launch/?limit=${limit}&ordering=-window_start`;

    try {
      const resp = await safeGet(url);

      // resp.results is expected; be defensive
      const results = resp?.results || resp?.launches || [];
      // filter launches where launch_service_provider or agencies contain NASA
      const nasaMatches = results.filter((l) => {
        const providerName = l?.launch_service_provider?.name || "";
        if (providerName && /nasa/i.test(providerName)) return true;

        // some entries include agencies in payloads/mission; be permissive
        const agencies = (l?.rocket?.second_stage?.payloads || []).map((p) => p?.agencies || []).flat();
        if (agencies.some((a) => a?.name && /nasa/i.test(a.name))) return true;
        return false;
      });

      // If we got NASA data, return it; otherwise use backup
      if (nasaMatches.length > 0) {
        console.log("✅ NASA launches API returned data:", nasaMatches.length, "missions");
        setCache(cacheKey, nasaMatches, SPACEX_CACHE_TTL_SECONDS);
        res.json(nasaMatches);
      } else {
        console.log("⚠️ NASA launches API returned no missions, using backup data");
        setCache(cacheKey, NASABackupData, SPACEX_CACHE_TTL_SECONDS);
        res.json(NASABackupData);
      }
    } catch (apiError) {
      console.error("NASA launches API error, using backup data:", apiError?.message || apiError);
      setCache(cacheKey, NASABackupData, SPACEX_CACHE_TTL_SECONDS);
      res.json(NASABackupData);
    }
  } catch (e) {
    console.error("NASA launches error:", e?.message || e);
    res.status(500).json({ error: "Failed to fetch NASA launches" });
  }
});

/* -------------------------
   Aggregate endpoint
   - Returns combined launch/mission lists from SpaceX, ISRO and NASA
   - Useful for single-page view
   ------------------------- */

app.get("/api/aggregate/launches", async (req, res) => {
  try {
    const cacheKey = "aggregate:launches";
    const cached = getCache(cacheKey);
    if (cached) return res.json(cached);

    // fetch in parallel with fallbacks
    const promises = {
      spacex: safeGet(`${SPACEX_BASE}/v4/launches`).catch((e) => {
        console.error("agg: spacex failed", e?.message || e);
        return [];
      }),
      isro: (async () => {
        // prefer ISRO missions; fallback to launchers or spacecrafts if not available
        try {
          const m = await safeGet(`${ISRO_BASE}/api/spacecraft_missions`);
          return m;
        } catch (e1) {
          try {
            const l = await safeGet(`${ISRO_BASE}/api/launchers`);
            return l;
          } catch (e2) {
            try {
              const s = await safeGet(`${ISRO_BASE}/api/spacecrafts`);
              return s;
            } catch (e3) {
              console.warn("agg: isro endpoints all failed");
              return [];
            }
          }
        }
      })(),
      nasa: (async () => {
        try {
          // re-use the same Launch Library approach as /api/nasa/launches
          const url = `https://ll.thespacedevs.com/2.2.0/launch/?limit=1000&ordering=-window_start`;
          const r = await safeGet(url);
          const results = r?.results || [];

          // Filter for NASA missions
          const nasaMatches = results.filter((l) => {
            const providerName = l?.launch_service_provider?.name || "";
            if (providerName && /nasa/i.test(providerName)) return true;
            const agencies = (l?.rocket?.second_stage?.payloads || []).map((p) => p?.agencies || []).flat();
            if (agencies.some((a) => a?.name && /nasa/i.test(a.name))) return true;
            return false;
          });

          // If we got NASA data, return it; otherwise use backup
          if (nasaMatches.length > 0) {
            console.log("✅ NASA API returned data:", nasaMatches.length, "missions");
            return nasaMatches;
          } else {
            console.log("⚠️ NASA API returned no missions, using backup data");
            return NASABackupData;
          }
        } catch (e) {
          console.error("agg: nasa fetch failed, using backup data", e?.message || e);
          return NASABackupData;
        }
      })(),
    };

    const [spacexData, isroData, nasaData] = await Promise.all([promises.spacex, promises.isro, promises.nasa]);

    console.log(`[AGGREGATE] SpaceX: ${Array.isArray(spacexData) ? spacexData.length : 'Not Array'}, ISRO: ${Array.isArray(isroData) ? isroData.length : 'Not Array'}, NASA: ${Array.isArray(nasaData) ? nasaData.length : 'Not Array'}`);

    const ensureArray = (d) => Array.isArray(d) ? d : [];

    const payload = {
      // LIMIT: Only send top 20 missions per agency to reduce payload size
      spacex: ensureArray(spacexData).slice(0, 20),
      isro: ensureArray(isroData).slice(0, 20),
      nasa: ensureArray(nasaData).slice(0, 20),
      generated_at: new Date().toISOString(),
    };

    setCache(cacheKey, payload, AGGREGATE_CACHE_TTL_SECONDS);
    res.json(payload);
  } catch (e) {
    console.error("Aggregate error:", e?.message || e);
    res.status(500).json({ error: "Failed to fetch aggregated launches" });
  }
});

/* -------------------------
   Generic 404 + error handler
   ------------------------- */
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

/* -------------------------
   Start server
   ------------------------- */
const PORT = process.env.PORT || 5000;
/* -------------------------
   Notification Scheduler
   ------------------------- */
import { broadcastNotification } from "./Controllers/notificationController.js";

const METEOR_SHOWERS = [
  { name: "Quadrantids", month: 0, day: 3 },
  { name: "Lyrids", month: 3, day: 22 },
  { name: "Eta Aquariids", month: 4, day: 6 },
  { name: "Perseids", month: 7, day: 12 },
  { name: "Orionids", month: 9, day: 21 },
  { name: "Leonids", month: 10, day: 17 },
  { name: "Geminids", month: 11, day: 14 },
];

async function checkAstronomyEvents() {
  console.log(`[${new Date().toISOString()}] Checking astronomy events...`);

  // 1. Check Aurora (Kp Index)
  try {
    const cacheKey = "noaa:planetary-k-index";
    let kpData = getCache(cacheKey);

    if (!kpData) {
      // Fetch Kp index (using a known NOAA endpoint or simulation if elusive)
      // For simplicity/reliability in this demo, we'll check the 6-hour x-ray we alrady have or specialized endpoint
      // Real endpoint: https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json
      const kIndexUrl = "https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json";
      try {
        const response = await axios.get(kIndexUrl);
        kpData = response.data;
        setCache(cacheKey, kpData, 300);
      } catch (err) {
        console.warn("Failed to fetch Kp index for notifications");
      }
    }

    if (kpData && Array.isArray(kpData)) {
      // Data format: [time, kp, a_running, station_count]
      // We look at the last entry
      const latest = kpData[kpData.length - 1];
      // latest[1] is Kp index as string or number
      const kp = Number(latest[1]);

      if (kp >= 6) { // Geomagnetic Storm Level G2+
        await broadcastNotification(
          "Aurora Alert!",
          `High geomagnetic activity detected (Kp ${kp}). Auroras may be visible at lower latitudes!`,
          "alert",
          "/applications" // Redirect to map
        );
      }
    }
  } catch (error) {
    console.error("Aurora check error:", error.message);
  }

  // 2. Check Meteor Showers
  const now = new Date();
  const todayMonth = now.getMonth();
  const todayDate = now.getDate();

  const shower = METEOR_SHOWERS.find(s => s.month === todayMonth && s.day === todayDate);
  if (shower) {
    // Check if we haven't already sent a notification for this today (naive check: just send it, frontend handles dedupe display or user ignores)
    // In a real app we'd check a "sentNotifications" log. 
    // For this loop which runs every 1.5 hours, we might send it multiple times on the peak day.
    // Fix: Only send if hour is between 18:00 and 20:00 (evening)
    const hour = now.getHours();
    if (hour >= 18 && hour < 20) {
      await broadcastNotification(
        "Meteor Shower Peak Tonight!",
        `The ${shower.name} meteor shower peaks tonight. Look up for a spectacular show!`,
        "event",
        "/learning"
      );
    }
  }
}

// Run scheduler every 1.5 hours (90 minutes)
const INTERVAL_MS = 90 * 60 * 1000;
setInterval(checkAstronomyEvents, INTERVAL_MS);

// Run once on startup after a delay to test
setTimeout(checkAstronomyEvents, 10000);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`SpaceX base: ${SPACEX_BASE}`);
  console.log(`ISRO base: ${ISRO_BASE}`);
  console.log(`Available Env Vars: ${Object.keys(process.env).filter(k => !k.startsWith('npm_')).join(', ')}`);
});
