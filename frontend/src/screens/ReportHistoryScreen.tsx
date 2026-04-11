import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Screen from '../components/Screen';
import { colors } from '../theme/colors';
import { fontFamilies, fontSizes } from '../theme/typography';

const ReportHistoryScreen = () => (
  <Screen title="Historial de reportes">
    <View style={styles.card}>
      <Text style={styles.title}>Tus incidencias</Text>
      <Text style={styles.body}>
        Lista cronológica con estados y evolución. Conecta con el backend para cargar
        resultados paginados.
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

export default ReportHistoryScreen;
