import { ENDPOINT } from "@/constants/Endpoint";
import { api } from "./axios";
import { 
    RangeExtractResponse, 
    RangeExtractCreatePayload, 
    RangeExtractUpdatePayload 
} from "../interfaces/RangeExtract";


export const rangeExtractService = {
    
    // Cria um extrato de intervalo vinculado a uma Análise de Solo (analysisId)
    create: async (analysisId: number, payload: RangeExtractCreatePayload): Promise<RangeExtractResponse> => {
        const response = await api.post<RangeExtractResponse>(ENDPOINT.CREATE_RANGE_EXTRACT, payload, {
            params: { analysisId }
        });
        return response.data;
    },

    getById: async (rangeExtractId: number): Promise<RangeExtractResponse> => {
        const response = await api.get<RangeExtractResponse>(ENDPOINT.GET_RANGE_EXTRACT_RANGE_EXTRACT, {
            params: { rangeExtractId }
        });
        return response.data;
    },

    // Busca todos os extratos de uma determinada análise
    getByAnalysisId: async (analysisId: number): Promise<RangeExtractResponse[]> => {
        const response = await api.get<RangeExtractResponse[]>(ENDPOINT.GET_BY_ANALYSIS_RANGE_EXTRACT, {
            params: { analysisId }
        });
        return response.data;
    },

    update: async (rangeExtractId: number, payload: RangeExtractUpdatePayload): Promise<RangeExtractResponse> => {
        const response = await api.put<RangeExtractResponse>(ENDPOINT.UPDATE_RANGE_EXTRACT, payload, {
            params: { rangeExtractId }
        });
        return response.data;
    },

    delete: async (rangeExtractId: number): Promise<void> => {
        await api.delete(ENDPOINT.DELETE_RANGE_EXTRACT, {
            params: { rangeExtractId }
        });
    }
};
