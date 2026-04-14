import React from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const BackgroundComponent = () => {
  return (
    <View pointerEvents="none" style={styles.container}>
      <LinearGradient
        colors={["#df6890", "#df6890", "#d886a2", "#FFFFFF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.circle, styles.circleThree]}
      />

      <View style={[styles.circle, styles.circleTwo]} />
      <View style={[styles.circle, styles.circleOne]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  circle: {
    position: "absolute",
    top: -220,
    left: -100,
    transform: [{ rotate: "13.603deg" }],
  },
  circleOne: {
    width: 604.335,
    height: 418.306,
    borderRadius: 604.335,
    backgroundColor: "#B34FAB",
    zIndex: 2,
  },
  circleTwo: {
    width: 666.583,
    height: 573.347,
    borderRadius: 666.583,
    backgroundColor: "#D4537E",
    zIndex: 1,
  },
  circleThree: {
    width: 760,
    height: 760,
    borderRadius: 380,
    top: -300,
    zIndex: 0,
  },
});

export default BackgroundComponent;
