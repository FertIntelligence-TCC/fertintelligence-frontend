import { api } from "./axios";
import {
    SoilAnalysisResponse,
    SoilAnalysisCreatePayload,
    SoilAnalysisUpdatePayload
} from "../interfaces/SoilAnalysis";

import { ENDPOINT } from "@/constants/Endpoint";

export const soilAnalysisService = {

    create: async (payload: SoilAnalysisCreatePayload): Promise<SoilAnalysisResponse> => {
        const response = await api.post<SoilAnalysisResponse>(`${ENDPOINT.SOIL_ANALYSIS}/register`, payload);
        return response.data;
    },

    getById: async (analysisId: number): Promise<SoilAnalysisResponse> => {
        const response = await api.get<SoilAnalysisResponse>(`${ENDPOINT.SOIL_ANALYSIS}/get-soil-analysis`, {
            params: { analysisId }
        });
        return response.data;
    },

    getByPlotId: async (plotId: number | string): Promise<SoilAnalysisResponse[]> => {
        const response = await api.get<SoilAnalysisResponse[]>(`${ENDPOINT.SOIL_ANALYSIS}/get-by-plot`, {
            params: { plotId }
        });
        return response.data;
    },

    update: async (analysisId: number, payload: SoilAnalysisUpdatePayload): Promise<SoilAnalysisResponse> => {
        const response = await api.put<SoilAnalysisResponse>(`${ENDPOINT.SOIL_ANALYSIS}/update`, payload, {
            params: { analysisId }
        });
        return response.data;
    },

    delete: async (analysisId: number): Promise<void> => {
        await api.delete(`${ENDPOINT.SOIL_ANALYSIS}/delete`, {
            params: { analysisId }
        });
    }
};
