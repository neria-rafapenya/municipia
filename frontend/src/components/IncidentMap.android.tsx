import React from 'react';
import { Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { colors } from '../theme/colors';
import { fontFamilies, fontSizes } from '../theme/typography';

type Props = {
  latitude: number;
  longitude: number;
};

const IncidentMap = ({ latitude, longitude }: Props) => {
  const key = (Constants.expoConfig?.extra?.googleMapsWebKey as string | null) || null;
  const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
  const staticUrl = key
    ? `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=16&size=640x360&scale=2&markers=color:red%7C${latitude},${longitude}&key=${key}`
    : null;

  return (
    <View style={styles.frame}>
      {staticUrl ? (
        <Pressable onPress={() => Linking.openURL(url)}>
          <Image source={{ uri: staticUrl }} style={styles.map} resizeMode="cover" />
          <View style={styles.overlay}>
            <Text style={styles.overlayText}>Abrir en Google Maps</Text>
          </View>
        </Pressable>
      ) : (
        <View style={styles.fallback}>
          <Text style={styles.fallbackText}>Mapa no disponible</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  frame: {
    marginTop: 10,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.divider,
    backgroundColor: colors.surfaceAlt,
  },
  map: {
    width: '100%',
    height: 200,
  },
  overlay: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  overlayText: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.xs,
    color: colors.white,
  },
  fallback: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
    color: colors.ink,
  },
});

export default IncidentMap;
