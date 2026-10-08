import AsyncStorage from '@react-native-async-storage/async-storage';

const PERMISSIONS_KEY_PREFIX = '@helper_app_permissions:';

// Configuração padrão de permissões ao instalar um novo módulo
export const DEFAULT_PERMISSIONS = {
  storage: true, // Isolado em apps/{appId}/
  files: true, // Isolado em apps/{appId}/data/
  location: false, // Requer autorização do usuário
  camera: false, // Requer autorização do usuário
  audio: false, // Requer autorização do usuário
  sensors: false, // Acelerômetro, Giroscópio, etc.
};

/**
 * Gera um hash SHA-256 a partir do appId para evitar colisões
 * e caracteres inválidos em chaves do AsyncStorage.
 */
const hashAppId = async appId => {
  if (!appId) return 'unknown_app';

  try {
    // Usa Web Crypto API nativa do JS / Hermes
    const encoder = new TextEncoder();
    const data = encoder.encode(appId);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (err) {
    // Fallback simples para ambientes sem crypto.subtle
    let hash = 0;
    for (let i = 0; i < appId.length; i++) {
      hash = (hash << 5) - hash + appId.charCodeAt(i);
      hash |= 0;
    }
    return `fallback_${Math.abs(hash)}`;
  }
};

export const getAppPermissions = async appId => {
  try {
    const hashedId = await hashAppId(appId);
    const raw = await AsyncStorage.getItem(
      `${PERMISSIONS_KEY_PREFIX}${hashedId}`,
    );
    if (!raw) return DEFAULT_PERMISSIONS;
    return {...DEFAULT_PERMISSIONS, ...JSON.parse(raw)};
  } catch {
    return DEFAULT_PERMISSIONS;
  }
};

export const setAppPermissions = async (appId, permissions) => {
  try {
    const hashedId = await hashAppId(appId);
    await AsyncStorage.setItem(
      `${PERMISSIONS_KEY_PREFIX}${hashedId}`,
      JSON.stringify(permissions),
    );
  } catch (err) {
    console.error('[PermissionService] Erro ao salvar permissões:', err);
  }
};

/**
 * Utilitário opcional para limpar as permissões ao deletar um módulo
 */
export const removeAppPermissions = async appId => {
  try {
    const hashedId = await hashAppId(appId);
    await AsyncStorage.removeItem(`${PERMISSIONS_KEY_PREFIX}${hashedId}`);
  } catch (err) {
    console.error('[PermissionService] Erro ao remover permissões:', err);
  }
};
