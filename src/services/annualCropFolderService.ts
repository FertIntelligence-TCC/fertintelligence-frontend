import { api } from "./axios";
import { 
  AnnualCropFolderCreateRequestDto, 
  AnnualCropFolderPostRequestDto, 
  AnnualCropFolderResponseDto 
} from "@/interfaces/AnnualCropFolder";

const BASE_URL = "/annual-crop-folder";

export const createAnnualCropFolder = async (
  plotId: number, 
  data: AnnualCropFolderCreateRequestDto
): Promise<AnnualCropFolderResponseDto> => {
  const response = await api.post(`${BASE_URL}/register`, data, {
    params: { plotId }
  });
  return response.data;
};

export const getAllAnnualCropFoldersByPlot = async (
  plotId: number
): Promise<AnnualCropFolderResponseDto[]> => {
  const response = await api.get(`${BASE_URL}/get-by-plot`, {
    params: { plotId }
  });
  return response.data;
};

export const updateAnnualCropFolder = async (
  annualCropFolderId: number,
  data: AnnualCropFolderPostRequestDto
): Promise<AnnualCropFolderResponseDto> => {
  const response = await api.put(`${BASE_URL}/update`, data, {
    params: { annualCropFolderId }
  });
  return response.data;
};

export const deleteAnnualCropFolder = async (
  annualCropFolderId: number
): Promise<void> => {
  await api.delete(`${BASE_URL}/delete`, {
    params: { annualCropFolderId }
  });
};