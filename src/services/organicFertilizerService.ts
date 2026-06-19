import { api } from "./axios";
import {
    OrganicFertilizerResponseDto,
    OrganicFertilizerCreateRequestDto,
    OrganicFertilizerPostRequestDto
} from "@/interfaces/Fertilizer";

import { ENDPOINT } from "@/constants/Endpoint";

export const fetchOrganicFertilizers = async (): Promise<OrganicFertilizerResponseDto[]> => {
    const { data } = await api.get(`${ENDPOINT.ORGANIC_FERTILIZER}/get-all`);
    return data;
};

export const fetchPublicOrganicFertilizers = async (): Promise<OrganicFertilizerResponseDto[]> => {
    const { data } = await api.get(`${ENDPOINT.ORGANIC_FERTILIZER}/get-all-public`);
    return data;
};

export const fetchDefaultOrganicFertilizers = async (): Promise<OrganicFertilizerResponseDto[]> => {
    const { data } = await api.get(`${ENDPOINT.ORGANIC_FERTILIZER}/get-all-default`);
    return data;
};

export const createOrganicFertilizer = async (payload: OrganicFertilizerCreateRequestDto): Promise<OrganicFertilizerResponseDto> => {
    const { data } = await api.post(`${ENDPOINT.ORGANIC_FERTILIZER}/register`, payload);
    return data;
};

export const updateOrganicFertilizer = async (
    id: number,
    payload: OrganicFertilizerPostRequestDto
): Promise<OrganicFertilizerResponseDto> => {
    const { data } = await api.put(`${ENDPOINT.ORGANIC_FERTILIZER}/update`, payload, {
        params: { organicFertilizerId: id }
    });
    return data;
};

export const deleteOrganicFertilizer = async (id: number): Promise<void> => {
    await api.delete(`${ENDPOINT.ORGANIC_FERTILIZER}/delete`, {
        params: { organicFertilizerId: id }
    });
};
