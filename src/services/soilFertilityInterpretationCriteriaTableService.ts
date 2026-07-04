import { ENDPOINT } from "@/constants/Endpoint";
import { api } from "./axios";
import { 
    SoilFertilityTableResponseDto, 
    SoilFertilityTableCreateRequestDto, 
    SoilFertilityTablePostRequestDto 
} from "@/interfaces/SoilFertilityInterpretationCriteriaTable";

const normalizeSoilFertilityTables = (data: unknown): SoilFertilityTableResponseDto[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data !== "object") return [];

    const payload = data as { content?: unknown; data?: unknown };
    if (Array.isArray(payload.content)) return payload.content as SoilFertilityTableResponseDto[];
    if (Array.isArray(payload.data)) return payload.data as SoilFertilityTableResponseDto[];
    return [];
};

export const fetchSoilFertilityTables = async (): Promise<SoilFertilityTableResponseDto[]> => {
    const { data } = await api.get(ENDPOINT.GET_ALL_SOIL_FERTILITY_INTERPRETATION_CRITERIA_TABLE, { params: { grupo: "MINHAS" } });
    return normalizeSoilFertilityTables(data);
};

export const createSoilFertilityTable = async (payload: SoilFertilityTableCreateRequestDto): Promise<SoilFertilityTableResponseDto> => {
    const { data } = await api.post(ENDPOINT.CREATE_SOIL_FERTILITY_INTERPRETATION_CRITERIA_TABLE, payload);
    return data;
};

export const updateSoilFertilityTable = async (
    id: number, 
    payload: SoilFertilityTablePostRequestDto 
): Promise<SoilFertilityTableResponseDto> => {
    const { data } = await api.put(ENDPOINT.UPDATE_SOIL_FERTILITY_INTERPRETATION_CRITERIA_TABLE, payload, { 
        params: { tableId: id } 
    });
    return data;
};

export const deleteSoilFertilityTable = async (id: number): Promise<void> => {
    await api.delete(ENDPOINT.DELETE_SOIL_FERTILITY_INTERPRETATION_CRITERIA_TABLE, { 
        params: { tableId: id } 
    });
};

export const fetchPublicSoilFertilityTables = async (): Promise<SoilFertilityTableResponseDto[]> => {
    const { data } = await api.get(ENDPOINT.GET_ALL_PUBLIC_SOIL_FERTILITY_INTERPRETATION_CRITERIA_TABLE);
    return normalizeSoilFertilityTables(data);
};

export const fetchDefaultSoilFertilityTables = async (): Promise<SoilFertilityTableResponseDto[]> => {
    const { data } = await api.get(ENDPOINT.GET_ALL_DEFAULT_SOIL_FERTILITY_INTERPRETATION_CRITERIA_TABLE);
    return normalizeSoilFertilityTables(data);
};
