import { api } from "./axios";
import { 
    LayerExtractResponse, 
    LayerExtractCreatePayload, 
    LayerExtractUpdatePayload 
} from "../interfaces/LayerExtract";

const ENDPOINT = "/layer-extract";

export const layerExtractService = {
    
    // Cria um extrato de camada vinculado a uma Análise de Solo (analysisId)
    create: async (analysisId: number, payload: LayerExtractCreatePayload): Promise<LayerExtractResponse> => {
        const response = await api.post<LayerExtractResponse>(`${ENDPOINT}/register`, payload, {
            params: { analysisId }
        });
        return response.data;
    },

    getById: async (layerExtractId: number): Promise<LayerExtractResponse> => {
        const response = await api.get<LayerExtractResponse>(`${ENDPOINT}/get-layer-extract`, {
            params: { layerExtractId }
        });
        return response.data;
    },

    // Busca todos os extratos de uma determinada análise
    getByAnalysisId: async (analysisId: number): Promise<LayerExtractResponse[]> => {
        const response = await api.get<LayerExtractResponse[]>(`${ENDPOINT}/get-by-analysis`, {
            params: { analysisId }
        });
        return response.data;
    },

    update: async (layerExtractId: number, payload: LayerExtractUpdatePayload): Promise<LayerExtractResponse> => {
        const response = await api.put<LayerExtractResponse>(`${ENDPOINT}/update`, payload, {
            params: { layerExtractId }
        });
        return response.data;
    },

    delete: async (layerExtractId: number): Promise<void> => {
        await api.delete(`${ENDPOINT}/delete`, {
            params: { layerExtractId }
        });
    }
};