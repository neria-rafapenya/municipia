import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import Screen from '../components/Screen';
import IncidentMap from '../components/IncidentMap';
import { useApi } from '../hooks/useApi';
import { NewIncidentStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { fontFamilies, fontSizes } from '../theme/typography';

type Route = RouteProp<NewIncidentStackParamList, 'IncidentDetail'>;

type IncidentAttachment = {
  id: number;
  fileUrl: string;
  fileName?: string | null;
  fileType?: string | null;
};

type Category = {
  id: number;
  name: string;
  active: boolean;
};

type Incident = {
  id: number;
  categoryId?: number | null;
  description?: string | null;
  status?: string | null;
  aiConfidence?: number | null;
  imageUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  locationAccuracy?: number | null;
  locationCapturedAt?: string | null;
  attachments?: IncidentAttachment[] | null;
};

const IncidentDetailScreen = () => {
  const route = useRoute<Route>();
  const { apiFetch } = useApi();
  const [incidentTitle, setIncidentTitle] = useState('Incidencia enviada');
  const [incident, setIncident] = useState<Incident | null>(null);
  const [categoryName, setCategoryName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const id = route.params?.id;
    if (!id || id === 'new') return;
    const load = async () => {
      try {
        setLoading(true);
        const data = await apiFetch<Incident>('/api/incidents/' + id);
        setIncident(data);
        if (data?.description) {
          setIncidentTitle(data.description);
        }
      } catch {
        // ignore for now
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [apiFetch, route.params?.id]);

  useEffect(() => {
    const loadCategory = async () => {
      if (!incident?.categoryId) {
        setCategoryName(null);
        return;
      }
      try {
        const data = await apiFetch<Category[]>('/api/categories');
        const match = data.find((item) => item.id === incident.categoryId);
        setCategoryName(match?.name || null);
      } catch {
        setCategoryName(null);
      }
    };
    loadCategory();
  }, [apiFetch, incident?.categoryId]);

  const formatConfidence = (value: number) => {
    const percent = value <= 1 ? value * 100 : value;
    const safe = Math.max(0, Math.min(100, percent));
    return `${Math.round(safe)}%`;
  };

  const isImageFile = (
    fileType?: string | null,
    fileName?: string | null,
    fileUrl?: string | null
  ) => {
    if (fileType?.startsWith('image/')) return true;
    const target = fileName || fileUrl || '';
    return /\.(jpe?g|png|gif|webp|heic)$/i.test(target);
  };

  const formatCapturedAt = (value?: string | null) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleString('es-ES');
  };

  const previewItems = useMemo(() => {
    if (incident?.attachments && incident.attachments.length > 0) {
      return incident.attachments.map((item) => ({
        id: item.id,
        url: item.fileUrl,
        fileName: item.fileName,
        fileType: item.fileType,
      }));
    }
    if (incident?.imageUrl) {
      return [
        {
          id: 0,
          url: incident.imageUrl,
          fileName: null,
          fileType: null,
        },
      ];
    }
    return [] as { id: number; url: string; fileName: string | null; fileType: string | null }[];
  }, [incident]);

  const mapRegion = useMemo(() => {
    if (incident?.latitude == null || incident?.longitude == null) return null;
    return {
      latitude: incident.latitude,
      longitude: incident.longitude,
      latitudeDelta: 0.004,
      longitudeDelta: 0.004,
    };
  }, [incident?.latitude, incident?.longitude]);

  return (
    <Screen title="Detalle incidencia" showBack>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {loading ? (
            <ActivityIndicator color={colors.brandPurple} />
          ) : (
            <>
              <Text style={styles.title}>{incidentTitle}</Text>
              {incident?.aiConfidence != null && (
                <View style={styles.aiBadge}>
                  <Text style={styles.aiBadgeLabel}>IA</Text>
                  <Text style={styles.aiBadgeValue}>
                    {formatConfidence(incident.aiConfidence)}
                  </Text>
                </View>
              )}
              {previewItems.length > 0 && (
                <View style={styles.previewBlock}>
                  <Text style={styles.sectionTitle}>Adjuntos</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.previewRow}
                  >
                    {previewItems.map((item) =>
                      isImageFile(item.fileType, item.fileName, item.url) ? (
                        <Image
                          key={item.id}
                          source={{ uri: item.url }}
                          style={styles.previewImage}
                        />
                      ) : (
                        <View key={item.id} style={styles.previewFallback}>
                          <Text style={styles.previewFallbackText}>FILE</Text>
                        </View>
                      )
                    )}
                  </ScrollView>
                </View>
              )}
              <View style={styles.infoBlock}>
                <Text style={styles.sectionTitle}>Datos reportados</Text>
                {categoryName || incident?.categoryId ? (
                  <Text style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Categoría: </Text>
                    {categoryName || `#${incident?.categoryId}`}
                  </Text>
                ) : null}
                {incident?.description ? (
                  <Text style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Descripción: </Text>
                    {incident.description}
                  </Text>
                ) : null}
                {incident?.latitude != null && incident?.longitude != null ? (
                  <Text style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Ubicación: </Text>
                    {incident.latitude.toFixed(5)}, {incident.longitude.toFixed(5)}
                  </Text>
                ) : (
                  <Text style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Ubicación: </Text>Sin datos
                  </Text>
                )}
                {incident?.locationAccuracy != null && (
                  <Text style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Precisión: </Text>
                    ±{Math.round(incident.locationAccuracy)} m
                  </Text>
                )}
                {formatCapturedAt(incident?.locationCapturedAt) && (
                  <Text style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Capturada: </Text>
                    {formatCapturedAt(incident?.locationCapturedAt)}
                  </Text>
                )}
              </View>
              {mapRegion && (
                <View style={styles.mapBlock}>
                  <Text style={styles.sectionTitle}>Mapa</Text>
                  <IncidentMap
                    latitude={mapRegion.latitude}
                    longitude={mapRegion.longitude}
                  />
                </View>
              )}
              <Text style={styles.body}>
                Hemos registrado tu incidencia. Recibirás actualizaciones en el historial.
              </Text>
            </>
          )}
        </View>
      </ScrollView>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  title: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.lg,
    color: colors.ink,
  },
  sectionTitle: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.sm,
    color: colors.ink,
    marginBottom: 10,
  },
  previewBlock: {
    marginTop: 14,
  },
  previewRow: {
    gap: 12,
  },
  previewImage: {
    width: 96,
    height: 96,
    borderRadius: 16,
    backgroundColor: colors.surfaceAlt,
  },
  previewFallback: {
    width: 96,
    height: 96,
    borderRadius: 16,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewFallbackText: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.xs,
    color: colors.inkSoft,
  },
  infoBlock: {
    marginTop: 16,
  },
  infoRow: {
    marginTop: 6,
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
    color: colors.ink,
  },
  infoLabel: {
    fontFamily: fontFamilies.semiBold,
    color: colors.ink,
  },
  mapBlock: {
    marginTop: 18,
  },
  body: {
    marginTop: 10,
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
});

export default IncidentDetailScreen;
