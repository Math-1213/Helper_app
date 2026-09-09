import axios from 'axios';
import RNFS from 'react-native-fs';

export const downloadUpdateCode = async url => {
  if (!url) return null;

  try {
    const cleanUrl = url.trim();

    // 1. Trata arquivos locais extraídos pelo Marketplace
    if (cleanUrl.startsWith('file://')) {
      const filePath = cleanUrl.replace('file://', '');
      const exists = await RNFS.exists(filePath);

      if (!exists) {
        console.warn(`[Helper] Arquivo local não encontrado: ${filePath}`);
        return null;
      }

      // Lê o HTML direto do sistema de arquivos do Android/iOS
      const localContent = await RNFS.readFile(filePath, 'utf8');
      return localContent;
    }

    // 2. Formata URLs remota de rede (Dev ou Produção)
    const formattedUrl =
      cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')
        ? cleanUrl
        : `http://${cleanUrl}`;

    // 3. Download via Axios com timeouts e validação de status
    const response = await axios.get(formattedUrl, {
      timeout: 5000,
      responseType: 'text',
      validateStatus: status => status >= 200 && status < 300,
    });

    return response.data;
  } catch (err) {
    console.log(`[Helper] Erro ao baixar update (${url}):`, err.message);
    return null; // Retorna null para ativar o fallback de cache local na WebViewScreen
  }
};

export default downloadUpdateCode;
