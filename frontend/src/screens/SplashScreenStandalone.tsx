import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import * as NavigationBar from "expo-navigation-bar";
import { Animated, Easing, Platform, StyleSheet, View } from "react-native";
import LogoNegativo from "../components/LogoNegativo";

const FINAL_SIZE = 150;
const START_SCALE = 10 / FINAL_SIZE;

const SplashScreenStandalone = () => {
  const scale = useRef(new Animated.Value(START_SCALE)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const hideAndroidNavBar = useCallback(() => {
    if (Platform.OS !== "android") return;
    NavigationBar.setVisibilityAsync("hidden");
    NavigationBar.setBehaviorAsync("overlay-swipe");
    NavigationBar.setPositionAsync("absolute");
    NavigationBar.setBackgroundColorAsync("transparent");
  }, []);

  useEffect(() => {
    hideAndroidNavBar();
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 1,
        duration: 1600,
        easing: Easing.out(Easing.exp),
        useNativeDriver: false,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 1200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
    ]).start();
  }, [hideAndroidNavBar, opacity, scale]);

  const logoStyle = useMemo(
    () => ({
      transform: [{ scale }],
      opacity,
    }),
    [opacity, scale],
  );

  return (
    <LinearGradient colors={["#A85DC9", "#EF5E9D"]} style={styles.container}>
      <View style={styles.inner}>
        <Animated.View style={logoStyle}>
          <LogoNegativo size={FINAL_SIZE} />
        </Animated.View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
});

export default SplashScreenStandalone;
