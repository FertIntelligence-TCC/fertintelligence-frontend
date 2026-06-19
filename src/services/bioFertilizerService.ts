import { api } from "./axios";
import {
    BioFertilizerResponseDto,
    BioFertilizerCreateRequestDto,
    BioFertilizerPostRequestDto
} from "@/interfaces/Fertilizer";

import { ENDPOINT } from "@/constants/Endpoint";
// Ajuste o endpoint base conforme o seu Controller Java (@RequestMapping)

export const fetchBioFertilizers = async (): Promise<BioFertilizerResponseDto[]> => {
    const { data } = await api.get(`${ENDPOINT.BIO_FERTILIZER}/get-all`);
    return data;
};

export const fetchPublicBioFertilizers = async (): Promise<BioFertilizerResponseDto[]> => {
    const { data } = await api.get(`${ENDPOINT.BIO_FERTILIZER}/get-all-public`);
    return data;
};

export const fetchDefaultBioFertilizers = async (): Promise<BioFertilizerResponseDto[]> => {
    const { data } = await api.get(`${ENDPOINT.BIO_FERTILIZER}/get-all-default`);
    return data;
};

export const createBioFertilizer = async (payload: BioFertilizerCreateRequestDto): Promise<BioFertilizerResponseDto> => {
    const { data } = await api.post(`${ENDPOINT.BIO_FERTILIZER}/register`, payload);
    return data;
};

export const updateBioFertilizer = async (
    id: number,
    payload: BioFertilizerPostRequestDto
): Promise<BioFertilizerResponseDto> => {
    const { data } = await api.put(`${ENDPOINT.BIO_FERTILIZER}/update`, payload, {
        params: { bioFertilizerId: id }
    });
    return data;
};

export const deleteBioFertilizer = async (id: number): Promise<void> => {
    await api.delete(`${ENDPOINT.BIO_FERTILIZER}/delete`, {
        params: { bioFertilizerId: id }
    });
};
