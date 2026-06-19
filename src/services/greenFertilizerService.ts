import { ENDPOINT } from "@/constants/Endpoint";
import { api } from "./axios";
import { 
    GreenFertilizerResponseDto, 
    GreenFertilizerCreateRequestDto,
    GreenFertilizerPostRequestDto 
} from "@/interfaces/Fertilizer";


export const fetchGreenFertilizers = async (): Promise<GreenFertilizerResponseDto[]> => {
    const { data } = await api.get(ENDPOINT.GET_ALL_GREEN_FERTILIZER);
    return data;
};

export const fetchPublicGreenFertilizers = async (): Promise<GreenFertilizerResponseDto[]> => {
    const { data } = await api.get(ENDPOINT.GET_ALL_PUBLIC_GREEN_FERTILIZER);
    return data;
};

export const fetchDefaultGreenFertilizers = async (): Promise<GreenFertilizerResponseDto[]> => {
    const { data } = await api.get(ENDPOINT.GET_ALL_DEFAULT_GREEN_FERTILIZER);
    return data;
};

export const createGreenFertilizer = async (payload: GreenFertilizerCreateRequestDto): Promise<GreenFertilizerResponseDto> => {
    const { data } = await api.post(ENDPOINT.CREATE_GREEN_FERTILIZER, payload);
    return data;
};

export const updateGreenFertilizer = async (
    id: number, 
    payload: GreenFertilizerPostRequestDto 
): Promise<GreenFertilizerResponseDto> => {
    const { data } = await api.put(ENDPOINT.UPDATE_GREEN_FERTILIZER, payload, { 
        params: { greenFertilizerId: id } 
    });
    return data;
};

export const deleteGreenFertilizer = async (id: number): Promise<void> => {
    await api.delete(ENDPOINT.DELETE_GREEN_FERTILIZER, { 
        params: { greenFertilizerId: id } 
    });
};
