import React, {forwardRef, useImperativeHandle} from 'react';

const ConsoleBridge = forwardRef(({}, ref) => {
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
    // Chamada direta
    LOG: logMessage,

    // Compatibilidade com o router unificado handleAction
    handleAction(payload) {
      const {action, level, message, data, ...rest} = payload;

      // Suporta tanto os dados no topo quanto dentro de params
      const logParams = {
        level: level || rest.params?.level || 'info',
        message: message || rest.params?.message || '',
        data: data !== undefined ? data : rest.params?.data,
      };

      logMessage(logParams);
    },
  }));

  return null;
});

export default ConsoleBridge;
