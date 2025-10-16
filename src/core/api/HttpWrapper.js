import axios from "axios";

export class HttpWrapper {
  /**
   * Cria um novo cliente HTTP isolado
   * @param {object} options - opções de configuração
   * @param {string} [options.baseURL] - URL base opcional
   * @param {object} [options.headers] - headers padrão
   * @param {number} [options.timeout] - tempo limite da requisição
   */
  constructor({ baseURL = "", headers = {}, timeout = 10000 } = {}) {
    this.client = axios.create({
      baseURL,
      headers,
      timeout,
    });
  }

  /**
   * Realiza uma requisição genérica
   */
  async request({ method = "GET", url, data = null, headers = {} }) {
    try {
      const response = await this.client({
        method,
        url,
        data,
        headers,
      });
      return { success: true, data: response.data };
    } catch (error) {
      const err = error.response ? error.response.data : error.message;
      return { success: false, error: err };
    }
  }

  /**
   * Métodos simplificados
   */
  async get(url, headers = {}) {
    return this.request({ method: "GET", url, headers });
  }

  async post(url, data, headers = {}) {
    return this.request({ method: "POST", url, data, headers });
  }

  async put(url, data, headers = {}) {
    return this.request({ method: "PUT", url, data, headers });
  }

  async delete(url, headers = {}) {
    return this.request({ method: "DELETE", url, headers });
  }

  /**
   * Atualiza cabeçalhos dinamicamente
   */
  setHeader(key, value) {
    this.client.defaults.headers[key] = value;
  }

  /**
   * Define token de autenticação padrão
   */
  setAuthToken(token) {
    this.client.defaults.headers["Authorization"] = `Bearer ${token}`;
  }
}