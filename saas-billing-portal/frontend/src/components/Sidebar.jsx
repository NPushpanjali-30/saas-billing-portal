import { NavLink, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    const confirm = window.confirm("Are you sure you want to logout?");
    if (!confirm) return;
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="sidebar">
      <div className="logo">BillingOS</div>

      <div className="menu-title">Main</div>

      <NavLink
        to="/dashboard"
        className={({ isActive }) => isActive ? "active-link" : ""}
      >
        Dashboard
      </NavLink>

      <NavLink
        to="/billing"
        className={({ isActive }) => isActive ? "active-link" : ""}
      >
        Billing
      </NavLink>

      <NavLink
        to="/customers"
        className={({ isActive }) => isActive ? "active-link" : ""}
      >
        Customers
      </NavLink>

      <NavLink
        to="/settings"
        className={({ isActive }) => isActive ? "active-link" : ""}
      >
        Settings
      </NavLink>

      <div style={{ marginTop: "auto", paddingTop: "20px" }}>
        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            background: "rgba(239,68,68,0.15)",
            color: "#ef4444",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: "10px",
            padding: "12px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "14px"
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
