export const handleBridgeMessage = (event, refs, sendToWebView) => {
  try {
    const { module, action, params } = JSON.parse(event.nativeEvent.data);

    const modules = {
      camera: refs.camera?.current,
      sensors: refs.sensors?.current,
      location: refs.location?.current,
      file: refs.file?.current,
      mic: refs.mic?.current,
      storage: refs.storage?.current,
      console: refs.console?.current
    };

    const targetModule = modules[module];

    if (targetModule && typeof targetModule[action] === 'function') {
      targetModule[action](params);
    } else {
      console.warn(`Ação [${action}] não encontrada no módulo [${module}]`);
    }
  } catch (error) {
    console.error("Erro ao processar protocolo Bridge:", error);
  }
};