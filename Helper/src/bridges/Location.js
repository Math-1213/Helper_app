import React, {forwardRef, useImperativeHandle} from 'react';
import {PermissionsAndroid, Platform} from 'react-native';
import Geolocation from 'react-native-geolocation-service';

const LocationBridge = forwardRef(({sendToWebView}, ref) => {
  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      const auth = await Geolocation.requestAuthorization('whenInUse');
      return auth === 'granted';
    }

    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Permissão de Localização',
            message: 'O aplicativo precisa de acesso à sua localização.',
            buttonPositive: 'OK',
            buttonNegative: 'Cancelar',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        return false;
      }
    }

    return false;
  };

  const getCurrentLocation = async (params = {}, callbackId) => {
    const hasPermission = await requestLocationPermission();

    if (!hasPermission) {
      sendToWebView({
        callbackId,
        module: 'location',
        type: 'ERROR',
        success: false,
        message: 'Permissão de localização negada',
      });
      return;
    }

    const {
      enableHighAccuracy = true,
      timeout = 15000,
      maximumAge = 10000,
    } = params;

    Geolocation.getCurrentPosition(
      position => {
        sendToWebView({
          callbackId,
          module: 'location',
          type: 'LOCATION_DATA',
          success: true,
          data: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: position.timestamp,
          },
        });
      },
      error => {
        sendToWebView({
          callbackId,
          module: 'location',
          type: 'ERROR',
          success: false,
          message: error.message || 'Erro ao obter localização',
          code: error.code,
        });
      },
      {
        enableHighAccuracy,
        timeout,
        maximumAge,
        forceRequestLocation: true,
        showLocationDialog: true,
      },
    );
  };

  const handleAction = async payload => {
    const {action, callbackId, ...params} = payload;

    switch (action) {
      case 'GET_CURRENT_LOCATION':
        await getCurrentLocation(params, callbackId);
        break;
      default:
        if (callbackId) {
          sendToWebView({
            callbackId,
            module: 'location',
            type: 'ERROR',
            success: false,
            message: `Ação '${action}' não encontrada no LocationBridge.`,
          });
        }
        break;
    }
  };

  useImperativeHandle(ref, () => ({
    handleAction,
    GET_CURRENT_LOCATION: (params, callbackId) =>
      getCurrentLocation(params, callbackId),
  }));

  return null;
});

export default LocationBridge;
