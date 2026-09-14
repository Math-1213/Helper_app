import RNFS from 'react-native-fs';
import {unzip} from 'react-native-zip-archive';

/**
 * Baixa e instala (ou reinstala) o CÓDIGO de um módulo a partir de uma URL
 * de download de .zip. Usado pelo Marketplace, pela detecção automática do
 * "Adicionar Módulo" manual, e pelo botão de reinstalar — é sempre o mesmo
 * processo, só muda de onde é disparado.
 *
 * Importante: só mexe em apps/{appId}/code/. Dados gravados pelo módulo via
 * FileBridge vivem em apps/{appId}/data/ — uma pasta irmã, nunca tocada por
 * este processo — e via StorageBridge no AsyncStorage, isolado por
 * appId e completamente fora do sistema de arquivos. Reinstalar troca o
 * código sem apagar nada que o módulo tenha salvo.
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
