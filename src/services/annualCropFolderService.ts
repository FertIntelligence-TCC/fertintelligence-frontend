import { api } from "./axios";
import {
  AnnualCropFolderCreateRequestDto,
  AnnualCropFolderPostRequestDto,
  AnnualCropFolderResponseDto
} from "@/interfaces/AnnualCropFolder";

import { ENDPOINT } from "@/constants/Endpoint";

export const createAnnualCropFolder = async (
  plotId: number,
  data: AnnualCropFolderCreateRequestDto
): Promise<AnnualCropFolderResponseDto> => {
  const response = await api.post(`${ENDPOINT.ANNUAL_CROP_FOLDER}/register`, data, {
    params: { plotId }
  });
  return response.data;
};

export const getAllAnnualCropFoldersByPlot = async (
  plotId: number
): Promise<AnnualCropFolderResponseDto[]> => {
  const response = await api.get(`${ENDPOINT.ANNUAL_CROP_FOLDER}/get-by-plot`, {
    params: { plotId }
  });
  return response.data;
};

export const updateAnnualCropFolder = async (
  annualCropFolderId: number,
  data: AnnualCropFolderPostRequestDto
): Promise<AnnualCropFolderResponseDto> => {
  const response = await api.put(`${ENDPOINT.ANNUAL_CROP_FOLDER}/update`, data, {
    params: { annualCropFolderId }
  });
  return response.data;
};

export const deleteAnnualCropFolder = async (
  annualCropFolderId: number
): Promise<void> => {
  await api.delete(`${ENDPOINT.ANNUAL_CROP_FOLDER}/delete`, {
    params: { annualCropFolderId }
  });
};
