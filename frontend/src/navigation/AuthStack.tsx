import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { Easing } from 'react-native';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import { AuthStackParamList } from './types';

const Stack = createStackNavigator<AuthStackParamList>();

const transitionSpec = {
  open: {
    animation: 'timing' as const,
    config: {
      duration: 420,
      easing: Easing.out(Easing.cubic),
    },
  },
  close: {
    animation: 'timing' as const,
    config: {
      duration: 360,
      easing: Easing.out(Easing.cubic),
    },
  },
};

const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      gestureEnabled: true,
      gestureDirection: 'horizontal',
      transitionSpec,
      cardOverlayEnabled: true,
      cardStyle: { backgroundColor: 'transparent' },
      cardStyleInterpolator: ({ current, layouts }) => {
        const translateX = current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [layouts.screen.width, 0],
        });
        const scale = current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [1.02, 1],
        });
        const overlayOpacity = current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 0.08],
        });

        return {
          cardStyle: {
            transform: [{ translateX }, { scale }],
          },
          overlayStyle: {
            opacity: overlayOpacity,
          },
        };
      },
    }}
  >
    <Stack.Screen
      name="Login"
      component={LoginScreen}
    />
    <Stack.Screen
      name="Register"
      component={RegisterScreen}
    />
  </Stack.Navigator>
);

export default AuthStack;
