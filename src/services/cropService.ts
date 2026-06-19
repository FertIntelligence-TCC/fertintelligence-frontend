import { ENDPOINT } from "@/constants/Endpoint";
import { api } from "./axios";
import { 
  CropCreateRequestDto, 
  CropPostRequestDto, 
  CropResponseDto 
} from "@/interfaces/Crop";


export const createCrop = async (
  folderId: number,
  data: CropCreateRequestDto
): Promise<CropResponseDto> => {
  const response = await api.post(ENDPOINT.CREATE_CROP, data, {
    params: { folderId }
  });
  return response.data;
};

export const getCropById = async (
  cropId: number
): Promise<CropResponseDto> => {
  const response = await api.get(ENDPOINT.GET_CROP, {
    params: { cropId }
  });
  return response.data;
};

export const getCropsByFolder = async (
  folderId: number
): Promise<CropResponseDto[]> => {
  const response = await api.get(ENDPOINT.GET_CROP_BY_FOLDER, {
    params: { folderId }
  });
  return response.data;
};

export const updateCrop = async (
  cropId: number,
  data: CropPostRequestDto
): Promise<CropResponseDto> => {
  const response = await api.put(ENDPOINT.UPDATE_CROP, data, {
    params: { cropId }
  });
  return response.data;
};

export const deleteCrop = async (
  cropId: number
): Promise<void> => {
  await api.delete(ENDPOINT.DELETE_CROP, {
    params: { cropId }
  });
};
