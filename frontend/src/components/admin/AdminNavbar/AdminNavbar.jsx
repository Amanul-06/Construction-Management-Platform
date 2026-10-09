import { useNavigate } from "react-router-dom";
import "./AdminNavbar.css";

function AdminNavbar() {
  const navigate = useNavigate();

  let user = {};

  try {
    user = JSON.parse(localStorage.getItem("builder360_user") || "{}");
  } catch {
    user = {};
  }

  return (
    <header className="admin-navbar">
      <div className="admin-navbar-brand">
        <span className="admin-brand-mark">B</span>

        <div>
          <h2>Builder360</h2>
          <span>Administration</span>
        </div>
      </div>

      <div className="admin-navbar-profile">
        <div className="admin-profile-info">
          <strong>{user.name || "Administrator"}</strong>
          <span>Admin</span>
        </div>

        <div className="admin-avatar">
          {(user.name || "A").charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}

export default AdminNavbar;
