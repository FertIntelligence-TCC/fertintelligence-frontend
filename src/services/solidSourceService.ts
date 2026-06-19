import { api } from "./axios";
import {
  SolidSourceCreateRequestDto,
  SolidSourcePostRequestDto,
  SolidSourceResponseDto
} from "@/interfaces/FoliarFertilization";

import { ENDPOINT } from "@/constants/Endpoint";

export const createSolidSource = async (
  cropId: number,
  data: SolidSourceCreateRequestDto
): Promise<SolidSourceResponseDto> => {
  const response = await api.post(`${ENDPOINT.FOLIAR_FERTILIZATION_SOLID_SOURCE}/register`, data, {
    params: { cropId }
  });
  return response.data;
};

export const getSolidSourcesByCrop = async (
  cropId: number
): Promise<SolidSourceResponseDto[]> => {
  const response = await api.get(`${ENDPOINT.FOLIAR_FERTILIZATION_SOLID_SOURCE}/get-by-crop`, {
    params: { cropId }
  });
  return response.data;
};

export const getSolidSourceById = async (
  solidSourceId: number
): Promise<SolidSourceResponseDto> => {
  const response = await api.get(`${ENDPOINT.FOLIAR_FERTILIZATION_SOLID_SOURCE}/get`, {
    params: { solidSourceId }
  });
  return response.data;
};

export const updateSolidSource = async (
  solidSourceId: number,
  data: SolidSourcePostRequestDto
): Promise<SolidSourceResponseDto> => {
  const response = await api.put(`${ENDPOINT.FOLIAR_FERTILIZATION_SOLID_SOURCE}/update`, data, {
    params: { solidSourceId }
  });
  return response.data;
};

export const deleteSolidSource = async (
  solidSourceId: number
): Promise<void> => {
  await api.delete(`${ENDPOINT.FOLIAR_FERTILIZATION_SOLID_SOURCE}/delete`, {
    params: { solidSourceId }
  });
};
