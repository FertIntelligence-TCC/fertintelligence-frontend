import { api } from "./axios";
import { 
    SaturationExtractAnalysisExtractResponse, 
    SaturationExtractAnalysisExtractCreatePayload, 
    SaturationExtractAnalysisExtractUpdatePayload 
} from "../interfaces/SaturationExtractAnalysisExtract";

const ENDPOINT = "/saturation-extract-analysis-extract";

export const saturationExtractAnalysisExtractService = {
    
    /**
     * Cria os dados de análise de extrato de saturação.
     * Deve fornecer 'rangeExtractId' OU 'layerExtractId'.
     */
    create: async (
        payload: SaturationExtractAnalysisExtractCreatePayload,
        rangeExtractId?: number, 
        layerExtractId?: number
    ): Promise<SaturationExtractAnalysisExtractResponse> => {
        const params: any = {};
        if (rangeExtractId) params.rangeExtractId = rangeExtractId;
        if (layerExtractId) params.layerExtractId = layerExtractId;

        const response = await api.post<SaturationExtractAnalysisExtractResponse>(
            `${ENDPOINT}/register`, 
            payload, 
            { params }
        );
        return response.data;
    },

    getById: async (saturationExtractAnalysisExtractId: number): Promise<SaturationExtractAnalysisExtractResponse> => {
        const response = await api.get<SaturationExtractAnalysisExtractResponse>(`${ENDPOINT}/get-extract`, {
            params: { saturationExtractAnalysisExtractId }
        });
        return response.data;
    },

    // Busca dados de saturação associados a um Extrato de Intervalo
    getByRangeExtractId: async (rangeExtractId: number): Promise<SaturationExtractAnalysisExtractResponse[]> => {
        const response = await api.get<SaturationExtractAnalysisExtractResponse[]>(`${ENDPOINT}/get-by-range`, {
            params: { rangeExtractId }
        });
        return response.data;
    },

    // Busca dados de saturação associados a um Extrato de Camada
    getByLayerExtractId: async (layerExtractId: number): Promise<SaturationExtractAnalysisExtractResponse[]> => {
        const response = await api.get<SaturationExtractAnalysisExtractResponse[]>(`${ENDPOINT}/get-by-layer`, {
            params: { layerExtractId }
        });
        return response.data;
    },

    update: async (
        saturationExtractAnalysisExtractId: number, 
        payload: SaturationExtractAnalysisExtractUpdatePayload
    ): Promise<SaturationExtractAnalysisExtractResponse> => {
        const response = await api.put<SaturationExtractAnalysisExtractResponse>(`${ENDPOINT}/update`, payload, {
            params: { saturationExtractAnalysisExtractId }
        });
        return response.data;
    },

    delete: async (saturationExtractAnalysisExtractId: number): Promise<void> => {
        await api.delete(`${ENDPOINT}/delete`, {
            params: { saturationExtractAnalysisExtractId }
        });
    }
};