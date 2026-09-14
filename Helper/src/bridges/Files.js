import React, {forwardRef, useImperativeHandle} from 'react';
import RNFS from 'react-native-fs';
import {pick, types} from '@react-native-documents/picker';

// Aceita apenas um nome/segmento simples — sem separadores de caminho nem
// sequências de ".." que permitiriam escapar do diretório sandboxed do
// módulo. Mesma classe de vulnerabilidade (path traversal / CWE-22) já
// corrigida no servidor do Marketplace, agora do lado do cliente.
const isSafePathSegment = value =>
  typeof value === 'string' &&
  value.length > 0 &&
  !value.includes('/') &&
  !value.includes('\\') &&
  !value.includes('..');

const FileBridge = forwardRef(({sendToWebView}, ref) => {
  // Retorna o diretório do módulo específico para isolar o storage de arquivos
  const getAppDirectory = async (appId = 'default') => {
    const safeAppId = isSafePathSegment(appId) ? appId : 'default';
    // "data", não a raiz de apps/{appId} — o código extraído do módulo mora
    // em apps/{appId}/code (ver ModuleInstaller.js). Reinstalar um módulo só
    // mexe em code/, então manter os dados numa pasta irmã garante que eles
    // sobrevivem a uma reinstalação sem depender de nenhum código "tomar
    // cuidado" — as pastas simplesmente não se sobrepõem.
    const dir = `${RNFS.DocumentDirectoryPath}/apps/${safeAppId}/data`;
    if (!(await RNFS.exists(dir))) {
      await RNFS.mkdir(dir);
    }
    return dir;
  };

  const saveFile = async (
    {fileName, data, encoding = 'base64'},
    callbackId,
    context,
  ) => {
    try {
      if (!fileName || data === undefined) {
        throw new Error('Parâmetros "fileName" e "data" são obrigatórios.');
      }
      if (!isSafePathSegment(fileName)) {
        throw new Error('Nome de arquivo inválido.');
      }

      const dir = await getAppDirectory(context?.appId);
      const path = `${dir}/${fileName}`;

      // Validação do encoding: suporta 'utf8' ou 'base64'
      const writeEncoding = encoding === 'utf8' ? 'utf8' : 'base64';
      await RNFS.writeFile(path, data, writeEncoding);

      sendToWebView({
        callbackId,
        module: 'file',
        type: 'FILE_SUCCESS',
        success: true,
        message: `Arquivo salvo: ${fileName}`,
      });
    } catch (err) {
      sendToWebView({
        callbackId,
        module: 'file',
        type: 'ERROR',
        success: false,
        error: err.message,
      });
    }
  };

  const readFile = async (
    {fileName, encoding = 'base64'},
    callbackId,
    context,
  ) => {
    try {
      if (!isSafePathSegment(fileName)) {
        throw new Error('Nome de arquivo inválido.');
      }

      const dir = await getAppDirectory(context?.appId);
      const path = `${dir}/${fileName}`;

      if (!(await RNFS.exists(path))) {
        throw new Error(`Arquivo não encontrado: ${fileName}`);
      }

      const readEncoding = encoding === 'utf8' ? 'utf8' : 'base64';
      const content = await RNFS.readFile(path, readEncoding);

      sendToWebView({
        callbackId,
        module: 'file',
        type: 'FILE_DATA',
        success: true,
        data: content,
        fileName,
      });
    } catch (err) {
      sendToWebView({
        callbackId,
        module: 'file',
        type: 'ERROR',
        success: false,
        error: err.message,
      });
    }
  };

  const listFiles = async (callbackId, context) => {
    try {
      const dir = await getAppDirectory(context?.appId);
      const result = await RNFS.readDir(dir);
      const files = result.filter(f => f.isFile()).map(f => f.name);

      sendToWebView({
        callbackId,
        module: 'file',
        type: 'FILE_LIST',
        success: true,
        data: files,
      });
    } catch (err) {
      sendToWebView({
        callbackId,
        module: 'file',
        type: 'ERROR',
        success: false,
        error: err.message,
      });
    }
  };

  const pickFile = async (params = {}, callbackId) => {
    try {
      const results = await pick({
        type: [types.allFiles],
        copyTo: 'cachesDirectory',
      });

      if (!results || results.length === 0) {
        // Sem isso, uma seleção vazia (sem exceção de cancelamento) deixava
        // a WebView esperando por um callback que nunca chegava.
        if (callbackId) {
          sendToWebView({
            callbackId,
            module: 'file',
            type: 'CANCELLED',
            success: false,
            error: 'Nenhum arquivo selecionado.',
          });
        }
        return;
      }

      const res = results[0];
      let uriToRead = res.fileCopyUri || res.uri;

      if (!uriToRead) {
        throw new Error(
          'Não foi possível determinar o caminho do arquivo selecionado.',
        );
      }

      // Decodifica URIs com caracteres especiais (%20, etc)
      uriToRead = decodeURIComponent(uriToRead);

      const base64Content = await RNFS.readFile(uriToRead, 'base64');

      sendToWebView({
        callbackId,
        module: 'file',
        type: 'FILE_PICKED',
        success: true,
        data: {
          name: res.name,
          size: res.size,
          uri: res.uri,
          type: res.type,
          base64: base64Content,
        },
      });
    } catch (err) {
      const isUserCancelled =
        (typeof isCancelWithError === 'function' && isCancelWithError(err)) ||
        (typeof isCancel === 'function' && isCancel(err)) ||
        err?.code === 'DOCUMENT_PICKER_CANCELED' ||
        err?.message?.includes('user canceled');

      if (isUserCancelled) {
        if (callbackId) {
          sendToWebView({
            callbackId,
            module: 'file',
            type: 'CANCELLED',
            success: false,
            error: 'Seleção cancelada pelo usuário.',
          });
        }
        return;
      }
    }
  };

  const importPickedFile = async (
    {sourceUri, fileName},
    callbackId,
    context,
  ) => {
    try {
      if (!isSafePathSegment(fileName)) {
        throw new Error('Nome de arquivo inválido.');
      }
      if (!sourceUri) {
        throw new Error('Parâmetro "sourceUri" é obrigatório.');
      }

      const cleanSourceUri = decodeURIComponent(
        sourceUri.replace('file://', ''),
      );

      // Só aceita importar de dentro do cache do próprio app — onde o
      // PICK_FILE (copyTo: 'cachesDirectory') deixa o arquivo escolhido.
      // Sem essa checagem, qualquer caminho do dispositivo acessível ao
      // processo do app poderia ser copiado pra dentro do sandbox do módulo.
      if (!cleanSourceUri.startsWith(RNFS.CachesDirectoryPath)) {
        throw new Error('Origem do arquivo inválida.');
      }

      const dir = await getAppDirectory(context?.appId);
      const destPath = `${dir}/${fileName}`;
      await RNFS.copyFile(cleanSourceUri, destPath);

      sendToWebView({
        callbackId,
        module: 'file',
        type: 'FILE_SUCCESS',
        success: true,
        message: 'Arquivo importado com sucesso',
      });
    } catch (err) {
      sendToWebView({
        callbackId,
        module: 'file',
        type: 'ERROR',
        success: false,
        error: err.message,
      });
    }
  };

  const handleAction = async (payload, context) => {
    const {action, callbackId, ...params} = payload;

    switch (action) {
      case 'SAVE_FILE':
        await saveFile(params, callbackId, context);
        break;
      case 'READ_FILE':
        await readFile(params, callbackId, context);
        break;
      case 'LIST_FILES':
        await listFiles(callbackId, context);
        break;
      case 'PICK_FILE':
        await pickFile(params, callbackId);
        break;
      case 'IMPORT_PICKED_FILE':
        await importPickedFile(params, callbackId, context);
        break;
      default:
        if (callbackId) {
          sendToWebView({
            callbackId,
            module: 'file',
            type: 'ERROR',
            success: false,
            error: `Ação '${action}' não reconhecida no FileBridge.`,
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

export default FileBridge;
