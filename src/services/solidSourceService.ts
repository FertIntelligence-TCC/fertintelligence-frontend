import { ENDPOINT } from "@/constants/Endpoint";
import { api } from "./axios";
import { 
  SolidSourceCreateRequestDto, 
  SolidSourcePostRequestDto, 
  SolidSourceResponseDto 
} from "@/interfaces/FoliarFertilization";


export const createSolidSource = async (
  cropId: number,
  data: SolidSourceCreateRequestDto
): Promise<SolidSourceResponseDto> => {
  const response = await api.post(ENDPOINT.CREATE_FOLIAR_FERTILIZATION_SOLID_SOURCE, data, {
    params: { cropId }
  });
  return response.data;
};

export const getSolidSourcesByCrop = async (
  cropId: number
): Promise<SolidSourceResponseDto[]> => {
  const response = await api.get(ENDPOINT.GET_BY_CROP_FOLIAR_FERTILIZATION_SOLID_SOURCE, {
    params: { cropId }
  });
  return response.data;
};

export const getSolidSourceById = async (
  solidSourceId: number
): Promise<SolidSourceResponseDto> => {
  const response = await api.get(ENDPOINT.GET_FOLIAR_FERTILIZATION_SOLID_SOURCE, {
    params: { solidSourceId }
  });
  return response.data;
};

export const updateSolidSource = async (
  solidSourceId: number,
  data: SolidSourcePostRequestDto
): Promise<SolidSourceResponseDto> => {
  const response = await api.put(ENDPOINT.UPDATE_FOLIAR_FERTILIZATION_SOLID_SOURCE, data, {
    params: { solidSourceId }
  });
  return response.data;
};

export const deleteSolidSource = async (
  solidSourceId: number
): Promise<void> => {
  await api.delete(ENDPOINT.DELETE_FOLIAR_FERTILIZATION_SOLID_SOURCE, {
    params: { solidSourceId }
  });
};
