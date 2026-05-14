// src/services/simpleMineralFertilizerService.ts
import { api } from "./axios";
import { 
    SimpleMineralFertilizerResponseDto, 
    SimpleMineralFertilizerCreateRequestDto,
    SimpleMineralFertilizerPostRequestDto 
} from "@/interfaces/Fertilizer";

const ENDPOINT = "/simple-mineral-fertilizer";

export const fetchSimpleMineralFertilizers = async (): Promise<SimpleMineralFertilizerResponseDto[]> => {
    const { data } = await api.get(`${ENDPOINT}/get-all`);
    return data;
};

export const fetchPublicSimpleMineralFertilizers = async (): Promise<SimpleMineralFertilizerResponseDto[]> => {
    const { data } = await api.get(`${ENDPOINT}/get-all-public`);
    return data;
};

export const createSimpleMineralFertilizer = async (payload: SimpleMineralFertilizerCreateRequestDto): Promise<SimpleMineralFertilizerResponseDto> => {
    const { data } = await api.post(`${ENDPOINT}/register`, payload);
    return data;
};

export const updateSimpleMineralFertilizer = async (
    id: number, 
    payload: SimpleMineralFertilizerPostRequestDto 
): Promise<SimpleMineralFertilizerResponseDto> => {
    const { data } = await api.put(`${ENDPOINT}/update`, payload, { 
        params: { simpleMineralFertilizerId: id } 
    });
    return data;
};

export const deleteSimpleMineralFertilizer = async (id: number): Promise<void> => {
    await api.delete(`${ENDPOINT}/delete`, { 
        params: { simpleMineralFertilizerId: id } 
    });
};