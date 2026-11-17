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
        error: 'Permissão de localização negada.',
      });
      return;
    }

    const {
      enableHighAccuracy = true,
      timeout = 15000,
      maximumAge = 10000,
    } = params;

    try {
      // getCurrentPosition é baseado em callback, não em Promise — embrulhar
      // aqui garante que erros (inclusive de dentro do callback de erro do
      // próprio módulo nativo) caiam num único caminho de tratamento, em vez
      // de ficarem soltos fora da cadeia de await/try-catch, sem nenhuma
      // rede de segurança pra reportar de volta à WebView.
      const position = await new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy,
          timeout,
          maximumAge,
          forceRequestLocation: true,
          showLocationDialog: true,
        });
      });

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
    } catch (error) {
      sendToWebView({
        callbackId,
        module: 'location',
        type: 'ERROR',
        success: false,
        error: error?.message || 'Erro ao obter localização',
        code: error?.code,
      });
    }
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
            error: `Ação '${action}' não encontrada no LocationBridge.`,
          });
        }
        break;
    }
  };

  useImperativeHandle(ref, () => ({
    handleAction,
  }));

  return null;
});

export default LocationBridge;
