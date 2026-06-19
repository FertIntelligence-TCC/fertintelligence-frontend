import { api } from "./axios";
import {
    FormulatedMineralFertilizerResponseDto,
    FormulatedMineralFertilizerCreateRequestDto,
    FormulatedMineralFertilizerPostRequestDto
} from "@/interfaces/Fertilizer";

import { ENDPOINT } from "@/constants/Endpoint";

export const fetchFormulatedFertilizers = async (): Promise<FormulatedMineralFertilizerResponseDto[]> => {
    const { data } = await api.get(`${ENDPOINT.FORMULATED_MINERAL_FERTILIZER}/get-all`);
    return data;
};

export const fetchPublicFormulatedFertilizers = async (): Promise<FormulatedMineralFertilizerResponseDto[]> => {
    const { data } = await api.get(`${ENDPOINT.FORMULATED_MINERAL_FERTILIZER}/get-all-public`);
    return data;
};

export const fetchDefaultFormulatedFertilizers = async (): Promise<FormulatedMineralFertilizerResponseDto[]> => {
    const { data } = await api.get(`${ENDPOINT.FORMULATED_MINERAL_FERTILIZER}/get-all-default`);
    return data;
};

export const createFormulatedFertilizer = async (payload: FormulatedMineralFertilizerCreateRequestDto): Promise<FormulatedMineralFertilizerResponseDto> => {
    const { data } = await api.post(`${ENDPOINT.FORMULATED_MINERAL_FERTILIZER}/register`, payload);
    return data;
};

export const updateFormulatedFertilizer = async (
    id: number,
    payload: FormulatedMineralFertilizerPostRequestDto
): Promise<FormulatedMineralFertilizerResponseDto> => {
    const { data } = await api.put(`${ENDPOINT.FORMULATED_MINERAL_FERTILIZER}/update`, payload, {
        params: { formulatedMineralFertilizerId: id }
    });
    return data;
};

export const deleteFormulatedFertilizer = async (id: number): Promise<void> => {
    await api.delete(`${ENDPOINT.FORMULATED_MINERAL_FERTILIZER}/delete`, {
        params: { formulatedMineralFertilizerId: id }
    });
};
