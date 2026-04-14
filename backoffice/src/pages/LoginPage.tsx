import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Button, Card, Field, Input } from "../components/UI";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loading, token } = useAuth();
  const [email, setEmail] = useState("admin@creixell.cat");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="boot-screen">
        <div className="boot-card">
          <div className="spinner" />
          <p>Preparando acceso...</p>
        </div>
      </div>
    );
  }

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      await login(email.trim(), password);
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      setError(err?.message || "No se pudo iniciar sesión");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-screen">
      <Card className="login-card">
        <div className="login-head">
          <div className="brand-mark large">M</div>
          <div>
            <h1 className="page-title">Municipia Backoffice</h1>
            <p className="page-subtitle">Acceso local para gestionar el contenido.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <Field label="Email">
            <Input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              autoComplete="email"
              required
            />
          </Field>
          <Field label="Contraseña">
            <Input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              autoComplete="current-password"
              required
            />
          </Field>

          {error ? <div className="error-box">{error}</div> : null}

          <Button type="submit" disabled={submitting}>
            {submitting ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;
