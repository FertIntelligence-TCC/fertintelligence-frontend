import { api } from "./axios";
import { 
    ChelatedFertilizerResponseDto, 
    ChelatedFertilizerCreateRequestDto, 
    ChelatedFertilizerPostRequestDto 
} from "@/interfaces/Fertilizer";

// Ajuste o endpoint base conforme o seu Controller Java (@RequestMapping)
const ENDPOINT = "/chelated-fertilizer";

export const fetchChelatedFertilizers = async (): Promise<ChelatedFertilizerResponseDto[]> => {
    const { data } = await api.get(`${ENDPOINT}/get-all`);
    return data;
};

export const createChelatedFertilizer = async (payload: ChelatedFertilizerCreateRequestDto): Promise<ChelatedFertilizerResponseDto> => {
    const { data } = await api.post(`${ENDPOINT}/register`, payload);
    return data;
};

export const updateChelatedFertilizer = async (
    id: number, 
    payload: ChelatedFertilizerPostRequestDto 
): Promise<ChelatedFertilizerResponseDto> => {
    const { data } = await api.put(`${ENDPOINT}/update`, payload, { 
        params: { chelatedFertilizerId: id } 
    });
    return data;
};

export const deleteChelatedFertilizer = async (id: number): Promise<void> => {
    await api.delete(`${ENDPOINT}/delete`, { 
        params: { chelatedFertilizerId: id } 
    });
};