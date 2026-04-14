import React, { useCallback, useEffect, useState } from "react";
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
import type { CategoryCreateRequest, CategoryResponse, CategoryUpdateRequest } from "../api/types";

const initialForm = {
  name: "",
  description: "",
  active: true,
};

const CategoriesPage = () => {
  const { profile, apiFetch } = useAuth();
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deactivatingId, setDeactivatingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; text: string } | null>(
    null
  );
  const [form, setForm] = useState(initialForm);

  const loadCategories = useCallback(async () => {
    if (!profile) return;
    try {
      setLoading(true);
      const list = await apiFetch<CategoryResponse[]>(
        `/api/categories?municipalityId=${profile.municipalityId}`
      );
      setCategories(list);
    } catch (error) {
      setFeedback({
        tone: "error",
        text: error instanceof Error ? error.message : "No se pudieron cargar las categorías",
      });
    } finally {
      setLoading(false);
    }
  }, [apiFetch, profile]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  if (!profile) {
    return null;
  }

  const resetForm = () => {
    setEditingId(null);
    setForm(initialForm);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setSaving(true);
      setFeedback(null);
      if (editingId) {
        const payload: CategoryUpdateRequest = {
          name: form.name.trim(),
          description: form.description.trim() || null,
          active: form.active,
        };
        await apiFetch<CategoryResponse>(`/api/categories/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setFeedback({ tone: "success", text: "Categoría actualizada." });
      } else {
        const payload: CategoryCreateRequest = {
          municipalityId: profile.municipalityId,
          name: form.name.trim(),
          description: form.description.trim() || null,
        };
        await apiFetch<CategoryResponse>("/api/categories", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setFeedback({ tone: "success", text: "Categoría creada." });
      }
      resetForm();
      await loadCategories();
    } catch (error) {
      setFeedback({
        tone: "error",
        text: error instanceof Error ? error.message : "No se pudo guardar la categoría",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category: CategoryResponse) => {
    setEditingId(category.id);
    setForm({
      name: category.name,
      description: category.description ?? "",
      active: category.active,
    });
  };

  const handleDeactivate = async (id: number) => {
    try {
      setDeactivatingId(id);
      setFeedback(null);
      await apiFetch<CategoryResponse>(`/api/categories/${id}/deactivate`, {
        method: "PATCH",
      });
      setFeedback({ tone: "success", text: "Categoría desactivada." });
      await loadCategories();
      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      setFeedback({
        tone: "error",
        text: error instanceof Error ? error.message : "No se pudo desactivar la categoría",
      });
    } finally {
      setDeactivatingId(null);
    }
  };

  return (
    <div className="stack">
      <SectionHeader
        title="Categorías"
        subtitle="Crea y gestiona las categorías disponibles para las incidencias."
        actions={<Badge tone="primary">{categories.length} categorías</Badge>}
      />

      {feedback ? (
        <div className={feedback.tone === "error" ? "error-box" : "success-box"}>
          {feedback.text}
        </div>
      ) : null}

      <div className="grid cards-2">
        <Card>
          <h2 className="section-title">
            {editingId ? "Editar categoría" : "Nueva categoría"}
          </h2>
          <form className="form" onSubmit={handleSubmit}>
            <Field label="Nombre">
              <Input
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                required
              />
            </Field>
            <Field label="Descripción">
              <TextArea
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({ ...current, description: event.target.value }))
                }
              />
            </Field>
            {editingId ? (
              <Field label="Activa">
                <Select
                  value={form.active ? "true" : "false"}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, active: event.target.value === "true" }))
                  }
                >
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </Select>
              </Field>
            ) : null}
            <div className="actions">
              <Button type="submit" disabled={saving}>
                {saving ? "Guardando..." : editingId ? "Actualizar" : "Crear categoría"}
              </Button>
              {editingId ? (
                <Button type="button" variant="secondary" onClick={resetForm}>
                  Cancelar
                </Button>
              ) : null}
            </div>
          </form>
        </Card>

        <Card>
          <h2 className="section-title">Notas</h2>
          <p className="muted">
            Las categorías se usan en las incidencias y heredan el municipio de la sesión actual.
          </p>
        </Card>
      </div>

      <Card>
        <div className="toolbar">
          <h2 className="section-title">Listado</h2>
          <Badge tone="neutral">{categories.length} registros</Badge>
        </div>

        {loading ? (
          <div className="boot-card">
            <div className="spinner" />
            <p>Cargando categorías...</p>
          </div>
        ) : categories.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td>
                      <strong>{category.name}</strong>
                      <div className="muted">ID #{category.id}</div>
                    </td>
                    <td>{category.description || "—"}</td>
                    <td>
                      <Badge tone={category.active ? "success" : "danger"}>
                        {category.active ? "Activa" : "Inactiva"}
                      </Badge>
                    </td>
                    <td>
                      <div className="table-actions">
                        <Button type="button" variant="secondary" onClick={() => handleEdit(category)}>
                          Editar
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          disabled={!category.active || deactivatingId === category.id}
                          onClick={() => handleDeactivate(category.id)}
                        >
                          {deactivatingId === category.id ? "Desactivando..." : "Desactivar"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState>No hay categorías todavía.</EmptyState>
        )}
      </Card>
    </div>
  );
};

export default CategoriesPage;
