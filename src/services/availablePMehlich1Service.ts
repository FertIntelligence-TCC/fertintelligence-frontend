import { api } from "./axios";
import {
  AvailablePMehlich1ResponseDto,
  AvailablePMehlich1CreateRequestDto,
  AvailablePMehlich1PostRequestDto
} from "@/interfaces/AvailablePMehlich1";

import { ENDPOINT } from "@/constants/Endpoint";

export const getAvailablePMehlich1ByTable = async (tableId: number): Promise<AvailablePMehlich1ResponseDto | null> => {
  try {
    const { data } = await api.get(`${ENDPOINT.AVAILABLE_P_MEHLICH_1}/get-by-table`, {
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
  const { data } = await api.post(`${ENDPOINT.AVAILABLE_P_MEHLICH_1}/register`, payload, {
    params: { tableId }
  });
  return data;
};

export const updateAvailablePMehlich1 = async (criterionId: number, payload: AvailablePMehlich1PostRequestDto) => {
  const { data } = await api.put(`${ENDPOINT.AVAILABLE_P_MEHLICH_1}/update`, payload, {
    params: { criterionId }
  });
  return data;
};
