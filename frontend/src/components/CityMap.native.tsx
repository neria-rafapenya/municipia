import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { CityMapProps } from './CityMap.types';
import { colors } from '../theme/colors';
import { fontFamilies, fontSizes } from '../theme/typography';

const computeRegion = (
  points: CityMapProps['points'],
  center?: CityMapProps['center']
): Region | null => {
  if (center) {
    return {
      latitude: center.latitude,
      longitude: center.longitude,
      latitudeDelta: 0.03,
      longitudeDelta: 0.03,
    };
  }

  if (points.length === 0) return null;

  const latitude = points.reduce((sum, point) => sum + point.latitude, 0) / points.length;
  const longitude = points.reduce((sum, point) => sum + point.longitude, 0) / points.length;

  if (points.length === 1) {
    return {
      latitude,
      longitude,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    };
  }

  const latSpread = Math.max(...points.map((point) => Math.abs(point.latitude - latitude)));
  const lngSpread = Math.max(...points.map((point) => Math.abs(point.longitude - longitude)));
  const delta = Math.max(0.01, Math.min(0.25, Math.max(latSpread, lngSpread) * 3.5));

  return {
    latitude,
    longitude,
    latitudeDelta: delta,
    longitudeDelta: delta,
  };
};

const CityMap = ({ points, onPointPress, center }: CityMapProps) => {
  const region = useMemo(() => computeRegion(points, center), [points, center]);

  if (!region) {
    return (
      <View style={styles.frame}>
        <Text style={styles.label}>Aún no hay incidencias con ubicación.</Text>
      </View>
    );
  }

  return (
    <View style={styles.frame}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        scrollEnabled
        zoomEnabled
        pitchEnabled={false}
        rotateEnabled={false}
        showsMyLocationButton={false}
      >
        {points.map((point) => (
          <Marker
            key={point.id}
            coordinate={{
              latitude: point.latitude,
              longitude: point.longitude,
            }}
            onPress={() => onPointPress(point)}
            title={point.title}
            description={point.status || undefined}
          />
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  frame: {
    marginTop: 10,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.divider,
    backgroundColor: colors.surfaceAlt,
  },
  map: {
    width: '100%',
    height: 300,
  },
  label: {
    padding: 16,
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
    color: colors.ink,
    textAlign: 'center',
  },
});

export default CityMap;
