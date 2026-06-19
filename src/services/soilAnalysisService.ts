import { ENDPOINT } from "@/constants/Endpoint";
import { api } from "./axios";
import { 
    SoilAnalysisResponse, 
    SoilAnalysisCreatePayload, 
    SoilAnalysisUpdatePayload 
} from "../interfaces/SoilAnalysis";


export const soilAnalysisService = {
    
    create: async (payload: SoilAnalysisCreatePayload): Promise<SoilAnalysisResponse> => {
        const response = await api.post<SoilAnalysisResponse>(ENDPOINT.CREATE_SOIL_ANALYSIS, payload);
        return response.data;
    },

    getById: async (analysisId: number): Promise<SoilAnalysisResponse> => {
        const response = await api.get<SoilAnalysisResponse>(ENDPOINT.GET_SOIL_ANALYSIS_SOIL_ANALYSIS, {
            params: { analysisId }
        });
        return response.data;
    },

    getByPlotId: async (plotId: number | string): Promise<SoilAnalysisResponse[]> => {
        const response = await api.get<SoilAnalysisResponse[]>(ENDPOINT.GET_BY_PLOT_SOIL_ANALYSIS, {
            params: { plotId }
        });
        return response.data;
    },

    update: async (analysisId: number, payload: SoilAnalysisUpdatePayload): Promise<SoilAnalysisResponse> => {
        const response = await api.put<SoilAnalysisResponse>(ENDPOINT.UPDATE_SOIL_ANALYSIS, payload, {
            params: { analysisId }
        });
        return response.data;
    },

    delete: async (analysisId: number): Promise<void> => {
        await api.delete(ENDPOINT.DELETE_SOIL_ANALYSIS, {
            params: { analysisId }
        });
    }
};
