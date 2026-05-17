import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  DeviceEventEmitter,
  BackHandler,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { handleBridgeMessage } from '../bridges';

// Bridges
import CameraBridge from '../bridges/Camera';
import SensorBridge from '../bridges/Sensors';
import FileBridge from '../bridges/Files';
import MicrophoneBridge from '../bridges/Audio';
import LocationBridge from '../bridges/Location';
import StorageBridge from '../bridges/Storage';
import ConsoleBridge from '../bridges/Console';

import downloadUpdateCode from '../Services/Helper';

export default function WebViewScreen({ route, navigation }) {
  const { url, htmlLocal, appId } = route.params;
  const insets = useSafeAreaInsets();
  const webviewRef = useRef(null);

  // Estado para controlar se a WebView pode voltar internamente
  const [canGoBack, setCanGoBack] = useState(false);

  // Define a fonte inicial: prioriza o HTML local se existir, senão carrega a URL diretamente
  const [displaySource, setDisplaySource] = useState(() => {
    if (htmlLocal) return { html: htmlLocal, baseUrl: url };
    return { uri: url.startsWith('http') ? url : `http://${url}` };
  });

  const bridgeRefs = {
    camera: useRef(null),
    sensors: useRef(null),
    file: useRef(null),
    mic: useRef(null),
    location: useRef(null),
    storage: useRef(null),
    console: useRef(null),
  };

  // Intercepta o botão voltar nativo do Android com a assinatura correta de remoção
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (canGoBack && webviewRef.current) {
          webviewRef.current.goBack();
          return true; // Bloqueia a ação de fechar a tela
        }
        return false; // Permite voltar para a Home
      };

      // Adiciona o listener
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      // Retorna a função de limpeza padrão corrigida
      return () => {
        if (subscription && typeof subscription.remove === 'function') {
          subscription.remove();
        } else {
          BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        }
      };
    }, [canGoBack]),
  );

  useEffect(() => {
    let isMounted = true;
    const sourceCancel = axios.CancelToken.source();

    const checkAndFetchUpdate = async () => {
      // Se for um arquivo local extraído do Marketplace, não precisa validar rede externa
      if (url.startsWith('file://')) {
        setDisplaySource({ uri: url }); // Aponta direto para o arquivo local
        return;
      }

      const targetUrl =
        url.startsWith('http://') || url.startsWith('https://')
          ? url
          : `http://${url}`;

      try {
        // Validação do Axios para IPs/Servidores externos...
        await axios({
          method: 'HEAD',
          url: targetUrl,
          timeout: 3000,
          cancelToken: sourceCancel.token,
          validateStatus: () => true,
        });

        const novoHtml = await downloadUpdateCode(targetUrl);
        if (isMounted && novoHtml && novoHtml !== htmlLocal) {
          setDisplaySource({ html: novoHtml, baseUrl: targetUrl });
          DeviceEventEmitter.emit('UPDATE_APP_CACHE', {
            id: appId,
            html: novoHtml,
          });
        }
      } catch (error) {
        if (axios.isCancel(error)) return;
        console.log(`[WebView] Usando versão em cache local estável.`);
      }
    };

    checkAndFetchUpdate();
    return () => {
      isMounted = false;
      sourceCancel.cancel();
    };
  }, [url, htmlLocal, appId]);

  const sendToWebView = payload => {
    webviewRef.current?.postMessage(JSON.stringify(payload));
  };

  // Atualiza o estado de navegação interna da WebView
  const handleNavigationStateChange = navState => {
    setCanGoBack(navState.canGoBack);
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      {/* Bridges de Hardware/Nativo */}
      <CameraBridge ref={bridgeRefs.camera} sendToWebView={sendToWebView} />
      <SensorBridge ref={bridgeRefs.sensors} sendToWebView={sendToWebView} />
      <FileBridge ref={bridgeRefs.file} sendToWebView={sendToWebView} />
      <MicrophoneBridge ref={bridgeRefs.mic} sendToWebView={sendToWebView} />
      <LocationBridge ref={bridgeRefs.location} sendToWebView={sendToWebView} />
      <StorageBridge ref={bridgeRefs.storage} sendToWebView={sendToWebView} />
      <ConsoleBridge ref={bridgeRefs.console} sendToWebView={sendToWebView} />

      <View style={styles.webviewContainer}>
        <WebView
          ref={webviewRef}
          source={displaySource}
          onMessage={event =>
            handleBridgeMessage(event, bridgeRefs, sendToWebView)
          }
          onNavigationStateChange={handleNavigationStateChange}
          javaScriptEnabled
          domStorageEnabled
          allowFileAccess
          allowUniversalAccessFromFileURLs
          originWhitelist={['*']}
          mixedContentMode="always"
          style={styles.webview}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0C',
  },
  webviewContainer: {
    flex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
