import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useEffect,
} from 'react';
import {View, StyleSheet, Linking} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraFormat,
} from 'react-native-vision-camera';
import RNFS from 'react-native-fs';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';

const CameraBridge = forwardRef(({sendToWebView}, ref) => {
  const [position, setPosition] = useState('back'); // 'back' | 'front'
  const device = useCameraDevice(position);

  const format = useCameraFormat(device, [
    {videoResolution: {width: 640, height: 480}},
    {fps: 20},
  ]);

  const camera = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const isCapturingFrame = useRef(false);

  useEffect(() => {
    const requestCameraPermission = async () => {
      const permission = await Camera.requestCameraPermission();
      if (permission === 'denied') {
        await Linking.openSettings();
      }
    };
    requestCameraPermission();
  }, []);

  // Loop de streaming seguro para evitar acumulação de I/O em disco
  useEffect(() => {
    let interval;
    if (streaming && isActive && device) {
      interval = setInterval(async () => {
        if (isCapturingFrame.current || !camera.current) return;

        try {
          isCapturingFrame.current = true;

          const snapshot = await camera.current.takeSnapshot({
            quality: 10,
            skipMetadata: true,
          });

          const base64 = await RNFS.readFile(snapshot.path, 'base64');

          sendToWebView({
            module: 'camera',
            type: 'FRAME',
            data: `data:image/jpeg;base64,${base64}`,
          });

          if (await RNFS.exists(snapshot.path)) {
            await RNFS.unlink(snapshot.path);
          }
        } catch (err) {
          // Ignora falhas pontuais de frame para não quebrar o loop
        } finally {
          isCapturingFrame.current = false;
        }
      }, 200); // 5 FPS
    }

    return () => {
      if (interval) clearInterval(interval);
      isCapturingFrame.current = false;
    };
  }, [streaming, isActive, device]);

  const startStream = (params = {}, callbackId) => {
    if (
      params.position &&
      (params.position === 'front' || params.position === 'back')
    ) {
      setPosition(params.position);
    }
    setIsActive(true);
    setStreaming(true);

    if (callbackId) {
      sendToWebView({callbackId, success: true, message: 'Stream iniciada'});
    }
  };

  const stopStream = (params = {}, callbackId) => {
    setStreaming(false);
    setIsActive(false);

    if (callbackId) {
      sendToWebView({callbackId, success: true, message: 'Stream parada'});
    }
  };

  const takePhoto = async (params = {}, callbackId) => {
    if (!isActive || !camera.current) {
      const errorMsg = 'A câmera precisa estar ativa para capturar uma foto.';
      sendToWebView({
        callbackId,
        module: 'camera',
        type: 'ERROR',
        success: false,
        message: errorMsg,
      });
      return;
    }

    try {
      const photo = await camera.current.takePhoto({
        qualityPrioritization: 'quality',
        flash: params?.flash || 'off',
      });

      if (params?.saveToGallery !== false) {
        await CameraRoll.saveAsset(`file://${photo.path}`, {type: 'photo'});
      }

      const base64 = await RNFS.readFile(photo.path, 'base64');
      const dataUri = `data:image/jpeg;base64,${base64}`;

      sendToWebView({
        callbackId,
        module: 'camera',
        type: 'PHOTO_RESULT',
        success: true,
        data: dataUri,
      });

      if (await RNFS.exists(photo.path)) {
        await RNFS.unlink(photo.path);
      }
    } catch (err) {
      console.error('[CameraBridge] Erro ao tirar foto:', err);
      sendToWebView({
        callbackId,
        module: 'camera',
        type: 'ERROR',
        success: false,
        error: err.message,
      });
    }
  };

  // Suporte duplo a chamadas diretas ou via handleAction
  const handleAction = async payload => {
    const {action, callbackId, ...params} = payload;

    switch (action) {
      case 'START_STREAM':
        startStream(params, callbackId);
        break;
      case 'STOP_STREAM':
        stopStream(params, callbackId);
        break;
      case 'TAKE_PHOTO':
        await takePhoto(params, callbackId);
        break;
      case 'SWITCH_CAMERA':
        setPosition(prev => (prev === 'back' ? 'front' : 'back'));
        if (callbackId) sendToWebView({callbackId, success: true, position});
        break;
      default:
        if (callbackId) {
          sendToWebView({
            callbackId,
            success: false,
            error: `Ação '${action}' não reconhecida na câmera.`,
          });
        }
        break;
    }
  };

  useImperativeHandle(ref, () => ({
    handleAction,
    START_STREAM: (params, callbackId) => startStream(params, callbackId),
    STOP_STREAM: (params, callbackId) => stopStream(params, callbackId),
    TAKE_PHOTO: (params, callbackId) => takePhoto(params, callbackId),
  }));

  if (!device) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isActive}
        format={format}
        photo={true}
        video={true}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: -1000,
    width: 640,
    height: 480,
    zIndex: -1,
    opacity: 0,
  },
});

export default CameraBridge;
