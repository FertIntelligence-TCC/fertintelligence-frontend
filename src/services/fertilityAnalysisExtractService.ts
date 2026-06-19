import { ENDPOINT } from "@/constants/Endpoint";
import { api } from "./axios";
import { 
    FertilityAnalysisExtractResponse, 
    FertilityAnalysisExtractCreatePayload, 
    FertilityAnalysisExtractUpdatePayload 
} from "../interfaces/FertilityAnalysisExtract";


export const fertilityAnalysisExtractService = {
    
    /**
     * Cria os dados de análise de fertilidade (Química).
     * Deve fornecer 'rangeExtractId' OU 'layerExtractId'.
     */
    create: async (
        payload: FertilityAnalysisExtractCreatePayload,
        rangeExtractId?: number, 
        layerExtractId?: number
    ): Promise<FertilityAnalysisExtractResponse> => {
        const params: any = {};
        if (rangeExtractId) params.rangeExtractId = rangeExtractId;
        if (layerExtractId) params.layerExtractId = layerExtractId;

        const response = await api.post<FertilityAnalysisExtractResponse>(
            ENDPOINT.CREATE_FERTILITY_ANALYSIS_EXTRACT, 
            payload, 
            { params }
        );
        return response.data;
    },

    getById: async (fertilityAnalysisExtractId: number): Promise<FertilityAnalysisExtractResponse> => {
        const response = await api.get<FertilityAnalysisExtractResponse>(ENDPOINT.GET_EXTRACT_FERTILITY_ANALYSIS_EXTRACT, {
            params: { fertilityAnalysisExtractId }
        });
        return response.data;
    },

    // Busca dados químicos associados a um Extrato de Intervalo
    getByRangeExtractId: async (rangeExtractId: number): Promise<FertilityAnalysisExtractResponse[]> => {
        const response = await api.get<FertilityAnalysisExtractResponse[]>(ENDPOINT.GET_BY_RANGE_FERTILITY_ANALYSIS_EXTRACT, {
            params: { rangeExtractId }
        });
        return response.data;
    },

    // Busca dados químicos associados a um Extrato de Camada
    getByLayerExtractId: async (layerExtractId: number): Promise<FertilityAnalysisExtractResponse[]> => {
        const response = await api.get<FertilityAnalysisExtractResponse[]>(ENDPOINT.GET_BY_LAYER_FERTILITY_ANALYSIS_EXTRACT, {
            params: { layerExtractId }
        });
        return response.data;
    },

    update: async (
        fertilityAnalysisExtractId: number, 
        payload: FertilityAnalysisExtractUpdatePayload
    ): Promise<FertilityAnalysisExtractResponse> => {
        const response = await api.put<FertilityAnalysisExtractResponse>(ENDPOINT.UPDATE_FERTILITY_ANALYSIS_EXTRACT, payload, {
            params: { fertilityAnalysisExtractId }
        });
        return response.data;
    },

    delete: async (fertilityAnalysisExtractId: number): Promise<void> => {
        await api.delete(ENDPOINT.DELETE_FERTILITY_ANALYSIS_EXTRACT, {
            params: { fertilityAnalysisExtractId }
        });
    }
};
