import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Screen from '../components/Screen';
import { NewIncidentStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { fontFamilies, fontSizes } from '../theme/typography';

type Nav = NativeStackNavigationProp<NewIncidentStackParamList, 'NewIncidentHome'>;

const NewIncidentScreen = () => {
  const navigation = useNavigation<Nav>();

  return (
    <Screen title="Nueva incidencia">
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Captura y reporta</Text>
        <Text style={styles.heroBody}>
          Sube una foto o describe la incidencia. La IA sugerirá la categoría.
        </Text>
      </View>

      <Pressable style={styles.primaryButton} onPress={() => navigation.navigate('IncidentPreview')}>
        <Text style={styles.primaryText}>Abrir cámara</Text>
      </Pressable>
    </Screen>
  );
};

const styles = StyleSheet.create({
  hero: {
    padding: 18,
    borderRadius: 20,
    backgroundColor: colors.paperStrong,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  heroTitle: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.lg,
    color: colors.ink,
  },
  heroBody: {
    marginTop: 8,
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
    color: colors.slate,
  },
  primaryButton: {
    marginTop: 20,
    backgroundColor: colors.accent,
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

export default NewIncidentScreen;
