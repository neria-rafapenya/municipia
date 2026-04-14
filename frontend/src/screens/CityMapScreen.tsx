import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Screen from '../components/Screen';
import CityMap from '../components/CityMap';
import { CityMapPoint } from '../components/CityMap.types';
import { MUNICIPALITY_CENTER } from '../api/config';
import { useApi } from '../hooks/useApi';
import { MapStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { fontFamilies, fontSizes } from '../theme/typography';

type Nav = NativeStackNavigationProp<MapStackParamList, 'CityMapHome'>;

type MeResponse = {
  id: number;
  municipalityId: number;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  role: string;
};

type Incident = {
  id: number;
  description?: string | null;
  status?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

type PagedResponse<T> = {
  items: T[];
  page: number;
  size: number;
  total: number;
};

const CityMapScreen = () => {
  const navigation = useNavigation<Nav>();
  const { apiFetch } = useApi();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedPointId, setSelectedPointId] = useState<number | null>(null);
  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const me = await apiFetch<MeResponse>('/api/users/me');
        const data = await apiFetch<PagedResponse<Incident> | Incident[]>(
          `/api/incidents?userId=${me.id}&sort=createdAt,desc&page=0&size=200`
        );
        const items = Array.isArray(data) ? data : data.items || [];

        if (!active) {
          return;
        }

        setIncidents(items);
      } catch (err: any) {
        if (!active) {
          return;
        }
        setError(err?.message || 'No se pudieron cargar las incidencias del mapa');
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
  }, [apiFetch, refreshIndex]);

  const points = useMemo(
    () =>
      incidents
        .filter((incident) => incident.latitude != null && incident.longitude != null)
        .map((incident) => ({
          id: incident.id,
          latitude: incident.latitude as number,
          longitude: incident.longitude as number,
          title: incident.description?.trim() || `Incidencia #${incident.id}`,
          status: incident.status || 'Pendiente',
        })),
    [incidents]
  );

  const selectedPoint = useMemo(
    () => points.find((point) => point.id === selectedPointId) || null,
    [points, selectedPointId]
  );

  const handlePointPress = (point: CityMapPoint) => {
    setSelectedPointId(point.id);
  };

  const handleOpenDetail = () => {
    if (!selectedPoint) return;
    setSelectedPointId(null);
    navigation.navigate('PointDetail', { id: String(selectedPoint.id) });
  };

  const closeModal = () => {
    setSelectedPointId(null);
  };

  return (
    <Screen title="Mapa de ciudad">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerCard}>
          <Text style={styles.title}>Tus incidencias en el mapa</Text>
          <Text style={styles.body}>
            Mostramos las incidencias geolocalizadas de tu municipio vigente.
          </Text>
          <View style={styles.metaRow}>
            <View style={styles.metaPill}>
              <Text style={styles.metaLabel}>Puntos</Text>
              <Text style={styles.metaValue}>{points.length}</Text>
            </View>
            <View style={styles.metaPill}>
              <Text style={styles.metaLabel}>Total</Text>
              <Text style={styles.metaValue}>{incidents.length}</Text>
            </View>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator color={colors.brandPurple} />
            <Text style={styles.loadingText}>Cargando incidencias del mapa...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorCard}>
            <Text style={styles.title}>No hemos podido cargar el mapa</Text>
            <Text style={styles.body}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={() => setRefreshIndex((value) => value + 1)}>
              <Text style={styles.retryText}>Reintentar</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.mapCard}>
            <CityMap
              points={points}
              onPointPress={handlePointPress}
              center={MUNICIPALITY_CENTER}
            />
          </View>
        )}
      </ScrollView>

      <Modal
        transparent
        visible={Boolean(selectedPoint)}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <Pressable style={styles.modalBackdrop} onPress={closeModal}>
          <Pressable style={styles.modalCard} onPress={() => undefined}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle} numberOfLines={2}>
              {selectedPoint?.title}
            </Text>
            <Text style={styles.modalBody}>
              {selectedPoint?.status || 'Sin estado'}
            </Text>
            <Text style={styles.modalCoords}>
              {selectedPoint
                ? `${selectedPoint.latitude.toFixed(5)}, ${selectedPoint.longitude.toFixed(5)}`
                : ''}
            </Text>
            <Pressable style={styles.detailButton} onPress={handleOpenDetail}>
              <Text style={styles.detailButtonText}>Ver detalle</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    gap: 16,
    paddingBottom: 28,
  },
  headerCard: {
    padding: 18,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  title: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.lg,
    color: colors.ink,
  },
  body: {
    marginTop: 8,
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
    color: colors.slate,
    lineHeight: 20,
  },
  metaRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 10,
  },
  metaPill: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  metaLabel: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.xs,
    color: colors.slate,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  metaValue: {
    marginTop: 4,
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.lg,
    color: colors.ink,
  },
  mapCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  loadingCard: {
    minHeight: 320,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  loadingText: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
    color: colors.slate,
  },
  errorCard: {
    padding: 18,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.divider,
    gap: 12,
  },
  retryButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: colors.ocean,
  },
  retryText: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.sm,
    color: colors.white,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 1,
    borderColor: colors.divider,
    padding: 18,
    gap: 10,
  },
  modalHandle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.divider,
    marginBottom: 4,
  },
  modalTitle: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.lg,
    color: colors.ink,
  },
  modalBody: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
    color: colors.slate,
  },
  modalCoords: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.xs,
    color: colors.inkSoft,
  },
  detailButton: {
    marginTop: 6,
    alignSelf: 'flex-start',
    backgroundColor: colors.brandPurple,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 14,
  },
  detailButtonText: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.sm,
    color: colors.white,
  },
});

export default CityMapScreen;
