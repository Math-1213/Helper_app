import React, { forwardRef, useImperativeHandle } from 'react';

const ConsoleBridge = forwardRef(({}, ref) => {
  useImperativeHandle(ref, () => ({
    // Recebe o log da WebView e printa no terminal do Node (React Native)
    LOG(params) {
      const { level, message, data } = params;
      const timestamp = new Date().toLocaleTimeString();
      const prefix = `[WebView-${level.toUpperCase()}] [${timestamp}]:`;

      if (level === 'error') {
        console.error(prefix, message, data || '');
      } else if (level === 'warn') {
        console.warn(prefix, message, data || '');
      } else {
        console.log(prefix, message, data || '');
      }
    }
  }));

  return null;
});

export default ConsoleBridge;