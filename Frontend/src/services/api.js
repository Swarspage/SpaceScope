import axios from "axios";
import { API_BASE_URL } from "../config";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
});

// ============================
// ISS Tracking
// ============================

export const getISSLocation = () => api.get("/iss");

export const getISSPass = (lat, lon) =>
  api.get(`/iss-pass?lat=${lat}&lon=${lon}`);

// ============================
// Aurora & Space Weather
// ============================

export const getAuroraData = (force = false) =>
  api.get(`/aurora${force ? "?force=true" : ""}`);
export const getSolarFlares = () => api.get("/solar-flares");

// ============================
// NASA APIs
// ============================

export const getNASAPhoto = () => api.get("/nasa-apod");

export const getNearEarthObjects = () => api.get("/neo");

export const getEarthImagery = (lat, lon, date) =>
  api.get(`/earth-imagery?lat=${lat}&lon=${lon}&date=${date}`);

// ============================
// Auth APIs
// ============================
export const loginUser = (credentials) => api.post("/auth/login", credentials);
export const registerUser = (userData) => api.post("/auth/register", userData);

export default api;
