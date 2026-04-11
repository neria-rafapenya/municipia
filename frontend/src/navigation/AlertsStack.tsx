import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import AlertDetailScreen from '../screens/AlertDetailScreen';
import AlertsScreen from '../screens/AlertsScreen';
import { AlertsStackParamList } from './types';

const Stack = createNativeStackNavigator<AlertsStackParamList>();

const AlertsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
    <Stack.Screen name="AlertsHome" component={AlertsScreen} />
    <Stack.Screen name="AlertDetail" component={AlertDetailScreen} />
  </Stack.Navigator>
);

export default AlertsStack;
