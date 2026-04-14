import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Screen from '../components/Screen';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import { createImageUploadFormData } from '../utils/imageUpload';
import { colors } from '../theme/colors';
import { fontFamilies, fontSizes } from '../theme/typography';

type MeResponse = {
  id: number;
  municipalityId: number;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  role: string;
};

const MAX_AVATAR_BYTES = 15 * 1024 * 1024;
const ALLOWED_AVATAR_MIME = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];
const ALLOWED_AVATAR_EXT = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

const ProfileScreen = () => {
  const { token, logout } = useAuth();
  const { apiFetch } = useApi();
  const [profile, setProfile] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiFetch<MeResponse>('/api/users/me');
        if (isMounted) {
          setProfile(data);
          setFullName(data.fullName || '');
          setEmail(data.email || '');
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'No se pudo cargar el perfil.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [apiFetch]);

  const initials = useMemo(() => {
    const base = (profile?.fullName || fullName || profile?.email || email || '').trim();
    if (!base) return 'VV';
    const parts = base.split(/\s+/);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }, [profile, fullName, email]);

  const isAllowedAvatar = (mimeType?: string | null, name?: string | null) => {
    if (mimeType && ALLOWED_AVATAR_MIME.includes(mimeType.toLowerCase())) {
      return true;
    }
    if (!name || !name.includes('.')) return false;
    const ext = name.split('.').pop()?.toLowerCase();
    return !!ext && ALLOWED_AVATAR_EXT.includes(ext);
  };

  const isDirty = useMemo(() => {
    if (!profile) return false;
    return (
      (fullName || '') !== (profile.fullName || '') ||
      (email || '') !== (profile.email || '')
    );
  }, [profile, fullName, email]);

  const handlePickAvatar = async () => {
    if (avatarUploading) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permiso necesario', 'Necesitamos acceso a tus fotos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      quality: 1,
    });
    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];
    if (asset.fileSize && asset.fileSize > MAX_AVATAR_BYTES) {
      Alert.alert('Archivo demasiado grande', 'La imagen no puede superar 15 MB.');
      return;
    }
    const name = asset.fileName || asset.file?.name || `avatar-${Date.now()}.jpg`;
    const mimeType = asset.mimeType || asset.file?.type || 'image/jpeg';
    if (!isAllowedAvatar(mimeType, name)) {
      Alert.alert('Formato no válido', 'Solo se aceptan JPEG, PNG, WEBP o GIF.');
      return;
    }

    const formData = createImageUploadFormData(asset);

    setAvatarUploading(true);
    try {
      if (!token) {
        await logout();
        Alert.alert('Sesión caducada', 'Vuelve a iniciar sesión para continuar.');
        return;
      }
      const updated = await apiFetch<MeResponse>('/api/users/me/avatar', {
        method: 'POST',
        body: formData,
      });
      setProfile(updated);
      setFullName(updated.fullName || '');
      setEmail(updated.email || '');
      Alert.alert('Avatar actualizado', 'Tu foto de perfil se ha guardado.');
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'No se pudo actualizar el avatar.');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    if (!isDirty) {
      Alert.alert('Sin cambios', 'No hay cambios para guardar.');
      return;
    }
    setSaving(true);
    try {
      const updated = await apiFetch<MeResponse>('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
        }),
      });
      setProfile(updated);
      setFullName(updated.fullName || '');
      setEmail(updated.email || '');
      Alert.alert('Perfil actualizado', 'Tus datos se han guardado.');
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'No se pudo actualizar el perfil.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('Faltan datos', 'Completa la contraseña actual y la nueva.');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Contraseña insegura', 'La nueva contraseña debe tener 8 caracteres o más.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('No coincide', 'La confirmación no coincide con la nueva contraseña.');
      return;
    }
    setChangingPassword(true);
    try {
      await apiFetch('/api/users/me/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Contraseña actualizada', 'Tu contraseña se ha cambiado.');
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'No se pudo cambiar la contraseña.');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <Screen title="Mi perfil">
      <View style={[styles.card, styles.avatarCard]}>
        <View style={styles.avatarRow}>
          <Pressable style={styles.avatarCircle} onPress={handlePickAvatar}>
            {profile?.avatarUrl ? (
              <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarInitials}>{initials}</Text>
            )}
            {avatarUploading && (
              <View style={styles.avatarOverlay}>
                <ActivityIndicator color={colors.white} />
              </View>
            )}
          </Pressable>
          <View style={styles.avatarInfo}>
            <Text style={styles.title}>Foto de perfil</Text>
            <Text style={styles.helperText}>JPG, PNG, WEBP o GIF · Máx 15 MB</Text>
            <Pressable onPress={handlePickAvatar} disabled={avatarUploading}>
              <Text style={styles.avatarLink}>
                {avatarUploading ? 'Subiendo...' : 'Cambiar foto'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Datos del vecino</Text>
        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.accent} />
            <Text style={styles.loadingText}>Cargando perfil...</Text>
          </View>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : profile ? (
          <View style={styles.details}>
            <View style={styles.item}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Nombre y apellidos"
                placeholderTextColor={colors.slate}
                style={styles.input}
              />
            </View>
            <View style={styles.item}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="correo@ejemplo.com"
                placeholderTextColor={colors.slate}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>
            <Pressable
              style={[styles.primaryButton, !isDirty && styles.disabledButton]}
              onPress={handleSave}
              disabled={!isDirty || saving}
            >
              {saving ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.primaryButtonText}>Guardar cambios</Text>
              )}
            </Pressable>
          </View>
        ) : (
          <Text style={styles.body}>
            Configura tu municipio, preferencias de alertas y datos de contacto.
          </Text>
        )}
      </View>

      <View style={[styles.card, styles.passwordCard]}>
        <Text style={styles.title}>Cambiar contraseña</Text>
        <Text style={styles.helperText}>
          Dejar en blanco si no deseas cambiar la contraseña
        </Text>
        <View style={styles.details}>
          <View style={styles.item}>
            <Text style={styles.label}>Contraseña actual</Text>
            <TextInput
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="********"
              placeholderTextColor={colors.slate}
              secureTextEntry
              style={styles.input}
            />
          </View>
          <View style={styles.item}>
            <Text style={styles.label}>Nueva contraseña</Text>
            <TextInput
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Mínimo 8 caracteres"
              placeholderTextColor={colors.slate}
              secureTextEntry
              style={styles.input}
            />
          </View>
          <View style={styles.item}>
            <Text style={styles.label}>Confirmar contraseña</Text>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Repite la contraseña"
              placeholderTextColor={colors.slate}
              secureTextEntry
              style={styles.input}
            />
          </View>
          <Pressable
            style={styles.secondaryButton}
            onPress={handleChangePassword}
            disabled={changingPassword}
          >
            {changingPassword ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.secondaryButtonText}>Actualizar contraseña</Text>
            )}
          </Pressable>
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 18,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  avatarCard: {
    marginBottom: 16,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.paperStrong,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarInitials: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.lg,
    color: colors.accent,
  },
  avatarInfo: {
    flex: 1,
    gap: 6,
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLink: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.sm,
    color: colors.brandPurple,
  },
  title: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.lg,
    color: colors.ink,
  },
  details: {
    marginTop: 16,
    gap: 12,
  },
  item: {
    gap: 4,
  },
  label: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.xs,
    color: colors.slate,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  value: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.md,
    color: colors.ink,
  },
  input: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.md,
    color: colors.ink,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.strokeSoft,
  },
  primaryButton: {
    marginTop: 6,
    backgroundColor: colors.brandPurple,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.sm,
    color: colors.white,
  },
  secondaryButton: {
    marginTop: 6,
    backgroundColor: colors.ocean,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.sm,
    color: colors.white,
  },
  disabledButton: {
    opacity: 0.6,
  },
  passwordCard: {
    marginTop: 16,
  },
  helperText: {
    marginTop: 6,
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
    color: colors.slate,
  },
  loadingRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
    color: colors.slate,
  },
  errorText: {
    marginTop: 14,
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
    color: colors.danger,
  },
  body: {
    marginTop: 10,
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
    color: colors.slate,
  },
});

export default ProfileScreen;
