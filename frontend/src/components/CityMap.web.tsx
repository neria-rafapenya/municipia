import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { CityMapProps } from './CityMap.types';
import { colors } from '../theme/colors';
import { fontFamilies, fontSizes } from '../theme/typography';

const computeCenter = (points: CityMapProps['points']) => {
  if (points.length === 0) {
    return { latitude: 0, longitude: 0 };
  }

  const latitude = points.reduce((sum, point) => sum + point.latitude, 0) / points.length;
  const longitude = points.reduce((sum, point) => sum + point.longitude, 0) / points.length;
  return { latitude, longitude };
};

const CityMap = ({ points, onPointPress, center }: CityMapProps) => {
  const key = (Constants.expoConfig?.extra?.googleMapsWebKey as string | null) || null;
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: key || '',
  });
  const fallbackCenter = useMemo(() => computeCenter(points), [points]);
  const effectiveCenter = center || fallbackCenter;
  const zoom = center ? 14 : points.length <= 1 ? 15 : 14;

  if (!key) {
    return (
      <View style={styles.frame}>
        <Text style={styles.label}>Configura GOOGLE_MAPS_WEB_KEY para ver el mapa.</Text>
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={styles.frame}>
        <Text style={styles.label}>No se pudo cargar Google Maps.</Text>
      </View>
    );
  }

  if (!isLoaded) {
    return (
      <View style={styles.frame}>
        <Text style={styles.label}>Cargando mapa...</Text>
      </View>
    );
  }

  if (!center && points.length === 0) {
    return (
      <View style={styles.frame}>
        <Text style={styles.label}>Aún no hay incidencias con ubicación.</Text>
      </View>
    );
  }

  return (
    <View style={styles.frame}>
      <GoogleMap
        mapContainerStyle={styles.map}
        center={{ lat: effectiveCenter.latitude, lng: effectiveCenter.longitude }}
        zoom={zoom}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          fullscreenControl: false,
        }}
      >
        {points.map((point) => (
          <Marker
            key={point.id}
            position={{ lat: point.latitude, lng: point.longitude }}
            onClick={() => onPointPress(point)}
            title={point.title}
            label={point.title.length > 18 ? point.title.slice(0, 18) : point.title}
          />
        ))}
      </GoogleMap>
    </View>
  );
};

const styles = StyleSheet.create({
  frame: {
    marginTop: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.divider,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
  },
  label: {
    padding: 16,
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
    color: colors.ink,
    textAlign: 'center',
  },
  map: {
    width: '100%',
    height: 300,
  },
});

export default CityMap;
