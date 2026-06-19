import { ENDPOINT } from "@/constants/Endpoint";
import { api } from "./axios";
import { 
    SoilFertilityTableResponseDto, 
    SoilFertilityTableCreateRequestDto, 
    SoilFertilityTablePostRequestDto 
} from "@/interfaces/SoilFertilityInterpretationCriteriaTable";


export const fetchSoilFertilityTables = async (): Promise<SoilFertilityTableResponseDto[]> => {
    const { data } = await api.get(ENDPOINT.GET_ALL_SOIL_FERTILITY_INTERPRETATION_CRITERIA_TABLE, { params: { grupo: "MINHAS" } });
    return data;
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
    return data;
};

export const fetchDefaultSoilFertilityTables = async (): Promise<SoilFertilityTableResponseDto[]> => {
    const { data } = await api.get(ENDPOINT.GET_ALL_DEFAULT_SOIL_FERTILITY_INTERPRETATION_CRITERIA_TABLE);
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data.content && Array.isArray(data.content)) return data.content;
    // Fallback: se for objeto com chave 'data' (padrão de algumas APIs)
    if (data.data && Array.isArray(data.data)) return data.data;
    return [];
};
