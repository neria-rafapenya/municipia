import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen
      name="Login"
      component={LoginScreen}
      options={{ animation: 'slide_from_bottom' }}
    />
    <Stack.Screen
      name="Register"
      component={RegisterScreen}
      options={{ animation: 'slide_from_bottom' }}
    />
  </Stack.Navigator>
);

export default AuthStack;
