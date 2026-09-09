import React, {forwardRef, useImperativeHandle, useRef, useEffect} from 'react';
import {
  accelerometer,
  gyroscope,
  setUpdateIntervalForType,
  SensorTypes,
} from 'react-native-sensors';

const SensorBridge = forwardRef(({sendToWebView}, ref) => {
  const subscriptions = useRef({
    accelerometer: null,
    gyroscope: null,
  });

  const stopAllSensors = () => {
    Object.keys(subscriptions.current).forEach(key => {
      if (subscriptions.current[key]) {
        subscriptions.current[key].unsubscribe();
        subscriptions.current[key] = null;
      }
    });
  };

  useEffect(() => {
    return () => {
      stopAllSensors();
    };
  }, []);

  const startAccelerometer = (params = {}, callbackId) => {
    subscriptions.current.accelerometer?.unsubscribe();

    const interval = params?.interval || 100;
    setUpdateIntervalForType(SensorTypes.accelerometer, interval);

    subscriptions.current.accelerometer = accelerometer.subscribe({
      next: ({x, y, z, timestamp}) => {
        sendToWebView({
          callbackId,
          module: 'sensors',
          type: 'ACCELEROMETER_DATA',
          success: true,
          data: {
            x: parseFloat(x.toFixed(2)),
            y: parseFloat(y.toFixed(2)),
            z: parseFloat(z.toFixed(2)),
            timestamp,
          },
        });
      },
      error: error => {
        sendToWebView({
          callbackId,
          module: 'sensors',
          type: 'ERROR',
          success: false,
          message: error?.message || 'Acelerômetro indisponível no dispositivo',
        });
        stopAccelerometer();
      },
    });
  };

  const stopAccelerometer = callbackId => {
    if (subscriptions.current.accelerometer) {
      subscriptions.current.accelerometer.unsubscribe();
      subscriptions.current.accelerometer = null;
    }
    if (callbackId) {
      sendToWebView({
        callbackId,
        module: 'sensors',
        type: 'SENSOR_STOPPED',
        sensor: 'accelerometer',
        success: true,
      });
    }
  };

  const startGyroscope = (params = {}, callbackId) => {
    subscriptions.current.gyroscope?.unsubscribe();

    const interval = params?.interval || 100;
    setUpdateIntervalForType(SensorTypes.gyroscope, interval);

    subscriptions.current.gyroscope = gyroscope.subscribe({
      next: ({x, y, z, timestamp}) => {
        sendToWebView({
          callbackId,
          module: 'sensors',
          type: 'GYROSCOPE_DATA',
          success: true,
          data: {
            x: parseFloat(x.toFixed(2)),
            y: parseFloat(y.toFixed(2)),
            z: parseFloat(z.toFixed(2)),
            timestamp,
          },
        });
      },
      error: error => {
        sendToWebView({
          callbackId,
          module: 'sensors',
          type: 'ERROR',
          success: false,
          message: error?.message || 'Giroscópio indisponível no dispositivo',
        });
        stopGyroscope();
      },
    });
  };

  const stopGyroscope = callbackId => {
    if (subscriptions.current.gyroscope) {
      subscriptions.current.gyroscope.unsubscribe();
      subscriptions.current.gyroscope = null;
    }
    if (callbackId) {
      sendToWebView({
        callbackId,
        module: 'sensors',
        type: 'SENSOR_STOPPED',
        sensor: 'gyroscope',
        success: true,
      });
    }
  };

  const handleAction = async payload => {
    const {action, callbackId, ...params} = payload;

    switch (action) {
      case 'START_ACCELEROMETER':
        startAccelerometer(params, callbackId);
        break;
      case 'STOP_ACCELEROMETER':
        stopAccelerometer(callbackId);
        break;
      case 'START_GYROSCOPE':
        startGyroscope(params, callbackId);
        break;
      case 'STOP_GYROSCOPE':
        stopGyroscope(callbackId);
        break;
      default:
        if (callbackId) {
          sendToWebView({
            callbackId,
            module: 'sensors',
            type: 'ERROR',
            success: false,
            message: `Ação '${action}' não encontrada no SensorBridge.`,
          });
        }
        break;
    }
  };

  useImperativeHandle(ref, () => ({
    handleAction,
    START_ACCELEROMETER: (params, callbackId) =>
      startAccelerometer(params, callbackId),
    STOP_ACCELEROMETER: callbackId => stopAccelerometer(callbackId),
    START_GYROSCOPE: (params, callbackId) => startGyroscope(params, callbackId),
    STOP_GYROSCOPE: callbackId => stopGyroscope(callbackId),
  }));

  return null;
});

export default SensorBridge;
