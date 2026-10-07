import RNFS from 'react-native-fs';
import {unzip} from 'react-native-zip-archive';

/**
 * Baixa e instala (ou reinstala) o CÓDIGO de um módulo a partir de uma URL
 * de download de .zip. Usado pelo Marketplace, pela detecção automática do
 * "Adicionar Módulo" manual, e pelo botão de reinstalar.
 *
 * Importante: só mexe em apps/{appId}/code/. Dados gravados pelo módulo via
 * FileBridge vivem em apps/{appId}/data/ e via StorageBridge no AsyncStorage.
 */
export const installModuleFromUrl = async (downloadUrl, appId) => {
  const codeDir = `${RNFS.DocumentDirectoryPath}/apps/${appId}/code`;
  const tempZipPath = `${RNFS.CachesDirectoryPath}/${appId}_install_temp.zip`;

  try {
    if (await RNFS.exists(codeDir)) {
      await RNFS.unlink(codeDir);
    }
    if (await RNFS.exists(tempZipPath)) {
      await RNFS.unlink(tempZipPath);
    }

    await RNFS.mkdir(codeDir);

    const result = await RNFS.downloadFile({
      fromUrl: downloadUrl,
      toFile: tempZipPath,
    }).promise;

    if (result.statusCode !== 200) {
      throw new Error(`Servidor retornou status HTTP ${result.statusCode}`);
    }

    await unzip(tempZipPath, codeDir);
    await RNFS.unlink(tempZipPath);

    const entryPath = `${codeDir}/index.html`;
    if (!(await RNFS.exists(entryPath))) {
      throw new Error('Pacote inválido: index.html não encontrado no ZIP.');
    }

    return {url: `file://${entryPath}`};
  } catch (err) {
    try {
      if (await RNFS.exists(codeDir)) await RNFS.unlink(codeDir);
      if (await RNFS.exists(tempZipPath)) await RNFS.unlink(tempZipPath);
    } catch (cleanErr) {
      console.log('[ModuleInstaller] Erro no cleanup:', cleanErr);
    }
    throw err;
  }
};
