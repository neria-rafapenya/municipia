import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Screen from '../components/Screen';
import { NewIncidentStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { fontFamilies, fontSizes } from '../theme/typography';

type Nav = NativeStackNavigationProp<NewIncidentStackParamList, 'IncidentPreview'>;

const IncidentPreviewScreen = () => {
  const navigation = useNavigation<Nav>();

  return (
    <Screen title="Preview IA">
      <View style={styles.card}>
        <Text style={styles.title}>Etiqueta sugerida</Text>
        <Text style={styles.badge}>Mobiliario urbano · 0.86</Text>
        <Text style={styles.body}>
          Confirma la categoría o ajusta la descripción antes de enviar la incidencia.
        </Text>
      </View>

      <Pressable
        style={styles.primaryButton}
        onPress={() => navigation.navigate('IncidentDetail', { id: 'new' })}
      >
        <Text style={styles.primaryText}>Confirmar y enviar</Text>
      </Pressable>
    </Screen>
  );
};

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
    fontSize: fontSizes.md,
    color: colors.ink,
  },
  badge: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: colors.mint,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.sm,
    color: colors.ocean,
  },
  body: {
    marginTop: 10,
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
    color: colors.slate,
  },
  primaryButton: {
    marginTop: 20,
    backgroundColor: colors.ocean,
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
  },
  primaryText: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.md,
    color: colors.white,
  },
});

export default IncidentPreviewScreen;
