import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is working! 🚀" });
});

// Get ISS location
app.get("/api/iss", async (req, res) => {
  try {
    const response = await axios.get("http://api.open-notify.org/iss-now.json");
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to get ISS data" });
  }
});

// Get ISS pass times
app.get("/api/iss-pass", async (req, res) => {
  try {
    const { lat, lon } = req.query;
    const response = await axios.get(
      `http://api.open-notify.org/iss-pass.json?lat=${lat}&lon=${lon}`
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to get ISS pass data" });
  }
});

// Get Kp Index (Aurora)
app.get("/api/aurora", async (req, res) => {
  try {
    const response = await axios.get(
      "https://services.swpc.noaa.gov/json/geospace/kp_3day.json"
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to get aurora data" });
  }
});

// Get Solar Flare data
app.get("/api/solar-flares", async (req, res) => {
  try {
    const response = await axios.get(
      "https://services.swpc.noaa.gov/json/goes/primary/xrays-6-hour.json"
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to get solar flare data" });
  }
});

// NASA APOD
app.get("/api/nasa-apod", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.nasa.gov/planetary/apod?api_key=${process.env.NASA_API_KEY}`
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to get NASA APOD" });
  }
});

// Near Earth Objects
app.get("/api/neo", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const response = await axios.get(
      `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&api_key=${process.env.NASA_API_KEY}`
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to get NEO data" });
  }
});

// Earth imagery
app.get("/api/earth-imagery", async (req, res) => {
  try {
    const { lat, lon, date } = req.query;
    const response = await axios.get(
      `https://api.nasa.gov/planetary/earth/imagery?lon=${lon}&lat=${lat}&date=${date}&api_key=${process.env.NASA_API_KEY}`
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to get Earth imagery" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 SpaceScope Backend running on http://localhost:${PORT}`);
  console.log(`📡 Test endpoint: http://localhost:${PORT}/api/test`);
});
