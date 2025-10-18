import 'react-native-get-random-values'; // required for uuid on RN
import EncryptedStorage from 'react-native-encrypted-storage';
import { v4 as uuidv4 } from 'uuid';
import SHA256 from 'crypto-js/sha256';
import Base64 from 'crypto-js/enc-base64'; // para codificação legível
import Hex from 'crypto-js/enc-hex';
import RNFS from 'react-native-fs';

const MODULES_FILE = `${RNFS.DocumentDirectoryPath}/modules.json`;

const STORAGE_PREFIX = '@helper_module_key:'; // chave por módulo

async function loadModules() {
  try {
    const data = await RNFS.readFile(MODULES_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function saveModules(modules) {
  await RNFS.writeFile(MODULES_FILE, JSON.stringify(modules), 'utf8');
}

const KeyManager = {
  /**
   * Gera um moduleId e moduleKey seguros e guarda no EncryptedStorage.
   * moduleInfo: { name, version, author } - usados para compor o moduleId (reprodutível se quiser)
   * retorna { moduleId, moduleKey }
   */
  async generateAndStoreKey(moduleInfo = {}) {
    // resetRealm()
    const { name = 'unknown', version = '0.0.0', author = '' } = moduleInfo;

    // moduleId fixo baseado em dados estáveis
    const rawId = `${name}:${version}:${author}`;
    const moduleId = SHA256(rawId).toString(Base64);

    const existing = await EncryptedStorage.getItem(STORAGE_PREFIX + moduleId);
    if (existing) {
      // retorna exatamente o que está salvo (mantém moduleKey idêntica)
      return JSON.parse(existing);
    }

    const keySeed = `${uuidv4()}:${Date.now()}:${moduleId}`;
    const rawKey = SHA256(keySeed).toString();
    const moduleKey = Hex.parse(rawKey).toString(Base64);

    const entry = {
      moduleId,
      moduleKey,
      createdAt: new Date().toISOString(),
      meta: { name, version, author }
    };

    await EncryptedStorage.setItem(STORAGE_PREFIX + moduleId, JSON.stringify(entry));
    await this._addToIndex(moduleId);

    return entry;
  }
  ,

  /**
   * Retorna a chave armazenada (ou null)
   */
  async getKey(moduleId) {
    const raw = await EncryptedStorage.getItem(STORAGE_PREFIX + moduleId);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      return parsed.moduleKey || null;
    } catch (e) {
      return null;
    }
  },

  /**
   * Verifica se uma chave fornecida bate com a armazenada
   */
  async verifyKey(moduleId, providedKey) {
    const stored = await this.getKey(moduleId);
    if (!stored) return false;
    return stored === providedKey;
  },

  /**
   * Remove a chave do armazenamento seguro (quando desinstalar módulo)
   */
  async removeKey(moduleId) {
    await EncryptedStorage.removeItem(STORAGE_PREFIX + moduleId);
  },

  /**
   * Lista módulos com chaves armazenadas (útil para debugging/admin)
   */
  async listModules() {
    // EncryptedStorage não fornece listKeys por padrão. Mantemos um índice opcional (padrão simples):
    // Para simplicidade: mantemos um item índice que contenha todos moduleIds
    const indexRaw = await EncryptedStorage.getItem(STORAGE_PREFIX + '__index__');
    const index = indexRaw ? JSON.parse(indexRaw) : [];
    const items = [];
    for (const id of index) {
      const raw = await EncryptedStorage.getItem(STORAGE_PREFIX + id);
      if (raw) items.push(JSON.parse(raw));
    }
    return items;
  },

  /**
   * Adiciona moduleId ao índice (helper interno)
   */
  async _addToIndex(moduleId) {
    const key = STORAGE_PREFIX + '__index__';
    const raw = await EncryptedStorage.getItem(key);
    const index = raw ? JSON.parse(raw) : [];
    if (!index.includes(moduleId)) {
      index.push(moduleId);
      await EncryptedStorage.setItem(key, JSON.stringify(index));
    }
  },

  /**
   * Gera e registra (gera key e adiciona ao índice)
   */
  async registerModule(moduleInfo = {}) {
    const { moduleId, moduleKey } = await this.generateAndStoreKey(moduleInfo);
    await this._addToIndex(moduleId);
    return { moduleId, moduleKey };
  }
};

export default KeyManager;
