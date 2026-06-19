import { api } from "./axios";
import { PlotResponse, PlotCreatePayload, PlotUpdatePayload } from "@/interfaces/Plot";

import { ENDPOINT } from "@/constants/Endpoint";

export const getPlotsByProperty = async (propertyId: number): Promise<PlotResponse[]> => {
    const { data } = await api.get(`${ENDPOINT.PLOT}/get-by-property`, {
        params: { propertyId }
    });
    return data;
};

export const createPlot = async (propertyId: number, payload: PlotCreatePayload): Promise<PlotResponse> => {
    const { data } = await api.post(`${ENDPOINT.PLOT}/register`, payload, {
        params: { propertyId }
    });
    return data;
};

export const getPlotById = async (plotId: number): Promise<PlotResponse> => {
    const response = await api.get<PlotResponse>(`${ENDPOINT.PLOT}/get`, {
        params: { plotId }
    });
    return response.data;
};

export const updatePlot = async (plotId: number, payload: PlotUpdatePayload): Promise<PlotResponse> => {
    const { data } = await api.put(`${ENDPOINT.PLOT}/update`, payload, {
        params: { plotId }
    });
    return data;
};

export const deletePlot = async (plotId: number): Promise<void> => {
    await api.delete(`${ENDPOINT.PLOT}/delete`, {
        params: { plotId }
    });
};
