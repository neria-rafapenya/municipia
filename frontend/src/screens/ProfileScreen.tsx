import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Screen from '../components/Screen';
import { colors } from '../theme/colors';
import { fontFamilies, fontSizes } from '../theme/typography';

const ProfileScreen = () => (
  <Screen title="Mi perfil">
    <View style={styles.card}>
      <Text style={styles.title}>Datos del vecino</Text>
      <Text style={styles.body}>
        Configura tu municipio, preferencias de alertas y datos de contacto.
      </Text>
    </View>
  </Screen>
);

const styles = StyleSheet.create({
  card: {
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
    marginTop: 10,
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
    color: colors.slate,
  },
});

export default ProfileScreen;
