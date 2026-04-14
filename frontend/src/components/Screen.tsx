import React from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import LogoMiniBlanco from './LogoMiniBlanco';
import BackgroundComponent from './BackgroundComponent';
import { useDrawer } from '../context/DrawerContext';
import { useNavigationBar } from '../context/NavigationBarContext';
import { colors } from '../theme/colors';

type Props = {
  title: string;
  children?: React.ReactNode;
  showBack?: boolean;
};

const Screen = ({ title, children, showBack = false }: Props) => {
  const { open } = useDrawer();
  const { navHidden } = useNavigationBar();
  const navigation = useNavigation();

  const handleBack = () => {
    if ((navigation as any)?.canGoBack?.()) {
      (navigation as any).goBack();
    }
  };

  return (
    <SafeAreaView
      style={styles.safe}
      edges={
        Platform.OS === 'android' && navHidden ? ['top', 'left', 'right'] : undefined
      }
    >
      <BackgroundComponent />
      <View style={styles.header}>
        <View style={styles.leftSlot}>
          {showBack ? (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <MaterialIcons name="arrow-back-ios-new" size={18} color={colors.ink} />
            </TouchableOpacity>
          ) : (
            <View style={styles.logoWrap}>
              <LogoMiniBlanco size={120} />
            </View>
          )}
        </View>
        <TouchableOpacity onPress={open} style={styles.menuButton}>
          <MaterialIcons name="menu" size={22} color={colors.ink} />
        </TouchableOpacity>
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
    backgroundColor: 'transparent',
  },
  leftSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoWrap: {
    height: 28,
    justifyContent: 'center',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.paperStrong,
  },
  menuButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.paperStrong,
  },
  content: {
    flex: 1,
    padding: 20,
  },
});

export default Screen;
