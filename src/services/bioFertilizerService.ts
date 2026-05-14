import { api } from "./axios";
import { 
    BioFertilizerResponseDto, 
    BioFertilizerCreateRequestDto, 
    BioFertilizerPostRequestDto 
} from "@/interfaces/Fertilizer";

// Ajuste o endpoint base conforme o seu Controller Java (@RequestMapping)
const ENDPOINT = "/bio-fertilizer";

export const fetchBioFertilizers = async (): Promise<BioFertilizerResponseDto[]> => {
    const { data } = await api.get(`${ENDPOINT}/get-all`);
    return data;
};

export const fetchPublicBioFertilizers = async (): Promise<BioFertilizerResponseDto[]> => {
    const { data } = await api.get(`${ENDPOINT}/get-all-public`);
    return data;
};

export const createBioFertilizer = async (payload: BioFertilizerCreateRequestDto): Promise<BioFertilizerResponseDto> => {
    const { data } = await api.post(`${ENDPOINT}/register`, payload);
    return data;
};

export const updateBioFertilizer = async (
    id: number, 
    payload: BioFertilizerPostRequestDto 
): Promise<BioFertilizerResponseDto> => {
    const { data } = await api.put(`${ENDPOINT}/update`, payload, { 
        params: { bioFertilizerId: id } 
    });
    return data;
};

export const deleteBioFertilizer = async (id: number): Promise<void> => {
    await api.delete(`${ENDPOINT}/delete`, { 
        params: { bioFertilizerId: id } 
    });
};