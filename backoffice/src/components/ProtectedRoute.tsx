import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Button, Card } from "./UI";

const ProtectedRoute = () => {
  const { loading, token, profile, logout } = useAuth();

  if (loading) {
    return (
      <div className="boot-screen">
        <div className="boot-card">
          <div className="spinner" />
          <p>Cargando backoffice...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (profile?.role !== "ADMIN") {
    return (
      <div className="boot-screen">
        <Card className="boot-card">
          <h1 className="page-title">Acceso restringido</h1>
          <p className="page-subtitle">
            Este backoffice está preparado para usuarios administradores.
          </p>
          <div className="actions">
            <Button variant="secondary" onClick={() => logout()}>
              Cerrar sesión
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
