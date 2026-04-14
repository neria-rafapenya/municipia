export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL || "http://localhost:8080")
  .replace(/\/+$/, "");

export const MUNICIPALITY_ID = (() => {
  const raw = process.env.EXPO_PUBLIC_MUNICIPALITY_ID;
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) ? parsed : 1;
})();

export type GeoCoordinates = {
  latitude: number;
  longitude: number;
};

const parseCoordinate = (value: string | undefined) => {
  const parsed = value ? Number(value) : NaN;
  return Number.isFinite(parsed) ? parsed : null;
};

const municipalityLatitude = parseCoordinate(process.env.EXPO_PUBLIC_MUNICIPALITY_LAT);
const municipalityLongitude = parseCoordinate(process.env.EXPO_PUBLIC_MUNICIPALITY_LON);

export const MUNICIPALITY_CENTER: GeoCoordinates | null =
  municipalityLatitude != null && municipalityLongitude != null
    ? {
        latitude: municipalityLatitude,
        longitude: municipalityLongitude,
      }
    : null;
