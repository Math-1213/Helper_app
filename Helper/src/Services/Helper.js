import axios from 'axios';

export const downloadUpdateCode = async url => {
  try {
    // Garante compatibilidade tanto com http:// quanto https://
    const formattedUrl =
      url.startsWith('http://') ||
      url.startsWith('https://') ||
      url.startsWith('file://')
        ? url
        : `http://${url}`; // Mude para https:// se for o padrão de produção

    // Axios gerencia o timeout de forma nativa e limpa
    const response = await axios.get(formattedUrl, {
      timeout: 5000,
      responseType: 'text', // Garante que o retorno venha como string/texto
    });

    return response.data; // Retorna o HTML/Código baixado
  } catch (err) {
    console.log('Erro ao baixar, usando cache...', err.message);
    return null; // Retorna null para o componente usar a versão estável local
  }
};
