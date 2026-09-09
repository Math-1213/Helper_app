import axios from 'axios';
import {Platform} from 'react-native';

// Trata o localhost para emuladores Android vs iOS/Físico
const DEFAULT_HOST =
  Platform.OS === 'android' ? '10.0.2.2:3333' : '127.0.0.1:3333';
const DEFAULT_BASE_URL = `http://${DEFAULT_HOST}`;

// Instância padrão do Axios
const api = axios.create({
  baseURL: DEFAULT_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/**
 * Normaliza e atualiza a URL base da API do Marketplace em tempo de execução
 * @param {string} url - URL do servidor (ex: "192.168.1.15:3333" ou "https://api.marketplace.com")
 */
export const setMarketplaceBaseURL = url => {
  if (!url || typeof url !== 'string') {
    console.warn('[Marketplace API] Tentativa de definir URL inválida.');
    return;
  }

  const cleanUrl = url.trim().replace(/\/+$/, ''); // Remove barras no final
  const formattedUrl = /^https?:\/\//i.test(cleanUrl)
    ? cleanUrl
    : `http://${cleanUrl}`;

  api.defaults.baseURL = formattedUrl;
  console.log(`[Marketplace API] Base URL atualizada para: ${formattedUrl}`);
};

export default api;
