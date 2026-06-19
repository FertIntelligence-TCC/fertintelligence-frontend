import { api } from "./axios";
import {
  AvailableSResponseDto,
  AvailableSCreateRequestDto,
  AvailableSPostRequestDto
} from "@/interfaces/AvailableS";

import { ENDPOINT } from "@/constants/Endpoint";

export const getAvailableSByTable = async (tableId: number): Promise<AvailableSResponseDto | null> => {
  try {
    const { data } = await api.get(`${ENDPOINT.AVAILABLE_S}/get-by-table`, {
      params: { tableId }
    });
    return data;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    throw error;
  }
};

export const createAvailableS = async (tableId: number, payload: AvailableSCreateRequestDto) => {
  const { data } = await api.post(`${ENDPOINT.AVAILABLE_S}/register`, payload, {
    params: { tableId }
  });
  return data;
};

export const updateAvailableS = async (criterionId: number, payload: AvailableSPostRequestDto) => {
  const { data } = await api.put(`${ENDPOINT.AVAILABLE_S}/update`, payload, {
    params: { criterionId }
  });
  return data;
};
