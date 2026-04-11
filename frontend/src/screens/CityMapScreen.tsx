import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Screen from '../components/Screen';
import { MapStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { fontFamilies, fontSizes } from '../theme/typography';

type Nav = NativeStackNavigationProp<MapStackParamList, 'CityMapHome'>;

const CityMapScreen = () => {
  const navigation = useNavigation<Nav>();

  return (
    <Screen title="Mapa de ciudad">
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapTitle}>Mapa interactivo</Text>
        <Text style={styles.mapBody}>Capa de incidencias y puntos de interés</Text>
      </View>
      <Pressable style={styles.primaryButton} onPress={() => navigation.navigate('PointDetail')}>
        <Text style={styles.primaryText}>Ver punto cercano</Text>
      </Pressable>
    </Screen>
  );
};

const styles = StyleSheet.create({
  mapPlaceholder: {
    height: 260,
    borderRadius: 24,
    backgroundColor: colors.paperStrong,
    borderWidth: 1,
    borderColor: colors.divider,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  mapTitle: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.lg,
    color: colors.ink,
  },
  mapBody: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
    color: colors.slate,
  },
  primaryButton: {
    marginTop: 18,
    backgroundColor: colors.ocean,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  primaryText: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.md,
    color: colors.white,
  },
});

export default CityMapScreen;
