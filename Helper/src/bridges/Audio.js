import React, {forwardRef, useImperativeHandle, useEffect, useRef} from 'react';
import {PermissionsAndroid, Platform} from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';

const audioRecorderPlayer = new AudioRecorderPlayer();

const MicrophoneBridge = forwardRef(({sendToWebView}, ref) => {
  // Evita START/STOP duplicados — dois toques rápidos no módulo web, ou uma
  // segunda chamada chegando antes da primeira terminar.
  const isRecordingRef = useRef(false);

  const requestMicPermission = async () => {
    if (Platform.OS === 'ios') return true;

    try {
      const grants = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      ]);

      return (
        grants[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] ===
        PermissionsAndroid.RESULTS.GRANTED
      );
    } catch (err) {
      console.warn('[MicrophoneBridge] Erro ao solicitar permissões:', err);
      return false;
    }
  };

  const handleAction = async payload => {
    const {action, callbackId} = payload;

    switch (action) {
      case 'START_RECORDING':
        await startRecording(callbackId);
        break;

      case 'STOP_RECORDING':
        await stopRecording(callbackId);
        break;

      default:
        if (callbackId) {
          sendToWebView({
            callbackId,
            success: false,
            error: `Ação '${action}' desconhecida no MicrophoneBridge.`,
          });
        }
        break;
    }
  };

  const startRecording = async callbackId => {
    if (isRecordingRef.current) {
      sendToWebView({
        callbackId,
        module: 'mic',
        type: 'ERROR',
        success: false,
        error: 'Já existe uma gravação em andamento.',
      });
      return;
    }

    const hasPermission = await requestMicPermission();
    if (!hasPermission) {
      sendToWebView({
        callbackId,
        module: 'mic',
        type: 'ERROR',
        success: false,
        error: 'Permissão de microfone negada.',
      });
      return;
    }

    try {
      const result = await audioRecorderPlayer.startRecorder();
      isRecordingRef.current = true;
      sendToWebView({
        callbackId,
        module: 'mic',
        type: 'RECORDING_STARTED',
        success: true,
        uri: result,
      });
    } catch (error) {
      sendToWebView({
        callbackId,
        module: 'mic',
        type: 'ERROR',
        success: false,
        error: error.message,
      });
    }
  };

  const stopRecording = async callbackId => {
    if (!isRecordingRef.current) {
      sendToWebView({
        callbackId,
        module: 'mic',
        type: 'ERROR',
        success: false,
        error: 'Nenhuma gravação em andamento.',
      });
      return;
    }

    try {
      const result = await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();
      isRecordingRef.current = false;

      // Sanitiza caminho do arquivo para o RNFS (remove o prefixo file:// caso esteja presente)
      const cleanPath = result.replace('file://', '');
      const base64Audio = await RNFS.readFile(cleanPath, 'base64');

      // Extensão/MimeType dinâmico
      const mimeType = Platform.OS === 'ios' ? 'audio/m4a' : 'audio/mp4';
      const dataUri = `data:${mimeType};base64,${base64Audio}`;

      sendToWebView({
        callbackId,
        module: 'mic',
        type: 'RECORDING_STOPPED',
        success: true,
        uri: dataUri,
      });
    } catch (error) {
      isRecordingRef.current = false;
      sendToWebView({
        callbackId,
        module: 'mic',
        type: 'ERROR',
        success: false,
        error: error.message,
      });
    }
  };

  // Se a WebView fechar (navegação de volta, troca de módulo) com uma
  // gravação ativa, encerra o recorder em vez de deixar o microfone "vivo"
  // em segundo plano depois que o usuário já saiu da tela.
  useEffect(() => {
    return () => {
      if (isRecordingRef.current) {
        audioRecorderPlayer.stopRecorder().catch(() => {});
        audioRecorderPlayer.removeRecordBackListener();
      }
    };
  }, []);

  useImperativeHandle(ref, () => ({
    handleAction,
  }));

  return null;
});

export default MicrophoneBridge;
