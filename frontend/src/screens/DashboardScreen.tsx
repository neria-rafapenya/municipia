import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Location from "expo-location";
import Screen from "../components/Screen";
import { colors } from "../theme/colors";
import { fontFamilies, fontSizes } from "../theme/typography";
import { DrawerStackParamList, NewsItem } from "../navigation/types";

const noImage = require("../../assets/noimage.png");

const DashboardScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<DrawerStackParamList, "Dashboard">>();
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [weather, setWeather] = useState<{
    temp: number;
    description: string;
    windKmh?: number;
    city?: string;
    main?: string;
  } | null>(null);

  const newsItems = useMemo<NewsItem[]>(
    () => [
      {
        id: "n1",
        title: "Corte de agua programado",
        summary: "Zona centro · Mañana 09:00-13:00",
        content:
          "Se realizará un corte de agua programado en la zona centro debido a tareas de mantenimiento en la red principal. Recomendamos almacenar agua suficiente para las horas indicadas.",
        image: null,
      },
      {
        id: "n2",
        title: "Nuevas rutas de reciclaje",
        summary: "Consulta los cambios en tu barrio",
        content:
          "Se han actualizado las rutas de reciclaje para mejorar la frecuencia de recogida y reducir tiempos. Consulta el calendario actualizado en la web municipal o en la oficina de atención ciudadana.",
        image: null,
      },
    ],
    [],
  );

  useEffect(() => {
    const apiKey = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY;
    if (!apiKey) {
      setWeatherError("Configura la API de OpenWeather");
      setWeatherLoading(false);
      return;
    }

    const city = process.env.EXPO_PUBLIC_WEATHER_CITY || "Creixell,ES";
    const defaultLat = Number(process.env.EXPO_PUBLIC_WEATHER_LAT);
    const defaultLon = Number(process.env.EXPO_PUBLIC_WEATHER_LON);

    const buildUrl = (params: string) =>
      `https://api.openweathermap.org/data/2.5/weather?${params}&units=metric&lang=es&appid=${apiKey}`;

    const loadWeather = async () => {
      try {
        setWeatherLoading(true);
        setWeatherError(null);

        let params = `q=${encodeURIComponent(city)}`;
        const permission = await Location.getForegroundPermissionsAsync();
        if (permission.status === "granted") {
          const position = await Location.getCurrentPositionAsync({});
          params = `lat=${position.coords.latitude}&lon=${position.coords.longitude}`;
        } else if (Number.isFinite(defaultLat) && Number.isFinite(defaultLon)) {
          params = `lat=${defaultLat}&lon=${defaultLon}`;
        }

        const response = await fetch(buildUrl(params));
        if (!response.ok) {
          throw new Error("No se pudo cargar el clima");
        }
        const data = await response.json();
        const temp = Math.round(data?.main?.temp ?? 0);
        const description = data?.weather?.[0]?.description || "Sin datos";
        const windSpeed = typeof data?.wind?.speed === "number" ? data.wind.speed : null;
        const windKmh = windSpeed != null ? Math.round(windSpeed * 3.6) : undefined;
        const main = data?.weather?.[0]?.main || undefined;
        const name = data?.name || undefined;
        setWeather({
          temp,
          description,
          windKmh,
          city: name || city,
          main,
        });
      } catch (err: any) {
        setWeatherError(err?.message || "No se pudo cargar el clima");
      } finally {
        setWeatherLoading(false);
      }
    };

    loadWeather();
  }, []);

  const weatherIconName = useMemo(() => {
    const main = weather?.main?.toLowerCase();
    if (!main) return "wb-sunny";
    if (main.includes("thunder")) return "flash-on";
    if (main.includes("drizzle") || main.includes("rain")) return "umbrella";
    if (main.includes("snow")) return "ac-unit";
    if (main.includes("cloud")) return "cloud";
    if (main.includes("mist") || main.includes("fog") || main.includes("haze")) {
      return "blur-on";
    }
    return "wb-sunny";
  }, [weather?.main]);

  const weatherMeta = useMemo(() => {
    if (!weather) return "";
    const description =
      weather.description.charAt(0).toUpperCase() + weather.description.slice(1);
    if (weather.windKmh != null) {
      return `${description} · Viento ${weather.windKmh} km/h`;
    }
    return description;
  }, [weather]);

  return (
    <Screen title="Dashboard">
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Bienvenido</Text>
          <Text style={styles.heroSubtitle}>
            Tu municipio al día, en un solo lugar.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.sectionTitleGlow]}>
            Clima actual
          </Text>
          <View style={styles.weatherCard}>
            <View style={styles.weatherIcon}>
              <MaterialIcons
                name={weatherIconName}
                size={26}
                color={colors.brandRed}
              />
            </View>
            <View style={styles.weatherInfo}>
              {weatherLoading ? (
                <View style={styles.weatherLoadingRow}>
                  <ActivityIndicator color={colors.brandPurple} size="small" />
                  <Text style={styles.weatherMeta}>Cargando clima...</Text>
                </View>
              ) : weatherError ? (
                <>
                  <Text style={styles.weatherTemp}>--</Text>
                  <Text style={styles.weatherMeta}>{weatherError}</Text>
                </>
              ) : (
                <>
                  <Text style={styles.weatherTemp}>{weather?.temp ?? "--"}°C</Text>
                  <Text style={styles.weatherMeta}>{weatherMeta}</Text>
                </>
              )}
            </View>
            <View style={styles.weatherTag}>
              <Text style={styles.weatherTagText}>
                {weather?.city || "Creixell"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.sectionTitleGlow]}>
            Accesos rápidos
          </Text>
          <View style={styles.quickRow}>
            <Pressable
              style={styles.quickCard}
              onPress={() => navigation.navigate("NewIncidentTab" as never)}
            >
              <View
                style={[
                  styles.quickIcon,
                  { backgroundColor: colors.surfaceSoft },
                ]}
              >
                <MaterialIcons
                  name="add-a-photo"
                  size={22}
                  color={colors.ink}
                />
              </View>
              <Text style={styles.quickTitle}>Nueva incidencia</Text>
              <Text style={styles.quickSubtitle}>
                Reporta con foto y ubicación
              </Text>
            </Pressable>

            <Pressable
              style={styles.quickCard}
              onPress={() => navigation.navigate("ChatAI" as never)}
            >
              <View
                style={[
                  styles.quickIcon,
                  { backgroundColor: colors.surfaceAlt },
                ]}
              >
                <MaterialIcons
                  name="chat-bubble"
                  size={22}
                  color={colors.ink}
                />
              </View>
              <Text style={styles.quickTitle}>Chat IA</Text>
              <Text style={styles.quickSubtitle}>
                Resuelve dudas al instante
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Noticias y avisos</Text>
          <View style={styles.newsList}>
            {newsItems.map((item) => (
              <Pressable
                key={item.id}
                style={styles.newsCard}
                onPress={() => navigation.navigate("NewsDetail", { item })}
              >
                <Image
                  source={item.image ?? (item.imageUrl ? { uri: item.imageUrl } : noImage)}
                  style={styles.newsImage}
                  resizeMode="cover"
                />
                <Text style={styles.newsTitle}>{item.title}</Text>
                <Text style={styles.newsSubtitle}>{item.summary}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 30,
    gap: 20,
  },
  hero: {
    paddingVertical: 6,
  },
  heroTitle: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.xl,
    color: colors.white,
  },
  heroSubtitle: {
    marginTop: 6,
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
    color: colors.white,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.md,
    color: colors.ink,
  },
  sectionTitleGlow: {
    textShadowColor: "rgba(255, 255, 255, 0.85)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  weatherCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.strokeSoft,
  },
  weatherIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
  weatherInfo: {
    flex: 1,
  },
  weatherLoadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  weatherTemp: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.lg,
    color: colors.ink,
  },
  weatherMeta: {
    marginTop: 2,
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
    color: colors.slate,
  },
  weatherTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.surfaceAlt,
  },
  weatherTagText: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.xs,
    color: colors.inkSoft,
  },
  quickRow: {
    flexDirection: "row",
    gap: 12,
  },
  quickCard: {
    flex: 1,
    padding: 16,
    borderRadius: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.strokeSoft,
  },
  quickIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  quickTitle: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.md,
    color: colors.ink,
  },
  quickSubtitle: {
    marginTop: 4,
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
    color: colors.slate,
  },
  newsList: {
    gap: 12,
  },
  newsCard: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.strokeSoft,
    gap: 10,
  },
  newsImage: {
    width: "100%",
    height: 140,
    borderRadius: 14,
    backgroundColor: colors.surfaceAlt,
  },
  newsTitle: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.md,
    color: colors.ink,
  },
  newsSubtitle: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
    color: colors.slate,
  },
});

export default DashboardScreen;
