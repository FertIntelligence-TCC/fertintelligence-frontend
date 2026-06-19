import { api } from "./axios";
import {
  CropDeficiencyToxicityCreateRequestDto,
  CropDeficiencyToxicityPostRequestDto,
  CropDeficiencyToxicityResponseDto,
} from "@/interfaces/CropDeficiencyToxicity";

import { ENDPOINT } from "@/constants/Endpoint";

export const createCropDeficiencyToxicity = async (
  cropId: number,
  data: CropDeficiencyToxicityCreateRequestDto,
): Promise<CropDeficiencyToxicityResponseDto> => {
  console.debug("POST /crop-deficiency-toxicity/register payload", data);
  const response = await api.post(`${ENDPOINT.CROP_DEFICIENCY_TOXICITY}/register`, data, { params: { cropId } });
  return response.data;
};

export const getCropDeficiencyToxicitiesByCrop = async (
  cropId: number,
): Promise<CropDeficiencyToxicityResponseDto[]> => {
  const response = await api.get(`${ENDPOINT.CROP_DEFICIENCY_TOXICITY}/get-by-crop`, { params: { cropId } });
  return response.data;
};

export const updateCropDeficiencyToxicity = async (
  deficiencyToxicityId: number,
  data: CropDeficiencyToxicityPostRequestDto,
): Promise<CropDeficiencyToxicityResponseDto> => {
  console.debug("PUT /crop-deficiency-toxicity/update payload", data);
  const response = await api.put(`${ENDPOINT.CROP_DEFICIENCY_TOXICITY}/update`, data, {
    params: { deficiencyToxicityId },
  });
  return response.data;
};

export const deleteCropDeficiencyToxicity = async (
  deficiencyToxicityId: number,
): Promise<void> => {
  await api.delete(`${ENDPOINT.CROP_DEFICIENCY_TOXICITY}/delete`, { params: { deficiencyToxicityId } });
};
