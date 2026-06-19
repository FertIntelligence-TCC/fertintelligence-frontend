// src/services/simpleMineralFertilizerService.ts
import { api } from "./axios";
import {
    SimpleMineralFertilizerResponseDto,
    SimpleMineralFertilizerCreateRequestDto,
    SimpleMineralFertilizerPostRequestDto
} from "@/interfaces/Fertilizer";

import { ENDPOINT } from "@/constants/Endpoint";

export const fetchSimpleMineralFertilizers = async (): Promise<SimpleMineralFertilizerResponseDto[]> => {
    const { data } = await api.get(`${ENDPOINT.SIMPLE_MINERAL_FERTILIZER}/get-all`);
    return data;
};

export const fetchPublicSimpleMineralFertilizers = async (): Promise<SimpleMineralFertilizerResponseDto[]> => {
    const { data } = await api.get(`${ENDPOINT.SIMPLE_MINERAL_FERTILIZER}/get-all-public`);
    return data;
};

export const fetchDefaultSimpleMineralFertilizers = async (): Promise<SimpleMineralFertilizerResponseDto[]> => {
    const { data } = await api.get(`${ENDPOINT.SIMPLE_MINERAL_FERTILIZER}/get-all-default`);
    return data;
};

export const createSimpleMineralFertilizer = async (payload: SimpleMineralFertilizerCreateRequestDto): Promise<SimpleMineralFertilizerResponseDto> => {
    const { data } = await api.post(`${ENDPOINT.SIMPLE_MINERAL_FERTILIZER}/register`, payload);
    return data;
};

export const updateSimpleMineralFertilizer = async (
    id: number,
    payload: SimpleMineralFertilizerPostRequestDto
): Promise<SimpleMineralFertilizerResponseDto> => {
    const { data } = await api.put(`${ENDPOINT.SIMPLE_MINERAL_FERTILIZER}/update`, payload, {
        params: { simpleMineralFertilizerId: id }
    });
    return data;
};

export const deleteSimpleMineralFertilizer = async (id: number): Promise<void> => {
    await api.delete(`${ENDPOINT.SIMPLE_MINERAL_FERTILIZER}/delete`, {
        params: { simpleMineralFertilizerId: id }
    });
};
