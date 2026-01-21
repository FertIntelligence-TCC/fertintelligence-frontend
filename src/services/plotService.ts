import { api } from "./axios";
import { PlotResponse, PlotCreatePayload, PlotUpdatePayload } from "@/interfaces/Plot";

const ENDPOINT = "/plot";

export const getPlotsByProperty = async (propertyId: number): Promise<PlotResponse[]> => {
    const { data } = await api.get(`${ENDPOINT}/get-by-property`, {
        params: { propertyId }
    });
    return data;
};

export const createPlot = async (propertyId: number, payload: PlotCreatePayload): Promise<PlotResponse> => {
    const { data } = await api.post(`${ENDPOINT}/register`, payload, {
        params: { propertyId }
    });
    return data;
};

export const updatePlot = async (plotId: number, payload: PlotUpdatePayload): Promise<PlotResponse> => {
    const { data } = await api.put(`${ENDPOINT}/update`, payload, {
        params: { plotId }
    });
    return data;
};

export const deletePlot = async (plotId: number): Promise<void> => {
    await api.delete(`${ENDPOINT}/delete`, {
        params: { plotId }
    });
};