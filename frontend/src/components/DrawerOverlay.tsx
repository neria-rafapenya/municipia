import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTabNavigation } from '../context/TabNavigationContext';
import MenuIcon from '../../assets/icons/menu.svg';
import LogoutIcon from '../../assets/icons/logout.svg';
import SettingsIcon from '../../assets/icons/settings.svg';
import { useAuth } from '../context/AuthContext';
import { useDrawer } from '../context/DrawerContext';
import { useApi } from '../hooks/useApi';
import { colors } from '../theme/colors';
import { fontFamilies, fontSizes } from '../theme/typography';
import DrawerItem from './DrawerItem';

type DrawerProfile = {
  fullName?: string;
  email?: string;
  avatarUrl?: string | null;
};

const DrawerOverlay = () => {
  const { navigation } = useTabNavigation();
  const { isOpen, close, open } = useDrawer();
  const { logout } = useAuth();
  const { apiFetch } = useApi();
  const [profile, setProfile] = useState<DrawerProfile | null>(null);
  const width = Dimensions.get('window').width;
  const drawerWidth = Math.min(width * 0.82, 320);
  const translateX = useRef(new Animated.Value(-drawerWidth)).current;
  const isDragging = useRef(false);

  useEffect(() => {
    let isMounted = true;
    if (!isOpen) return () => {
      isMounted = false;
    };
    const loadProfile = async () => {
      try {
        const data = await apiFetch<DrawerProfile>('/api/users/me');
        if (isMounted) {
          setProfile(data);
        }
      } catch {
        if (isMounted) {
          setProfile(null);
        }
      }
    };
    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [apiFetch, isOpen]);

  useEffect(() => {
    if (isDragging.current) return;
    Animated.timing(translateX, {
      toValue: isOpen ? 0 : -drawerWidth,
      duration: 240,
      useNativeDriver: false,
    }).start();
  }, [isOpen, drawerWidth, translateX]);

  const snapTo = (toValue: number) => {
    Animated.timing(translateX, {
      toValue,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const edgePanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        !isOpen && gesture.dx > 8 && Math.abs(gesture.dy) < 12,
      onPanResponderGrant: () => {
        isDragging.current = true;
      },
      onPanResponderMove: (_, gesture) => {
        const next = Math.min(0, -drawerWidth + gesture.dx);
        translateX.setValue(next);
      },
      onPanResponderRelease: (_, gesture) => {
        isDragging.current = false;
        const shouldOpen = gesture.dx > drawerWidth * 0.35;
        if (shouldOpen) {
          open();
        } else {
          snapTo(-drawerWidth);
        }
      },
      onPanResponderTerminate: () => {
        isDragging.current = false;
        snapTo(isOpen ? 0 : -drawerWidth);
      },
    })
  ).current;

  const drawerPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        isOpen && Math.abs(gesture.dx) > 6 && Math.abs(gesture.dy) < 12,
      onPanResponderGrant: () => {
        isDragging.current = true;
      },
      onPanResponderMove: (_, gesture) => {
        const next = Math.max(-drawerWidth, Math.min(0, gesture.dx));
        translateX.setValue(next);
      },
      onPanResponderRelease: (_, gesture) => {
        isDragging.current = false;
        const shouldClose = gesture.dx < -drawerWidth * 0.35;
        if (shouldClose) {
          close();
        } else {
          snapTo(0);
        }
      },
      onPanResponderTerminate: () => {
        isDragging.current = false;
        snapTo(isOpen ? 0 : -drawerWidth);
      },
    })
  ).current;

  const menuItems = useMemo(
    () => [
      { label: 'Dashboard', screen: 'Dashboard' as const },
      { label: 'Historial de reportes', screen: 'ReportHistory' as const },
      { label: 'Chat IA', screen: 'ChatAI' as const },
      { label: 'Mi perfil', screen: 'Profile' as const },
    ],
    []
  );

  const initials = useMemo(() => {
    const base = (profile?.fullName || profile?.email || '').trim();
    if (!base) return 'VV';
    const parts = base.split(/\s+/);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }, [profile]);

  const goTo = (screen: 'Dashboard' | 'ReportHistory' | 'ChatAI' | 'Profile' | 'Settings') => {
    if (navigation) {
      navigation.navigate('DrawerTab', { screen });
    }
    close();
  };

  return (
    <>
      {!isOpen && <View style={styles.edgeSwipe} {...edgePanResponder.panHandlers} />}
      {isOpen && <Pressable style={styles.backdrop} onPress={close} />}
      <Animated.View
        style={[styles.drawer, { width: drawerWidth, transform: [{ translateX }] }]}
        {...drawerPanResponder.panHandlers}
      >
        <LinearGradient colors={[colors.ocean, colors.accent]} style={styles.header}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              {profile?.avatarUrl ? (
                <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{initials}</Text>
              )}
            </View>
            <View>
              <Text style={styles.name}>{profile?.fullName || 'Vecino'}</Text>
              <Text style={styles.city}>{profile?.email || 'Municipia'}</Text>
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

      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 18, 24, 0.4)',
  },
  edgeSwipe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 24,
    zIndex: 5,
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.paper,
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
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
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
});

export default DrawerOverlay;
