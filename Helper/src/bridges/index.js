export const handleBridgeMessage = (
  event,
  refs,
  sendToWebView,
  context = {},
) => {
  let callbackId;

  const reportFailure = error => {
    const message = error?.message || String(error) || 'Erro desconhecido.';
    console.error(
      `[Bridge:ERR] ❌ Erro na execução | Callback: ${
        callbackId || 'N/A'
      } | Msg: ${message}`,
      error,
    );
    if (callbackId) {
      sendToWebView({callbackId, success: false, error: message});
    }
  };

  try {
    const rawData = event.nativeEvent.data;
    console.log(`[Bridge:IN] 📩 Mensagem recebida da WebView:`, rawData);

    const payload = JSON.parse(rawData);
    const {module, action, params} = payload;
    callbackId = payload.callbackId;

    console.log(
      `[Bridge:PARSE] 🔍 Modulo: "${module}" | Ação: "${action}" | CallbackId: "${callbackId}"`,
      {
        params,
        context,
      },
    );

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
      console.warn(
        `[Bridge:WARN] ⚠️ Módulo [${module}] não encontrado ou ref nula. Módulos disponíveis:`,
        Object.keys(modules).filter(k => !!modules[k]),
      );
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
      console.log(`[Bridge:EXEC] 🚀 Chamando ${module}.handleAction()`);

      Promise.resolve(
        targetModule.handleAction({...params, action, callbackId}, context),
      )
        .then(result => {
          console.log(
            `[Bridge:OK] ✅ ${module}.handleAction() executado com sucesso:`,
            result,
          );
          return result;
        })
        .catch(reportFailure);
      return;
    }

    // Caso o módulo exponha métodos diretamente pelo nome da action
    if (typeof targetModule[action] === 'function') {
      console.log(
        `[Bridge:EXEC] 🚀 Chamando método direto: ${module}.${action}()`,
      );

      Promise.resolve(targetModule[action](params, callbackId, context))
        .then(result => {
          console.log(
            `[Bridge:OK] ✅ ${module}.${action}() executado com sucesso:`,
            result,
          );
          return result;
        })
        .catch(reportFailure);
      return;
    }

    console.warn(
      `[Bridge:WARN] ⚠️ Ação [${action}] não encontrada no módulo [${module}].`,
    );
    if (callbackId) {
      sendToWebView({
        callbackId,
        success: false,
        error: `Ação '${action}' não encontrada no módulo '${module}'.`,
      });
    }
  } catch (error) {
    console.error(
      `[Bridge:ERR] 💥 Erro ao processar/parsear JSON da WebView:`,
      error,
    );
    reportFailure(error);
  }
};
