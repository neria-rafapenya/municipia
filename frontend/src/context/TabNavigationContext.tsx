import React, { createContext, useContext, useMemo, useState } from 'react';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

type TabNavigationContextValue = {
  navigation: BottomTabBarProps['navigation'] | null;
  setNavigation: (navigation: BottomTabBarProps['navigation']) => void;
};

const TabNavigationContext = createContext<TabNavigationContextValue | undefined>(
  undefined
);

export const TabNavigationProvider = ({ children }: { children: React.ReactNode }) => {
  const [navigation, setNavigation] = useState<BottomTabBarProps['navigation'] | null>(
    null
  );

  const value = useMemo(
    () => ({
      navigation,
      setNavigation,
    }),
    [navigation]
  );

  return (
    <TabNavigationContext.Provider value={value}>
      {children}
    </TabNavigationContext.Provider>
  );
};

export const useTabNavigation = () => {
  const ctx = useContext(TabNavigationContext);
  if (!ctx) {
    throw new Error('useTabNavigation must be used within TabNavigationProvider');
  }
  return ctx;
};
