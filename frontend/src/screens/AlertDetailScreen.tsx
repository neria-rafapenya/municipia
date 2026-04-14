import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Screen from '../components/Screen';
import { colors } from '../theme/colors';
import { fontFamilies, fontSizes } from '../theme/typography';

const AlertDetailScreen = () => (
  <Screen title="Detalle de alerta" showBack>
    <View style={styles.card}>
      <Text style={styles.title}>Actualización municipal</Text>
      <Text style={styles.body}>
        Este es un espacio para mostrar el detalle completo de la alerta, con horarios,
        instrucciones y contactos útiles.
      </Text>
    </View>
  </Screen>
);

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 18,
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
    lineHeight: 20,
  },
});

export default AlertDetailScreen;
