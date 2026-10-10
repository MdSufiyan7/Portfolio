
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Home from "./pages/Home";
import Login from "./admin/Login";
import Dashboard from "./admin/Dashboard";
import ProjectsManager from "./admin/ProjectsManager";
import ProtectedRoute from "./components/ProtectedRoute";
import CertificateManager from "./admin/CertificateManager";
import ProfileSkillsManager from "./admin/ProfileSkillsManager";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public portfolio */}
        <Route path="/" element={<Home />} />

        {/* Admin login */}
        <Route path="/admin/login" element={<Login />} />

        {/* Private dashboard */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Private project manager */}
        <Route
          path="/admin/projects"
          element={
            <ProtectedRoute>
              <ProjectsManager />
            </ProtectedRoute>
          }
        />

        {/* Unknown URLs return to public homepage */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
        
<Route
  path="/admin/certificates"
  element={
    <ProtectedRoute>
      <CertificateManager />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/profile-skills"
  element={
    <ProtectedRoute>
      <ProfileSkillsManager />
    </ProtectedRoute>
  }
/>

      </Routes>
    </BrowserRouter>
  );
}
