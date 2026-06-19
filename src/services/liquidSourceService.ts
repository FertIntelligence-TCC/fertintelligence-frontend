import { ENDPOINT } from "@/constants/Endpoint";
import { api } from "./axios";
import { 
  LiquidSourceCreateRequestDto, 
  LiquidSourcePostRequestDto, 
  LiquidSourceResponseDto 
} from "@/interfaces/FoliarFertilization"; // Agrupado em um arquivo comum se preferir


export const createLiquidSource = async (
  cropId: number,
  data: LiquidSourceCreateRequestDto
): Promise<LiquidSourceResponseDto> => {
  const response = await api.post(ENDPOINT.CREATE_FOLIAR_FERTILIZATION_LIQUID_SOURCE, data, {
    params: { cropId }
  });
  return response.data;
};

export const getLiquidSourcesByCrop = async (
  cropId: number
): Promise<LiquidSourceResponseDto[]> => {
  const response = await api.get(ENDPOINT.GET_BY_CROP_FOLIAR_FERTILIZATION_LIQUID_SOURCE, {
    params: { cropId }
  });
  return response.data;
};

export const getLiquidSourceById = async (
  liquidSourceId: number
): Promise<LiquidSourceResponseDto> => {
  const response = await api.get(ENDPOINT.GET_FOLIAR_FERTILIZATION_LIQUID_SOURCE, {
    params: { liquidSourceId }
  });
  return response.data;
};

export const updateLiquidSource = async (
  liquidSourceId: number,
  data: LiquidSourcePostRequestDto
): Promise<LiquidSourceResponseDto> => {
  const response = await api.put(ENDPOINT.UPDATE_FOLIAR_FERTILIZATION_LIQUID_SOURCE, data, {
    params: { liquidSourceId }
  });
  return response.data;
};

export const deleteLiquidSource = async (
  liquidSourceId: number
): Promise<void> => {
  await api.delete(ENDPOINT.DELETE_FOLIAR_FERTILIZATION_LIQUID_SOURCE, {
    params: { liquidSourceId }
  });
};
