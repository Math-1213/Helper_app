import React, {forwardRef, useImperativeHandle} from 'react';
import {PermissionsAndroid, Platform} from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';

const audioRecorderPlayer = new AudioRecorderPlayer();

const MicrophoneBridge = forwardRef(({sendToWebView}, ref) => {
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
    const hasPermission = await requestMicPermission();
    if (!hasPermission) {
      sendToWebView({
        callbackId,
        module: 'mic',
        type: 'ERROR',
        success: false,
        message: 'Permissão de microfone negada.',
      });
      return;
    }

    try {
      const result = await audioRecorderPlayer.startRecorder();
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
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();

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
      sendToWebView({
        callbackId,
        module: 'mic',
        type: 'ERROR',
        success: false,
        error: error.message,
      });
    }
  };

  useImperativeHandle(ref, () => ({
    handleAction,
    START_RECORDING: (params, callbackId) => startRecording(callbackId),
    STOP_RECORDING: (params, callbackId) => stopRecording(callbackId),
  }));

  return null;
});

export default MicrophoneBridge;
