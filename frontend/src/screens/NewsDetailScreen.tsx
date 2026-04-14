import React from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import Screen from "../components/Screen";
import { DrawerStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";
import { fontFamilies, fontSizes } from "../theme/typography";

const noImage = require("../../assets/noimage.png");

type RouteProps = RouteProp<DrawerStackParamList, "NewsDetail">;

const NewsDetailScreen = () => {
  const route = useRoute<RouteProps>();
  const { item } = route.params;
  const imageSource = item.image ?? (item.imageUrl ? { uri: item.imageUrl } : noImage);

  return (
    <Screen title="Detalle" showBack>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.imageWrap}>
            <Image source={imageSource} style={styles.image} resizeMode="cover" />
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.summary}>{item.summary}</Text>
            <View style={styles.divider} />
            <Text style={styles.contentText}>{item.content}</Text>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 30,
    gap: 12,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.strokeSoft,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  imageWrap: {
    width: "100%",
  },
  image: {
    width: "100%",
    height: 180,
    backgroundColor: colors.surfaceAlt,
  },
  cardBody: {
    padding: 16,
    gap: 12,
  },
  title: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.lg,
    color: colors.ink,
  },
  summary: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.md,
    color: colors.inkSoft,
  },
  divider: {
    height: 1,
    backgroundColor: colors.strokeSoft,
    marginVertical: 6,
  },
  contentText: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
    color: colors.ink,
    lineHeight: 20,
  },
});

export default NewsDetailScreen;
