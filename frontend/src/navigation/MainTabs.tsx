import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import AlertIcon from '../../assets/icons/alert.svg';
import CameraIcon from '../../assets/icons/camera.svg';
import MapIcon from '../../assets/icons/map.svg';
import TabBarIcon from '../components/TabBarIcon';
import { colors } from '../theme/colors';
import { fontFamilies } from '../theme/typography';
import AlertsStack from './AlertsStack';
import DrawerStack from './DrawerStack';
import MapStack from './MapStack';
import NewIncidentStack from './NewIncidentStack';
import { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.accent,
      tabBarInactiveTintColor: colors.slate,
      tabBarStyle: {
        backgroundColor: colors.paper,
        borderTopColor: colors.divider,
        height: 72,
        paddingTop: 8,
      },
      tabBarLabelStyle: {
        fontSize: 12,
        letterSpacing: 0.3,
        fontFamily: fontFamilies.medium,
      },
    }}
  >
    <Tab.Screen
      name="AlertsTab"
      component={AlertsStack}
      options={{
        title: 'Alertas',
        tabBarIcon: ({ color }) => <TabBarIcon Icon={AlertIcon} color={color} />,
      }}
    />
    <Tab.Screen
      name="NewIncidentTab"
      component={NewIncidentStack}
      options={{
        title: 'Nueva',
        tabBarIcon: ({ color }) => <TabBarIcon Icon={CameraIcon} color={color} />,
      }}
    />
    <Tab.Screen
      name="MapTab"
      component={MapStack}
      options={{
        title: 'Mapa',
        tabBarIcon: ({ color }) => <TabBarIcon Icon={MapIcon} color={color} />,
      }}
    />
    <Tab.Screen
      name="DrawerTab"
      component={DrawerStack}
      options={{
        tabBarButton: () => null,
      }}
    />
  </Tab.Navigator>
);

export default MainTabs;
