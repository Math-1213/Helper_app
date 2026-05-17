import React, { forwardRef, useImperativeHandle } from 'react';
import RNFS from 'react-native-fs';
import { pick, types } from '@react-native-documents/picker';

const FileBridge = forwardRef(({ sendToWebView }, ref) => {
  useImperativeHandle(ref, () => ({
    async SAVE_FILE({ fileName, data }) {
      const path = `${RNFS.DocumentDirectoryPath}/${fileName}`;
      try {
        await RNFS.writeFile(path, data, 'base64');
        sendToWebView({
          module: 'file',
          type: 'FILE_SUCCESS',
          message: 'Arquivo salvo: ' + fileName,
        });
      } catch (err) {
        sendToWebView({ module: 'file', type: 'ERROR', message: err.message });
      }
    },

    async READ_FILE({ fileName }) {
      const path = `${RNFS.DocumentDirectoryPath}/${fileName}`;
      try {
        const content = await RNFS.readFile(path, 'base64');
        sendToWebView({
          module: 'file',
          type: 'FILE_DATA',
          data: content,
          fileName: fileName,
        });
      } catch (err) {
        sendToWebView({
          module: 'file',
          type: 'ERROR',
          message: 'Arquivo não encontrado',
        });
      }
    },

    async LIST_FILES() {
      try {
        const result = await RNFS.readDir(RNFS.DocumentDirectoryPath);
        const files = result.filter(f => f.isFile()).map(f => f.name);
        sendToWebView({
          module: 'file',
          type: 'FILE_LIST',
          data: files,
        });
      } catch (err) {
        sendToWebView({ module: 'file', type: 'ERROR', message: err.message });
      }
    },

    async PICK_FILE(params) {
      try {
        const results = await pick({
          type: [types.allFiles],
          copyTo: 'cachesDirectory', // Tenta copiar para o cache
        });

        if (!results || results.length === 0) return;

        const res = results[0];

        // CORREÇÃO: Verifica qual URI está disponível.
        // Se o fileCopyUri falhou no 'copyTo', usamos o uri normal.
        const uriToRead = res.fileCopyUri || res.uri;

        if (!uriToRead) {
          throw new Error('Não foi possível determinar o caminho do arquivo.');
        }

        // O RNFS precisa que o caminho no Android não tenha o prefixo 'content://'
        // para algumas operações, mas o readFile costuma lidar bem com URIs se o módulo nativo permitir.
        const base64Content = await RNFS.readFile(uriToRead, 'base64');

        sendToWebView({
          module: 'file',
          type: 'FILE_PICKED',
          data: {
            name: res.name,
            size: res.size,
            uri: res.uri,
            type: res.type,
            base64: base64Content,
          },
        });
      } catch (err) {
        console.log('Erro Código:', err?.code);
        console.log('Erro Mensagem:', err?.message);

        if (err?.code === 'DOCUMENT_PICKER_CANCELED') return;

        sendToWebView({
          module: 'file',
          type: 'ERROR',
          message: err?.message || 'Erro ao processar arquivo selecionado',
        });
      }
    },

    // Bônus: Ação para salvar o arquivo importado na pasta permanente do app
    async IMPORT_PICKED_FILE({ sourceUri, fileName }) {
      const destPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
      try {
        await RNFS.copyFile(sourceUri, destPath);
        sendToWebView({
          module: 'file',
          type: 'FILE_SUCCESS',
          message: 'Arquivo importado com sucesso',
        });
      } catch (err) {
        sendToWebView({ module: 'file', type: 'ERROR', message: err.message });
      }
    },
  }));

  return null;
});

export default FileBridge;
