import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Screen from '../components/Screen';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApi } from '../hooks/useApi';
import { DrawerStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { fontFamilies, fontSizes } from '../theme/typography';

type IncidentAttachment = {
  id: number;
  fileUrl: string;
  fileName?: string | null;
  fileType?: string | null;
};

type Incident = {
  id: number;
  description?: string | null;
  status?: string | null;
  aiConfidence?: number | null;
  imageUrl?: string | null;
  attachments?: IncidentAttachment[] | null;
};

type PagedResponse<T> = {
  items: T[];
  page: number;
  size: number;
  total: number;
};

const ReportHistoryScreen = () => {
  const { apiFetch } = useApi();
  const navigation = useNavigation<NativeStackNavigationProp<DrawerStackParamList>>();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Incident[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiFetch<PagedResponse<Incident> | Incident[]>(
          '/api/incidents?sort=createdAt,desc&page=0&size=20'
        );
        if (Array.isArray(data)) {
          setItems(data);
        } else {
          setItems(data.items || []);
        }
      } catch (err: any) {
        setError(err?.message || 'No se pudieron cargar las incidencias');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [apiFetch]);

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

  const previewsForIncident = (incident: Incident) => {
    if (incident.attachments && incident.attachments.length > 0) {
      return incident.attachments.map((file) => ({
        url: file.fileUrl,
        fileName: file.fileName,
        fileType: file.fileType,
      }));
    }
    if (incident.imageUrl) {
      return [{ url: incident.imageUrl, fileName: null, fileType: null }];
    }
    return [] as { url: string; fileName: string | null; fileType: string | null }[];
  };

  const handleOpenIncident = useCallback(
    (id: number) => {
      navigation.navigate('IncidentDetail', { id: String(id) });
    },
    [navigation]
  );

  const renderItem = ({ item }: { item: Incident }) => {
    const previews = previewsForIncident(item);

    return (
      <Pressable style={styles.itemCard} onPress={() => handleOpenIncident(item.id)}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle} numberOfLines={2}>
            {item.description || 'Incidencia enviada'}
          </Text>
          <Text style={styles.itemMeta}>Estado: {item.status || 'Pendiente'}</Text>
          {item.aiConfidence != null && (
            <View style={styles.aiBadge}>
              <Text style={styles.aiBadgeLabel}>IA</Text>
              <Text style={styles.aiBadgeValue}>{formatConfidence(item.aiConfidence)}</Text>
            </View>
          )}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.previewRow}
          >
            {previews.length > 0 ? (
              previews.map((preview, index) =>
                isImageFile(preview.fileType, preview.fileName, preview.url) ? (
                  <Image
                    key={`${preview.url}-${index}`}
                    source={{ uri: preview.url }}
                    style={styles.previewImage}
                  />
                ) : (
                  <View key={`${preview.url}-${index}`} style={styles.previewFallback}>
                    <Text style={styles.previewFallbackText}>FILE</Text>
                  </View>
                )
              )
            ) : (
              <View style={styles.previewFallback}>
                <Text style={styles.previewFallbackText}>SIN FOTO</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Pressable>
    );
  };

  const listEmpty = useMemo(() => {
    if (loading) return null;
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.title}>Tus incidencias</Text>
        <Text style={styles.body}>Aún no hay reportes registrados.</Text>
      </View>
    );
  }, [loading]);

  return (
    <Screen title="Historial de reportes">
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.brandPurple} />
        </View>
      ) : error ? (
        <View style={styles.emptyCard}>
          <Text style={styles.title}>Error</Text>
          <Text style={styles.body}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={listEmpty}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  emptyCard: {
    padding: 18,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  list: {
    gap: 12,
    paddingBottom: 20,
  },
  itemCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.divider,
    padding: 16,
  },
  previewRow: {
    marginTop: 12,
    gap: 10,
  },
  previewImage: {
    width: 68,
    height: 68,
    borderRadius: 14,
    backgroundColor: colors.surfaceAlt,
  },
  previewFallback: {
    width: 68,
    height: 68,
    borderRadius: 14,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewFallbackText: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.xs,
    color: colors.inkSoft,
    textAlign: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.md,
    color: colors.ink,
  },
  itemMeta: {
    marginTop: 6,
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.xs,
    color: colors.slate,
  },
  title: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.lg,
    color: colors.ink,
  },
  body: {
    marginTop: 10,
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
    color: colors.slate,
  },
  aiBadge: {
    marginTop: 8,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ReportHistoryScreen;
