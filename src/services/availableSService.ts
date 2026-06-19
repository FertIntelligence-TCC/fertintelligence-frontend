import { ENDPOINT } from "@/constants/Endpoint";
import { api } from "./axios";
import {
  AvailableSResponseDto,
  AvailableSCreateRequestDto,
  AvailableSPostRequestDto
} from "@/interfaces/AvailableS";


export const getAvailableSByTable = async (tableId: number): Promise<AvailableSResponseDto | null> => {
  try {
    const { data } = await api.get(ENDPOINT.GET_BY_TABLE_AVAILABLE_S, {
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
  const { data } = await api.post(ENDPOINT.CREATE_AVAILABLE_S, payload, {
    params: { tableId }
  });
  return data;
};

export const updateAvailableS = async (criterionId: number, payload: AvailableSPostRequestDto) => {
  const { data } = await api.put(ENDPOINT.UPDATE_AVAILABLE_S, payload, {
    params: { criterionId }
  });
  return data;
};
