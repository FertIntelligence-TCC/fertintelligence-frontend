import { api } from "./axios";
import { 
    FormulatedMineralFertilizerResponseDto, 
    FormulatedMineralFertilizerCreateRequestDto,
    FormulatedMineralFertilizerPostRequestDto 
} from "@/interfaces/Fertilizer";

const ENDPOINT = "/formulated-mineral-fertilizer";

export const fetchFormulatedFertilizers = async (): Promise<FormulatedMineralFertilizerResponseDto[]> => {
    const { data } = await api.get(`${ENDPOINT}/get-all`);
    return data;
};

export const fetchPublicFormulatedFertilizers = async (): Promise<FormulatedMineralFertilizerResponseDto[]> => {
    const { data } = await api.get(`${ENDPOINT}/get-all-public`);
    return data;
};

export const createFormulatedFertilizer = async (payload: FormulatedMineralFertilizerCreateRequestDto): Promise<FormulatedMineralFertilizerResponseDto> => {
    const { data } = await api.post(`${ENDPOINT}/register`, payload);
    return data;
};

export const updateFormulatedFertilizer = async (
    id: number, 
    payload: FormulatedMineralFertilizerPostRequestDto 
): Promise<FormulatedMineralFertilizerResponseDto> => {
    const { data } = await api.put(`${ENDPOINT}/update`, payload, { 
        params: { formulatedMineralFertilizerId: id } 
    });
    return data;
};

export const deleteFormulatedFertilizer = async (id: number): Promise<void> => {
    await api.delete(`${ENDPOINT}/delete`, { 
        params: { formulatedMineralFertilizerId: id } 
    });
};