import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MenuIcon from '../../assets/icons/menu.svg';
import { useDrawer } from '../context/DrawerContext';
import { colors } from '../theme/colors';
import { fontFamilies, fontSizes } from '../theme/typography';

type Props = {
  title: string;
  children?: React.ReactNode;
};

const Screen = ({ title, children }: Props) => {
  const { open } = useDrawer();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={open} style={styles.menuButton}>
          <MenuIcon width={22} height={22} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.menuButton} />
      </View>
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    backgroundColor: colors.white,
  },
  menuButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.paperStrong,
  },
  title: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.lg,
    color: colors.ink,
  },
  content: {
    flex: 1,
    padding: 20,
  },
});

export default Screen;
