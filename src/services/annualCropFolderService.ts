import { ENDPOINT } from "@/constants/Endpoint";
import { api } from "./axios";
import { 
  AnnualCropFolderCreateRequestDto, 
  AnnualCropFolderPostRequestDto, 
  AnnualCropFolderResponseDto 
} from "@/interfaces/AnnualCropFolder";


export const createAnnualCropFolder = async (
  plotId: number, 
  data: AnnualCropFolderCreateRequestDto
): Promise<AnnualCropFolderResponseDto> => {
  const response = await api.post(ENDPOINT.CREATE_ANNUAL_CROP_FOLDER, data, {
    params: { plotId }
  });
  return response.data;
};

export const getAllAnnualCropFoldersByPlot = async (
  plotId: number
): Promise<AnnualCropFolderResponseDto[]> => {
  const response = await api.get(ENDPOINT.GET_BY_PLOT_ANNUAL_CROP_FOLDER, {
    params: { plotId }
  });
  return response.data;
};

export const updateAnnualCropFolder = async (
  annualCropFolderId: number,
  data: AnnualCropFolderPostRequestDto
): Promise<AnnualCropFolderResponseDto> => {
  const response = await api.put(ENDPOINT.UPDATE_ANNUAL_CROP_FOLDER, data, {
    params: { annualCropFolderId }
  });
  return response.data;
};

export const deleteAnnualCropFolder = async (
  annualCropFolderId: number
): Promise<void> => {
  await api.delete(ENDPOINT.DELETE_ANNUAL_CROP_FOLDER, {
    params: { annualCropFolderId }
  });
};
