import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  SectionHeader,
  Select,
  TextArea,
} from "../components/UI";
import type {
  CategoryResponse,
  CreateIncidentRequest,
  IncidentHistoryResponse,
  IncidentResponse,
  IncidentStatus,
  PagedResponse,
  UpdateIncidentRequest,
  UserResponse,
} from "../api/types";

const incidentStatuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "REJECTED"] as const;

const initialCreateForm = {
  description: "",
  categoryId: "",
  latitude: "",
  longitude: "",
  locationAccuracy: "",
  imageUrl: "",
  aiConfidence: "",
};

const initialUpdateForm = {
  assignedOperatorId: "",
  status: "OPEN" as IncidentStatus,
  comment: "",
  imageUrl: "",
  resolutionImageUrl: "",
};

const statusTone = (status: IncidentStatus) => {
  if (status === "RESOLVED") return "success";
  if (status === "REJECTED") return "danger";
  if (status === "IN_PROGRESS") return "warning";
  return "primary";
};

const parseNumber = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? Number(trimmed) : null;
};

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const IncidentsPage = () => {
  const { profile, apiFetch } = useAuth();
  const [incidents, setIncidents] = useState<IncidentResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [savingCreate, setSavingCreate] = useState(false);
  const [savingUpdate, setSavingUpdate] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; text: string } | null>(
    null
  );
  const [selectedIncidentId, setSelectedIncidentId] = useState<number | null>(null);
  const [history, setHistory] = useState<IncidentHistoryResponse[]>([]);
  const [createForm, setCreateForm] = useState(initialCreateForm);
  const [updateForm, setUpdateForm] = useState(initialUpdateForm);

  const selectedIncident = useMemo(
    () => incidents.find((item) => item.id === selectedIncidentId) ?? null,
    [incidents, selectedIncidentId]
  );

  const categoryNameById = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories]
  );
  const userNameById = useMemo(
    () => new Map(users.map((user) => [user.id, user.fullName])),
    [users]
  );

  const loadReferenceData = useCallback(async () => {
    if (!profile) return;
    try {
      const [categoryList, userList] = await Promise.all([
        apiFetch<CategoryResponse[]>(`/api/categories?municipalityId=${profile.municipalityId}`),
        apiFetch<UserResponse[]>(`/api/users?municipalityId=${profile.municipalityId}`),
      ]);
      setCategories(categoryList);
      setUsers(userList);
    } catch (error) {
      setFeedback({
        tone: "error",
        text: error instanceof Error ? error.message : "No se pudieron cargar datos de apoyo",
      });
    }
  }, [apiFetch, profile]);

  const loadIncidents = useCallback(async () => {
    if (!profile) return;
    try {
      setLoading(true);
      const response = await apiFetch<PagedResponse<IncidentResponse>>(
        `/api/incidents?municipalityId=${profile.municipalityId}&page=0&size=200&sort=id,desc`
      );
      setIncidents(response.items);
      setSelectedIncidentId((current) => {
        if (current && response.items.some((item) => item.id === current)) {
          return current;
        }
        return response.items[0]?.id ?? null;
      });
    } catch (error) {
      setFeedback({
        tone: "error",
        text: error instanceof Error ? error.message : "No se pudieron cargar las incidencias",
      });
    } finally {
      setLoading(false);
    }
  }, [apiFetch, profile]);

  const loadHistory = useCallback(
    async (incidentId: number) => {
      try {
        setHistoryLoading(true);
        const list = await apiFetch<IncidentHistoryResponse[]>(
          `/api/incidents/${incidentId}/history`
        );
        setHistory(list);
      } catch (error) {
        setHistory([]);
        setFeedback({
          tone: "error",
          text: error instanceof Error ? error.message : "No se pudo cargar el historial",
        });
      } finally {
        setHistoryLoading(false);
      }
    },
    [apiFetch]
  );

  useEffect(() => {
    loadReferenceData();
    loadIncidents();
  }, [loadIncidents, loadReferenceData]);

  useEffect(() => {
    if (selectedIncident) {
      setUpdateForm({
        assignedOperatorId: selectedIncident.assignedOperatorId?.toString() ?? "",
        status: (selectedIncident.status as IncidentStatus) || "OPEN",
        comment: "",
        imageUrl: selectedIncident.imageUrl ?? "",
        resolutionImageUrl: selectedIncident.resolutionImageUrl ?? "",
      });
      loadHistory(selectedIncident.id);
      return;
    }
    setHistory([]);
  }, [loadHistory, selectedIncident]);

  if (!profile) {
    return null;
  }

  const handleCreateSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setSavingCreate(true);
      setFeedback(null);
      const payload: CreateIncidentRequest = {
        description: createForm.description.trim(),
        categoryId: parseNumber(createForm.categoryId),
        latitude: parseNumber(createForm.latitude),
        longitude: parseNumber(createForm.longitude),
        locationAccuracy: parseNumber(createForm.locationAccuracy),
        imageUrl: createForm.imageUrl.trim() || null,
        aiConfidence: parseNumber(createForm.aiConfidence),
      };
      await apiFetch<{ id: number }>("/api/incidents", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setFeedback({ tone: "success", text: "Incidencia creada." });
      setCreateForm(initialCreateForm);
      await loadIncidents();
    } catch (error) {
      setFeedback({
        tone: "error",
        text: error instanceof Error ? error.message : "No se pudo crear la incidencia",
      });
    } finally {
      setSavingCreate(false);
    }
  };

  const handleUpdateSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedIncident) return;
    try {
      setSavingUpdate(true);
      setFeedback(null);
      const payload: UpdateIncidentRequest = {
        assignedOperatorId: parseNumber(updateForm.assignedOperatorId),
        status: updateForm.status,
        comment: updateForm.comment.trim() || null,
        imageUrl: updateForm.imageUrl.trim() || null,
        resolutionImageUrl: updateForm.resolutionImageUrl.trim() || null,
      };
      await apiFetch<IncidentResponse>(`/api/incidents/${selectedIncident.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      setFeedback({ tone: "success", text: "Incidencia actualizada." });
      await loadIncidents();
    } catch (error) {
      setFeedback({
        tone: "error",
        text: error instanceof Error ? error.message : "No se pudo actualizar la incidencia",
      });
    } finally {
      setSavingUpdate(false);
    }
  };

  return (
    <div className="stack">
      <SectionHeader
        title="Incidencias"
        subtitle="Crea, revisa y actualiza el estado de las incidencias del municipio."
        actions={<Badge tone="primary">{incidents.length} incidencias</Badge>}
      />

      {feedback ? (
        <div className={feedback.tone === "error" ? "error-box" : "success-box"}>
          {feedback.text}
        </div>
      ) : null}

      <div className="grid cards-2">
        <Card>
          <h2 className="section-title">Nueva incidencia</h2>
          <p className="muted">
            Se creará como el usuario logueado dentro del municipio actual.
          </p>
          <form className="form" onSubmit={handleCreateSubmit}>
            <Field label="Descripción">
              <TextArea
                value={createForm.description}
                onChange={(event) =>
                  setCreateForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                required
              />
            </Field>
            <Field label="Categoría">
              <Select
                value={createForm.categoryId}
                onChange={(event) =>
                  setCreateForm((current) => ({ ...current, categoryId: event.target.value }))
                }
              >
                <option value="">Sin categoría</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="form-grid">
              <Field label="Latitud">
                <Input
                  value={createForm.latitude}
                  onChange={(event) =>
                    setCreateForm((current) => ({ ...current, latitude: event.target.value }))
                  }
                />
              </Field>
              <Field label="Longitud">
                <Input
                  value={createForm.longitude}
                  onChange={(event) =>
                    setCreateForm((current) => ({ ...current, longitude: event.target.value }))
                  }
                />
              </Field>
            </div>
            <div className="form-grid">
              <Field label="Precisión">
                <Input
                  value={createForm.locationAccuracy}
                  onChange={(event) =>
                    setCreateForm((current) => ({
                      ...current,
                      locationAccuracy: event.target.value,
                    }))
                  }
                />
              </Field>
              <Field label="Confianza AI">
                <Input
                  value={createForm.aiConfidence}
                  onChange={(event) =>
                    setCreateForm((current) => ({ ...current, aiConfidence: event.target.value }))
                  }
                />
              </Field>
            </div>
            <Field label="Imagen URL">
              <Input
                value={createForm.imageUrl}
                onChange={(event) =>
                  setCreateForm((current) => ({ ...current, imageUrl: event.target.value }))
                }
                placeholder="https://..."
              />
            </Field>
            <Button type="submit" disabled={savingCreate}>
              {savingCreate ? "Creando..." : "Crear incidencia"}
            </Button>
          </form>
        </Card>

        <Card className="scroll-card">
          <h2 className="section-title">
            {selectedIncident ? `Incidencia #${selectedIncident.id}` : "Detalle"}
          </h2>
          {selectedIncident ? (
            <div className="detail-grid">
              <div className="chip-list">
                <Badge tone={statusTone(selectedIncident.status)}>{selectedIncident.status}</Badge>
                <span className="chip">
                  Usuario: {userNameById.get(selectedIncident.userId) ?? `#${selectedIncident.userId}`}
                </span>
                <span className="chip">
                  Categoría:{" "}
                  {selectedIncident.categoryId
                    ? categoryNameById.get(selectedIncident.categoryId) ??
                      `#${selectedIncident.categoryId}`
                    : "Sin categoría"}
                </span>
              </div>

              <div>
                <div className="muted">Descripción</div>
                <p>{selectedIncident.description}</p>
              </div>

              <div className="form-grid">
                <div>
                  <div className="muted">Coordenadas</div>
                  <p>
                    {selectedIncident.latitude ?? "—"}, {selectedIncident.longitude ?? "—"}
                  </p>
                </div>
                <div>
                  <div className="muted">Capturada</div>
                  <p>{formatDate(selectedIncident.locationCapturedAt)}</p>
                </div>
              </div>

              {selectedIncident.imageUrl ? (
                <div className="preview">
                  <img
                    className="preview-image"
                    src={selectedIncident.imageUrl}
                    alt={`Incidencia ${selectedIncident.id}`}
                  />
                </div>
              ) : null}

              <div>
                <div className="muted">Adjuntos</div>
                {selectedIncident.attachments.length ? (
                  <div className="chip-list">
                    {selectedIncident.attachments.map((attachment) => (
                      <a
                        key={attachment.id}
                        className="chip"
                        href={attachment.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {attachment.fileName || `Adjunto #${attachment.id}`}
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="muted">Sin adjuntos</p>
                )}
              </div>

              <form className="form" onSubmit={handleUpdateSubmit}>
                <h3 className="section-title">Actualizar incidencia</h3>
                <Field label="Operador asignado">
                  <Select
                    value={updateForm.assignedOperatorId}
                    onChange={(event) =>
                      setUpdateForm((current) => ({
                        ...current,
                        assignedOperatorId: event.target.value,
                      }))
                    }
                  >
                    <option value="">Sin asignar</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.fullName} ({user.role})
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Estado">
                  <Select
                    value={updateForm.status}
                    onChange={(event) =>
                      setUpdateForm((current) => ({
                        ...current,
                        status: event.target.value as IncidentStatus,
                      }))
                    }
                  >
                    {incidentStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Comentario">
                  <TextArea
                    value={updateForm.comment}
                    onChange={(event) =>
                      setUpdateForm((current) => ({ ...current, comment: event.target.value }))
                    }
                  />
                </Field>
                <Field label="Imagen incidente">
                  <Input
                    value={updateForm.imageUrl}
                    onChange={(event) =>
                      setUpdateForm((current) => ({ ...current, imageUrl: event.target.value }))
                    }
                  />
                </Field>
                <Field label="Imagen de resolución">
                  <Input
                    value={updateForm.resolutionImageUrl}
                    onChange={(event) =>
                      setUpdateForm((current) => ({
                        ...current,
                        resolutionImageUrl: event.target.value,
                      }))
                    }
                  />
                </Field>
                <Button type="submit" disabled={savingUpdate}>
                  {savingUpdate ? "Guardando..." : "Actualizar"}
                </Button>
              </form>

              <div>
                <div className="muted">Historial</div>
                {historyLoading ? (
                  <div className="boot-card">
                    <div className="spinner" />
                    <p>Cargando historial...</p>
                  </div>
                ) : history.length ? (
                  <div className="detail-grid">
                    {history.map((entry) => (
                      <div key={entry.id} className="card" style={{ boxShadow: "none" }}>
                        <div className="chip-list">
                          <Badge tone={statusTone(entry.newStatus ?? "OPEN")}>
                            {entry.previousStatus ?? "—"} → {entry.newStatus ?? "—"}
                          </Badge>
                          <span className="chip">#{entry.changedByUserId}</span>
                          <span className="chip">{formatDate(entry.changedAt)}</span>
                        </div>
                        {entry.operatorComment ? <p>{entry.operatorComment}</p> : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="muted">Sin histórico disponible.</p>
                )}
              </div>
            </div>
          ) : (
            <EmptyState>Selecciona una incidencia del listado para ver el detalle.</EmptyState>
          )}
        </Card>
      </div>

      <Card>
        <div className="toolbar">
          <h2 className="section-title">Listado</h2>
          <Badge tone="neutral">{incidents.length} registros</Badge>
        </div>

        {loading ? (
          <div className="boot-card">
            <div className="spinner" />
            <p>Cargando incidencias...</p>
          </div>
        ) : incidents.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Estado</th>
                  <th>Usuario</th>
                  <th>Categoría</th>
                  <th>Descripción</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((incident) => (
                  <tr key={incident.id}>
                    <td>#{incident.id}</td>
                    <td>
                      <Badge tone={statusTone(incident.status)}>{incident.status}</Badge>
                    </td>
                    <td>{userNameById.get(incident.userId) ?? `#${incident.userId}`}</td>
                    <td>
                      {incident.categoryId
                        ? categoryNameById.get(incident.categoryId) ?? `#${incident.categoryId}`
                        : "—"}
                    </td>
                    <td>{incident.description.slice(0, 90)}</td>
                    <td>
                      <div className="table-actions">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => setSelectedIncidentId(incident.id)}
                        >
                          Ver
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState>No hay incidencias todavía.</EmptyState>
        )}
      </Card>
    </div>
  );
};

export default IncidentsPage;
