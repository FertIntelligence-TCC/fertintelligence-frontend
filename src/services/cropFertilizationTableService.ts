// src/services/cropFertilizationTableService.ts
import { api } from "./axios"; // Assumindo que você já tem uma instância axios configurada
import { CropFertilizationTableCreateRequestDto, CropFertilizationTableResponseDto } from "../interfaces/CropFertilizationTable";

const ENDPOINT = "/crop-fertilization-table"; 

export const fetchCropFertilizationTables = async (): Promise<CropFertilizationTableResponseDto[]> => {
    const { data } = await api.get(`${ENDPOINT}/get-all`, { params: { grupo: "MINHAS" } }); 
    return data;
};

export const createCropFertilizationTable = async (payload: CropFertilizationTableCreateRequestDto): Promise<CropFertilizationTableResponseDto> => {
    const { data } = await api.post(`${ENDPOINT}/register`, payload);
    return data;
};

export const updateCropFertilizationTable = async ({
    id,
    payload,
}: {
    id: number;
    payload: CropFertilizationTableCreateRequestDto;
}): Promise<CropFertilizationTableResponseDto> => {
    const { data } = await api.put(`${ENDPOINT}/update`, payload, {
        params: { tableId: id },
    });
    return data;
};

export const deleteCropFertilizationTable = async (id: number): Promise<void> => {
    await api.delete(`${ENDPOINT}/delete`, { params: { tableId: id } });
};

export const fetchPublicCropFertilizationTables = async (): Promise<CropFertilizationTableResponseDto[]> => {
    const { data } = await api.get(`${ENDPOINT}/get-all-public`);
    return data;
};

export const fetchDefaultCropFertilizationTables = async (): Promise<CropFertilizationTableResponseDto[]> => {
    const { data } = await api.get(`${ENDPOINT}/get-all-default`);
    return data;
};
