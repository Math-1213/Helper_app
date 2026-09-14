import React, {forwardRef, useImperativeHandle} from 'react';
import RNFS from 'react-native-fs';
import {
  pick,
  types,
  isCancel,
  keepLocalCopy,
} from '@react-native-documents/picker';

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
        type: [types.images, types.allFiles],
        allowMultiSelection: false,
      });

      if (!results || results.length === 0) {
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

      if (!res?.uri) {
        throw new Error(
          'O seletor não retornou uma URI válida para o arquivo.',
        );
      }

      console.log('[FileBridge] 📄 Arquivo selecionado:', {
        name: res.name,
        uri: res.uri,
        type: res.type,
        size: res.size,
      });

      /*
       * Converte a URI fornecida pelo DocumentProvider para uma
       * cópia local controlada pelo aplicativo.
       *
       * IMPORTANTE:
       * Não usamos RNFS.copyFile() diretamente sobre content://.
       *
       * O Android pode fornecer uma URI temporária que o RNFS
       * não consegue acessar diretamente.
       */
      const localCopy = await keepLocalCopy({
        files: [
          {
            uri: res.uri,
            fileName: res.name || `picked_${Date.now()}`,
          },
        ],
        destination: 'cachesDirectory',
      });

      console.log('[FileBridge] 📦 Resultado keepLocalCopy:', localCopy);

      if (
        !localCopy ||
        !localCopy[0] ||
        localCopy[0].status !== 'success' ||
        !localCopy[0].localUri
      ) {
        const copyResult = localCopy?.[0];

        throw new Error(
          copyResult?.copyError ||
            'Não foi possível criar uma cópia local do arquivo selecionado.',
        );
      }

      const localUri = localCopy[0].localUri;

      /*
       * keepLocalCopy() retorna uma URI local.
       *
       * Normalizamos para um caminho que o RNFS consiga utilizar.
       */
      const localPath = localUri.replace(/^file:\/\//, '');

      /*
       * Defesa adicional:
       * o arquivo precisa estar dentro do cache privado do aplicativo.
       */
      if (!localPath.startsWith(RNFS.CachesDirectoryPath)) {
        throw new Error(
          'A cópia local foi criada fora do cache permitido do aplicativo.',
        );
      }

      if (!(await RNFS.exists(localPath))) {
        throw new Error('A cópia local do arquivo não foi encontrada.');
      }

      /*
       * Lê somente a cópia local.
       *
       * A partir daqui não dependemos mais da URI content://
       * fornecida pelo Android.
       */
      const base64Content = await RNFS.readFile(localPath, 'base64');

      /*
       * Remove o arquivo temporário depois da leitura.
       */
      await RNFS.unlink(localPath).catch(() => {});

      sendToWebView({
        callbackId,
        module: 'file',
        type: 'FILE_PICKED',
        success: true,
        data: {
          name: res.name,
          size: res.size,
          uri: res.uri,
          type: res.type || 'application/octet-stream',
          base64: base64Content,
        },
      });
    } catch (err) {
      const isUserCancelled =
        (typeof isCancel === 'function' && isCancel(err)) ||
        err?.code === 'DOCUMENT_PICKER_CANCELED' ||
        err?.code === 'DOCUMENT_PICKER_CANCELLED' ||
        err?.code === 'CANCELLED' ||
        err?.message?.toLowerCase().includes('cancel');

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

      console.error('[FileBridge] ❌ Erro no PICK_FILE:', err);

      sendToWebView({
        callbackId,
        module: 'file',
        type: 'ERROR',
        success: false,
        error: err?.message || 'Erro ao processar arquivo selecionado.',
      });
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

      const cleanSourceUri = sourceUri.replace(/^file:\/\//, '');

      if (!cleanSourceUri.startsWith(RNFS.CachesDirectoryPath)) {
        throw new Error('Origem do arquivo inválida.');
      }

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
