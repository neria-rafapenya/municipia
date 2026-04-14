import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import AlertsStack from "./AlertsStack";
import DrawerStack from "./DrawerStack";
import MapStack from "./MapStack";
import NewIncidentStack from "./NewIncidentStack";
import { DrawerStackParamList, MainTabParamList } from "./types";
import CustomTabBar from "./CustomTabBar";

const Tab = createBottomTabNavigator<MainTabParamList>();
const LAST_TAB_KEY = "nav:last_tab";
const LAST_DRAWER_KEY = "nav:last_drawer_screen";
const DEFAULT_TAB: keyof MainTabParamList = "DrawerTab";
const DEFAULT_DRAWER: keyof DrawerStackParamList = "Dashboard";

const MainTabs = () => {
  const [initialTab, setInitialTab] = useState<keyof MainTabParamList | null>(
    null
  );
  const [initialDrawerScreen, setInitialDrawerScreen] =
    useState<keyof DrawerStackParamList | null>(null);

  useEffect(() => {
    const load = async () => {
      const lastTab = await AsyncStorage.getItem(LAST_TAB_KEY);
      const lastDrawer = await AsyncStorage.getItem(LAST_DRAWER_KEY);
      const validTabs: Array<keyof MainTabParamList> = [
        "AlertsTab",
        "NewIncidentTab",
        "MapTab",
        "DrawerTab",
      ];
      const validDrawer: Array<keyof DrawerStackParamList> = [
        "Dashboard",
        "ReportHistory",
        "Profile",
        "Settings",
      ];
      setInitialTab(
        validTabs.includes(lastTab as keyof MainTabParamList)
          ? (lastTab as keyof MainTabParamList)
          : DEFAULT_TAB
      );
      setInitialDrawerScreen(
        validDrawer.includes(lastDrawer as keyof DrawerStackParamList)
          ? (lastDrawer as keyof DrawerStackParamList)
          : DEFAULT_DRAWER
      );
    };
    load();
  }, []);

  if (!initialTab) {
    return null;
  }

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
      initialRouteName={initialTab}
    >
      <Tab.Screen name="AlertsTab" component={AlertsStack} />
      <Tab.Screen name="NewIncidentTab" component={NewIncidentStack} />
      <Tab.Screen name="MapTab" component={MapStack} />

      <Tab.Screen
        name="DrawerTab"
        component={DrawerStack}
        initialParams={
          initialDrawerScreen ? { screen: initialDrawerScreen } : undefined
        }
        options={{ tabBarButton: () => null }}
      />
    </Tab.Navigator>
  );
};

export default MainTabs;
