import axios from 'axios';

// Instância padrão baseada no arquivo .env
const api = axios.create({
  baseURL: "127.0.0.1:3333",
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