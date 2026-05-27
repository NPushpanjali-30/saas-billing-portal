import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <div className="sidebar">
      <div className="logo">BillingOS</div>

      <div className="menu-title">Main</div>

      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          isActive ? "active-link" : ""
        }
      >
        Dashboard
      </NavLink>

      <NavLink
        to="/billing"
        className={({ isActive }) =>
          isActive ? "active-link" : ""
        }
      >
        Billing
      </NavLink>

      <NavLink
        to="/settings"
        className={({ isActive }) =>
          isActive ? "active-link" : ""
        }
      >
        Settings
      </NavLink>
    </div>
  );
}

export default Sidebar;
