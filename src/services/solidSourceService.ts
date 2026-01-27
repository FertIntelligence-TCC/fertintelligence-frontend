import { api } from "./axios";
import { 
  SolidSourceCreateRequestDto, 
  SolidSourcePostRequestDto, 
  SolidSourceResponseDto 
} from "@/interfaces/FoliarFertilization";

const BASE_URL = "/foliar-fertilization/solid-source";

export const createSolidSource = async (
  cropId: number,
  data: SolidSourceCreateRequestDto
): Promise<SolidSourceResponseDto> => {
  const response = await api.post(`${BASE_URL}/register`, data, {
    params: { cropId }
  });
  return response.data;
};

export const getSolidSourcesByCrop = async (
  cropId: number
): Promise<SolidSourceResponseDto[]> => {
  const response = await api.get(`${BASE_URL}/get-by-crop`, {
    params: { cropId }
  });
  return response.data;
};

export const getSolidSourceById = async (
  solidSourceId: number
): Promise<SolidSourceResponseDto> => {
  const response = await api.get(`${BASE_URL}/get`, {
    params: { solidSourceId }
  });
  return response.data;
};

export const updateSolidSource = async (
  solidSourceId: number,
  data: SolidSourcePostRequestDto
): Promise<SolidSourceResponseDto> => {
  const response = await api.put(`${BASE_URL}/update`, data, {
    params: { solidSourceId }
  });
  return response.data;
};

export const deleteSolidSource = async (
  solidSourceId: number
): Promise<void> => {
  await api.delete(`${BASE_URL}/delete`, {
    params: { solidSourceId }
  });
};