import React from 'react';
import { StyleSheet, View } from 'react-native';
import DrawerOverlay from '../components/DrawerOverlay';
import { DrawerProvider } from '../context/DrawerContext';
import MainTabs from './MainTabs';

const AppShell = () => (
  <DrawerProvider>
    <View style={styles.container}>
      <MainTabs />
      <DrawerOverlay />
    </View>
  </DrawerProvider>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AppShell;
