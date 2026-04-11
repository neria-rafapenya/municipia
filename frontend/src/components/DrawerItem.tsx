import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { fontFamilies, fontSizes } from '../theme/typography';

type Props = {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
};

const DrawerItem = ({ label, onPress, style }: Props) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.item,
      pressed && styles.pressed,
      style,
    ]}
  >
    <Text style={styles.text}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  item: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
  },
  pressed: {
    backgroundColor: colors.paperStrong,
  },
  text: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.md,
    color: colors.ink,
  },
});

export default DrawerItem;
