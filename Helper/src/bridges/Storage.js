import React, {forwardRef, useImperativeHandle} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const StorageBridge = forwardRef(({sendToWebView}, ref) => {
  // Sanitiza o appId e a key para impedir injeção de delimitadores ou traversal
  const sanitize = str => String(str || '').replace(/[^a-zA-Z0-9_-]/g, '_');

  const getScopedKey = (key, rawAppId) => {
    if (!rawAppId) {
      throw new Error(
        'Identificador do aplicativo (appId) não foi fornecido no contexto.',
      );
    }
    const safeAppId = sanitize(rawAppId);
    const safeKey = String(key).replace(/[^a-zA-Z0-9_\.-]/g, '_');
    return `@app_${safeAppId}:${safeKey}`;
  };

  const saveItem = async ({key, value}, callbackId, context) => {
    try {
      if (!key) throw new Error('O parâmetro "key" é obrigatório.');

      const scopedKey = getScopedKey(key, context?.appId);
      await AsyncStorage.setItem(scopedKey, JSON.stringify(value));

      sendToWebView({
        callbackId,
        module: 'storage',
        type: 'SAVE_SUCCESS',
        success: true,
        key,
      });
    } catch (err) {
      sendToWebView({
        callbackId,
        module: 'storage',
        type: 'ERROR',
        success: false,
        error: err.message,
      });
    }
  };

  const getItem = async ({key}, callbackId, context) => {
    try {
      if (!key) throw new Error('O parâmetro "key" é obrigatório.');

      const scopedKey = getScopedKey(key, context?.appId);
      const rawValue = await AsyncStorage.getItem(scopedKey);

      let parsedValue = null;
      if (rawValue !== null) {
        try {
          parsedValue = JSON.parse(rawValue);
        } catch {
          parsedValue = rawValue;
        }
      }

      sendToWebView({
        callbackId,
        module: 'storage',
        type: 'STORAGE_DATA',
        success: true,
        key,
        value: parsedValue,
      });
    } catch (err) {
      sendToWebView({
        callbackId,
        module: 'storage',
        type: 'ERROR',
        success: false,
        error: err.message,
      });
    }
  };

  const removeItem = async ({key}, callbackId, context) => {
    try {
      if (!key) throw new Error('O parâmetro "key" é obrigatório.');

      const scopedKey = getScopedKey(key, context?.appId);
      await AsyncStorage.removeItem(scopedKey);

      sendToWebView({
        callbackId,
        module: 'storage',
        type: 'REMOVE_SUCCESS',
        success: true,
        key,
      });
    } catch (err) {
      sendToWebView({
        callbackId,
        module: 'storage',
        type: 'ERROR',
        success: false,
        error: err.message,
      });
    }
  };

  const clearStorage = async (callbackId, context) => {
    try {
      if (!context?.appId) {
        throw new Error(
          'Identificador do aplicativo (appId) não foi fornecido.',
        );
      }

      const safeAppId = sanitize(context.appId);
      const prefix = `@app_${safeAppId}:`;

      const allKeys = await AsyncStorage.getAllKeys();
      const appKeys = allKeys.filter(k => k.startsWith(prefix));

      if (appKeys.length > 0) {
        await AsyncStorage.multiRemove(appKeys);
      }

      sendToWebView({
        callbackId,
        module: 'storage',
        type: 'CLEAR_SUCCESS',
        success: true,
      });
    } catch (err) {
      sendToWebView({
        callbackId,
        module: 'storage',
        type: 'ERROR',
        success: false,
        error: err.message,
      });
    }
  };

  const handleAction = async (payload, context) => {
    const {action, callbackId, ...params} = payload;

    switch (action) {
      case 'STORAGE_SAVE':
        await saveItem(params, callbackId, context);
        break;
      case 'STORAGE_GET':
        await getItem(params, callbackId, context);
        break;
      case 'STORAGE_REMOVE':
        await removeItem(params, callbackId, context);
        break;
      case 'STORAGE_CLEAR':
        await clearStorage(callbackId, context);
        break;
      default:
        if (callbackId) {
          sendToWebView({
            callbackId,
            module: 'storage',
            type: 'ERROR',
            success: false,
            error: `Ação '${action}' não reconhecida no StorageBridge.`,
          });
        }
        break;
    }
  };

  useImperativeHandle(ref, () => ({
    handleAction,
  }));

  return null;
});

export default StorageBridge;
