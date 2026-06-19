import { api } from "./axios";
import {
  TopDressingFertilizationCreateRequestDto,
  TopDressingFertilizationPostRequestDto,
  TopDressingFertilizationResponseDto
} from "@/interfaces/TopDressingFertilization";

import { ENDPOINT } from "@/constants/Endpoint";

export const createTopDressingFertilization = async (
  cropId: number,
  data: TopDressingFertilizationCreateRequestDto
): Promise<TopDressingFertilizationResponseDto> => {
  const response = await api.post(`${ENDPOINT.TOP_DRESSING_FERTILIZATION}/register`, data, {
    params: { cropId }
  });
  return response.data;
};

export const getTopDressingFertilizationsByCrop = async (
  cropId: number
): Promise<TopDressingFertilizationResponseDto[]> => {
  const response = await api.get(`${ENDPOINT.TOP_DRESSING_FERTILIZATION}/get-by-crop`, {
    params: { cropId }
  });
  return response.data;
};

export const updateTopDressingFertilization = async (
  fertilizationId: number,
  data: TopDressingFertilizationPostRequestDto
): Promise<TopDressingFertilizationResponseDto> => {
  const response = await api.put(`${ENDPOINT.TOP_DRESSING_FERTILIZATION}/update`, data, {
    params: { fertilizationId }
  });
  return response.data;
};

export const deleteTopDressingFertilization = async (
  fertilizationId: number
): Promise<void> => {
  await api.delete(`${ENDPOINT.TOP_DRESSING_FERTILIZATION}/delete`, {
    params: { fertilizationId }
  });
};
