import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import {
  CategoryResponse,
  IncidentResponse,
  NewsResponse,
  PagedResponse,
  UserResponse,
} from "../api/types";
import { Badge, Card, SectionHeader } from "../components/UI";

type Counts = {
  users: number;
  categories: number;
  news: number;
  incidents: number;
};

const DashboardPage = () => {
  const { profile, apiFetch } = useAuth();
  const [counts, setCounts] = useState<Counts | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!profile) return;
      try {
        setLoading(true);
        const municipalityId = profile.municipalityId;
        const [users, categories, news, incidents] = await Promise.all([
          apiFetch<UserResponse[]>(`/api/users?municipalityId=${municipalityId}`),
          apiFetch<CategoryResponse[]>(`/api/categories?municipalityId=${municipalityId}`),
          apiFetch<NewsResponse[]>(`/api/news?municipalityId=${municipalityId}`),
          apiFetch<PagedResponse<IncidentResponse>>(
            `/api/incidents?municipalityId=${municipalityId}&page=0&size=1&sort=id,desc`
          ),
        ]);

        if (!active) return;
        setCounts({
          users: users.length,
          categories: categories.length,
          news: news.length,
          incidents: incidents.total,
        });
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [profile, apiFetch]);

  return (
    <div className="stack">
      <SectionHeader
        title="Dashboard"
        subtitle="Resumen rápido del municipio y accesos a los CRUD principales."
        actions={<Badge tone="primary">MVP local</Badge>}
      />

      <div className="grid cards-4">
        <Card>
          <div className="stat-label">Usuarios</div>
          <div className="stat-value">{loading ? "..." : counts?.users ?? 0}</div>
          <Link to="/users" className="stat-link">
            Abrir usuarios
          </Link>
        </Card>
        <Card>
          <div className="stat-label">Categorías</div>
          <div className="stat-value">{loading ? "..." : counts?.categories ?? 0}</div>
          <Link to="/categories" className="stat-link">
            Abrir categorías
          </Link>
        </Card>
        <Card>
          <div className="stat-label">Noticias</div>
          <div className="stat-value">{loading ? "..." : counts?.news ?? 0}</div>
          <Link to="/news" className="stat-link">
            Abrir noticias
          </Link>
        </Card>
        <Card>
          <div className="stat-label">Incidencias</div>
          <div className="stat-value">{loading ? "..." : counts?.incidents ?? 0}</div>
          <Link to="/incidents" className="stat-link">
            Abrir incidencias
          </Link>
        </Card>
      </div>

      <div className="grid cards-2">
        <Card>
          <h2 className="section-title">Acceso rápido</h2>
          <div className="actions">
            <Link to="/news" className="button secondary">
              Nueva noticia
            </Link>
            <Link to="/incidents" className="button secondary">
              Nueva incidencia
            </Link>
          </div>
        </Card>
        <Card>
          <h2 className="section-title">Municipio activo</h2>
          <p className="muted">
            {profile ? `${profile.fullName} · ${profile.email}` : "Sin sesión"}
          </p>
          <p className="muted">Municipio ID: {profile?.municipalityId ?? "-"}</p>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
