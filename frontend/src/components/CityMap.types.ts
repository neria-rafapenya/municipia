export type CityMapCenter = {
  latitude: number;
  longitude: number;
};

export type CityMapPoint = {
  id: number;
  latitude: number;
  longitude: number;
  title: string;
  status?: string | null;
};

export type CityMapProps = {
  points: CityMapPoint[];
  onPointPress: (point: CityMapPoint) => void;
  center?: CityMapCenter | null;
};
