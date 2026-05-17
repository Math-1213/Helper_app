import React, { forwardRef, useImperativeHandle } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const StorageBridge = forwardRef(({ sendToWebView }, ref) => {
  
  useImperativeHandle(ref, () => ({
    // Salva um dado (Chave, Valor)
    async STORAGE_SAVE(params) {
      try {
        const { key, value } = params;
        // Convertemos para string caso venha um objeto/array
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        await AsyncStorage.setItem(key, stringValue);
        
        sendToWebView({ module: 'storage', type: 'SAVE_SUCCESS', key });
      } catch (err) {
        sendToWebView({ module: 'storage', type: 'ERROR', message: err.message });
      }
    },

    // Recupera um dado pela chave
    async STORAGE_GET(params) {
      try {
        const { key } = params;
        const value = await AsyncStorage.getItem(key);
        
        sendToWebView({ 
          module: 'storage', 
          type: 'STORAGE_DATA', 
          key, 
          value: value // A WebView deve dar JSON.parse se necessário
        });
      } catch (err) {
        sendToWebView({ module: 'storage', type: 'ERROR', message: err.message });
      }
    },

    // Remove uma chave específica
    async STORAGE_REMOVE(params) {
      try {
        await AsyncStorage.removeItem(params.key);
        sendToWebView({ module: 'storage', type: 'REMOVE_SUCCESS', key: params.key });
      } catch (err) {
        sendToWebView({ module: 'storage', type: 'ERROR', message: err.message });
      }
    },

    // Limpa TUDO o que foi salvo pelo app
    async STORAGE_CLEAR() {
      try {
        await AsyncStorage.clear();
        sendToWebView({ module: 'storage', type: 'CLEAR_SUCCESS' });
      } catch (err) {
        sendToWebView({ module: 'storage', type: 'ERROR', message: err.message });
      }
    }
  }));

  return null;
});

export default StorageBridge;