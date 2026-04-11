import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AlertsStackParamList = {
  AlertsHome: undefined;
  AlertDetail: { id: string } | undefined;
};

export type NewIncidentStackParamList = {
  NewIncidentHome: undefined;
  IncidentPreview: undefined;
  IncidentDetail: { id: string } | undefined;
};

export type MapStackParamList = {
  CityMapHome: undefined;
  PointDetail: { id: string } | undefined;
};

export type DrawerStackParamList = {
  Dashboard: undefined;
  ReportHistory: undefined;
  Profile: undefined;
  Settings: undefined;
};

export type MainTabParamList = {
  AlertsTab: NavigatorScreenParams<AlertsStackParamList>;
  NewIncidentTab: NavigatorScreenParams<NewIncidentStackParamList>;
  MapTab: NavigatorScreenParams<MapStackParamList>;
  DrawerTab: NavigatorScreenParams<DrawerStackParamList>;
};

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};
