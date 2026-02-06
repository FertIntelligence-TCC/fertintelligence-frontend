import { api } from "./axios";
import { 
    SoilAnalysisResponse, 
    SoilAnalysisCreatePayload, 
    SoilAnalysisUpdatePayload 
} from "../interfaces/SoilAnalysis";

const ENDPOINT = "/soil-analysis";

export const soilAnalysisService = {
    
    create: async (payload: SoilAnalysisCreatePayload): Promise<SoilAnalysisResponse> => {
        const response = await api.post<SoilAnalysisResponse>(`${ENDPOINT}/register`, payload);
        return response.data;
    },

    getById: async (analysisId: number): Promise<SoilAnalysisResponse> => {
        const response = await api.get<SoilAnalysisResponse>(`${ENDPOINT}/get-soil-analysis`, {
            params: { analysisId }
        });
        return response.data;
    },

    getByPlotId: async (plotId: number | string): Promise<SoilAnalysisResponse[]> => {
        const response = await api.get<SoilAnalysisResponse[]>(`${ENDPOINT}/get-by-plot`, {
            params: { plotId }
        });
        return response.data;
    },

    update: async (analysisId: number, payload: SoilAnalysisUpdatePayload): Promise<SoilAnalysisResponse> => {
        const response = await api.put<SoilAnalysisResponse>(`${ENDPOINT}/update`, payload, {
            params: { analysisId }
        });
        return response.data;
    },

    delete: async (analysisId: number): Promise<void> => {
        await api.delete(`${ENDPOINT}/delete`, {
            params: { analysisId }
        });
    }
};