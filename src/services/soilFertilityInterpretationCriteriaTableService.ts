import { api } from "./axios";
import { 
    SoilFertilityTableResponseDto, 
    SoilFertilityTableCreateRequestDto, 
    SoilFertilityTablePostRequestDto 
} from "@/interfaces/SoilFertilityInterpretationCriteriaTable";

const ENDPOINT = "/soil-fertility-interpretation-criteria-table"; 

export const fetchSoilFertilityTables = async (): Promise<SoilFertilityTableResponseDto[]> => {
    const { data } = await api.get(`${ENDPOINT}/get-all`);
    return Array.isArray(data) ? data : [];
};

export const createSoilFertilityTable = async (payload: SoilFertilityTableCreateRequestDto): Promise<SoilFertilityTableResponseDto> => {
    const { data } = await api.post(`${ENDPOINT}/register`, payload);
    return data;
};

export const updateSoilFertilityTable = async (
    id: number, 
    payload: SoilFertilityTablePostRequestDto 
): Promise<SoilFertilityTableResponseDto> => {
    const { data } = await api.put(`${ENDPOINT}/update`, payload, { 
        params: { tableId: id } 
    });
    return data;
};

export const deleteSoilFertilityTable = async (id: number): Promise<void> => {
    await api.delete(`${ENDPOINT}/delete`, { 
        params: { tableId: id } 
    });
};

export const fetchPublicSoilFertilityTables = async (): Promise<SoilFertilityTableResponseDto[]> => {
    const { data } = await api.get(`${ENDPOINT}/get-all-public`);
    return Array.isArray(data) ? data : [];
};

export const fetchDefaultSoilFertilityTables = async (): Promise<SoilFertilityTableResponseDto[]> => {
    const { data } = await api.get(`${ENDPOINT}/get-all-default`);
    return Array.isArray(data) ? data : [];
};
