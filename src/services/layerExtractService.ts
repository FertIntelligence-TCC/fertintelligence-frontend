import { ENDPOINT } from "@/constants/Endpoint";
import { api } from "./axios";
import { 
    LayerExtractResponse, 
    LayerExtractCreatePayload, 
    LayerExtractUpdatePayload 
} from "../interfaces/LayerExtract";


export const layerExtractService = {
    
    // Cria um extrato de camada vinculado a uma Análise de Solo (analysisId)
    create: async (analysisId: number, payload: LayerExtractCreatePayload): Promise<LayerExtractResponse> => {
        const response = await api.post<LayerExtractResponse>(ENDPOINT.CREATE_LAYER_EXTRACT, payload, {
            params: { analysisId }
        });
        return response.data;
    },

    getById: async (layerExtractId: number): Promise<LayerExtractResponse> => {
        const response = await api.get<LayerExtractResponse>(ENDPOINT.GET_LAYER_EXTRACT_LAYER_EXTRACT, {
            params: { layerExtractId }
        });
        return response.data;
    },

    // Busca todos os extratos de uma determinada análise
    getByAnalysisId: async (analysisId: number): Promise<LayerExtractResponse[]> => {
        const response = await api.get<LayerExtractResponse[]>(ENDPOINT.GET_BY_ANALYSIS_LAYER_EXTRACT, {
            params: { analysisId }
        });
        return response.data;
    },

    update: async (layerExtractId: number, payload: LayerExtractUpdatePayload): Promise<LayerExtractResponse> => {
        const response = await api.put<LayerExtractResponse>(ENDPOINT.UPDATE_LAYER_EXTRACT, payload, {
            params: { layerExtractId }
        });
        return response.data;
    },

    delete: async (layerExtractId: number): Promise<void> => {
        await api.delete(ENDPOINT.DELETE_LAYER_EXTRACT, {
            params: { layerExtractId }
        });
    }
};
