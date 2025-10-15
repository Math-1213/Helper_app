import Realm from 'realm';
import KeyManager from '../security/KeyManager'; 

const RealmManager = {
  realms: {}, // moduleId -> { realm, key }

  async initModuleRealm(moduleId, schema = [], options = {}) {
    // try to retrieve key saved for module
    const moduleKey = options.moduleKey || await KeyManager.getKey(moduleId);
    // Realm expects 64-byte binary key (ArrayBuffer / Uint8Array) for encryptionKey
    // Here we derive a 64-byte key from base64 string (moduleKey). Keep in mind to implement safe derivation.
    let encryptionKey = null;
    if (moduleKey) {
      try {
        // moduleKey is base64 string - convert to binary (Uint8Array)
        const binaryString = atob(moduleKey); // atob in RN may not exist; you can use Buffer polyfill or alternative
        const arr = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) arr[i] = binaryString.charCodeAt(i);
        // If shorter than 64, expand/hkdf - for demo we'll pad/truncate
        encryptionKey = new Int8Array(64);
        for (let i = 0; i < encryptionKey.length; i++) encryptionKey[i] = arr[i % arr.length];
      } catch (e) {
        // fallback: no encryption
        encryptionKey = null;
      }
    }

    const path = `${moduleId}.realm`;
    const config = {
      path,
      schema,
      schemaVersion: options.schemaVersion || 1,
    };
    if (encryptionKey) config.encryptionKey = encryptionKey;

    const realm = await Realm.open(config);
    this.realms[moduleId] = { realm, key: moduleKey || null };
    return realm;
  },

  getRealm(moduleId, providedKey) {
    const entry = this.realms[moduleId];
    if (!entry) throw new Error('Module realm not initialized: ' + moduleId);
    if (entry.key && providedKey && entry.key !== providedKey) throw new Error('Invalid key for realm');
    if (entry.key && !providedKey) throw new Error('Key required to access this realm');
    return entry.realm;
  },

  closeModuleRealm(moduleId) {
    const entry = this.realms[moduleId];
    if (!entry) return;
    try {
      entry.realm.close();
    } catch (e) {}
    delete this.realms[moduleId];
  }
};

export default RealmManager;
