import { ENDPOINT } from "@/constants/Endpoint";
import { api } from "./axios";
import {
  CropDeficiencyToxicityCreateRequestDto,
  CropDeficiencyToxicityPostRequestDto,
  CropDeficiencyToxicityResponseDto,
} from "@/interfaces/CropDeficiencyToxicity";


export const createCropDeficiencyToxicity = async (
  cropId: number,
  data: CropDeficiencyToxicityCreateRequestDto,
): Promise<CropDeficiencyToxicityResponseDto> => {
  console.debug("POST /crop-deficiency-toxicity/register payload", data);
  const response = await api.post(ENDPOINT.CREATE_CROP_DEFICIENCY_TOXICITY, data, { params: { cropId } });
  return response.data;
};

export const getCropDeficiencyToxicitiesByCrop = async (
  cropId: number,
): Promise<CropDeficiencyToxicityResponseDto[]> => {
  const response = await api.get(ENDPOINT.GET_BY_CROP_CROP_DEFICIENCY_TOXICITY, { params: { cropId } });
  return response.data;
};

export const updateCropDeficiencyToxicity = async (
  deficiencyToxicityId: number,
  data: CropDeficiencyToxicityPostRequestDto,
): Promise<CropDeficiencyToxicityResponseDto> => {
  console.debug("PUT /crop-deficiency-toxicity/update payload", data);
  const response = await api.put(ENDPOINT.UPDATE_CROP_DEFICIENCY_TOXICITY, data, {
    params: { deficiencyToxicityId },
  });
  return response.data;
};

export const deleteCropDeficiencyToxicity = async (
  deficiencyToxicityId: number,
): Promise<void> => {
  await api.delete(ENDPOINT.DELETE_CROP_DEFICIENCY_TOXICITY, { params: { deficiencyToxicityId } });
};
