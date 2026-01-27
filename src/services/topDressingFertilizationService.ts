import { api } from "./axios";
import { 
  TopDressingFertilizationCreateRequestDto, 
  TopDressingFertilizationPostRequestDto, 
  TopDressingFertilizationResponseDto 
} from "@/interfaces/TopDressingFertilization";

const BASE_URL = "/top-dressing-fertilization";

export const createTopDressingFertilization = async (
  cropId: number,
  data: TopDressingFertilizationCreateRequestDto
): Promise<TopDressingFertilizationResponseDto> => {
  const response = await api.post(`${BASE_URL}/register`, data, {
    params: { cropId }
  });
  return response.data;
};

export const getTopDressingFertilizationsByCrop = async (
  cropId: number
): Promise<TopDressingFertilizationResponseDto[]> => {
  const response = await api.get(`${BASE_URL}/get-by-crop`, {
    params: { cropId }
  });
  return response.data;
};

export const updateTopDressingFertilization = async (
  fertilizationId: number,
  data: TopDressingFertilizationPostRequestDto
): Promise<TopDressingFertilizationResponseDto> => {
  const response = await api.put(`${BASE_URL}/update`, data, {
    params: { fertilizationId }
  });
  return response.data;
};

export const deleteTopDressingFertilization = async (
  fertilizationId: number
): Promise<void> => {
  await api.delete(`${BASE_URL}/delete`, {
    params: { fertilizationId }
  });
};