# SINGULARITY 🌌
**The Ultimate "Mission Control" for Space Enthusiasts**

![Singularity Banner](https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop) 
*(Replace this link with your own screenshot/banner if available)*

> **Top 8 Finalist out of 100+ Submissions** 🏆

**Singularity** is a next-generation space exploration platform that aggregates real-time telemetry from NASA, SpaceX, and ISRO into a unified, immersive dashboard. It bridges the gap between raw scientific data and public accessibility through high-fidelity 3D visualizations, gamified learning, and AI-powered assistance.

---

## 🎥 Project Demo
**[Watch the Full App Tutorial]([./app_tutorial.mp4](https://www.youtube.com/watch?v=lDWuxWCVywc))**
*(Click above to view the walkthrough)*

---

## 🚀 The Brutal Feature List
Every feature in Singularity is built for performance, immersion, and scientific accuracy.

### 1. Core UX & Interface
*   **Parallax Landing Page:** Hero section features multi-layer depth scrolling effects with Framer Motion.
*   **3D Earth Entry:** Rotating WebGL Earth globe (`react-globe.gl`) with atmosphere rendering.
*   **Particle System:** Global background particle effects that react to mouse movement.
*   **Custom Cursor:** 'TargetCursor' component replaces default pointer with a sci-fi crosshair.
*   **Glassmorphism UI:** Application-wide use of backdrop filters and neon block borders.
*   **Mobile-First:** Fully adaptive layout with a custom "Capsule" mobile navigation bar.
*   **Soundscape:** Ambient space audio track with specific "Mute/Unmute" toggle state.

### 2. Dashboard Command Center
*   **Live Clock:** Multi-timezone greeting ("Good Morning/Evening") based on local system time.
*   **Daily Briefing:** Randomly generates famous space quotes on every load.
*   **Notification Hub:** YouTube-style dropdown aggregating system alerts, launches, and social interactions.
*   **Aggregated Stats:** Real-time counters for "Active Missions", "Next Pass", and "Aurora Kp".
*   **Dynamic Carousel:** Featured content slider that pauses auto-rotation on mouse hover.
*   **Mini-Map:** Interactive preview showing real-time Aurora heatzones.

### 3. Real-Time ISS Tracking
*   **3D Orbital View:** Accurate ISS model rendering floating above Earth surface.
*   **Ground Track:** 2D Mercator map showing current sub-satellite point and path history.
*   **Physics Propagation:** Client-side SGP4 math (`satellite.js`) calculates position 60x/second.
*   **User Geolocation:** Browser API requests user coordinates for pass predictions.
*   **Pass Prediction:** Iterative loop calculates next 24h of flyover events locally.
*   **Email Alerts:** **Nodemailer** integration sends HTML emails for upcoming visible passes.

### 4. Aurora & Environmental Monitor
*   **Kp Index Heatmap:** Visualizes geomagnetic storm intensity (Green to Red).
*   **Best View Finder:** Haversine formula finds nearest high-intensity aurora point to your location.
*   **Satellite Layers:** Toggles for **NDVI** (Vegetation), **CO2**, **Temp Anomaly**, and **Light Pollution**.
*   **Debris Globe:** 3D visualization of orbital debris density fields.
*   **CO2 Calculator:** Gamified modal for simulating carbon footprint reduction.

### 5. Mission Control & Launch Data
*   **Universal Timeline:** Merges **SpaceX**, **NASA**, and **ISRO** data into a single feed.
*   **Status Badges:** Indicators for "Success", "Failure", and "Upcoming".
*   **Launch Filtering:** Client-side filtering by Provider or Mission Status.
*   **Launch Countdown:** Dynamic T-Minus timer for the nearest upcoming mission.
*   **Mission Deep Dive:** Modal view showing rocket specs, launch site, and orbit details.

### 6. Learning Zone & Gamification
*   **Module Locker:** Sequential unlocking system (Module 2 locked until Module 1 complete).
*   **Video Integration:** Embedded YouTube players with completion tracking.
*   **XP System:** Backend awards experience points for finishing content.
*   **Global Leaderboard:** Ranks top 50 users based on total XP.
*   **Quiz Engine:** Interactive state machine for assessments with **Streak Counters**.
*   **AI Hints:** "Ask AI" button in quizzes provides context-aware clues via Gemini.

### 7. Users & Community
*   **JWT Authentication:** Stateless, secure token-based session management.
*   **The Cosmic Feed:** Infinite-scroll timeline of user posts with "Like" functionality.
*   **Smart Avatar:** Auto-generates user avatar initials if no custom image is uploaded.
*   **Danger Zone:** "Delete Account" functionality wipes user data from MongoDB.

### 8. AI & Chatbot ("Astro")
*   **Persistent Widget:** Floating chat bubble accessible from any page.
*   **Context Injection:** System prompt automatically updates based on your current Page (e.g., provides Aurora facts when on Aurora page).
*   **Gemini Proxy:** Backend route protects API keys; frontend only sends text prompts.

---

## 🛠 Technology Stack

### Frontend
*   **React 19** (Vite)
*   **Three.js / React-Globe.gl** (3D Rendering)
*   **TailwindCSS** (Styling)
*   **Framer Motion** (Animations)
*   **Leaflet.js** (2D Mapping)
*   **Satellite.js** (Orbital Mechanics)

### Backend
*   **Node.js & Express**
*   **MongoDB & Mongoose** (Database)
*   **Nodemailer** (Email Service)
*   **Google Gemini AI** (LLM Integration)
*   **Node-Cron** (Scheduled Tasks)

---

## ⚙️ Usage & Installation

### Prerequisites
*   Node.js (v18+)
*   MongoDB Atlas Account
*   Groq API Key

### 1. Clone the Repo
```bash
git clone https://github.com/yourusername/singularity.git
cd singularity
```

### 2. Backend Setup
```bash
cd Backend
npm install
# Create .env file (see .env.example)
npm run dev
```

### 3. Frontend Setup
```bash
cd Frontend
npm install
# Create .env file (see .env.example)
npm run dev
```

### 4. Lift Off 🚀
Visit `http://localhost:5173` to enter Mission Control.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
*Built with 💙 and ☕ during the Hackathon.*
