import { ENDPOINT } from "@/constants/Endpoint";
import { api } from "./axios";
import {
  ExchangeableSodiumCreateRequestDto,
  ExchangeableSodiumPostRequestDto,
  ExchangeableSodiumResponseDto
} from "@/interfaces/ExchangeableSodium";

export const getExchangeableSodiumByTable = async (tableId: number): Promise<ExchangeableSodiumResponseDto | null> => {
  try {
    const { data } = await api.get(ENDPOINT.GET_BY_TABLE_EXCHANGEABLE_SODIUM, {
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

export const createExchangeableSodium = async (tableId: number, payload: ExchangeableSodiumCreateRequestDto) => {
  const { data } = await api.post(ENDPOINT.CREATE_EXCHANGEABLE_SODIUM, payload, {
    params: { tableId }
  });
  return data;
};

export const updateExchangeableSodium = async (criterionId: number, payload: ExchangeableSodiumPostRequestDto) => {
  const { data } = await api.put(ENDPOINT.UPDATE_EXCHANGEABLE_SODIUM, payload, {
    params: { criterionId }
  });
  return data;
};
