import { ENDPOINT } from "@/constants/Endpoint";
import { api } from "./axios";
import { 
    PhysicalAnalysisExtractResponse, 
    PhysicalAnalysisExtractCreatePayload, 
    PhysicalAnalysisExtractUpdatePayload 
} from "../interfaces/PhysicalAnalysisExtract";


export const physicalAnalysisExtractService = {
    
    /**
     * Cria os dados de análise física.
     * Deve fornecer 'rangeExtractId' OU 'layerExtractId'. O outro deve ser undefined/null.
     */
    create: async (
        payload: PhysicalAnalysisExtractCreatePayload,
        rangeExtractId?: number, 
        layerExtractId?: number
    ): Promise<PhysicalAnalysisExtractResponse> => {
        const params: any = {};
        if (rangeExtractId) params.rangeExtractId = rangeExtractId;
        if (layerExtractId) params.layerExtractId = layerExtractId;

        const response = await api.post<PhysicalAnalysisExtractResponse>(
            ENDPOINT.CREATE_PHYSICAL_ANALYSIS_EXTRACT, 
            payload, 
            { params }
        );
        return response.data;
    },

    getById: async (physicalAnalysisExtractId: number): Promise<PhysicalAnalysisExtractResponse> => {
        const response = await api.get<PhysicalAnalysisExtractResponse>(ENDPOINT.GET_PHYSICAL_ANALYSIS_EXTRACT, {
            params: { physicalAnalysisExtractId }
        });
        return response.data;
    },

    // Busca dados físicos associados a um Extrato de Intervalo (Faixa)
    getByRangeExtractId: async (rangeExtractId: number): Promise<PhysicalAnalysisExtractResponse[]> => {
        const response = await api.get<PhysicalAnalysisExtractResponse[]>(ENDPOINT.GET_BY_RANGE_PHYSICAL_ANALYSIS_EXTRACT, {
            params: { rangeExtractId }
        });
        return response.data;
    },

    // Busca dados físicos associados a um Extrato de Camada
    getByLayerExtractId: async (layerExtractId: number): Promise<PhysicalAnalysisExtractResponse[]> => {
        const response = await api.get<PhysicalAnalysisExtractResponse[]>(ENDPOINT.GET_BY_LAYER_PHYSICAL_ANALYSIS_EXTRACT, {
            params: { layerExtractId }
        });
        return response.data;
    },

    update: async (
        physicalAnalysisExtractId: number, 
        payload: PhysicalAnalysisExtractUpdatePayload
    ): Promise<PhysicalAnalysisExtractResponse> => {
        const response = await api.put<PhysicalAnalysisExtractResponse>(ENDPOINT.UPDATE_PHYSICAL_ANALYSIS_EXTRACT, payload, {
            params: { physicalAnalysisExtractId }
        });
        return response.data;
    },

    delete: async (physicalAnalysisExtractId: number): Promise<void> => {
        await api.delete(ENDPOINT.DELETE_PHYSICAL_ANALYSIS_EXTRACT, {
            params: { physicalAnalysisExtractId }
        });
    }
};
