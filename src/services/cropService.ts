import { api } from "./axios";
import {
  CropCreateRequestDto,
  CropPostRequestDto,
  CropResponseDto
} from "@/interfaces/Crop";

import { ENDPOINT } from "@/constants/Endpoint";

export const createCrop = async (
  folderId: number,
  data: CropCreateRequestDto
): Promise<CropResponseDto> => {
  const response = await api.post(`${ENDPOINT.CROP}/register`, data, {
    params: { folderId }
  });
  return response.data;
};

export const getCropById = async (
  cropId: number
): Promise<CropResponseDto> => {
  const response = await api.get(`${ENDPOINT.CROP}/get`, {
    params: { cropId }
  });
  return response.data;
};

export const getCropsByFolder = async (
  folderId: number
): Promise<CropResponseDto[]> => {
  const response = await api.get(`${ENDPOINT.CROP}/get-by-folder`, {
    params: { folderId }
  });
  return response.data;
};

export const updateCrop = async (
  cropId: number,
  data: CropPostRequestDto
): Promise<CropResponseDto> => {
  const response = await api.put(`${ENDPOINT.CROP}/update`, data, {
    params: { cropId }
  });
  return response.data;
};

export const deleteCrop = async (
  cropId: number
): Promise<void> => {
  await api.delete(`${ENDPOINT.CROP}/delete`, {
    params: { cropId }
  });
};
