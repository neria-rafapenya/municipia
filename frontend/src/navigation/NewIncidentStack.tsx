import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import IncidentDetailScreen from '../screens/IncidentDetailScreen';
import IncidentPreviewScreen from '../screens/IncidentPreviewScreen';
import NewIncidentScreen from '../screens/NewIncidentScreen';
import { NewIncidentStackParamList } from './types';

const Stack = createNativeStackNavigator<NewIncidentStackParamList>();

const NewIncidentStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
    <Stack.Screen name="NewIncidentHome" component={NewIncidentScreen} />
    <Stack.Screen name="IncidentPreview" component={IncidentPreviewScreen} />
    <Stack.Screen name="IncidentDetail" component={IncidentDetailScreen} />
  </Stack.Navigator>
);

export default NewIncidentStack;
