import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Screen from '../components/Screen';
import { AlertsStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { fontFamilies, fontSizes } from '../theme/typography';

type Nav = NativeStackNavigationProp<AlertsStackParamList, 'AlertsHome'>;

const AlertsScreen = () => {
  const navigation = useNavigation<Nav>();

  return (
    <Screen title="Alertas locales">
      <View style={styles.stack}>
        {['Corte de agua', 'Obras en la avenida', 'Feria semanal'].map((item, index) => (
          <Pressable
            key={item}
            style={styles.card}
            onPress={() => navigation.navigate('AlertDetail', { id: `${index}` })}
          >
            <Text style={styles.cardTitle}>{item}</Text>
            <Text style={styles.cardBody}>
              Información actualizada sobre tu barrio. Toca para leer los detalles.
            </Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  stack: {
    gap: 14,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  cardTitle: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.md,
    color: colors.ink,
  },
  cardBody: {
    marginTop: 6,
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
    color: colors.slate,
  },
});

export default AlertsScreen;
