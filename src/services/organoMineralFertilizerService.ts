import { api } from "./axios";
import {
    OrganoMineralFertilizerResponseDto,
    OrganoMineralFertilizerCreateRequestDto,
    OrganoMineralFertilizerPostRequestDto
} from "@/interfaces/Fertilizer";

import { ENDPOINT } from "@/constants/Endpoint";

export const fetchOrganoMineralFertilizers = async (): Promise<OrganoMineralFertilizerResponseDto[]> => {
    const { data } = await api.get(`${ENDPOINT.ORGANO_MINERAL_FERTILIZER}/get-all`);
    return data;
};

export const fetchPublicOrganoMineralFertilizers = async (): Promise<OrganoMineralFertilizerResponseDto[]> => {
    const { data } = await api.get(`${ENDPOINT.ORGANO_MINERAL_FERTILIZER}/get-all-public`);
    return data;
};

export const fetchDefaultOrganoMineralFertilizers = async (): Promise<OrganoMineralFertilizerResponseDto[]> => {
    const { data } = await api.get(`${ENDPOINT.ORGANO_MINERAL_FERTILIZER}/get-all-default`);
    return data;
};

export const createOrganoMineralFertilizer = async (payload: OrganoMineralFertilizerCreateRequestDto): Promise<OrganoMineralFertilizerResponseDto> => {
    const { data } = await api.post(`${ENDPOINT.ORGANO_MINERAL_FERTILIZER}/register`, payload);
    return data;
};

export const updateOrganoMineralFertilizer = async (
    id: number,
    payload: OrganoMineralFertilizerPostRequestDto
): Promise<OrganoMineralFertilizerResponseDto> => {
    const { data } = await api.put(`${ENDPOINT.ORGANO_MINERAL_FERTILIZER}/update`, payload, {
        params: { organoMineralFertilizerId: id }
    });
    return data;
};

export const deleteOrganoMineralFertilizer = async (id: number): Promise<void> => {
    await api.delete(`${ENDPOINT.ORGANO_MINERAL_FERTILIZER}/delete`, {
        params: { organoMineralFertilizerId: id }
    });
};
