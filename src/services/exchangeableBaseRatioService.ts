import { AxiosError } from "axios";
import { ENDPOINT } from "@/constants/Endpoint";
import { api } from "./axios";
import {
  ExchangeableBaseRatioCreateRequestDto,
  ExchangeableBaseRatioPostRequestDto,
  ExchangeableBaseRatioResponseDto
} from "@/interfaces/ExchangeableBaseRatio";

const isNotFound = (error: unknown) =>
  error instanceof AxiosError && error.response?.status === 404;

export const getExchangeableBaseRatioByTable = async (tableId: number): Promise<ExchangeableBaseRatioResponseDto | null> => {
  try {
    const { data } = await api.get(ENDPOINT.GET_BY_TABLE_EXCHANGEABLE_BASE_RATIO, {
      params: { tableId }
    });
    return data;
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
};

export const createExchangeableBaseRatio = async (tableId: number, payload: ExchangeableBaseRatioCreateRequestDto) => {
  const { data } = await api.post(ENDPOINT.CREATE_EXCHANGEABLE_BASE_RATIO, payload, {
    params: { tableId }
  });
  return data;
};

export const updateExchangeableBaseRatio = async (criterionId: number, payload: ExchangeableBaseRatioPostRequestDto) => {
  const { data } = await api.put(ENDPOINT.UPDATE_EXCHANGEABLE_BASE_RATIO, payload, {
    params: { criterionId }
  });
  return data;
};
