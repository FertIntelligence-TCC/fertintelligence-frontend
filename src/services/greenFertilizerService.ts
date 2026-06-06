import { api } from "./axios";
import { 
    GreenFertilizerResponseDto, 
    GreenFertilizerCreateRequestDto,
    GreenFertilizerPostRequestDto 
} from "@/interfaces/Fertilizer";

// Ajuste o endpoint base conforme o seu Controller Java (@RequestMapping)
const ENDPOINT = "/green-fertilizer"; 

export const fetchGreenFertilizers = async (): Promise<GreenFertilizerResponseDto[]> => {
    const { data } = await api.get(`${ENDPOINT}/get-all`);
    return data;
};

export const fetchPublicGreenFertilizers = async (): Promise<GreenFertilizerResponseDto[]> => {
    const { data } = await api.get(`${ENDPOINT}/get-all-public`);
    return data;
};

export const fetchDefaultGreenFertilizers = async (): Promise<GreenFertilizerResponseDto[]> => {
    const { data } = await api.get(`${ENDPOINT}/get-all-default`);
    return data;
};

export const createGreenFertilizer = async (payload: GreenFertilizerCreateRequestDto): Promise<GreenFertilizerResponseDto> => {
    const { data } = await api.post(`${ENDPOINT}/register`, payload);
    return data;
};

export const updateGreenFertilizer = async (
    id: number, 
    payload: GreenFertilizerPostRequestDto 
): Promise<GreenFertilizerResponseDto> => {
    const { data } = await api.put(`${ENDPOINT}/update`, payload, { 
        params: { greenFertilizerId: id } 
    });
    return data;
};

export const deleteGreenFertilizer = async (id: number): Promise<void> => {
    await api.delete(`${ENDPOINT}/delete`, { 
        params: { greenFertilizerId: id } 
    });
};
