import { ENDPOINT } from "@/constants/Endpoint";
import { api } from "./axios";
import {
  KExchangeableContentResponseDto,
  KExchangeableContentCreateRequestDto,
  KExchangeableContentPostRequestDto
} from "@/interfaces/KExchangeableContent";


export const getKExchangeableContentByTable = async (tableId: number): Promise<KExchangeableContentResponseDto | null> => {
  try {
    const { data } = await api.get(ENDPOINT.GET_BY_TABLE_K_EXCHANGEABLE_CONTENT, {
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
  const { data } = await api.post(ENDPOINT.CREATE_K_EXCHANGEABLE_CONTENT, payload, {
    params: { tableId }
  });
  return data;
};

export const updateKExchangeableContent = async (criterionId: number, payload: KExchangeableContentPostRequestDto) => {
  const { data } = await api.put(ENDPOINT.UPDATE_K_EXCHANGEABLE_CONTENT, payload, {
    params: { criterionId }
  });
  return data;
};
