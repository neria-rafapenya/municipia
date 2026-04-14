import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { Button, Badge, Card, EmptyState, Field, Input, SectionHeader, Select } from "../components/UI";
import type {
  RegisterUserRequest,
  UserResponse,
  UserRole,
  UserUpdateRequest,
} from "../api/types";

const roleOptions = ["ADMIN", "OPERATOR", "NEIGHBOR"] as const;

const roleTone = (role: UserRole) => {
  if (role === "ADMIN") return "primary";
  if (role === "OPERATOR") return "warning";
  return "neutral";
};

const UsersPage = () => {
  const { profile, apiFetch, refreshProfile } = useAuth();
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; text: string } | null>(
    null
  );
  const [profileForm, setProfileForm] = useState({ fullName: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [createForm, setCreateForm] = useState<RegisterUserRequest>({
    municipalityId: 0,
    fullName: "",
    email: "",
    password: "",
    role: "NEIGHBOR",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (!profile) {
      return;
    }
    setProfileForm({
      fullName: profile.fullName,
      email: profile.email,
    });
    setCreateForm((current) => ({
      ...current,
      municipalityId: profile.municipalityId,
    }));
  }, [profile]);

  const loadUsers = useCallback(async () => {
    if (!profile) return;
    try {
      setLoading(true);
      const list = await apiFetch<UserResponse[]>(
        `/api/users?municipalityId=${profile.municipalityId}`
      );
      setUsers(list);
    } catch (error) {
      setFeedback({
        tone: "error",
        text: error instanceof Error ? error.message : "No se pudieron cargar los usuarios",
      });
    } finally {
      setLoading(false);
    }
  }, [apiFetch, profile]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  if (!profile) {
    return (
      <Card>
        <EmptyState>Sin perfil cargado.</EmptyState>
      </Card>
    );
  }

  const handleProfileSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setSavingProfile(true);
      setFeedback(null);
      const payload: UserUpdateRequest = {
        fullName: profileForm.fullName.trim(),
        email: profileForm.email.trim(),
      };
      await apiFetch<UserResponse>("/api/users/me", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      await refreshProfile();
      setFeedback({ tone: "success", text: "Perfil actualizado correctamente." });
      await loadUsers();
    } catch (error) {
      setFeedback({
        tone: "error",
        text: error instanceof Error ? error.message : "No se pudo actualizar el perfil",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setSavingPassword(true);
      setFeedback(null);
      await apiFetch<void>("/api/users/me/password", {
        method: "PUT",
        body: JSON.stringify(passwordForm),
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
      });
      setFeedback({ tone: "success", text: "Contraseña cambiada correctamente." });
    } catch (error) {
      setFeedback({
        tone: "error",
        text: error instanceof Error ? error.message : "No se pudo cambiar la contraseña",
      });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleAvatarSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!avatarFile) {
      setFeedback({ tone: "error", text: "Selecciona una imagen antes de subirla." });
      return;
    }
    try {
      setUploadingAvatar(true);
      setFeedback(null);
      const formData = new FormData();
      formData.append("file", avatarFile);
      await apiFetch<UserResponse>("/api/users/me/avatar", {
        method: "POST",
        body: formData,
      });
      await refreshProfile();
      setAvatarFile(null);
      if (avatarInputRef.current) {
        avatarInputRef.current.value = "";
      }
      setFeedback({ tone: "success", text: "Avatar actualizado correctamente." });
      await loadUsers();
    } catch (error) {
      setFeedback({
        tone: "error",
        text: error instanceof Error ? error.message : "No se pudo subir el avatar",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCreateUser = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setCreatingUser(true);
      setFeedback(null);
      await apiFetch<{ id: number }>("/api/users/register", {
        method: "POST",
        body: JSON.stringify(createForm),
      });
      setCreateForm({
        municipalityId: profile.municipalityId,
        fullName: "",
        email: "",
        password: "",
        role: "NEIGHBOR",
      });
      setFeedback({ tone: "success", text: "Usuario creado correctamente." });
      await loadUsers();
    } catch (error) {
      setFeedback({
        tone: "error",
        text: error instanceof Error ? error.message : "No se pudo crear el usuario",
      });
    } finally {
      setCreatingUser(false);
    }
  };

  return (
    <div className="stack">
      <SectionHeader
        title="Usuarios"
        subtitle="Crea vecinos, operarios y administra tu propio perfil."
        actions={<Badge tone="primary">Municipio #{profile.municipalityId}</Badge>}
      />

      {feedback ? (
        <div className={feedback.tone === "error" ? "error-box" : "success-box"}>
          {feedback.text}
        </div>
      ) : null}

      <div className="grid cards-2">
        <Card>
          <h2 className="section-title">Mi perfil</h2>
          <div className="detail-grid">
            <form className="form" onSubmit={handleProfileSubmit}>
              <Field label="Nombre completo">
                <Input
                  value={profileForm.fullName}
                  onChange={(event) =>
                    setProfileForm((current) => ({
                      ...current,
                      fullName: event.target.value,
                    }))
                  }
                  required
                />
              </Field>
              <Field label="Email">
                <Input
                  type="email"
                  value={profileForm.email}
                  onChange={(event) =>
                    setProfileForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  required
                />
              </Field>
              <Button type="submit" disabled={savingProfile}>
                {savingProfile ? "Guardando..." : "Guardar perfil"}
              </Button>
            </form>

            <form className="form" onSubmit={handlePasswordSubmit}>
              <h3 className="section-title">Cambiar contraseña</h3>
              <Field label="Contraseña actual" help="Necesaria para confirmar el cambio.">
                <Input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(event) =>
                    setPasswordForm((current) => ({
                      ...current,
                      currentPassword: event.target.value,
                    }))
                  }
                  required
                />
              </Field>
              <Field label="Nueva contraseña">
                <Input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(event) =>
                    setPasswordForm((current) => ({
                      ...current,
                      newPassword: event.target.value,
                    }))
                  }
                  required
                />
              </Field>
              <Button type="submit" variant="secondary" disabled={savingPassword}>
                {savingPassword ? "Cambiando..." : "Cambiar contraseña"}
              </Button>
            </form>

            <form className="form" onSubmit={handleAvatarSubmit}>
              <h3 className="section-title">Avatar</h3>
              <div className="file-row">
                {profile.avatarUrl ? (
                  <img
                    className="avatar-preview"
                    src={profile.avatarUrl}
                    alt={profile.fullName}
                  />
                ) : (
                  <div className="avatar-preview" />
                )}
                <Field
                  label="Imagen"
                  help="JPG, JPEG, PNG, WEBP o GIF. Máximo 15 MB."
                >
                  <input
                    ref={avatarInputRef}
                    className="input"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    onChange={(event) => setAvatarFile(event.target.files?.[0] ?? null)}
                  />
                </Field>
              </div>
              <Button type="submit" variant="secondary" disabled={uploadingAvatar}>
                {uploadingAvatar ? "Subiendo..." : "Subir avatar"}
              </Button>
            </form>
          </div>
        </Card>

        <Card>
          <h2 className="section-title">Alta de usuario</h2>
          <form className="form" onSubmit={handleCreateUser}>
            <Field label="Nombre completo">
              <Input
                value={createForm.fullName}
                onChange={(event) =>
                  setCreateForm((current) => ({
                    ...current,
                    fullName: event.target.value,
                  }))
                }
                required
              />
            </Field>
            <Field label="Email">
              <Input
                type="email"
                value={createForm.email}
                onChange={(event) =>
                  setCreateForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                required
              />
            </Field>
            <Field label="Contraseña">
              <Input
                type="password"
                value={createForm.password}
                onChange={(event) =>
                  setCreateForm((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
                required
              />
            </Field>
            <Field label="Rol">
              <Select
                value={createForm.role}
                onChange={(event) =>
                  setCreateForm((current) => ({
                    ...current,
                    role: event.target.value as UserRole,
                  }))
                }
              >
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </Select>
            </Field>
            <Button type="submit" disabled={creatingUser}>
              {creatingUser ? "Creando..." : "Crear usuario"}
            </Button>
          </form>
        </Card>
      </div>

      <Card>
        <div className="toolbar">
          <h2 className="section-title">Usuarios del municipio</h2>
          <Badge tone="neutral">{users.length} registros</Badge>
        </div>

        {loading ? (
          <div className="boot-card">
            <div className="spinner" />
            <p>Cargando usuarios...</p>
          </div>
        ) : users.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Avatar</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <strong>{user.fullName}</strong>
                      <div className="muted">ID #{user.id}</div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <Badge tone={roleTone(user.role)}>{user.role}</Badge>
                    </td>
                    <td>
                      {user.avatarUrl ? (
                        <img
                          className="avatar-preview"
                          src={user.avatarUrl}
                          alt={user.fullName}
                        />
                      ) : (
                        <span className="muted">Sin avatar</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState>No hay usuarios en este municipio.</EmptyState>
        )}
      </Card>
    </div>
  );
};

export default UsersPage;
