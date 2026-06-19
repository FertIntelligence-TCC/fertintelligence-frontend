import { api } from "./axios";
import {
    MineralFertilizerResponseDto,
    MineralFertilizerCreateRequestDto,
    MineralFertilizerPostRequestDto
} from "@/interfaces/Fertilizer";

import { ENDPOINT } from "@/constants/Endpoint";

export const fetchMineralFertilizers = async (): Promise<MineralFertilizerResponseDto[]> => {
    const { data } = await api.get(`${ENDPOINT.MINERAL_FERTILIZER}/get-all`);
    return data;
};

export const fetchPublicMineralFertilizers = async (): Promise<MineralFertilizerResponseDto[]> => {
    const { data } = await api.get(`${ENDPOINT.MINERAL_FERTILIZER}/get-all-public`);
    return data;
};

export const fetchDefaultMineralFertilizers = async (): Promise<MineralFertilizerResponseDto[]> => {
    const { data } = await api.get(`${ENDPOINT.MINERAL_FERTILIZER}/get-all-default`);
    return data;
};

export const createMineralFertilizer = async (payload: MineralFertilizerCreateRequestDto): Promise<MineralFertilizerResponseDto> => {
    const { data } = await api.post(`${ENDPOINT.MINERAL_FERTILIZER}/register`, payload);
    return data;
};

export const updateMineralFertilizer = async (
    id: number,
    payload: MineralFertilizerPostRequestDto
): Promise<MineralFertilizerResponseDto> => {
    const { data } = await api.put(`${ENDPOINT.MINERAL_FERTILIZER}/update`, payload, {
        params: { mineralFertilizerId: id }
    });
    return data;
};

export const deleteMineralFertilizer = async (id: number): Promise<void> => {
    await api.delete(`${ENDPOINT.MINERAL_FERTILIZER}/delete`, {
        params: { mineralFertilizerId: id }
    });
};
