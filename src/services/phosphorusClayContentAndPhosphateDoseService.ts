import { AxiosError } from "axios";
import { ENDPOINT } from "@/constants/Endpoint";
import { api } from "./axios";
import {
  PhosphorusClayContentAndPhosphateDoseCreateRequestDto,
  PhosphorusClayContentAndPhosphateDosePostRequestDto,
  PhosphorusClayContentAndPhosphateDoseResponseDto
} from "@/interfaces/PhosphorusClayContentAndPhosphateDose";

const isNotFound = (error: unknown) =>
  error instanceof AxiosError && error.response?.status === 404;

export const getPhosphorusClayContentAndPhosphateDoseByTable = async (
  tableId: number
): Promise<PhosphorusClayContentAndPhosphateDoseResponseDto | null> => {
  try {
    const { data } = await api.get(
      ENDPOINT.GET_BY_TABLE_PHOSPHORUS_CLAY_CONTENT_AND_PHOSPHATE_DOSE,
      { params: { tableId } }
    );
    return data;
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
};

export const createPhosphorusClayContentAndPhosphateDose = async (
  tableId: number,
  payload: PhosphorusClayContentAndPhosphateDoseCreateRequestDto
) => {
  const { data } = await api.post(
    ENDPOINT.CREATE_PHOSPHORUS_CLAY_CONTENT_AND_PHOSPHATE_DOSE,
    payload,
    { params: { tableId } }
  );
  return data;
};

export const updatePhosphorusClayContentAndPhosphateDose = async (
  criterionId: number,
  payload: PhosphorusClayContentAndPhosphateDosePostRequestDto
) => {
  const { data } = await api.put(
    ENDPOINT.UPDATE_PHOSPHORUS_CLAY_CONTENT_AND_PHOSPHATE_DOSE,
    payload,
    { params: { criterionId } }
  );
  return data;
};
