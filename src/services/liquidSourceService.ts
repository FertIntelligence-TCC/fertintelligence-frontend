import { api } from "./axios";
import { 
  LiquidSourceCreateRequestDto, 
  LiquidSourcePostRequestDto, 
  LiquidSourceResponseDto 
} from "@/interfaces/FoliarFertilization"; // Agrupado em um arquivo comum se preferir

const BASE_URL = "/foliar-fertilization/liquid-source";

export const createLiquidSource = async (
  cropId: number,
  data: LiquidSourceCreateRequestDto
): Promise<LiquidSourceResponseDto> => {
  const response = await api.post(`${BASE_URL}/register`, data, {
    params: { cropId }
  });
  return response.data;
};

export const getLiquidSourcesByCrop = async (
  cropId: number
): Promise<LiquidSourceResponseDto[]> => {
  const response = await api.get(`${BASE_URL}/get-by-crop`, {
    params: { cropId }
  });
  return response.data;
};

export const getLiquidSourceById = async (
  liquidSourceId: number
): Promise<LiquidSourceResponseDto> => {
  const response = await api.get(`${BASE_URL}/get`, {
    params: { liquidSourceId }
  });
  return response.data;
};

export const updateLiquidSource = async (
  liquidSourceId: number,
  data: LiquidSourcePostRequestDto
): Promise<LiquidSourceResponseDto> => {
  const response = await api.put(`${BASE_URL}/update`, data, {
    params: { liquidSourceId }
  });
  return response.data;
};

export const deleteLiquidSource = async (
  liquidSourceId: number
): Promise<void> => {
  await api.delete(`${BASE_URL}/delete`, {
    params: { liquidSourceId }
  });
};