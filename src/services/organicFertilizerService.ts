import { ENDPOINT } from "@/constants/Endpoint";
import { api } from "./axios";
import {
    OrganicFertilizerResponseDto,
    OrganicFertilizerCreateRequestDto,
    OrganicFertilizerPostRequestDto
} from "@/interfaces/Fertilizer";


export const fetchOrganicFertilizers = async (): Promise<OrganicFertilizerResponseDto[]> => {
    const { data } = await api.get(ENDPOINT.GET_ALL_ORGANIC_FERTILIZER);
    return data;
};

export const fetchPublicOrganicFertilizers = async (): Promise<OrganicFertilizerResponseDto[]> => {
    const { data } = await api.get(ENDPOINT.GET_ALL_PUBLIC_ORGANIC_FERTILIZER);
    return data;
};

export const fetchDefaultOrganicFertilizers = async (): Promise<OrganicFertilizerResponseDto[]> => {
    const { data } = await api.get(ENDPOINT.GET_ALL_DEFAULT_ORGANIC_FERTILIZER);
    return data;
};

export const createOrganicFertilizer = async (payload: OrganicFertilizerCreateRequestDto): Promise<OrganicFertilizerResponseDto> => {
    const { data } = await api.post(ENDPOINT.CREATE_ORGANIC_FERTILIZER, payload);
    return data;
};

export const updateOrganicFertilizer = async (
    id: number,
    payload: OrganicFertilizerPostRequestDto
): Promise<OrganicFertilizerResponseDto> => {
    const { data } = await api.put(ENDPOINT.UPDATE_ORGANIC_FERTILIZER, payload, {
        params: { organicFertilizerId: id }
    });
    return data;
};

export const deleteOrganicFertilizer = async (id: number): Promise<void> => {
    await api.delete(ENDPOINT.DELETE_ORGANIC_FERTILIZER, {
        params: { organicFertilizerId: id }
    });
};
