import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { uploadMedia } from "../api/uploads";
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
import type { NewsCreateRequest, NewsResponse, NewsUpdateRequest } from "../api/types";

const initialForm = {
  title: "",
  summary: "",
  content: "",
  imageUrl: "",
  active: true,
};

const NewsPage = () => {
  const { profile, apiFetch } = useAuth();
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [news, setNews] = useState<NewsResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; text: string } | null>(
    null
  );
  const [form, setForm] = useState(initialForm);

  const loadNews = useCallback(async () => {
    if (!profile) return;
    try {
      setLoading(true);
      const list = await apiFetch<NewsResponse[]>(`/api/news?municipalityId=${profile.municipalityId}`);
      setNews(list);
    } catch (error) {
      setFeedback({
        tone: "error",
        text: error instanceof Error ? error.message : "No se pudieron cargar las noticias",
      });
    } finally {
      setLoading(false);
    }
  }, [apiFetch, profile]);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  if (!profile) {
    return null;
  }

  const resetForm = () => {
    setEditingId(null);
    setForm(initialForm);
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setSaving(true);
      setFeedback(null);
      if (editingId) {
        const payload: NewsUpdateRequest = {
          title: form.title.trim(),
          summary: form.summary.trim() || null,
          content: form.content.trim(),
          imageUrl: form.imageUrl.trim() || null,
          active: form.active,
        };
        await apiFetch<NewsResponse>(`/api/news/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setFeedback({ tone: "success", text: "Noticia actualizada." });
      } else {
        const payload: NewsCreateRequest = {
          municipalityId: profile.municipalityId,
          title: form.title.trim(),
          summary: form.summary.trim() || null,
          content: form.content.trim(),
          imageUrl: form.imageUrl.trim() || null,
        };
        await apiFetch<NewsResponse>("/api/news", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setFeedback({ tone: "success", text: "Noticia creada." });
      }
      resetForm();
      await loadNews();
    } catch (error) {
      setFeedback({
        tone: "error",
        text: error instanceof Error ? error.message : "No se pudo guardar la noticia",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: NewsResponse) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      summary: item.summary ?? "",
      content: item.content,
      imageUrl: item.imageUrl ?? "",
      active: item.active,
    });
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Seguro que quieres eliminar esta noticia?")) {
      return;
    }
    try {
      setDeletingId(id);
      setFeedback(null);
      await apiFetch<void>(`/api/news/${id}`, { method: "DELETE" });
      setFeedback({ tone: "success", text: "Noticia eliminada." });
      await loadNews();
      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      setFeedback({
        tone: "error",
        text: error instanceof Error ? error.message : "No se pudo eliminar la noticia",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpload = async () => {
    const file = imageInputRef.current?.files?.[0];
    if (!file) {
      setFeedback({ tone: "error", text: "Selecciona una imagen antes de subirla." });
      return;
    }
    try {
      setUploading(true);
      setFeedback(null);
      const uploaded = await uploadMedia(apiFetch, file, "news");
      setForm((current) => ({ ...current, imageUrl: uploaded.url }));
      setFeedback({ tone: "success", text: "Imagen subida correctamente." });
    } catch (error) {
      setFeedback({
        tone: "error",
        text: error instanceof Error ? error.message : "No se pudo subir la imagen",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="stack">
      <SectionHeader
        title="Noticias"
        subtitle="Publica y actualiza las noticias del municipio."
        actions={<Badge tone="primary">{news.length} noticias</Badge>}
      />

      {feedback ? (
        <div className={feedback.tone === "error" ? "error-box" : "success-box"}>
          {feedback.text}
        </div>
      ) : null}

      <div className="grid cards-2">
        <Card>
          <h2 className="section-title">{editingId ? "Editar noticia" : "Nueva noticia"}</h2>
          <form className="form" onSubmit={handleSubmit}>
            <Field label="Título">
              <Input
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({ ...current, title: event.target.value }))
                }
                required
              />
            </Field>
            <Field label="Resumen">
              <TextArea
                value={form.summary}
                onChange={(event) =>
                  setForm((current) => ({ ...current, summary: event.target.value }))
                }
              />
            </Field>
            <Field label="Contenido">
              <TextArea
                value={form.content}
                onChange={(event) =>
                  setForm((current) => ({ ...current, content: event.target.value }))
                }
                required
              />
            </Field>
            <Field label="Imagen URL">
              <Input
                value={form.imageUrl}
                onChange={(event) =>
                  setForm((current) => ({ ...current, imageUrl: event.target.value }))
                }
                placeholder="https://..."
              />
            </Field>
            <div className="form">
              <Field label="Subir imagen">
                <input
                  ref={imageInputRef}
                  className="input"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                />
              </Field>
              <Button type="button" variant="secondary" disabled={uploading} onClick={handleUpload}>
                {uploading ? "Subiendo..." : "Subir a Cloudinary"}
              </Button>
            </div>
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
            {form.imageUrl ? (
              <div className="preview">
                <img className="preview-image" src={form.imageUrl} alt={form.title || "Imagen"} />
              </div>
            ) : null}
            <div className="actions">
              <Button type="submit" disabled={saving}>
                {saving ? "Guardando..." : editingId ? "Actualizar" : "Publicar"}
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
            Las imágenes se suben a Cloudinary y la noticia se guarda con la URL resultante.
          </p>
          <div className="chip-list">
            <span className="chip">Listado</span>
            <span className="chip">Edición</span>
            <span className="chip">Eliminación</span>
            <span className="chip">Imagen remota</span>
          </div>
        </Card>
      </div>

      <Card>
        <div className="toolbar">
          <h2 className="section-title">Listado</h2>
          <Badge tone="neutral">{news.length} registros</Badge>
        </div>

        {loading ? (
          <div className="boot-card">
            <div className="spinner" />
            <p>Cargando noticias...</p>
          </div>
        ) : news.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Noticia</th>
                  <th>Estado</th>
                  <th>Imagen</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {news.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.title}</strong>
                      <div className="muted">{item.summary || "Sin resumen"}</div>
                    </td>
                    <td>
                      <Badge tone={item.active ? "success" : "danger"}>
                        {item.active ? "Activa" : "Inactiva"}
                      </Badge>
                    </td>
                    <td>
                      {item.imageUrl ? (
                        <img className="avatar-preview" src={item.imageUrl} alt={item.title} />
                      ) : (
                        <span className="muted">Sin imagen</span>
                      )}
                    </td>
                    <td>
                      <div className="table-actions">
                        <Button type="button" variant="secondary" onClick={() => handleEdit(item)}>
                          Editar
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          disabled={deletingId === item.id}
                          onClick={() => handleDelete(item.id)}
                        >
                          {deletingId === item.id ? "Eliminando..." : "Eliminar"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState>No hay noticias todavía.</EmptyState>
        )}
      </Card>
    </div>
  );
};

export default NewsPage;
