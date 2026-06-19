import { api } from "./axios";
import {
  KExchangeableContentResponseDto,
  KExchangeableContentCreateRequestDto,
  KExchangeableContentPostRequestDto
} from "@/interfaces/KExchangeableContent";

import { ENDPOINT } from "@/constants/Endpoint";

export const getKExchangeableContentByTable = async (tableId: number): Promise<KExchangeableContentResponseDto | null> => {
  try {
    const { data } = await api.get(`${ENDPOINT.K_EXCHANGEABLE_CONTENT}/get-by-table`, {
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

export const createKExchangeableContent = async (tableId: number, payload: KExchangeableContentCreateRequestDto) => {
  const { data } = await api.post(`${ENDPOINT.K_EXCHANGEABLE_CONTENT}/register`, payload, {
    params: { tableId }
  });
  return data;
};

export const updateKExchangeableContent = async (criterionId: number, payload: KExchangeableContentPostRequestDto) => {
  const { data } = await api.put(`${ENDPOINT.K_EXCHANGEABLE_CONTENT}/update`, payload, {
    params: { criterionId }
  });
  return data;
};
