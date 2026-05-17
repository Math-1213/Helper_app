import React, { forwardRef, useImperativeHandle } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from 'react-native-geolocation-service';

const LocationBridge = forwardRef(({ sendToWebView }, ref) => {
  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') return true;
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

  useImperativeHandle(ref, () => ({
    async GET_CURRENT_LOCATION() {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        sendToWebView({ module: 'location', type: 'ERROR', message: 'Permissão negada' });
        return;
      }

      Geolocation.getCurrentPosition(
        (position) => {
          sendToWebView({
            module: 'location',
            type: 'LOCATION_DATA',
            data: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
            },
          });
        },
        (error) => {
          sendToWebView({ module: 'location', type: 'ERROR', message: error.message });
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    },
  }));

  return null;
});

export default LocationBridge;