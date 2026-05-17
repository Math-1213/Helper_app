import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
} from 'react';
import {
  accelerometer,
  gyroscope,
  setUpdateIntervalForType,
  SensorTypes,
} from 'react-native-sensors';

const SensorBridge = forwardRef(({ sendToWebView }, ref) => {
  const subscriptions = useRef({
    accelerometer: null,
    gyroscope: null,
  });

  useEffect(() => {
    return () => {
      stopAllSensors();
    };
  }, []);

  const stopAllSensors = () => {
    Object.keys(subscriptions.current).forEach(key => {
      subscriptions.current[key]?.unsubscribe();
      subscriptions.current[key] = null;
    });
  };

  useImperativeHandle(ref, () => ({
    START_ACCELEROMETER(params) {
      // Limpa antes de iniciar para evitar duplicidade
      subscriptions.current.accelerometer?.unsubscribe();

      const interval = params?.interval || 100;
      setUpdateIntervalForType(SensorTypes.accelerometer, interval);

      subscriptions.current.accelerometer = accelerometer.subscribe(
        ({ x, y, z }) => {
          sendToWebView({
            module: 'sensors',
            type: 'ACCELEROMETER_DATA',
            data: {
              x: parseFloat(x.toFixed(2)),
              y: parseFloat(y.toFixed(2)),
              z: parseFloat(z.toFixed(2)),
            },
          });
        },
      );
      console.log('Módulo Sensors: Acelerômetro ativado');
    },

    STOP_ACCELEROMETER() {
      subscriptions.current.accelerometer?.unsubscribe();
      subscriptions.current.accelerometer = null;
      console.log('Módulo Sensors: Acelerômetro parado');
    },

    START_GYROSCOPE(params) {
      subscriptions.current.gyroscope?.unsubscribe();

      const interval = params?.interval || 100;
      setUpdateIntervalForType(SensorTypes.gyroscope, interval);

      subscriptions.current.gyroscope = gyroscope.subscribe(({ x, y, z }) => {
        sendToWebView({
          module: 'sensors',
          type: 'GYROSCOPE_DATA',
          data: {
            x: parseFloat(x.toFixed(2)),
            y: parseFloat(y.toFixed(2)),
            z: parseFloat(z.toFixed(2)),
          },
        });
      });
      console.log('Módulo Sensors: Giroscópio ativado');
    },

    STOP_GYROSCOPE() {
      subscriptions.current.gyroscope?.unsubscribe();
      subscriptions.current.gyroscope = null;
      console.log('Módulo Sensors: Giroscópio parado');
    },
  }));

  return null;
});

export default SensorBridge;
