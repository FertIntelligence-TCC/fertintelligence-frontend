import { ENDPOINT } from "@/constants/Endpoint";
import { api } from "./axios";
import { 
    OrganoMineralFertilizerResponseDto, 
    OrganoMineralFertilizerCreateRequestDto,
    OrganoMineralFertilizerPostRequestDto 
} from "@/interfaces/Fertilizer";


export const fetchOrganoMineralFertilizers = async (): Promise<OrganoMineralFertilizerResponseDto[]> => {
    const { data } = await api.get(ENDPOINT.GET_ALL_ORGANO_MINERAL_FERTILIZER);
    return data;
};

export const fetchPublicOrganoMineralFertilizers = async (): Promise<OrganoMineralFertilizerResponseDto[]> => {
    const { data } = await api.get(ENDPOINT.GET_ALL_PUBLIC_ORGANO_MINERAL_FERTILIZER);
    return data;
};

export const fetchDefaultOrganoMineralFertilizers = async (): Promise<OrganoMineralFertilizerResponseDto[]> => {
    const { data } = await api.get(ENDPOINT.GET_ALL_DEFAULT_ORGANO_MINERAL_FERTILIZER);
    return data;
};

export const createOrganoMineralFertilizer = async (payload: OrganoMineralFertilizerCreateRequestDto): Promise<OrganoMineralFertilizerResponseDto> => {
    const { data } = await api.post(ENDPOINT.CREATE_ORGANO_MINERAL_FERTILIZER, payload);
    return data;
};

export const updateOrganoMineralFertilizer = async (
    id: number, 
    payload: OrganoMineralFertilizerPostRequestDto 
): Promise<OrganoMineralFertilizerResponseDto> => {
    const { data } = await api.put(ENDPOINT.UPDATE_ORGANO_MINERAL_FERTILIZER, payload, { 
        params: { organoMineralFertilizerId: id } 
    });
    return data;
};

export const deleteOrganoMineralFertilizer = async (id: number): Promise<void> => {
    await api.delete(ENDPOINT.DELETE_ORGANO_MINERAL_FERTILIZER, { 
        params: { organoMineralFertilizerId: id } 
    });
};
