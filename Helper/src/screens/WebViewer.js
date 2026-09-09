import React, {useRef, useState, useEffect, useCallback} from 'react';
import {
  View,
  StyleSheet,
  DeviceEventEmitter,
  BackHandler,
  TouchableOpacity,
  Text,
} from 'react-native';
import {WebView} from 'react-native-webview';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import {handleBridgeMessage} from '../bridges';

// Bridges
import CameraBridge from '../bridges/Camera';
import SensorBridge from '../bridges/Sensors';
import FileBridge from '../bridges/Files';
import MicrophoneBridge from '../bridges/Audio';
import LocationBridge from '../bridges/Location';
import StorageBridge from '../bridges/Storage';
import ConsoleBridge from '../bridges/Console';

import downloadUpdateCode from '../Services/Helper';

export default function WebViewScreen({route, navigation}) {
  const {url, htmlLocal, appId} = route.params;
  const insets = useSafeAreaInsets();
  const webviewRef = useRef(null);

  const [canGoBack, setCanGoBack] = useState(false);

  const [displaySource, setDisplaySource] = useState(() => {
    if (htmlLocal) return {html: htmlLocal, baseUrl: url};
    return {uri: url.startsWith('http') ? url : `http://${url}`};
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

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (canGoBack && webviewRef.current) {
          webviewRef.current.goBack();
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

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
      if (url.startsWith('file://')) {
        setDisplaySource({uri: url});
        return;
      }

      const targetUrl =
        url.startsWith('http://') || url.startsWith('https://')
          ? url
          : `http://${url}`;

      try {
        await axios({
          method: 'HEAD',
          url: targetUrl,
          timeout: 3000,
          cancelToken: sourceCancel.token,
          validateStatus: () => true,
        });

        const novoHtml = await downloadUpdateCode(targetUrl);
        if (isMounted && novoHtml && novoHtml !== htmlLocal) {
          setDisplaySource({html: novoHtml, baseUrl: targetUrl});
          DeviceEventEmitter.emit('UPDATE_APP_CACHE', {
            id: appId,
            html: novoHtml,
          });
        }
      } catch (error) {
        if (axios.isCancel(error)) return;
        console.log('[WebView] Usando versão em cache local estável.');
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

  const handleMessage = event => {
    // Passa o appId no contexto da bridge para isolamento no Storage
    handleBridgeMessage(event, bridgeRefs, sendToWebView, {appId});
  };

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      {/* Mini Topbar de Navegação */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (canGoBack && webviewRef.current) {
              webviewRef.current.goBack();
            } else {
              navigation.goBack();
            }
          }}>
          <Icon name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle} numberOfLines={1}>
          {url}
        </Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}>
          <Icon name="close" size={20} color="#707080" />
        </TouchableOpacity>
      </View>

      {/* Bridges com a Prop do AppId injetada */}
      <CameraBridge ref={bridgeRefs.camera} sendToWebView={sendToWebView} />
      <SensorBridge ref={bridgeRefs.sensors} sendToWebView={sendToWebView} />
      <FileBridge ref={bridgeRefs.file} sendToWebView={sendToWebView} />
      <MicrophoneBridge ref={bridgeRefs.mic} sendToWebView={sendToWebView} />
      <LocationBridge ref={bridgeRefs.location} sendToWebView={sendToWebView} />
      <StorageBridge
        ref={bridgeRefs.storage}
        sendToWebView={sendToWebView}
        appId={appId}
      />
      <ConsoleBridge ref={bridgeRefs.console} sendToWebView={sendToWebView} />

      <View style={[styles.webviewContainer, {paddingBottom: insets.bottom}]}>
        <WebView
          ref={webviewRef}
          source={displaySource}
          onMessage={handleMessage}
          onNavigationStateChange={navState => setCanGoBack(navState.canGoBack)}
          javaScriptEnabled
          domStorageEnabled
          allowFileAccess
          // Trava de segurança: impede que arquivos locais acessem outros file:// arbitrários
          allowUniversalAccessFromFileURLs={false}
          allowFileAccessFromFileURLs={false}
          // Restringe esquemas aceitos
          originWhitelist={['http://*', 'https://*', 'file://*']}
          mixedContentMode="compatibility"
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
  topBar: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A22',
  },
  backButton: {
    padding: 8,
  },
  closeButton: {
    padding: 8,
  },
  topBarTitle: {
    color: '#6E6E80',
    fontSize: 12,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  webviewContainer: {
    flex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
