import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  MessageSquare,
  Activity,
  Settings,
  LogOut,
  HardHat,
} from "lucide-react";

import "./AdminSidebar.css";

function AdminSidebar() {
  const navigate = useNavigate();

  const mainMenuItems = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Projects",
      path: "/admin/projects",
      icon: FolderKanban,
    },
    {
      name: "Progress",
      path: "/admin/progress",
      icon: Activity,
    },
    {
      name: "Users",
      path: "/admin/users",
      icon: Users,
    },
    {
      name: "Enquiries",
      path: "/admin/enquiries",
      icon: MessageSquare,
    },
  ];

  function handleLogout() {
    localStorage.removeItem("builder360_token");
    localStorage.removeItem("builder360_user");

    navigate("/admin/login", { replace: true });
  }

  return (
    <aside className="admin-sidebar">
      {/* Sidebar heading */}
      <div className="admin-sidebar-heading">
        <HardHat size={22} />
        <span>WORKSPACE</span>
      </div>

      {/* Main navigation */}
      <nav className="admin-sidebar-nav">
        {mainMenuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `admin-sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={19} strokeWidth={1.8} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="admin-sidebar-bottom">
        {/* System status */}
        <div className="admin-sidebar-status">
          <span className="admin-status-dot"></span>
          <span>System Online</span>
        </div>

        {/* Settings */}
        <NavLink
          to="/admin/settings"
          className={({ isActive }) =>
            `admin-sidebar-link admin-sidebar-bottom-link ${
              isActive ? "active" : ""
            }`
          }
        >
          <Settings size={19} strokeWidth={1.8} />
          <span>Settings</span>
        </NavLink>

        {/* Logout */}
        <button
          type="button"
          className="admin-logout-button"
          onClick={handleLogout}
        >
          <LogOut size={19} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
