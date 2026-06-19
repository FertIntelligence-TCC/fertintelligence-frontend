import { ENDPOINT } from "@/constants/Endpoint";
import { api } from "./axios";
import {
  AvailablePResinResponseDto,
  AvailablePResinCreateRequestDto,
  AvailablePResinPostRequestDto
} from "@/interfaces/AvailablePResin";


export const getAvailablePResinByTable = async (tableId: number): Promise<AvailablePResinResponseDto | null> => {
  try {
    const { data } = await api.get(ENDPOINT.GET_BY_TABLE_AVAILABLE_P_ANION_EXCHANGE_RESIN_EXTRACTOR, {
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

export const createAvailablePResin = async (tableId: number, payload: AvailablePResinCreateRequestDto) => {
  const { data } = await api.post(ENDPOINT.CREATE_AVAILABLE_P_ANION_EXCHANGE_RESIN_EXTRACTOR, payload, {
    params: { tableId }
  });
  return data;
};

export const updateAvailablePResin = async (criterionId: number, payload: AvailablePResinPostRequestDto) => {
  const { data } = await api.put(ENDPOINT.UPDATE_AVAILABLE_P_ANION_EXCHANGE_RESIN_EXTRACTOR, payload, {
    params: { criterionId }
  });
  return data;
};
