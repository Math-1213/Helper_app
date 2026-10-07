import React, {useRef, useState, useEffect, useCallback} from 'react';
import {DeviceEventEmitter, BackHandler, StatusBar} from 'react-native';
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

import {
  Container,
  TopBar,
  IconButton,
  TopBarTitle,
  WebViewContainer,
} from './styles';

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

      return () => subscription.remove();
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

      const targetUrl = url.startsWith('http') ? url : `http://${url}`;

      try {
        await axios.head(targetUrl, {
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
    handleBridgeMessage(event, bridgeRefs, sendToWebView, {appId});
  };

  return (
    <Container>
      <StatusBar barStyle="light-content" backgroundColor="#121216" />

      <TopBar style={{paddingTop: insets.top}}>
        <IconButton
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
          onPress={() => {
            if (canGoBack && webviewRef.current) {
              webviewRef.current.goBack();
            } else {
              navigation.goBack();
            }
          }}>
          <Icon name="arrow-back" size={18} color="#EDEDF2" />
        </IconButton>

        <TopBarTitle numberOfLines={1}>{appId || url}</TopBarTitle>

        <IconButton
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
          onPress={() => navigation.goBack()}>
          <Icon name="close" size={18} color="#8C8C9E" />
        </IconButton>
      </TopBar>

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

      <WebViewContainer style={{paddingBottom: insets.bottom}}>
        <WebView
          ref={webviewRef}
          source={displaySource}
          onMessage={handleMessage}
          onNavigationStateChange={navState => setCanGoBack(navState.canGoBack)}
          javaScriptEnabled
          domStorageEnabled
          allowFileAccess
          allowUniversalAccessFromFileURLs={false}
          allowFileAccessFromFileURLs={false}
          originWhitelist={['http://*', 'https://*', 'file://*']}
          mixedContentMode="compatibility"
          style={{flex: 1, backgroundColor: 'transparent'}}
        />
      </WebViewContainer>
    </Container>
  );
}
