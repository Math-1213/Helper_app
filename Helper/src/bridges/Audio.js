import React, { forwardRef, useImperativeHandle } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';

const audioRecorderPlayer = new AudioRecorderPlayer();

const MicrophoneBridge = forwardRef(({ sendToWebView }, ref) => {
  const requestMicPermission = async () => {
    if (Platform.OS === 'ios') return true;
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

  useImperativeHandle(ref, () => ({
    async START_RECORDING() {
      const hasPermission = await requestMicPermission();
      if (!hasPermission) {
        sendToWebView({
          module: 'mic',
          type: 'ERROR',
          message: 'Permissão de microfone negada',
        });
        return;
      }

      const result = await audioRecorderPlayer.startRecorder();
      sendToWebView({ module: 'mic', type: 'RECORDING_STARTED', uri: result });
    },

    async STOP_RECORDING() {
      const result = await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();

      // Converte o arquivo gravado para Base64
      const base64Audio = await RNFS.readFile(result, 'base64');

      sendToWebView({
        module: 'mic',
        type: 'RECORDING_STOPPED',
        // Enviamos o Data URI para o componente <audio> entender direto
        uri: `data:audio/mp4;base64,${base64Audio}`,
      });
    },
  }));

  return null;
});

export default MicrophoneBridge;
