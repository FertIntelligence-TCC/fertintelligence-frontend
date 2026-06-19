import { ENDPOINT } from "@/constants/Endpoint";
import { api } from "./axios";
import { 
    ChelatedFertilizerResponseDto, 
    ChelatedFertilizerCreateRequestDto, 
    ChelatedFertilizerPostRequestDto 
} from "@/interfaces/Fertilizer";


export const fetchChelatedFertilizers = async (): Promise<ChelatedFertilizerResponseDto[]> => {
    const { data } = await api.get(ENDPOINT.GET_ALL_CHELATED_FERTILIZER);
    return data;
};

export const fetchPublicChelatedFertilizers = async (): Promise<ChelatedFertilizerResponseDto[]> => {
    const { data } = await api.get(ENDPOINT.GET_ALL_PUBLIC_CHELATED_FERTILIZER);
    return data;
};

export const fetchDefaultChelatedFertilizers = async (): Promise<ChelatedFertilizerResponseDto[]> => {
    const { data } = await api.get(ENDPOINT.GET_ALL_DEFAULT_CHELATED_FERTILIZER);
    return data;
};

export const createChelatedFertilizer = async (payload: ChelatedFertilizerCreateRequestDto): Promise<ChelatedFertilizerResponseDto> => {
    const { data } = await api.post(ENDPOINT.CREATE_CHELATED_FERTILIZER, payload);
    return data;
};

export const updateChelatedFertilizer = async (
    id: number, 
    payload: ChelatedFertilizerPostRequestDto 
): Promise<ChelatedFertilizerResponseDto> => {
    const { data } = await api.put(ENDPOINT.UPDATE_CHELATED_FERTILIZER, payload, { 
        params: { chelatedFertilizerId: id } 
    });
    return data;
};

export const deleteChelatedFertilizer = async (id: number): Promise<void> => {
    await api.delete(ENDPOINT.DELETE_CHELATED_FERTILIZER, { 
        params: { chelatedFertilizerId: id } 
    });
};
