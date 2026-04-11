import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { fontFamilies, fontSizes } from '../theme/typography';

const SplashScreen = () => (
  <LinearGradient colors={[colors.ocean, colors.accent]} style={styles.container}>
    <View style={styles.inner}>
      <Text style={styles.title}>Municipia</Text>
      <Text style={styles.subtitle}>Cuidamos juntos la ciudad</Text>
    </View>
  </LinearGradient>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  title: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.display,
    color: colors.white,
    letterSpacing: 1,
  },
  subtitle: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.md,
    color: 'rgba(255,255,255,0.85)',
  },
});

export default SplashScreen;
