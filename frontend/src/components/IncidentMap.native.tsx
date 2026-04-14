import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { colors } from '../theme/colors';

type Props = {
  latitude: number;
  longitude: number;
};

const IncidentMap = ({ latitude, longitude }: Props) => {
  const region = {
    latitude,
    longitude,
    latitudeDelta: 0.004,
    longitudeDelta: 0.004,
  };

  return (
    <View style={styles.frame}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        scrollEnabled={false}
        zoomEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}
        showsMyLocationButton={false}
      >
        <Marker coordinate={{ latitude, longitude }} />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  frame: {
    marginTop: 10,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.divider,
    backgroundColor: colors.surfaceAlt,
  },
  map: {
    width: '100%',
    height: 200,
  },
});

export default IncidentMap;
