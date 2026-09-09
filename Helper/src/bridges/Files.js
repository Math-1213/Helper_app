import React, {forwardRef, useImperativeHandle} from 'react';
import RNFS from 'react-native-fs';
import {pick, types, isCancel} from '@react-native-documents/picker';

const FileBridge = forwardRef(({sendToWebView}, ref) => {
  // Retorna o diretório do módulo específico para isolar o storage de arquivos
  const getAppDirectory = async (appId = 'default') => {
    const dir = `${RNFS.DocumentDirectoryPath}/apps/${appId}`;
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
        message: err.message,
      });
    }
  };

  const readFile = async (
    {fileName, encoding = 'base64'},
    callbackId,
    context,
  ) => {
    try {
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
        message: err.message,
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
        message: err.message,
      });
    }
  };

  const pickFile = async (params = {}, callbackId) => {
    try {
      const results = await pick({
        type: [types.allFiles],
        copyTo: 'cachesDirectory',
      });

      if (!results || results.length === 0) return;

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
      if (isCancel(err) || err?.code === 'DOCUMENT_PICKER_CANCELED') {
        if (callbackId) {
          sendToWebView({
            callbackId,
            module: 'file',
            type: 'CANCELLED',
            success: false,
            message: 'Seleção cancelada pelo usuário.',
          });
        }
        return;
      }

      sendToWebView({
        callbackId,
        module: 'file',
        type: 'ERROR',
        success: false,
        message: err?.message || 'Erro ao processar arquivo selecionado',
      });
    }
  };

  const importPickedFile = async (
    {sourceUri, fileName},
    callbackId,
    context,
  ) => {
    try {
      const dir = await getAppDirectory(context?.appId);
      const destPath = `${dir}/${fileName}`;

      const cleanSourceUri = decodeURIComponent(
        sourceUri.replace('file://', ''),
      );
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
        message: err.message,
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
            message: `Ação '${action}' não reconhecida no FileBridge.`,
          });
        }
        break;
    }
  };

  useImperativeHandle(ref, () => ({
    handleAction,
    SAVE_FILE: (params, callbackId, context) =>
      saveFile(params, callbackId, context),
    READ_FILE: (params, callbackId, context) =>
      readFile(params, callbackId, context),
    LIST_FILES: (params, callbackId, context) => listFiles(callbackId, context),
    PICK_FILE: (params, callbackId) => pickFile(params, callbackId),
    IMPORT_PICKED_FILE: (params, callbackId, context) =>
      importPickedFile(params, callbackId, context),
  }));

  return null;
});

export default FileBridge;
