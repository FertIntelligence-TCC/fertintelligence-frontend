import { api } from "./axios";
import { 
    RangeExtractResponse, 
    RangeExtractCreatePayload, 
    RangeExtractUpdatePayload 
} from "../interfaces/RangeExtract";

const ENDPOINT = "/range-extract";

export const rangeExtractService = {
    
    // Cria um extrato de intervalo vinculado a uma Análise de Solo (analysisId)
    create: async (analysisId: number, payload: RangeExtractCreatePayload): Promise<RangeExtractResponse> => {
        const response = await api.post<RangeExtractResponse>(`${ENDPOINT}/register`, payload, {
            params: { analysisId }
        });
        return response.data;
    },

    getById: async (rangeExtractId: number): Promise<RangeExtractResponse> => {
        const response = await api.get<RangeExtractResponse>(`${ENDPOINT}/get-range-extract`, {
            params: { rangeExtractId }
        });
        return response.data;
    },

    // Busca todos os extratos de uma determinada análise
    getByAnalysisId: async (analysisId: number): Promise<RangeExtractResponse[]> => {
        const response = await api.get<RangeExtractResponse[]>(`${ENDPOINT}/get-by-analysis`, {
            params: { analysisId }
        });
        return response.data;
    },

    update: async (rangeExtractId: number, payload: RangeExtractUpdatePayload): Promise<RangeExtractResponse> => {
        const response = await api.put<RangeExtractResponse>(`${ENDPOINT}/update`, payload, {
            params: { rangeExtractId }
        });
        return response.data;
    },

    delete: async (rangeExtractId: number): Promise<void> => {
        await api.delete(`${ENDPOINT}/delete`, {
            params: { rangeExtractId }
        });
    }
};