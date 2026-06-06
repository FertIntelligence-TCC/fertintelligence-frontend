import { api } from "./axios";
import { 
    MineralFertilizerResponseDto, 
    MineralFertilizerCreateRequestDto,
    MineralFertilizerPostRequestDto 
} from "@/interfaces/Fertilizer";

const ENDPOINT = "/mineral-fertilizer";

export const fetchMineralFertilizers = async (): Promise<MineralFertilizerResponseDto[]> => {
    const { data } = await api.get(`${ENDPOINT}/get-all`);
    return data;
};

export const fetchPublicMineralFertilizers = async (): Promise<MineralFertilizerResponseDto[]> => {
    const { data } = await api.get(`${ENDPOINT}/get-all-public`);
    return data;
};

export const fetchDefaultMineralFertilizers = async (): Promise<MineralFertilizerResponseDto[]> => {
    const { data } = await api.get(`${ENDPOINT}/get-all-default`);
    return data;
};

export const createMineralFertilizer = async (payload: MineralFertilizerCreateRequestDto): Promise<MineralFertilizerResponseDto> => {
    const { data } = await api.post(`${ENDPOINT}/register`, payload);
    return data;
};

export const updateMineralFertilizer = async (
    id: number, 
    payload: MineralFertilizerPostRequestDto 
): Promise<MineralFertilizerResponseDto> => {
    const { data } = await api.put(`${ENDPOINT}/update`, payload, { 
        params: { mineralFertilizerId: id } 
    });
    return data;
};

export const deleteMineralFertilizer = async (id: number): Promise<void> => {
    await api.delete(`${ENDPOINT}/delete`, { 
        params: { mineralFertilizerId: id } 
    });
};
