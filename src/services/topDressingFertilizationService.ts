import { ENDPOINT } from "@/constants/Endpoint";
import { api } from "./axios";
import { 
  TopDressingFertilizationCreateRequestDto, 
  TopDressingFertilizationPostRequestDto, 
  TopDressingFertilizationResponseDto 
} from "@/interfaces/TopDressingFertilization";


export const createTopDressingFertilization = async (
  cropId: number,
  data: TopDressingFertilizationCreateRequestDto
): Promise<TopDressingFertilizationResponseDto> => {
  const response = await api.post(ENDPOINT.CREATE_TOP_DRESSING_FERTILIZATION, data, {
    params: { cropId }
  });
  return response.data;
};

export const getTopDressingFertilizationsByCrop = async (
  cropId: number
): Promise<TopDressingFertilizationResponseDto[]> => {
  const response = await api.get(ENDPOINT.GET_BY_CROP_TOP_DRESSING_FERTILIZATION, {
    params: { cropId }
  });
  return response.data;
};

export const updateTopDressingFertilization = async (
  fertilizationId: number,
  data: TopDressingFertilizationPostRequestDto
): Promise<TopDressingFertilizationResponseDto> => {
  const response = await api.put(ENDPOINT.UPDATE_TOP_DRESSING_FERTILIZATION, data, {
    params: { fertilizationId }
  });
  return response.data;
};

export const deleteTopDressingFertilization = async (
  fertilizationId: number
): Promise<void> => {
  await api.delete(ENDPOINT.DELETE_TOP_DRESSING_FERTILIZATION, {
    params: { fertilizationId }
  });
};
