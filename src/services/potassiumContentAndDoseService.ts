import { AxiosError } from "axios";
import { ENDPOINT } from "@/constants/Endpoint";
import { api } from "./axios";
import {
  PotassiumContentAndDoseCreateRequestDto,
  PotassiumContentAndDosePostRequestDto,
  PotassiumContentAndDoseResponseDto
} from "@/interfaces/PotassiumContentAndDose";

const isNotFound = (error: unknown) =>
  error instanceof AxiosError && error.response?.status === 404;

export const getPotassiumContentAndDoseByTable = async (
  tableId: number
): Promise<PotassiumContentAndDoseResponseDto | null> => {
  try {
    const { data } = await api.get(ENDPOINT.GET_BY_TABLE_POTASSIUM_CONTENT_AND_DOSE, {
      params: { tableId }
    });
    return data;
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
};

export const createPotassiumContentAndDose = async (
  tableId: number,
  payload: PotassiumContentAndDoseCreateRequestDto
) => {
  const { data } = await api.post(ENDPOINT.CREATE_POTASSIUM_CONTENT_AND_DOSE, payload, {
    params: { tableId }
  });
  return data;
};

export const updatePotassiumContentAndDose = async (
  criterionId: number,
  payload: PotassiumContentAndDosePostRequestDto
) => {
  const { data } = await api.put(ENDPOINT.UPDATE_POTASSIUM_CONTENT_AND_DOSE, payload, {
    params: { criterionId }
  });
  return data;
};
