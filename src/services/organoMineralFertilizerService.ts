import { api } from "./axios";
import { 
    OrganoMineralFertilizerResponseDto, 
    OrganoMineralFertilizerCreateRequestDto,
    OrganoMineralFertilizerPostRequestDto 
} from "@/interfaces/Fertilizer";

const ENDPOINT = "/organo-mineral-fertilizer"; // Ajuste conforme seu Controller Java

export const fetchOrganoMineralFertilizers = async (): Promise<OrganoMineralFertilizerResponseDto[]> => {
    const { data } = await api.get(`${ENDPOINT}/get-all`);
    return data;
};

export const fetchPublicOrganoMineralFertilizers = async (): Promise<OrganoMineralFertilizerResponseDto[]> => {
    const { data } = await api.get(`${ENDPOINT}/get-all-public`);
    return data;
};

export const fetchDefaultOrganoMineralFertilizers = async (): Promise<OrganoMineralFertilizerResponseDto[]> => {
    const { data } = await api.get(`${ENDPOINT}/get-all-default`);
    return data;
};

export const createOrganoMineralFertilizer = async (payload: OrganoMineralFertilizerCreateRequestDto): Promise<OrganoMineralFertilizerResponseDto> => {
    const { data } = await api.post(`${ENDPOINT}/register`, payload);
    return data;
};

export const updateOrganoMineralFertilizer = async (
    id: number, 
    payload: OrganoMineralFertilizerPostRequestDto 
): Promise<OrganoMineralFertilizerResponseDto> => {
    const { data } = await api.put(`${ENDPOINT}/update`, payload, { 
        params: { organoMineralFertilizerId: id } 
    });
    return data;
};

export const deleteOrganoMineralFertilizer = async (id: number): Promise<void> => {
    await api.delete(`${ENDPOINT}/delete`, { 
        params: { organoMineralFertilizerId: id } 
    });
};
