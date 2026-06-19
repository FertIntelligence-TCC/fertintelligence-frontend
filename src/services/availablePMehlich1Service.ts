import { ENDPOINT } from "@/constants/Endpoint";
import { api } from "./axios";
import {
  AvailablePMehlich1ResponseDto,
  AvailablePMehlich1CreateRequestDto,
  AvailablePMehlich1PostRequestDto
} from "@/interfaces/AvailablePMehlich1";


export const getAvailablePMehlich1ByTable = async (tableId: number): Promise<AvailablePMehlich1ResponseDto | null> => {
  try {
    const { data } = await api.get(ENDPOINT.GET_BY_TABLE_AVAILABLE_P_MEHLICH_1_EXTRACTOR, {
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
  const { data } = await api.post(ENDPOINT.CREATE_AVAILABLE_P_MEHLICH_1_EXTRACTOR, payload, {
    params: { tableId }
  });
  return data;
};

export const updateAvailablePMehlich1 = async (criterionId: number, payload: AvailablePMehlich1PostRequestDto) => {
  const { data } = await api.put(ENDPOINT.UPDATE_AVAILABLE_P_MEHLICH_1_EXTRACTOR, payload, {
    params: { criterionId }
  });
  return data;
};
