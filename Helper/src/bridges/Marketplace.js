import axios from 'axios';
import Config from 'react-native-config';

// Instância padrão baseada no arquivo .env
const api = axios.create({
  baseURL: Config.MARKETPLACE_URL,
  timeout: 5000,
});

// Função para atualizar a URL base em tempo de execução
export const setMarketplaceBaseURL = (url) => {
  const formattedUrl = url.startsWith('http://') || url.startsWith('https://')
    ? url
    : `http://${url}`;
  
  api.defaults.baseURL = formattedUrl;
  console.log(`[Marketplace API] Base URL atualizada para: ${formattedUrl}`);
};

export default api;