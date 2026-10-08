import {ToastAndroid} from 'react-native';
import {getAppPermissions} from '../Services/PermissionService';

const MODULE_TO_PERMISSION_KEY = {
  camera: 'camera',
  sensors: 'sensors',
  location: 'location',
  file: 'files',
  mic: 'audio',
  storage: 'storage',
  // 'console' fica de fora por não requerer permissão restritiva
};

export const handleBridgeMessage = async (
  event,
  refs,
  sendToWebView,
  context = {},
) => {
  let callbackId;

  const reportFailure = error => {
    const message = error?.message || String(error) || 'Erro desconhecido.';
    console.error(
      `[Bridge:ERR] Erro na execução | Callback: ${
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

    // Garante compatibilidade entre 'module/bridge' e 'params/data'
    const moduleName = payload.module || payload.bridge;
    const actionName = payload.action;
    const paramsData = payload.params || payload.data || {};
    callbackId = payload.callbackId;

    console.log(
      `[Bridge:PARSE] Modulo: "${moduleName}" | Ação: "${actionName}" | CallbackId: "${callbackId}"`,
      {
        params: paramsData,
        context,
      },
    );

    // --- CHECAGEM DE PERMISSÃO INTERNA ---
    const permissionKey = MODULE_TO_PERMISSION_KEY[moduleName];
    const appId = context?.appId || context?.app?.id;

    if (permissionKey && appId) {
      const permissions = await getAppPermissions(appId);
      const hasPermission = !!permissions[permissionKey];

      if (!hasPermission) {
        const errorMsg = `Permissão negada para o módulo '${moduleName}'.`;

        console.warn(`[Bridge:BLOCKED] ${errorMsg} (App: ${appId})`);

        // Toast de aviso visual para o usuário
        const displayModuleName = moduleName
          ? String(moduleName).toUpperCase()
          : 'DESCONHECIDO';
        ToastAndroid.show(
          `O app solicitou recursos de ${displayModuleName}`,
          ToastAndroid.SHORT,
        );

        if (callbackId) {
          sendToWebView({
            callbackId,
            success: false,
            error: errorMsg,
            code: 'PERMISSION_DENIED',
          });
        }
        return;
      }
    }

    const modules = {
      camera: refs.camera?.current,
      sensors: refs.sensors?.current,
      location: refs.location?.current,
      file: refs.file?.current,
      mic: refs.mic?.current,
      storage: refs.storage?.current,
      console: refs.console?.current,
    };

    const targetModule = modules[moduleName];

    if (!targetModule) {
      console.warn(
        `[Bridge:WARN] ⚠️ Módulo [${moduleName}] não encontrado ou ref nula. Módulos disponíveis:`,
        Object.keys(modules).filter(k => !!modules[k]),
      );
      if (callbackId) {
        sendToWebView({
          callbackId,
          success: false,
          error: `Módulo '${moduleName}' indisponível.`,
        });
      }
      return;
    }

    // Caso o módulo utilize um manipulador central unificado (handleAction)
    if (typeof targetModule.handleAction === 'function') {
      console.log(`[Bridge:EXEC] Chamando ${moduleName}.handleAction()`);

      Promise.resolve(
        targetModule.handleAction(
          {...paramsData, action: actionName, callbackId},
          context,
        ),
      )
        .then(result => {
          console.log(
            `[Bridge:OK] ${moduleName}.handleAction() executado com sucesso:`,
            result,
          );
          return result;
        })
        .catch(reportFailure);
      return;
    }

    // Caso o módulo exponha métodos diretamente pelo nome da action
    if (typeof targetModule[actionName] === 'function') {
      console.log(
        `[Bridge:EXEC] Chamando método direto: ${moduleName}.${actionName}()`,
      );

      Promise.resolve(targetModule[actionName](paramsData, callbackId, context))
        .then(result => {
          console.log(
            `[Bridge:OK] ${moduleName}.${actionName}() executado com sucesso:`,
            result,
          );
          return result;
        })
        .catch(reportFailure);
      return;
    }

    console.warn(
      `[Bridge:WARN] Ação [${actionName}] não encontrada no módulo [${moduleName}].`,
    );
    if (callbackId) {
      sendToWebView({
        callbackId,
        success: false,
        error: `Ação '${actionName}' não encontrada no módulo '${moduleName}'.`,
      });
    }
  } catch (error) {
    console.error(
      `[Bridge:ERR] Erro ao processar/parsear JSON da WebView:`,
      error,
    );
    reportFailure(error);
  }
};
