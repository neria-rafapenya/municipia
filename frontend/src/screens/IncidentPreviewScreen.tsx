import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as DocumentPicker from 'expo-document-picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Screen from '../components/Screen';
import { useApi } from '../hooks/useApi';
import { NewIncidentStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { fontFamilies, fontSizes } from '../theme/typography';

type Nav = NativeStackNavigationProp<NewIncidentStackParamList, 'IncidentPreview'>;

type Category = {
  id: number;
  name: string;
  description?: string;
  active: boolean;
};

type LocalAttachment = {
  uri: string;
  name: string;
  type: string;
};

const IncidentPreviewScreen = () => {
  const navigation = useNavigation<Nav>();
  const { apiFetch } = useApi();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<LocalAttachment[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(
    null
  );
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [locationCapturedAt, setLocationCapturedAt] = useState<string | null>(null);
  const [aiConfidence, setAiConfidence] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingCategories(true);
        const data = await apiFetch<Category[]>('/api/categories');
        setCategories(data.filter((item) => item.active));
        if (data.length > 0) {
          setSelectedCategoryId(data[0].id);
        }
      } catch {
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };
    load();
  }, [apiFetch]);

  useEffect(() => {
    if (!description.trim()) {
      setAiConfidence(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const result = await apiFetch<{
          categoryId?: number | null;
          confidence?: number | null;
        }>('/api/ai/classify', {
          method: 'POST',
          body: JSON.stringify({ description: description.trim() }),
        });
        if (result?.categoryId) {
          setSelectedCategoryId(result.categoryId);
        }
        if (result?.confidence != null) {
          setAiConfidence(result.confidence);
        }
      } catch {
        // ignore AI errors for now
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [apiFetch, description]);

  useEffect(() => {
    const loadLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationError('Ubicación no permitida');
          return;
        }
        const current = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: current.coords.latitude,
          longitude: current.coords.longitude,
        });
        setLocationAccuracy(
          typeof current.coords.accuracy === 'number' ? current.coords.accuracy : null
        );
        setLocationCapturedAt(
          current.timestamp ? new Date(current.timestamp).toISOString() : null
        );
      } catch (err) {
        setLocationError('No se pudo obtener la ubicación');
      }
    };
    loadLocation();
  }, []);

  const categoryChips = useMemo(
    () =>
      categories.map((category) => {
        const isActive = category.id === selectedCategoryId;
        return (
          <Pressable
            key={category.id}
            style={[styles.chip, isActive && styles.chipActive]}
            onPress={() => setSelectedCategoryId(category.id)}
          >
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
              {category.name}
            </Text>
          </Pressable>
        );
      }),
    [categories, selectedCategoryId]
  );

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permiso necesario', 'Necesitamos acceso a tus fotos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];
    if (!asset.uri) return;
    setAttachments((prev) => [
      ...prev,
      {
        uri: asset.uri,
        name: asset.fileName || `foto-${Date.now()}.jpg`,
        type: asset.mimeType || 'image/jpeg',
      },
    ]);
  };

  const handlePickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
    if (result.canceled || !result.assets?.length) return;
    const file = result.assets[0];
    setAttachments((prev) => [
      ...prev,
      {
        uri: file.uri,
        name: file.name || `archivo-${Date.now()}`,
        type: file.mimeType || 'application/octet-stream',
      },
    ]);
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, idx) => idx !== index));
  };

  const isImageAttachment = (file: LocalAttachment) => {
    if (file.type?.startsWith('image/')) return true;
    return /\.(jpe?g|png|gif|webp|heic)$/i.test(file.name);
  };

  const formatConfidence = (value: number) => {
    const percent = value <= 1 ? value * 100 : value;
    const safe = Math.max(0, Math.min(100, percent));
    return `${Math.round(safe)}%`;
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Falta descripción', 'Describe la incidencia antes de enviar.');
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('description', description.trim());
      if (selectedCategoryId) {
        formData.append('categoryId', String(selectedCategoryId));
      }
      if (location) {
        formData.append('latitude', String(location.latitude));
        formData.append('longitude', String(location.longitude));
      }
      if (locationAccuracy != null) {
        formData.append('locationAccuracy', String(locationAccuracy));
      }
      if (locationCapturedAt) {
        formData.append('locationCapturedAt', locationCapturedAt);
      }
      if (aiConfidence !== null) {
        formData.append('aiConfidence', String(aiConfidence));
      }
      attachments.forEach((file) => {
        formData.append('files', {
          uri: file.uri,
          name: file.name,
          type: file.type,
        } as any);
      });
      const response = await apiFetch<{ id: number }>('/api/incidents', {
        method: 'POST',
        body: formData,
      });
      navigation.navigate('IncidentDetail', { id: String(response.id) });
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'No se pudo enviar la incidencia.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen title="Nueva incidencia">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.title}>Categoría</Text>
          {loadingCategories ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={colors.brandPurple} />
              <Text style={styles.loadingText}>Cargando categorías...</Text>
            </View>
          ) : (
            <View style={styles.chips}>{categoryChips}</View>
          )}
          {aiConfidence != null && (
            <View style={styles.aiBadge}>
              <Text style={styles.aiBadgeLabel}>IA</Text>
              <Text style={styles.aiBadgeValue}>{formatConfidence(aiConfidence)}</Text>
            </View>
          )}
          {locationError ? (
            <Text style={styles.locationNote}>{locationError}</Text>
          ) : location ? (
            <Text style={styles.locationNote}>
              Ubicación detectada: {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
              {locationAccuracy != null ? ` · ±${Math.round(locationAccuracy)} m` : ''}
            </Text>
          ) : (
            <Text style={styles.locationNote}>Detectando ubicación...</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Descripción</Text>
          <TextInput
            placeholder="Describe la incidencia..."
            placeholderTextColor={colors.slate}
            multiline
            value={description}
            onChangeText={setDescription}
            style={styles.textArea}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Adjuntos</Text>
          <View style={styles.attachRow}>
            <Pressable style={styles.attachButton} onPress={handlePickImage}>
              <Text style={styles.attachText}>Añadir foto</Text>
            </Pressable>
            <Pressable style={styles.attachButton} onPress={handlePickFile}>
              <Text style={styles.attachText}>Añadir archivo</Text>
            </Pressable>
          </View>
          <View style={styles.attachmentList}>
            {attachments.map((file, index) => (
              <View key={`${file.uri}-${index}`} style={styles.attachmentItem}>
                {isImageAttachment(file) ? (
                  <Image source={{ uri: file.uri }} style={styles.attachmentPreview} />
                ) : (
                  <View style={styles.attachmentPreviewFallback}>
                    <Text style={styles.attachmentPreviewText}>FILE</Text>
                  </View>
                )}
                <View style={styles.attachmentInfo}>
                  <Text style={styles.attachmentName} numberOfLines={1}>
                    {file.name}
                  </Text>
                </View>
                <Pressable onPress={() => handleRemoveAttachment(index)}>
                  <Text style={styles.removeText}>Quitar</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </View>

        <Pressable style={styles.primaryButton} onPress={handleSubmit}>
          {submitting ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.primaryText}>Confirmar y enviar</Text>
          )}
        </Pressable>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 30,
    gap: 16,
  },
  card: {
    padding: 18,
    borderRadius: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.strokeSoft,
  },
  title: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.md,
    color: colors.ink,
  },
  chips: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.strokeSoft,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.brandPurple,
    borderColor: colors.brandPurple,
  },
  chipText: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.sm,
    color: colors.ink,
  },
  chipTextActive: {
    color: colors.white,
  },
  textArea: {
    marginTop: 12,
    minHeight: 110,
    textAlignVertical: 'top',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.strokeSoft,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
    color: colors.ink,
  },
  attachRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 12,
  },
  attachButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
  },
  attachText: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.sm,
    color: colors.ink,
  },
  attachmentList: {
    marginTop: 12,
    gap: 8,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 12,
  },
  attachmentPreview: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.surfaceAlt,
  },
  attachmentPreviewFallback: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachmentPreviewText: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.xs,
    color: colors.inkSoft,
  },
  attachmentInfo: {
    flex: 1,
  },
  attachmentName: {
    flex: 1,
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
    color: colors.ink,
  },
  removeText: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.xs,
    color: colors.danger,
  },
  loadingRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
    color: colors.slate,
  },
  aiBadge: {
    marginTop: 12,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.brandPurple,
  },
  aiBadgeLabel: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.xs,
    color: colors.brandPurple,
  },
  aiBadgeValue: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.xs,
    color: colors.ink,
  },
  locationNote: {
    marginTop: 10,
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.xs,
    color: colors.slate,
  },
  primaryButton: {
    marginTop: 10,
    backgroundColor: colors.brandPurple,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  primaryText: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.md,
    color: colors.white,
  },
});

export default IncidentPreviewScreen;
