import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Button } from "../components/UI";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/users", label: "Usuarios" },
  { to: "/categories", label: "Categorías" },
  { to: "/news", label: "Noticias" },
  { to: "/incidents", label: "Incidencias" },
  { to: "/municipality", label: "Municipio" },
];

const AdminShell = () => {
  const { profile, logout } = useAuth();

  return (
    <div className="shell">
      <aside className="sidebar">
        <div>
          <div className="brand">
            <div className="brand-mark">M</div>
            <div>
              <div className="brand-name">Municipia</div>
              <div className="brand-sub">Backoffice</div>
            </div>
          </div>

          <nav className="nav">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`.trim()}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="profile-chip">
            <div className="profile-name">{profile?.fullName || "Admin"}</div>
            <div className="profile-meta">
              {profile?.email || ""} {profile?.role ? `· ${profile.role}` : ""}
            </div>
          </div>
          <Button variant="secondary" onClick={() => logout()}>
            Salir
          </Button>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div>
            <div className="topbar-kicker">Panel de administración</div>
            <div className="topbar-title">
              Municipio #{profile?.municipalityId ?? "-"}
            </div>
          </div>
          <div className="topbar-pill">localhost:8686</div>
        </header>

        <main className="page">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminShell;
