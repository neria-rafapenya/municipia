import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import MenuIcon from '../../assets/icons/menu.svg';
import LogoutIcon from '../../assets/icons/logout.svg';
import SettingsIcon from '../../assets/icons/settings.svg';
import { useAuth } from '../context/AuthContext';
import { useDrawer } from '../context/DrawerContext';
import { MainTabParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { fontFamilies, fontSizes } from '../theme/typography';
import DrawerItem from './DrawerItem';

const DrawerOverlay = () => {
  const navigation = useNavigation<NavigationProp<MainTabParamList>>();
  const { isOpen, close } = useDrawer();
  const { logout } = useAuth();
  const width = Dimensions.get('window').width;
  const drawerWidth = Math.min(width * 0.82, 320);
  const translateX = useRef(new Animated.Value(-drawerWidth)).current;

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: isOpen ? 0 : -drawerWidth,
      duration: 240,
      useNativeDriver: true,
    }).start();
  }, [isOpen, drawerWidth, translateX]);

  const menuItems = useMemo(
    () => [
      { label: 'Dashboard', screen: 'Dashboard' as const },
      { label: 'Historial de reportes', screen: 'ReportHistory' as const },
      { label: 'Mi perfil', screen: 'Profile' as const },
    ],
    []
  );

  const goTo = (screen: 'Dashboard' | 'ReportHistory' | 'Profile' | 'Settings') => {
    navigation.navigate('DrawerTab', { screen });
    close();
  };

  return (
    <>
      {isOpen && <Pressable style={styles.backdrop} onPress={close} />}
      <Animated.View style={[styles.drawer, { width: drawerWidth, transform: [{ translateX }] }]}>
        <LinearGradient colors={[colors.ocean, colors.accent]} style={styles.header}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>RV</Text>
            </View>
            <View>
              <Text style={styles.name}>Rafa Vecino</Text>
              <Text style={styles.city}>Municipia · Creixell</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <DrawerItem key={item.screen} label={item.label} onPress={() => goTo(item.screen)} />
          ))}
        </View>

        <View style={styles.footer}>
          <Pressable style={styles.footerButton} onPress={() => goTo('Settings')}>
            <SettingsIcon width={20} height={20} color={colors.ink} />
            <Text style={styles.footerText}>Settings</Text>
          </Pressable>
          <Pressable style={styles.footerButton} onPress={logout}>
            <LogoutIcon width={20} height={20} color={colors.danger} />
            <Text style={[styles.footerText, styles.logoutText]}>Logout</Text>
          </Pressable>
        </View>

        <View style={styles.handle}>
          <MenuIcon width={20} height={20} color={colors.paper} />
        </View>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 18, 24, 0.4)',
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.paper,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 22,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.lg,
    color: colors.ocean,
  },
  name: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.lg,
    color: colors.white,
  },
  city: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  menuSection: {
    padding: 18,
    gap: 6,
  },
  footer: {
    marginTop: 'auto',
    padding: 18,
    gap: 12,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.paperStrong,
    borderRadius: 16,
  },
  footerText: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.md,
    color: colors.ink,
  },
  logoutText: {
    color: colors.danger,
  },
  handle: {
    position: 'absolute',
    right: -18,
    top: 60,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.ocean,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default DrawerOverlay;
