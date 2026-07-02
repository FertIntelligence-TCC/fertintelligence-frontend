import { AxiosError } from "axios";
import { ENDPOINT } from "@/constants/Endpoint";
import { api } from "./axios";
import {
  CtcSaturationCreateRequestDto,
  CtcSaturationPostRequestDto,
  CtcSaturationResponseDto
} from "@/interfaces/CtcSaturation";

const isNotFound = (error: unknown) =>
  error instanceof AxiosError && error.response?.status === 404;

export const getCtcSaturationByTable = async (tableId: number): Promise<CtcSaturationResponseDto | null> => {
  try {
    const { data } = await api.get(ENDPOINT.GET_BY_TABLE_CTC_SATURATION, {
      params: { tableId }
    });
    return data;
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
};

export const createCtcSaturation = async (tableId: number, payload: CtcSaturationCreateRequestDto) => {
  const { data } = await api.post(ENDPOINT.CREATE_CTC_SATURATION, payload, {
    params: { tableId }
  });
  return data;
};

export const updateCtcSaturation = async (criterionId: number, payload: CtcSaturationPostRequestDto) => {
  const { data } = await api.put(ENDPOINT.UPDATE_CTC_SATURATION, payload, {
    params: { criterionId }
  });
  return data;
};
