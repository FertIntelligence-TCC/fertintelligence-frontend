import { AxiosError } from "axios";
import { ENDPOINT } from "@/constants/Endpoint";
import { api } from "./axios";
import {
  MicronutrientDoseCreateRequestDto,
  MicronutrientDosePostRequestDto,
  MicronutrientDoseResponseDto
} from "@/interfaces/MicronutrientDose";

const isNotFound = (error: unknown) =>
  error instanceof AxiosError && error.response?.status === 404;

export const getMicronutrientDoseByTable = async (tableId: number): Promise<MicronutrientDoseResponseDto | null> => {
  try {
    const { data } = await api.get(ENDPOINT.GET_BY_TABLE_MICRONUTRIENT_DOSE, {
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

export const createMicronutrientDose = async (tableId: number, payload: MicronutrientDoseCreateRequestDto) => {
  const { data } = await api.post(ENDPOINT.CREATE_MICRONUTRIENT_DOSE, payload, {
    params: { tableId }
  });
  return data;
};

export const updateMicronutrientDose = async (criterionId: number, payload: MicronutrientDosePostRequestDto) => {
  const { data } = await api.put(ENDPOINT.UPDATE_MICRONUTRIENT_DOSE, payload, {
    params: { criterionId }
  });
  return data;
};
