import Realm from 'realm';
import RNFS from 'react-native-fs';
import KeyManager from '../security/KeyManager';

function base64ToEncryptionKey(base64) {
  try {
    const binaryString = global.atob(base64);
    const arr = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      arr[i] = binaryString.charCodeAt(i);
    }

    // Realm exige 64 bytes
    const key = new Int8Array(64);
    for (let i = 0; i < key.length; i++) {
      key[i] = arr[i % arr.length];
    }

    return key;
  } catch (err) {
    console.warn('[RealmManager] Falha ao converter chave Realm:', err);
    return null;
  }
}

const RealmManager = {
  realms: {}, // moduleId -> { realm, key }

  /**
   * Inicializa (ou reabre) o Realm de um módulo.
   * - Reusa instância se já estiver aberta
   * - Recupera chave persistente do KeyManager
   * - Recria arquivo se houver erro de decriptação/corrupção
   */
  async initModuleRealm(moduleId, schema = [], options = {}) {
    // 🧩 Reusa se já estiver aberto
    if (this.realms[moduleId]) {
      console.log(`[RealmManager] Reutilizando Realm do módulo: ${moduleId}`);
      return this.realms[moduleId].realm;
    }

    const moduleKey = options.moduleKey || (await KeyManager.getKey?.(moduleId));
    const encryptionKey = moduleKey ? base64ToEncryptionKey(moduleKey) : null;

    const path = `${RNFS.DocumentDirectoryPath}/${moduleId}.realm`;
    const config = {
      path,
      schema,
      schemaVersion: options.schemaVersion || 1,
      encryptionKey,
    };

    let realm;
    try {
      realm = await Realm.open(config);
      console.log(`[RealmManager] Realm aberto com sucesso: ${path}`);
    } catch (err) {
      if (err.message.includes('decryption failed') || err.message.includes('HMAC')) {
        console.warn('[RealmManager] Arquivo corrompido ou chave incorreta. Recriando Realm...');

        try {
          await RNFS.unlink(path);
          realm = await Realm.open(config);
        } catch (unlinkErr) {
          console.error('[RealmManager] Falha ao recriar Realm:', unlinkErr);
          throw unlinkErr;
        }
      } else {
        throw err;
      }
    }

    this.realms[moduleId] = { realm, key: moduleKey || null };
    return realm;
  },

  /**
   * Obtém o Realm já inicializado
   */
  getRealm(moduleId, providedKey) {
    const entry = this.realms[moduleId];
    if (!entry) throw new Error(`Realm do módulo "${moduleId}" não inicializado.`);
    if (entry.key && providedKey && entry.key !== providedKey)
      throw new Error('Chave inválida para acessar o Realm.');
    if (entry.key && !providedKey)
      throw new Error('Chave necessária para acessar este Realm.');
    return entry.realm;
  },

  /**
   * Fecha e remove da memória
   */
  closeModuleRealm(moduleId) {
    const entry = this.realms[moduleId];
    if (!entry) return;
    try {
      entry.realm.close();
      console.log(`[RealmManager] Realm fechado: ${moduleId}`);
    } catch (e) {
      console.warn(`[RealmManager] Erro ao fechar Realm: ${e.message}`);
    }
    delete this.realms[moduleId];
  },

  /**
   * Apaga o arquivo físico do Realm (opcional)
   */
  async deleteRealmFile(moduleId) {
    const path = `${RNFS.DocumentDirectoryPath}/${moduleId}.realm`;
    try {
      if (await RNFS.exists(path)) {
        await RNFS.unlink(path);
        console.log(`[RealmManager] Realm removido: ${path}`);
      }
    } catch (err) {
      console.error('[RealmManager] Falha ao deletar Realm:', err);
    }
  },
};

export default RealmManager;
