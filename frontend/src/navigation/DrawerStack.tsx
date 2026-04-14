import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import DashboardScreen from '../screens/DashboardScreen';
import ChatAiScreen from '../screens/ChatAiScreen';
import IncidentDetailScreen from '../screens/IncidentDetailScreen';
import NewsDetailScreen from '../screens/NewsDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ReportHistoryScreen from '../screens/ReportHistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { DrawerStackParamList } from './types';

const Stack = createNativeStackNavigator<DrawerStackParamList>();

const DrawerStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_left' }}>
    <Stack.Screen name="Dashboard" component={DashboardScreen} />
    <Stack.Screen name="ReportHistory" component={ReportHistoryScreen} />
    <Stack.Screen name="ChatAI" component={ChatAiScreen} />
    <Stack.Screen name="NewsDetail" component={NewsDetailScreen} />
    <Stack.Screen name="IncidentDetail" component={IncidentDetailScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
  </Stack.Navigator>
);

export default DrawerStack;
