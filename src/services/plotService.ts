import { ENDPOINT } from "@/constants/Endpoint";
import { api } from "./axios";
import { PlotResponse, PlotCreatePayload, PlotUpdatePayload } from "@/interfaces/Plot";


export const getPlotsByProperty = async (propertyId: number): Promise<PlotResponse[]> => {
    const { data } = await api.get(ENDPOINT.GET_BY_PROPERTY_PLOT, {
        params: { propertyId }
    });
    return data;
};

export const createPlot = async (propertyId: number, payload: PlotCreatePayload): Promise<PlotResponse> => {
    const { data } = await api.post(ENDPOINT.CREATE_PLOT, payload, {
        params: { propertyId }
    });
    return data;
};

export const getPlotById = async (plotId: number): Promise<PlotResponse> => {
    const response = await api.get<PlotResponse>(ENDPOINT.GET_PLOT, {
        params: { plotId }
    });
    return response.data;
};

export const updatePlot = async (plotId: number, payload: PlotUpdatePayload): Promise<PlotResponse> => {
    const { data } = await api.put(ENDPOINT.UPDATE_PLOT, payload, {
        params: { plotId }
    });
    return data;
};

export const deletePlot = async (plotId: number): Promise<void> => {
    await api.delete(ENDPOINT.DELETE_PLOT, {
        params: { plotId }
    });
};
