import { ENDPOINT } from "@/constants/Endpoint";
import { api } from "./axios";
import { 
    MineralFertilizerResponseDto, 
    MineralFertilizerCreateRequestDto,
    MineralFertilizerPostRequestDto 
} from "@/interfaces/Fertilizer";


export const fetchMineralFertilizers = async (): Promise<MineralFertilizerResponseDto[]> => {
    const { data } = await api.get(ENDPOINT.GET_ALL_MINERAL_FERTILIZER);
    return data;
};

export const fetchPublicMineralFertilizers = async (): Promise<MineralFertilizerResponseDto[]> => {
    const { data } = await api.get(ENDPOINT.GET_ALL_PUBLIC_MINERAL_FERTILIZER);
    return data;
};

export const fetchDefaultMineralFertilizers = async (): Promise<MineralFertilizerResponseDto[]> => {
    const { data } = await api.get(ENDPOINT.GET_ALL_DEFAULT_MINERAL_FERTILIZER);
    return data;
};

export const createMineralFertilizer = async (payload: MineralFertilizerCreateRequestDto): Promise<MineralFertilizerResponseDto> => {
    const { data } = await api.post(ENDPOINT.CREATE_MINERAL_FERTILIZER, payload);
    return data;
};

export const updateMineralFertilizer = async (
    id: number, 
    payload: MineralFertilizerPostRequestDto 
): Promise<MineralFertilizerResponseDto> => {
    const { data } = await api.put(ENDPOINT.UPDATE_MINERAL_FERTILIZER, payload, { 
        params: { mineralFertilizerId: id } 
    });
    return data;
};

export const deleteMineralFertilizer = async (id: number): Promise<void> => {
    await api.delete(ENDPOINT.DELETE_MINERAL_FERTILIZER, { 
        params: { mineralFertilizerId: id } 
    });
};
