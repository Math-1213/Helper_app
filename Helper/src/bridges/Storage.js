import React, {forwardRef, useImperativeHandle} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const StorageBridge = forwardRef(({sendToWebView}, ref) => {
  // Constrói a chave isolada por app (ex: "@finco:user_theme")
  const getScopedKey = (key, appId = 'global') => `@${appId}:${key}`;

  const saveItem = async ({key, value}, callbackId, context) => {
    try {
      if (!key) throw new Error('O parâmetro "key" é obrigatório.');

      const scopedKey = getScopedKey(key, context?.appId);

      // Serializa sempre, mesmo para strings. Antes, uma string que
      // parecesse JSON (ex: "123", "true") era gravada crua e, ao ser lida
      // de volta em getItem, virava número/boolean por engano — o
      // round-trip save/get não preservava o tipo original.
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
          // Dado gravado antes dessa correção (string crua, não-JSON) —
          // mantém compatibilidade com o que já estiver salvo.
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
      const appId = context?.appId || 'global';
      const prefix = `@${appId}:`;

      // Busca todas as chaves gravadas no AsyncStorage
      const allKeys = await AsyncStorage.getAllKeys();

      // Filtra apenas as chaves do módulo atual
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
