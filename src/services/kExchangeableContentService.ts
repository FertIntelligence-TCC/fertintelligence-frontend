import { api } from "./axios";
import {
  KExchangeableContentResponseDto,
  KExchangeableContentCreateRequestDto,
  KExchangeableContentPostRequestDto
} from "@/interfaces/KExchangeableContent";

const ENDPOINT = "/k-exchangeable-content";

export const getKExchangeableContentByTable = async (tableId: number): Promise<KExchangeableContentResponseDto | null> => {
  try {
    const { data } = await api.get(`${ENDPOINT}/get-by-table`, {
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
  const { data } = await api.post(`${ENDPOINT}/register`, payload, {
    params: { tableId }
  });
  return data;
};

export const updateKExchangeableContent = async (criterionId: number, payload: KExchangeableContentPostRequestDto) => {
  const { data } = await api.put(`${ENDPOINT}/update`, payload, {
    params: { criterionId }
  });
  return data;
};