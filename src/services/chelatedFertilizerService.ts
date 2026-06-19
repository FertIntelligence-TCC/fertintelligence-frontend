import { api } from "./axios";
import {
    ChelatedFertilizerResponseDto,
    ChelatedFertilizerCreateRequestDto,
    ChelatedFertilizerPostRequestDto
} from "@/interfaces/Fertilizer";

import { ENDPOINT } from "@/constants/Endpoint";
// Ajuste o endpoint base conforme o seu Controller Java (@RequestMapping)

export const fetchChelatedFertilizers = async (): Promise<ChelatedFertilizerResponseDto[]> => {
    const { data } = await api.get(`${ENDPOINT.CHELATED_FERTILIZER}/get-all`);
    return data;
};

export const fetchPublicChelatedFertilizers = async (): Promise<ChelatedFertilizerResponseDto[]> => {
    const { data } = await api.get(`${ENDPOINT.CHELATED_FERTILIZER}/get-all-public`);
    return data;
};

export const fetchDefaultChelatedFertilizers = async (): Promise<ChelatedFertilizerResponseDto[]> => {
    const { data } = await api.get(`${ENDPOINT.CHELATED_FERTILIZER}/get-all-default`);
    return data;
};

export const createChelatedFertilizer = async (payload: ChelatedFertilizerCreateRequestDto): Promise<ChelatedFertilizerResponseDto> => {
    const { data } = await api.post(`${ENDPOINT.CHELATED_FERTILIZER}/register`, payload);
    return data;
};

export const updateChelatedFertilizer = async (
    id: number,
    payload: ChelatedFertilizerPostRequestDto
): Promise<ChelatedFertilizerResponseDto> => {
    const { data } = await api.put(`${ENDPOINT.CHELATED_FERTILIZER}/update`, payload, {
        params: { chelatedFertilizerId: id }
    });
    return data;
};

export const deleteChelatedFertilizer = async (id: number): Promise<void> => {
    await api.delete(`${ENDPOINT.CHELATED_FERTILIZER}/delete`, {
        params: { chelatedFertilizerId: id }
    });
};
