import AsyncStorage from "@react-native-async-storage/async-storage";
import Core from "../../../core";
const HttpWrapper = Core.api.HttpWrapper

const STORAGE_KEY = "@last_server"; // onde o IP:porta é salvo

export class ListAPI {
    constructor() {
        this.http = new HttpWrapper();
    }

    /**
     * Normaliza o IP e porta do usuário, removendo "http://" ou "https://"
     */
    normalizeAddress(address) {
        if (!address) return null;
        return address
            .trim()
            .replace(/^https?:\/\//, "") // remove http:// ou https://
            .replace(/\/+$/, ""); // remove barras no final
    }

    /**
     * Monta a URL completa
     */
    buildUrl(address) {
        const normalized = this.normalizeAddress(address);
        return normalized ? `http://${normalized}/push` : null;
    }

    /**
     * Salva o último IP:porta
     */
    async saveLastServer(address) {
        const normalized = this.normalizeAddress(address);
        if (normalized) {
            await AsyncStorage.setItem(STORAGE_KEY, normalized);
        }
    }

    /**
     * Recupera o último IP:porta
     */
    async getLastServer() {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        return saved || "";
    }

    /**
     * Envia uma lista ao servidor
     */
    async pushList(address, list) {
        try {
            const url = this.buildUrl(address);
            if (!url) throw new Error("Endereço inválido.");

            // salva IP:porta para futuras execuções
            await this.saveLastServer(address);

            const payload = {
                name: list.name,
                tasks: list.tasks,
            };

            const headers = {
                "Content-Type": "application/json",
                id: list.id.toString(),
            };

            const { success, data, error } = await this.http.put(url, payload, headers);

            if (!success) {
                throw new Error(error?.message || "Falha ao enviar lista.");
            }

            return { success: true, data };
        } catch (err) {
            console.error("Erro no envio:", err);
            return { success: false, error: err.message };
        }
    }
}
