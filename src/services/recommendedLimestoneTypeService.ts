import { AxiosError } from "axios";
import { ENDPOINT } from "@/constants/Endpoint";
import { api } from "./axios";
import {
  RecommendedLimestoneTypeCreateRequestDto,
  RecommendedLimestoneTypePostRequestDto,
  RecommendedLimestoneTypeResponseDto
} from "@/interfaces/RecommendedLimestoneType";

const isNotFound = (error: unknown) =>
  error instanceof AxiosError && error.response?.status === 404;

export const getRecommendedLimestoneTypeByTable = async (tableId: number): Promise<RecommendedLimestoneTypeResponseDto | null> => {
  try {
    const { data } = await api.get(ENDPOINT.GET_BY_TABLE_RECOMMENDED_LIMESTONE_TYPE, {
      params: { tableId }
    });
    return data;
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
};

export const createRecommendedLimestoneType = async (tableId: number, payload: RecommendedLimestoneTypeCreateRequestDto) => {
  const { data } = await api.post(ENDPOINT.CREATE_RECOMMENDED_LIMESTONE_TYPE, payload, {
    params: { tableId }
  });
  return data;
};

export const updateRecommendedLimestoneType = async (criterionId: number, payload: RecommendedLimestoneTypePostRequestDto) => {
  const { data } = await api.put(ENDPOINT.UPDATE_RECOMMENDED_LIMESTONE_TYPE, payload, {
    params: { criterionId }
  });
  return data;
};
