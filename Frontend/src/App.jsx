import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "../Context/AuthContext";
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import AuroraPage from "./pages/AuroraPage";
import ISSTracker from "./pages/ISSTracker";
import MissionTimelines from "./pages/MissionTimelines";
import MeteorCalendar from "./pages/MeteorCalender";
import LearningPage from "./pages/LearningPage";
import HomePage from "./pages/HomePage";
import Applications from "./pages/ApplicationsPage";
import CommunityPage from "./pages/CommunityPage"; // Add this
import Particles from "./components/Particles";

// Protected Route Component - must be used inside AuthProvider
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#050714]">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

// AppRoutes - separated to ensure useAuth is called inside AuthProvider
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/aurora"
        element={
          <ProtectedRoute>
            <AuroraPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/iss"
        element={
          <ProtectedRoute>
            <ISSTracker />
          </ProtectedRoute>
        }
      />

      <Route
        path="/missions"
        element={
          <ProtectedRoute>
            <MissionTimelines />
          </ProtectedRoute>
        }
      />

      <Route
        path="/meteors"
        element={
          <ProtectedRoute>
            <MeteorCalendar />
          </ProtectedRoute>
        }
      />

      <Route
        path="/learning"
        element={
          <ProtectedRoute>
            <LearningPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/applications"
        element={
          <ProtectedRoute>
            <Applications />
          </ProtectedRoute>
        }
      />

      <Route
        path="/community"
        element={
          <ProtectedRoute>
            <CommunityPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};




function App() {
  return (
    <AuthProvider>
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, backgroundColor: '#000000' }}>
        <Particles
          particleColors={['#ffffff', '#ffffff']}
          particleCount={200}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover={true}
          alphaParticles={false}
          disableRotation={false}
        />
      </div>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;