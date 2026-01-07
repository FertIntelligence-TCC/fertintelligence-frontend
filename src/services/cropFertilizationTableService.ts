// src/services/cropFertilizationTableService.ts
import { api } from "./axios"; // Assumindo que você já tem uma instância axios configurada
import { CropFertilizationTableCreateRequestDto, CropFertilizationTableResponseDto } from "../interfaces/CropFertilizationTable";

const ENDPOINT = "/crop-fertilization-tables"; // Verifique a rota exata no Controller

export const fetchCropFertilizationTables = async (): Promise<CropFertilizationTableResponseDto[]> => {
    const { data } = await api.get(ENDPOINT);
    return data;
};

export const fetchCropFertilizationTableById = async (id: number): Promise<CropFertilizationTableResponseDto> => {
    const { data } = await api.get(`${ENDPOINT}/${id}`);
    return data;
};

export const createCropFertilizationTable = async (payload: CropFertilizationTableCreateRequestDto): Promise<CropFertilizationTableResponseDto> => {
    const { data } = await api.post(ENDPOINT, payload);
    return data;
};

export const updateCropFertilizationTable = async ({ id, payload }: { id: number; payload: CropFertilizationTableCreateRequestDto }): Promise<CropFertilizationTableResponseDto> => {
    const { data } = await api.put(`${ENDPOINT}/${id}`, payload);
    return data;
};

export const deleteCropFertilizationTable = async (id: number): Promise<void> => {
    await api.delete(`${ENDPOINT}/${id}`);
};