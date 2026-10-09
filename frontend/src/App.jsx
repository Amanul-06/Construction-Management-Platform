import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/public/Home/Home";
import AdminLogin from "./pages/admin/AdminLogin/AdminLogin";
import AdminLayout from "./components/admin/AdminLayout/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard/AdminDashboard";
import ProtectedRoute from "./components/admin/ProtectedRoute/ProtectedRoute";
import Projects from "./pages/admin/Projects/Projects";
import Progress from "./pages/admin/Progress/Progress";

function AdminPlaceholder({ title }) {
  return (
    <div style={{ padding: "24px" }}>
      <h1>{title}</h1>
      <p>This section is under development.</p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public website */}
        <Route path="/" element={<Home />} />

        {/* Admin login */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected admin panel */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />

            <Route path="dashboard" element={<AdminDashboard />} />

            <Route path="projects" element={<Projects />} />
            <Route path="progress" element={<Progress />} />

            <Route path="users" element={<AdminPlaceholder title="Users" />} />

            <Route
              path="enquiries"
              element={<AdminPlaceholder title="Enquiries" />}
            />

            <Route
              path="settings"
              element={<AdminPlaceholder title="Settings" />}
            />
          </Route>
        </Route>

        {/* Unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
