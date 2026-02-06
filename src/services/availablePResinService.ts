import { api } from "./axios";
import {
  AvailablePResinResponseDto,
  AvailablePResinCreateRequestDto,
  AvailablePResinPostRequestDto
} from "@/interfaces/AvailablePResin";

const ENDPOINT = "/available-p-anion-exchange-resin-extractor";

export const getAvailablePResinByTable = async (tableId: number): Promise<AvailablePResinResponseDto | null> => {
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

export const createAvailablePResin = async (tableId: number, payload: AvailablePResinCreateRequestDto) => {
  const { data } = await api.post(`${ENDPOINT}/register`, payload, {
    params: { tableId }
  });
  return data;
};

export const updateAvailablePResin = async (criterionId: number, payload: AvailablePResinPostRequestDto) => {
  const { data } = await api.put(`${ENDPOINT}/update`, payload, {
    params: { criterionId }
  });
  return data;
};