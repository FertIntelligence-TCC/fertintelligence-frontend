import { api } from "./axios";
import {
  AvailablePMehlich1ResponseDto,
  AvailablePMehlich1CreateRequestDto,
  AvailablePMehlich1PostRequestDto
} from "@/interfaces/AvailablePMehlich1";

const ENDPOINT = "/available-p-mehlich-1-extractor";

export const getAvailablePMehlich1ByTable = async (tableId: number): Promise<AvailablePMehlich1ResponseDto | null> => {
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

export const createAvailablePMehlich1 = async (tableId: number, payload: AvailablePMehlich1CreateRequestDto) => {
  const { data } = await api.post(`${ENDPOINT}/register`, payload, {
    params: { tableId }
  });
  return data;
};

export const updateAvailablePMehlich1 = async (criterionId: number, payload: AvailablePMehlich1PostRequestDto) => {
  const { data } = await api.put(`${ENDPOINT}/update`, payload, {
    params: { criterionId }
  });
  return data;
};