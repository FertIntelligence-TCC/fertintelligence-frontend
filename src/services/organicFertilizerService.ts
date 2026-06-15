import { api } from "./axios";
import {
    OrganicFertilizerResponseDto,
    OrganicFertilizerCreateRequestDto,
    OrganicFertilizerPostRequestDto
} from "@/interfaces/Fertilizer";

const ENDPOINT = "/organic-fertilizer";

export const fetchOrganicFertilizers = async (): Promise<OrganicFertilizerResponseDto[]> => {
    const { data } = await api.get(`${ENDPOINT}/get-all`);
    return data;
};

export const fetchPublicOrganicFertilizers = async (): Promise<OrganicFertilizerResponseDto[]> => {
    const { data } = await api.get(`${ENDPOINT}/get-all-public`);
    return data;
};

export const fetchDefaultOrganicFertilizers = async (): Promise<OrganicFertilizerResponseDto[]> => {
    const { data } = await api.get(`${ENDPOINT}/get-all-default`);
    return data;
};

export const createOrganicFertilizer = async (payload: OrganicFertilizerCreateRequestDto): Promise<OrganicFertilizerResponseDto> => {
    const { data } = await api.post(`${ENDPOINT}/register`, payload);
    return data;
};

export const updateOrganicFertilizer = async (
    id: number,
    payload: OrganicFertilizerPostRequestDto
): Promise<OrganicFertilizerResponseDto> => {
    const { data } = await api.put(`${ENDPOINT}/update`, payload, {
        params: { organicFertilizerId: id }
    });
    return data;
};

export const deleteOrganicFertilizer = async (id: number): Promise<void> => {
    await api.delete(`${ENDPOINT}/delete`, {
        params: { organicFertilizerId: id }
    });
};
