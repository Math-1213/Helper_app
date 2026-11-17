import axios from 'axios';

const normalizeUrl = url =>
  url.startsWith('http://') ||
  url.startsWith('https://') ||
  url.startsWith('file://')
    ? url
    : `http://${url}`;

/**
 * Descobre se uma URL aponta pra um pacote .zip (módulo instalado, offline)
 * ou uma página web comum (atalho, carregado ao vivo).
 */
export const identifySource = async rawUrl => {
  const url = normalizeUrl(rawUrl.trim());

  try {
    const head = await axios.head(url, {
      timeout: 5000,
      validateStatus: () => true,
    });

    if (head.status < 400) {
      const contentType = (head.headers?.['content-type'] || '').toLowerCase();
      if (contentType.includes('zip')) return {type: 'module', url};
      if (contentType.includes('html')) return {type: 'shortcut', url};
    }
  } catch (err) {
    // Servidor pode não suportar HEAD, segue para o fallback binário.
  }

  const probe = await axios.get(url, {
    timeout: 8000,
    responseType: 'arraybuffer',
    headers: {Range: 'bytes=0-3'},
    validateStatus: () => true,
  });

  if (probe.status >= 400) {
    throw new Error(`Servidor retornou status HTTP ${probe.status}.`);
  }

  const bytes = new Uint8Array(probe.data);
  const isZip = bytes[0] === 0x50 && bytes[1] === 0x4b; // Assinatura "PK"

  return {type: isZip ? 'module' : 'shortcut', url};
};

/**
 * @deprecated Usado hoje só pelo WebViewScreen (checkAndFetchUpdate) pra
 * módulos "atalho" antigos, cacheados por HTML.
 */
export const downloadUpdateCode = async url => {
  try {
    const formattedUrl = normalizeUrl(url);
    const response = await axios.get(formattedUrl, {
      timeout: 5000,
      responseType: 'text',
    });
    return response.data;
  } catch (err) {
    console.log('Erro ao baixar, usando cache...', err.message);
    return null;
  }
};
