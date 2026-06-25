import { AxiosError } from "axios";
import { ENDPOINT } from "@/constants/Endpoint";
import { api } from "./axios";
import {
  SulfurDoseCreateRequestDto,
  SulfurDosePostRequestDto,
  SulfurDoseResponseDto
} from "@/interfaces/SulfurDose";

const isNotFound = (error: unknown) =>
  error instanceof AxiosError && error.response?.status === 404;

export const getSulfurDoseByTable = async (tableId: number): Promise<SulfurDoseResponseDto | null> => {
  try {
    const { data } = await api.get(ENDPOINT.GET_BY_TABLE_SULFUR_DOSE, {
      params: { tableId }
    });
    return data;
  } catch (error) {
    if (isNotFound(error)) {
      return null;
    }
    throw error;
  }
};

export const createSulfurDose = async (tableId: number, payload: SulfurDoseCreateRequestDto) => {
  const { data } = await api.post(ENDPOINT.CREATE_SULFUR_DOSE, payload, {
    params: { tableId }
  });
  return data;
};

export const updateSulfurDose = async (criterionId: number, payload: SulfurDosePostRequestDto) => {
  const { data } = await api.put(ENDPOINT.UPDATE_SULFUR_DOSE, payload, {
    params: { criterionId }
  });
  return data;
};
