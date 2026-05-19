import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useEffect,
} from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Camera, CameraApi } from 'react-native-camera-kit';
import RNFS from 'react-native-fs';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';

const CameraBridge = forwardRef(({ sendToWebView }, ref) => {
  const camera = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [streaming, setStreaming] = useState(false);

  // Loop de streaming simulado via Snapshot
  useEffect(() => {
    let interval;
    if (streaming && isActive) {
      interval = setInterval(async () => {
        try {
          if (camera.current) {
            // Captura uma imagem rápida do preview com qualidade reduzida
            const snapshot = await camera.current.capture({});
            
            // O CameraKit retorna o caminho em 'uri'
            const base64 = await RNFS.readFile(snapshot.uri, 'base64');
            
            sendToWebView({
              module: 'camera',
              type: 'FRAME',
              data: `data:image/jpeg;base64,${base64}`,
            });

            // Limpa o arquivo gerado temporariamente
            await RNFS.unlink(snapshot.uri);
          }
        } catch (err) {
          // Ignora falhas pontuais no loop de frames
        }
      }, 200); // 5 FPS seguro para a bridge
    }
    return () => clearInterval(interval);
  }, [streaming, isActive]);

  useImperativeHandle(ref, () => ({
    START_STREAM() {
      console.log('CameraBridge', 'START_STREAM');
      setIsActive(true);
      setStreaming(true);
    },
    STOP_STREAM() {
      console.log('CameraBridge', 'STOP_STREAM');
      setStreaming(false);
      setIsActive(false);
    },
    async TAKE_PHOTO(params) {
      console.log('CameraBridge', 'TAKE_PHOTO', params);
      
      if (!isActive || !camera.current) {
        sendToWebView({
          module: 'camera',
          type: 'ERROR',
          message: 'A stream precisa estar ativa para capturar uma foto.',
        });
        return;
      }

      try {
        // Tira a foto em alta qualidade
        const photo = await camera.current.capture({});

        if (params?.saveToGallery !== false) {
          await CameraRoll.saveAsset(photo.uri, { type: 'photo' });
          console.log('PHOTO PATH ON GALLERY', photo.uri);
        }

        const base64 = await RNFS.readFile(photo.uri, 'base64');
        sendToWebView({
          module: 'camera',
          type: 'PHOTO_RESULT',
          data: `data:image/jpeg;base64,${base64}`,
        });

        await RNFS.unlink(photo.uri);
      } catch (err) {
        console.error('Erro ao tirar foto:', err);
      }
    },
  }));

  // Se a câmera não estiver ativa, não renderiza para poupar recursos
  if (!isActive) return null;

  return (
    <View style={styles.container}>
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        cameraType="back"
        flashMode={ "auto" }
        resetFocusTimeout={0}
        resetFocusWhenMotionDetected={false}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: -1000, // Mantém escondido fora da tela conforme seu design original
    width: 640,
    height: 480,
    zIndex: -1,
  },
});

export default CameraBridge;