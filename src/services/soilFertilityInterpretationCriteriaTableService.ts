import { api } from "./axios";
import {
    SoilFertilityTableResponseDto,
    SoilFertilityTableCreateRequestDto,
    SoilFertilityTablePostRequestDto
} from "@/interfaces/SoilFertilityInterpretationCriteriaTable";

import { ENDPOINT } from "@/constants/Endpoint";

export const fetchSoilFertilityTables = async (): Promise<SoilFertilityTableResponseDto[]> => {
    const { data } = await api.get(`${ENDPOINT.SOIL_FERTILITY_INTERPRETATION_CRITERIA_TABLE}/get-all`, { params: { grupo: "MINHAS" } });
    return data;
};

export const createSoilFertilityTable = async (payload: SoilFertilityTableCreateRequestDto): Promise<SoilFertilityTableResponseDto> => {
    const { data } = await api.post(`${ENDPOINT.SOIL_FERTILITY_INTERPRETATION_CRITERIA_TABLE}/register`, payload);
    return data;
};

export const updateSoilFertilityTable = async (
    id: number,
    payload: SoilFertilityTablePostRequestDto
): Promise<SoilFertilityTableResponseDto> => {
    const { data } = await api.put(`${ENDPOINT.SOIL_FERTILITY_INTERPRETATION_CRITERIA_TABLE}/update`, payload, {
        params: { tableId: id }
    });
    return data;
};

export const deleteSoilFertilityTable = async (id: number): Promise<void> => {
    await api.delete(`${ENDPOINT.SOIL_FERTILITY_INTERPRETATION_CRITERIA_TABLE}/delete`, {
        params: { tableId: id }
    });
};

export const fetchPublicSoilFertilityTables = async (): Promise<SoilFertilityTableResponseDto[]> => {
    const { data } = await api.get(`${ENDPOINT.SOIL_FERTILITY_INTERPRETATION_CRITERIA_TABLE}/get-all-public`);
    return data;
};

export const fetchDefaultSoilFertilityTables = async (): Promise<SoilFertilityTableResponseDto[]> => {
    const { data } = await api.get(`${ENDPOINT.SOIL_FERTILITY_INTERPRETATION_CRITERIA_TABLE}/get-all-default`);
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data.content && Array.isArray(data.content)) return data.content;
    // Fallback: se for objeto com chave 'data' (padrão de algumas APIs)
    if (data.data && Array.isArray(data.data)) return data.data;
    return [];
};
