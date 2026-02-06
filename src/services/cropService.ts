import { api } from "./axios";
import { 
  CropCreateRequestDto, 
  CropPostRequestDto, 
  CropResponseDto 
} from "@/interfaces/Crop";

const BASE_URL = "/crop";

export const createCrop = async (
  folderId: number,
  data: CropCreateRequestDto
): Promise<CropResponseDto> => {
  const response = await api.post(`${BASE_URL}/register`, data, {
    params: { folderId }
  });
  return response.data;
};

export const getCropById = async (
  cropId: number
): Promise<CropResponseDto> => {
  const response = await api.get(`${BASE_URL}/get`, {
    params: { cropId }
  });
  return response.data;
};

export const getCropsByFolder = async (
  folderId: number
): Promise<CropResponseDto[]> => {
  const response = await api.get(`${BASE_URL}/get-by-folder`, {
    params: { folderId }
  });
  return response.data;
};

export const updateCrop = async (
  cropId: number,
  data: CropPostRequestDto
): Promise<CropResponseDto> => {
  const response = await api.put(`${BASE_URL}/update`, data, {
    params: { cropId }
  });
  return response.data;
};

export const deleteCrop = async (
  cropId: number
): Promise<void> => {
  await api.delete(`${BASE_URL}/delete`, {
    params: { cropId }
  });
};