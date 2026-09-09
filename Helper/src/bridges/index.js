export const handleBridgeMessage = (
  event,
  refs,
  sendToWebView,
  context = {},
) => {
  try {
    const payload = JSON.parse(event.nativeEvent.data);
    const {module, action, params, callbackId} = payload;

    const modules = {
      camera: refs.camera?.current,
      sensors: refs.sensors?.current,
      location: refs.location?.current,
      file: refs.file?.current,
      mic: refs.mic?.current,
      storage: refs.storage?.current,
      console: refs.console?.current,
    };

    const targetModule = modules[module];

    if (!targetModule) {
      console.warn(`[Bridge] Módulo [${module}] não encontrado ou ref nula.`);
      if (callbackId) {
        sendToWebView({
          callbackId,
          success: false,
          error: `Módulo '${module}' indisponível.`,
        });
      }
      return;
    }

    // Caso o módulo utilize um manipulador central unificado (handleAction)
    if (typeof targetModule.handleAction === 'function') {
      targetModule.handleAction({action, ...params, callbackId}, context);
      return;
    }

    // Caso o módulo expor métodos diretamente pelo nome da action
    if (typeof targetModule[action] === 'function') {
      targetModule[action](params, callbackId, context);
      return;
    }

    console.warn(
      `[Bridge] Ação [${action}] não encontrada no módulo [${module}]`,
    );
    if (callbackId) {
      sendToWebView({
        callbackId,
        success: false,
        error: `Ação '${action}' não encontrada no módulo '${module}'.`,
      });
    }
  } catch (error) {
    console.error('[Bridge] Erro ao processar protocolo Bridge:', error);
  }
};
