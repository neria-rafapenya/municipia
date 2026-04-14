import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";

type ButtonBottomProps = {
  size?: number;
  active?: boolean;
  hovered?: boolean;
  children?: React.ReactNode;
};

const ButtonBottom = ({
  size = 64,
  active = false,
  hovered = false,
  children,
}: ButtonBottomProps) => {
  const gradientPrefix = React.useRef(
    `bb-${Math.random().toString(36).slice(2, 9)}`,
  ).current;
  const outerSize = size + 5;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const isActive = active || hovered;
  const gradientSuffix = isActive ? "active" : "default";
  const outerGradient = {
    from: "#8C4BDF",
    to: "#FFFFFF",
    x1: "0%",
    y1: "0%",
    x2: "0%",
    y2: "100%",
  };
  const fillGradient = isActive
    ? {
        from: "#4F0FA0",
        to: hovered ? "#7D3ECD" : "#ae396c",
        x1: "0%",
        y1: "0%",
        x2: "100%",
        y2: "100%",
      }
    : {
        from: "#A85DC9",
        to: "#EF5E9D",
        x1: "0%",
        y1: "0%",
        x2: "0%",
        y2: "100%",
      };
  const borderGradient = isActive
    ? {
        from: "#6E358C",
        to: "#EF5E9D",
        x1: "0%",
        y1: "0%",
        x2: "100%",
        y2: "100%",
      }
    : {
        from: "#D99AFA",
        to: "#BA3D4F",
        x1: "0%",
        y1: "0%",
        x2: "100%",
        y2: "100%",
      };
  return (
    <View style={[styles.wrapper, { width: outerSize, height: outerSize }]}>
      <Svg
        width={outerSize}
        height={outerSize}
        style={[styles.outerCircle, { width: outerSize, height: outerSize }]}
      >
        <Defs>
          <LinearGradient
            id={`${gradientPrefix}-outerGradient-${gradientSuffix}`}
            x1={outerGradient.x1}
            y1={outerGradient.y1}
            x2={outerGradient.x2}
            y2={outerGradient.y2}
          >
            <Stop offset="0%" stopColor={outerGradient.from} />
            <Stop offset="100%" stopColor={outerGradient.to} />
          </LinearGradient>
        </Defs>
        <Circle
          cx={outerSize / 2}
          cy={outerSize / 2}
          r={outerSize / 2}
          fill={`url(#${gradientPrefix}-outerGradient-${gradientSuffix})`}
          opacity={hovered ? 0.8 : active ? 1 : 0.7}
        />
      </Svg>
      <View
        style={[
          styles.innerShadowWrap,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
      >
        <View
          style={[
            styles.innerCircle,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        >
          <Svg width={size} height={size} style={StyleSheet.absoluteFillObject}>
            <Defs>
              <LinearGradient
                id={`${gradientPrefix}-fillGradient-${gradientSuffix}`}
                x1={fillGradient.x1}
                y1={fillGradient.y1}
                x2={fillGradient.x2}
                y2={fillGradient.y2}
              >
                <Stop offset="0%" stopColor={fillGradient.from} />
                <Stop offset="100%" stopColor={fillGradient.to} />
              </LinearGradient>
              <LinearGradient
                id={`${gradientPrefix}-borderGradient-${gradientSuffix}`}
                x1={borderGradient.x1}
                y1={borderGradient.y1}
                x2={borderGradient.x2}
                y2={borderGradient.y2}
              >
                <Stop offset="0%" stopColor={borderGradient.from} />
                <Stop offset="100%" stopColor={borderGradient.to} />
              </LinearGradient>
            </Defs>
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill={`url(#${gradientPrefix}-fillGradient-${gradientSuffix})`}
              stroke={`url(#${gradientPrefix}-borderGradient-${gradientSuffix})`}
              strokeWidth={strokeWidth}
            />
          </Svg>
          {children}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  outerCircle: {
    position: "absolute",
    backgroundColor: "transparent",
  },
  innerShadowWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  innerCircle: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
});

export default ButtonBottom;
