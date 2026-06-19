import { ENDPOINT } from "@/constants/Endpoint";
import { api } from "./axios";
import { 
    FormulatedMineralFertilizerResponseDto, 
    FormulatedMineralFertilizerCreateRequestDto,
    FormulatedMineralFertilizerPostRequestDto 
} from "@/interfaces/Fertilizer";


export const fetchFormulatedFertilizers = async (): Promise<FormulatedMineralFertilizerResponseDto[]> => {
    const { data } = await api.get(ENDPOINT.GET_ALL_FORMULATED_MINERAL_FERTILIZER);
    return data;
};

export const fetchPublicFormulatedFertilizers = async (): Promise<FormulatedMineralFertilizerResponseDto[]> => {
    const { data } = await api.get(ENDPOINT.GET_ALL_PUBLIC_FORMULATED_MINERAL_FERTILIZER);
    return data;
};

export const fetchDefaultFormulatedFertilizers = async (): Promise<FormulatedMineralFertilizerResponseDto[]> => {
    const { data } = await api.get(ENDPOINT.GET_ALL_DEFAULT_FORMULATED_MINERAL_FERTILIZER);
    return data;
};

export const createFormulatedFertilizer = async (payload: FormulatedMineralFertilizerCreateRequestDto): Promise<FormulatedMineralFertilizerResponseDto> => {
    const { data } = await api.post(ENDPOINT.CREATE_FORMULATED_MINERAL_FERTILIZER, payload);
    return data;
};

export const updateFormulatedFertilizer = async (
    id: number, 
    payload: FormulatedMineralFertilizerPostRequestDto 
): Promise<FormulatedMineralFertilizerResponseDto> => {
    const { data } = await api.put(ENDPOINT.UPDATE_FORMULATED_MINERAL_FERTILIZER, payload, { 
        params: { formulatedMineralFertilizerId: id } 
    });
    return data;
};

export const deleteFormulatedFertilizer = async (id: number): Promise<void> => {
    await api.delete(ENDPOINT.DELETE_FORMULATED_MINERAL_FERTILIZER, { 
        params: { formulatedMineralFertilizerId: id } 
    });
};
