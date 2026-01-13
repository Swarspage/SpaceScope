import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./Pages/Dashboard";
import LoginPage from "./Pages/LoginPage";
import AuroraPage from "./Pages/AuroraPage";
import ISSTracker from "./Pages/ISSTracker";
import MissionTimelines from "./Pages/MissionTimelines";

function App() {
  return (
    <Router>
      <Routes>
        {/* Main Dashboard - Default Route */}
        <Route path="/" element={<Dashboard />} />

        {/* Authentication */}
        <Route path="/login" element={<LoginPage />} />

        {/* Feature Pages */}
        <Route path="/aurora" element={<AuroraPage />} />
        <Route path="/iss" element={<ISSTracker />} />
        <Route path="/missions" element={<MissionTimelines />} />
      </Routes>
    </Router>
  );
}

export default App;