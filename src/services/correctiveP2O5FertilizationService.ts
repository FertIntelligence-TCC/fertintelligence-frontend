import { AxiosError } from "axios";
import { ENDPOINT } from "@/constants/Endpoint";
import { api } from "./axios";
import {
  CorrectiveP2O5FertilizationCreateRequestDto,
  CorrectiveP2O5FertilizationPostRequestDto,
  CorrectiveP2O5FertilizationResponseDto
} from "@/interfaces/CorrectiveP2O5Fertilization";

const isNotFound = (error: unknown) =>
  error instanceof AxiosError && error.response?.status === 404;

export const getCorrectiveP2O5FertilizationByTable = async (
  tableId: number
): Promise<CorrectiveP2O5FertilizationResponseDto[]> => {
  try {
    const { data } = await api.get(ENDPOINT.GET_BY_TABLE_CORRECTIVE_P2O5_FERTILIZATION, {
      params: { tableId }
    });
    return Array.isArray(data) ? data : [];
  } catch (error) {
    if (isNotFound(error)) return [];
    throw error;
  }
};

export const createCorrectiveP2O5Fertilization = async (
  tableId: number,
  payload: CorrectiveP2O5FertilizationCreateRequestDto
) => {
  const { data } = await api.post(ENDPOINT.CREATE_CORRECTIVE_P2O5_FERTILIZATION, payload, {
    params: { tableId }
  });
  return data;
};

export const updateCorrectiveP2O5Fertilization = async (
  criterionId: number,
  payload: CorrectiveP2O5FertilizationPostRequestDto
) => {
  const { data } = await api.put(ENDPOINT.UPDATE_CORRECTIVE_P2O5_FERTILIZATION, payload, {
    params: { criterionId }
  });
  return data;
};
