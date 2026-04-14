import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AppState, Platform, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as NavigationBar from 'expo-navigation-bar';
import DrawerOverlay from '../components/DrawerOverlay';
import { DrawerProvider } from '../context/DrawerContext';
import { NavigationBarProvider } from '../context/NavigationBarContext';
import { TabNavigationProvider } from '../context/TabNavigationContext';
import MainTabs from './MainTabs';

const AppShell = () => {
  const [navHidden, setNavHidden] = useState(false);
  const insets = useSafeAreaInsets();
  const hideAndroidNavBar = useCallback(() => {
    if (Platform.OS !== 'android') return;
    NavigationBar.setVisibilityAsync('hidden');
    NavigationBar.setBehaviorAsync('overlay-swipe');
    NavigationBar.setPositionAsync('absolute');
    NavigationBar.setBackgroundColorAsync('transparent');
    NavigationBar.getVisibilityAsync().then((visibility) => {
      setNavHidden(visibility === 'hidden');
    });
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      setNavHidden(false);
      return;
    }
    hideAndroidNavBar();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        hideAndroidNavBar();
      }
    });
    return () => sub.remove();
  }, [hideAndroidNavBar]);

  useFocusEffect(
    useCallback(() => {
      hideAndroidNavBar();
    }, [hideAndroidNavBar])
  );

  const navValue = useMemo(() => ({ navHidden }), [navHidden]);

  return (
    <NavigationBarProvider value={navValue}>
      <TabNavigationProvider>
        <DrawerProvider>
          <View
            style={[
              styles.container,
              Platform.OS === 'android' && navHidden && { marginBottom: -insets.bottom },
            ]}
          >
            <MainTabs />
            <DrawerOverlay />
          </View>
        </DrawerProvider>
      </TabNavigationProvider>
    </NavigationBarProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AppShell;
