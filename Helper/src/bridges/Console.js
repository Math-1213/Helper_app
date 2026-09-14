import React, {forwardRef, useImperativeHandle} from 'react';

const ConsoleBridge = forwardRef(({sendToWebView}, ref) => {
  const logMessage = (params = {}) => {
    const level = (params.level || 'info').toLowerCase();
    const message = params.message || '';
    const rawData = params.data;

    const timestamp = new Date().toLocaleTimeString();
    const prefix = `[WebView-${level.toUpperCase()}] [${timestamp}]:`;

    // Formata o 'data' para garantir legibilidade de objetos no Metro
    let formattedData = '';
    if (rawData !== undefined && rawData !== null) {
      formattedData =
        typeof rawData === 'object'
          ? JSON.stringify(rawData, null, 2)
          : rawData;
    }

    switch (level) {
      case 'error':
        console.error(prefix, message, formattedData);
        break;
      case 'warn':
        console.warn(prefix, message, formattedData);
        break;
      case 'info':
      case 'log':
      default:
        console.log(prefix, message, formattedData);
        break;
    }
  };

  useImperativeHandle(ref, () => ({
    handleAction(payload) {
      const {action, callbackId, level, message, data} = payload;

      if (action && action !== 'LOG') {
        if (callbackId) {
          sendToWebView({
            callbackId,
            success: false,
            error: `Ação '${action}' não reconhecida no ConsoleBridge.`,
          });
        }
        return;
      }

      logMessage({level, message, data});

      // Logar é fire-and-forget por natureza, mas se um callbackId foi
      // enviado, o lado da WebView pode estar esperando uma resposta —
      // sem isso, uma chamada baseada em Promise ficaria pendurada pra
      // sempre (mesma classe de bug corrigida no dispatcher central).
      if (callbackId) {
        sendToWebView({callbackId, success: true});
      }
    },
  }));

  return null;
});

export default ConsoleBridge;
