import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";

type ButtonNewProps = {
  size?: number;
  hovered?: boolean;
  children?: React.ReactNode;
};

const ButtonNew = ({ size = 70, hovered = false, children }: ButtonNewProps) => {
  const gradientPrefix = React.useRef(
    `bn-${Math.random().toString(36).slice(2, 9)}`
  ).current;
  const outerSize = size + 5;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const gradientSuffix = "default";

  const outerGradient = {
    from: "#99A0A9",
    to: "#FFFFFF",
    x1: "0%",
    y1: "0%",
    x2: "100%",
    y2: "100%",
  };

  const fillGradient = {
    from: hovered ? "#FAFBFC" : "#DDE1E7",
    to: hovered ? "#DDE1E7" : "#FAFBFC",
    x1: "0%",
    y1: "0%",
    x2: "100%",
    y2: "100%",
  };

  const borderGradient = {
    from: hovered ? "#CBD0D9" : "#FFFFFF",
    to: hovered ? "#FFFFFF" : "#CBD0D9",
    x1: "0%",
    y1: "0%",
    x2: "100%",
    y2: "100%",
  };

  return (
    <View style={[styles.wrapper, { width: outerSize, height: outerSize }]}>
      <View style={[styles.outerWrap, { width: outerSize, height: outerSize }]}>
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
          />
        </Svg>
      </View>
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
  outerWrap: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  innerCircle: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
});

export default ButtonNew;
