import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import CityMapScreen from '../screens/CityMapScreen';
import MapPointDetailScreen from '../screens/MapPointDetailScreen';
import { MapStackParamList } from './types';

const Stack = createNativeStackNavigator<MapStackParamList>();

const MapStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
    <Stack.Screen name="CityMapHome" component={CityMapScreen} />
    <Stack.Screen name="PointDetail" component={MapPointDetailScreen} />
  </Stack.Navigator>
);

export default MapStack;
