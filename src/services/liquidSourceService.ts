import { api } from "./axios";
import {
  LiquidSourceCreateRequestDto,
  LiquidSourcePostRequestDto,
  LiquidSourceResponseDto
} from "@/interfaces/FoliarFertilization"; // Agrupado em um arquivo comum se preferir

import { ENDPOINT } from "@/constants/Endpoint";

export const createLiquidSource = async (
  cropId: number,
  data: LiquidSourceCreateRequestDto
): Promise<LiquidSourceResponseDto> => {
  const response = await api.post(`${ENDPOINT.FOLIAR_FERTILIZATION_LIQUID_SOURCE}/register`, data, {
    params: { cropId }
  });
  return response.data;
};

export const getLiquidSourcesByCrop = async (
  cropId: number
): Promise<LiquidSourceResponseDto[]> => {
  const response = await api.get(`${ENDPOINT.FOLIAR_FERTILIZATION_LIQUID_SOURCE}/get-by-crop`, {
    params: { cropId }
  });
  return response.data;
};

export const getLiquidSourceById = async (
  liquidSourceId: number
): Promise<LiquidSourceResponseDto> => {
  const response = await api.get(`${ENDPOINT.FOLIAR_FERTILIZATION_LIQUID_SOURCE}/get`, {
    params: { liquidSourceId }
  });
  return response.data;
};

export const updateLiquidSource = async (
  liquidSourceId: number,
  data: LiquidSourcePostRequestDto
): Promise<LiquidSourceResponseDto> => {
  const response = await api.put(`${ENDPOINT.FOLIAR_FERTILIZATION_LIQUID_SOURCE}/update`, data, {
    params: { liquidSourceId }
  });
  return response.data;
};

export const deleteLiquidSource = async (
  liquidSourceId: number
): Promise<void> => {
  await api.delete(`${ENDPOINT.FOLIAR_FERTILIZATION_LIQUID_SOURCE}/delete`, {
    params: { liquidSourceId }
  });
};
