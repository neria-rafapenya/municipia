import React from "react";
import {
  View,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Dimensions,
  Text,
  Platform,
} from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigationBar } from "../context/NavigationBarContext";
import { useTabNavigation } from "../context/TabNavigationContext";
import { DrawerStackParamList } from "./types";
import AsyncStorage from "@react-native-async-storage/async-storage";

import ButtonBottom from "../components/ButtonBottom";
import ButtonNew from "../components/ButtonNew";

const { width } = Dimensions.get("window");
const BAR_HEIGHT = 90;

export default function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const center = width / 2;
  const insets = useSafeAreaInsets();
  const { navHidden } = useNavigationBar();
  const { setNavigation } = useTabNavigation();
  const [centerHovered, setCenterHovered] = React.useState(false);
  const currentRoute = state.routes[state.index];
  const nestedRouteName =
    currentRoute.name === "DrawerTab"
      ? (currentRoute.state as any)?.routes?.[
          (currentRoute.state as any)?.index ?? 0
        ]?.name
      : undefined;
  const isProfileActive =
    currentRoute.name === "DrawerTab" && nestedRouteName === "Profile";
  const isHomeActive = false;
  const isAlertsActive = currentRoute.name === "AlertsTab";
  const isMapActive = currentRoute.name === "MapTab";
  const nestedCurrent =
    currentRoute.name === "DrawerTab"
      ? (currentRoute.state as any)?.routes?.[
          (currentRoute.state as any)?.index ?? 0
        ]?.name
      : undefined;

  React.useEffect(() => {
    setNavigation(navigation);
  }, [navigation, setNavigation]);

  React.useEffect(() => {
    const lastTabKey = "nav:last_tab";
    const lastDrawerKey = "nav:last_drawer_screen";
    AsyncStorage.setItem(lastTabKey, currentRoute.name);
    if (currentRoute.name === "DrawerTab" && nestedCurrent) {
      AsyncStorage.setItem(lastDrawerKey, nestedCurrent);
    }
  }, [currentRoute.name, nestedCurrent]);

  const goToDrawer = (screen: keyof DrawerStackParamList) => {
    navigation.navigate("DrawerTab", { screen });
  };

  const d = `
    M0 0
    H${center - 70}
    C ${center - 50} 0, ${center - 40} 50, ${center} 50
    C ${center + 40} 50, ${center + 50} 0, ${center + 70} 0
    H${width}
    V${BAR_HEIGHT}
    H0
    Z
  `;

  return (
    <View
      style={[
        styles.wrapper,
        Platform.OS === "android" && navHidden && { marginBottom: -insets.bottom },
      ]}
    >
      {/* FONDO */}
      <Svg width={width} height={BAR_HEIGHT} style={styles.canvas}>
        <Defs>
          <LinearGradient id="tabGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#A85DC9" />
            <Stop offset="100%" stopColor="#EF5E9D" />
          </LinearGradient>
          <LinearGradient id="tabShadowTop" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="rgba(0,0,0,0.08)" />
            <Stop offset="35%" stopColor="rgba(0,0,0,0.04)" />
            <Stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </LinearGradient>
        </Defs>
        <Path d={d} fill="url(#tabGradient)" />
        {Platform.OS !== "android" && (
          <Path
            d={d}
            fill="none"
            stroke="url(#tabShadowTop)"
            strokeWidth={5}
            strokeLinejoin="round"
            strokeLinecap="round"
            transform="translate(0 -5)"
            opacity={0.55}
          />
        )}
      </Svg>

      {/* IZQUIERDA */}
      <View style={styles.leftGroup}>
        <TabItem
          label="Home"
          isFocused={isHomeActive}
          onPress={() => goToDrawer("Dashboard")}
        >
          <MaterialIcons name="home" size={22} color="#fff" />
        </TabItem>

        <TabItem
          label="Perfil"
          isFocused={isProfileActive}
          onPress={() => goToDrawer("Profile")}
        >
          <MaterialIcons name="person" size={22} color="#fff" />
        </TabItem>
      </View>

      {/* BOTÓN CENTRAL */}
      <Pressable
        style={styles.centerButton}
        onPress={() =>
          navigation.navigate("NewIncidentTab", { screen: "IncidentPreview" })
        }
        onHoverIn={() => setCenterHovered(true)}
        onHoverOut={() => setCenterHovered(false)}
      >
        {({ pressed }) => (
          <ButtonNew size={70} hovered={centerHovered || pressed}>
            <MaterialIcons name="add" size={30} color="#A1A1A6" />
          </ButtonNew>
        )}
      </Pressable>

      {/* DERECHA */}
      <View style={styles.rightGroup}>
        <TabItem
          label="Alertas"
          isFocused={isAlertsActive}
          onPress={() => navigation.navigate("AlertsTab")}
        >
          <MaterialIcons name="notifications" size={22} color="#fff" />
        </TabItem>

        <TabItem
          label="Mapa"
          isFocused={isMapActive}
          onPress={() => navigation.navigate("MapTab")}
        >
          <MaterialIcons name="map" size={22} color="#fff" />
        </TabItem>
      </View>
    </View>
  );
}

const TabItem = ({ children, label, onPress, isFocused }: any) => {
  const [pressedActive, setPressedActive] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const active = Boolean(isFocused || pressedActive);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressedActive(true)}
      onPressOut={() => setPressedActive(false)}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={styles.tabItem}
    >
      <ButtonBottom size={42} active={active} hovered={hovered}>
        {children}
      </ButtonBottom>
      {/* labels ocultas */}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    height: BAR_HEIGHT,
    position: "relative",
    backgroundColor: "#FFFFFF",
  },
  canvas: {
    position: "absolute",
    width: "100%",
    height: BAR_HEIGHT,
  },
  leftGroup: {
    position: "absolute",
    left: 16,
    bottom: 22,
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },
  rightGroup: {
    position: "absolute",
    right: 16,
    bottom: 22,
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },
  tabItem: {
    alignItems: "center",
  },
  centerButton: {
    position: "absolute",
    top: -35,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
  },
});
