import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { colors } from '../theme/colors';
import { fontFamilies, fontSizes } from '../theme/typography';

type Props = {
  latitude: number;
  longitude: number;
};

const IncidentMap = ({ latitude, longitude }: Props) => {
  const key = (Constants.expoConfig?.extra?.googleMapsWebKey as string | null) || null;
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: key || '',
  });

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

  return (
    <View style={styles.frame}>
      <GoogleMap
        mapContainerStyle={styles.map}
        center={{ lat: latitude, lng: longitude }}
        zoom={16}
        options={{
          disableDefaultUI: true,
          zoomControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        }}
      >
        <Marker position={{ lat: latitude, lng: longitude }} />
      </GoogleMap>
    </View>
  );
};

const styles = StyleSheet.create({
  frame: {
    marginTop: 10,
    borderRadius: 16,
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
    height: 200,
  },
});

export default IncidentMap;
