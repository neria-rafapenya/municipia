import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { Badge, Card, EmptyState, SectionHeader } from "../components/UI";
import type { MunicipalityResponse } from "../api/types";

const MunicipalityPage = () => {
  const { profile, apiFetch } = useAuth();
  const [municipality, setMunicipality] = useState<MunicipalityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) {
      return;
    }

    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        const result = await apiFetch<MunicipalityResponse>(
          `/api/municipalities/${profile.municipalityId}`
        );
        if (active) {
          setMunicipality(result);
        }
      } catch (error) {
        if (active) {
          setFeedback(error instanceof Error ? error.message : "No se pudo cargar el municipio");
        }
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
  }, [apiFetch, profile]);

  const configJson = useMemo(() => {
    if (!municipality?.configJson) {
      return "";
    }
    try {
      return JSON.stringify(JSON.parse(municipality.configJson), null, 2);
    } catch {
      return municipality.configJson;
    }
  }, [municipality]);

  if (!profile) {
    return null;
  }

  return (
    <div className="stack">
      <SectionHeader
        title="Municipio"
        subtitle="Datos del municipio activo para esta sesión."
        actions={<Badge tone="primary">ID #{profile.municipalityId}</Badge>}
      />

      {feedback ? <div className="error-box">{feedback}</div> : null}

      <Card>
        {loading ? (
          <div className="boot-card">
            <div className="spinner" />
            <p>Cargando municipio...</p>
          </div>
        ) : municipality ? (
          <div className="detail-grid">
            <div className="grid cards-2">
              <div className="card">
                <div className="muted">Nombre</div>
                <h2 className="section-title">{municipality.name}</h2>
              </div>
              <div className="card">
                <div className="muted">Código postal</div>
                <h2 className="section-title">{municipality.postalCode}</h2>
              </div>
            </div>

            <div>
              <h3 className="section-title">Config JSON</h3>
              {configJson ? (
                <pre className="json-pre">{configJson}</pre>
              ) : (
                <EmptyState>Este municipio todavía no tiene configuración JSON.</EmptyState>
              )}
            </div>
          </div>
        ) : (
          <EmptyState>No se encontró el municipio activo.</EmptyState>
        )}
      </Card>
    </div>
  );
};

export default MunicipalityPage;
