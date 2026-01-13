// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Dashboard from "./Pages/Dashboard";
// import LoginPage from "./Pages/LoginPage";
// import AuroraPage from "./Pages/AuroraPage";
// import ISSTracker from "./Pages/ISSTracker";
// import MissionTimelines from "./Pages/MissionTimelines";

// function App() {
//   return (
//     <Router>
//       <Routes>
//         {/* Main Dashboard - Default Route */}
//         <Route path="/" element={<Dashboard />} />

//         {/* Authentication */}
//         <Route path="/login" element={<LoginPage />} />

//         {/* Feature Pages */}
//         <Route path="/aurora" element={<AuroraPage />} />
//         <Route path="/iss" element={<ISSTracker />} />
//         <Route path="/missions" element={<MissionTimelines />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "../Context/AuthContext";
import Dashboard from "./Pages/Dashboard";
import LoginPage from "./Pages/LoginPage";
import ProfilePage from "./Pages/ProfilePage";
import AuroraPage from "./Pages/AuroraPage";
import ISSTracker from "./Pages/ISSTracker";
import MissionTimelines from "./Pages/MissionTimelines";

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
      {/* Authentication */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes */}
      <Route
        path="/"
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

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;