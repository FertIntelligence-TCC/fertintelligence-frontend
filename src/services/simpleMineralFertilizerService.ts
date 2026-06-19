// src/services/simpleMineralFertilizerService.ts
import { ENDPOINT } from "@/constants/Endpoint";
import { api } from "./axios";
import { 
    SimpleMineralFertilizerResponseDto, 
    SimpleMineralFertilizerCreateRequestDto,
    SimpleMineralFertilizerPostRequestDto 
} from "@/interfaces/Fertilizer";


export const fetchSimpleMineralFertilizers = async (): Promise<SimpleMineralFertilizerResponseDto[]> => {
    const { data } = await api.get(ENDPOINT.GET_ALL_SIMPLE_MINERAL_FERTILIZER);
    return data;
};

export const fetchPublicSimpleMineralFertilizers = async (): Promise<SimpleMineralFertilizerResponseDto[]> => {
    const { data } = await api.get(ENDPOINT.GET_ALL_PUBLIC_SIMPLE_MINERAL_FERTILIZER);
    return data;
};

export const fetchDefaultSimpleMineralFertilizers = async (): Promise<SimpleMineralFertilizerResponseDto[]> => {
    const { data } = await api.get(ENDPOINT.GET_ALL_DEFAULT_SIMPLE_MINERAL_FERTILIZER);
    return data;
};

export const createSimpleMineralFertilizer = async (payload: SimpleMineralFertilizerCreateRequestDto): Promise<SimpleMineralFertilizerResponseDto> => {
    const { data } = await api.post(ENDPOINT.CREATE_SIMPLE_MINERAL_FERTILIZER, payload);
    return data;
};

export const updateSimpleMineralFertilizer = async (
    id: number, 
    payload: SimpleMineralFertilizerPostRequestDto 
): Promise<SimpleMineralFertilizerResponseDto> => {
    const { data } = await api.put(ENDPOINT.UPDATE_SIMPLE_MINERAL_FERTILIZER, payload, { 
        params: { simpleMineralFertilizerId: id } 
    });
    return data;
};

export const deleteSimpleMineralFertilizer = async (id: number): Promise<void> => {
    await api.delete(ENDPOINT.DELETE_SIMPLE_MINERAL_FERTILIZER, { 
        params: { simpleMineralFertilizerId: id } 
    });
};
