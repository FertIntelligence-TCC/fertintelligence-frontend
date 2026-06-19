import { ENDPOINT } from "@/constants/Endpoint";
import { api } from "./axios";
import { 
    BioFertilizerResponseDto, 
    BioFertilizerCreateRequestDto, 
    BioFertilizerPostRequestDto 
} from "@/interfaces/Fertilizer";


export const fetchBioFertilizers = async (): Promise<BioFertilizerResponseDto[]> => {
    const { data } = await api.get(ENDPOINT.GET_ALL_BIO_FERTILIZER);
    return data;
};

export const fetchPublicBioFertilizers = async (): Promise<BioFertilizerResponseDto[]> => {
    const { data } = await api.get(ENDPOINT.GET_ALL_PUBLIC_BIO_FERTILIZER);
    return data;
};

export const fetchDefaultBioFertilizers = async (): Promise<BioFertilizerResponseDto[]> => {
    const { data } = await api.get(ENDPOINT.GET_ALL_DEFAULT_BIO_FERTILIZER);
    return data;
};

export const createBioFertilizer = async (payload: BioFertilizerCreateRequestDto): Promise<BioFertilizerResponseDto> => {
    const { data } = await api.post(ENDPOINT.CREATE_BIO_FERTILIZER, payload);
    return data;
};

export const updateBioFertilizer = async (
    id: number, 
    payload: BioFertilizerPostRequestDto 
): Promise<BioFertilizerResponseDto> => {
    const { data } = await api.put(ENDPOINT.UPDATE_BIO_FERTILIZER, payload, { 
        params: { bioFertilizerId: id } 
    });
    return data;
};

export const deleteBioFertilizer = async (id: number): Promise<void> => {
    await api.delete(ENDPOINT.DELETE_BIO_FERTILIZER, { 
        params: { bioFertilizerId: id } 
    });
};
