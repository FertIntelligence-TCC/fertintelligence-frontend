import { AxiosError } from "axios";
import { ENDPOINT } from "@/constants/Endpoint";
import { api } from "./axios";
import {
  CorrectiveK2OFertilizationCreateRequestDto,
  CorrectiveK2OFertilizationPostRequestDto,
  CorrectiveK2OFertilizationResponseDto
} from "@/interfaces/CorrectiveK2OFertilization";

const isNotFound = (error: unknown) =>
  error instanceof AxiosError && error.response?.status === 404;

export const getCorrectiveK2OFertilizationByTable = async (
  tableId: number
): Promise<CorrectiveK2OFertilizationResponseDto[]> => {
  try {
    const { data } = await api.get(ENDPOINT.GET_BY_TABLE_CORRECTIVE_K2O_FERTILIZATION, {
      params: { tableId }
    });
    return Array.isArray(data) ? data : [];
  } catch (error) {
    if (isNotFound(error)) return [];
    throw error;
  }
};

export const createCorrectiveK2OFertilization = async (
  tableId: number,
  payload: CorrectiveK2OFertilizationCreateRequestDto
) => {
  const { data } = await api.post(ENDPOINT.CREATE_CORRECTIVE_K2O_FERTILIZATION, payload, {
    params: { tableId }
  });
  return data;
};

export const updateCorrectiveK2OFertilization = async (
  criterionId: number,
  payload: CorrectiveK2OFertilizationPostRequestDto
) => {
  const { data } = await api.put(ENDPOINT.UPDATE_CORRECTIVE_K2O_FERTILIZATION, payload, {
    params: { criterionId }
  });
  return data;
};

export const deleteCorrectiveK2OFertilization = async (criterionId: number) => {
  await api.delete(ENDPOINT.DELETE_CORRECTIVE_K2O_FERTILIZATION, {
    params: { criterionId }
  });
};
