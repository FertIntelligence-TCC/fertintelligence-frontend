import { api } from "./axios";
import {
  CropDeficiencyToxicityCreateRequestDto,
  CropDeficiencyToxicityPostRequestDto,
  CropDeficiencyToxicityResponseDto,
} from "@/interfaces/CropDeficiencyToxicity";

const BASE_URL = "/crop-deficiency-toxicity";

export const createCropDeficiencyToxicity = async (
  cropId: number,
  data: CropDeficiencyToxicityCreateRequestDto,
): Promise<CropDeficiencyToxicityResponseDto> => {
  console.debug("POST /crop-deficiency-toxicity/register payload", data);
  const response = await api.post(`${BASE_URL}/register`, data, { params: { cropId } });
  return response.data;
};

export const getCropDeficiencyToxicitiesByCrop = async (
  cropId: number,
): Promise<CropDeficiencyToxicityResponseDto[]> => {
  const response = await api.get(`${BASE_URL}/get-by-crop`, { params: { cropId } });
  return response.data;
};

export const updateCropDeficiencyToxicity = async (
  deficiencyToxicityId: number,
  data: CropDeficiencyToxicityPostRequestDto,
): Promise<CropDeficiencyToxicityResponseDto> => {
  console.debug("PUT /crop-deficiency-toxicity/update payload", data);
  const response = await api.put(`${BASE_URL}/update`, data, {
    params: { deficiencyToxicityId },
  });
  return response.data;
};

export const deleteCropDeficiencyToxicity = async (
  deficiencyToxicityId: number,
): Promise<void> => {
  await api.delete(`${BASE_URL}/delete`, { params: { deficiencyToxicityId } });
};
