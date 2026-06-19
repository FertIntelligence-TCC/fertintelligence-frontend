import { api } from "./axios";
import {
  DiverseContentRangeResponseDto,
  DiverseContentRangeCreateRequestDto,
  DiverseContentRangePostRequestDto
} from "@/interfaces/DiverseContentRange";

import { ENDPOINT } from "@/constants/Endpoint";

export const getDiverseContentRangeByTable = async (tableId: number): Promise<DiverseContentRangeResponseDto | null> => {
  try {
    const { data } = await api.get(`${ENDPOINT.DIVERSE_CONTENT_RANGE}/get-by-table`, {
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

export const createDiverseContentRange = async (tableId: number, payload: DiverseContentRangeCreateRequestDto) => {
  const { data } = await api.post(`${ENDPOINT.DIVERSE_CONTENT_RANGE}/register`, payload, {
    params: { tableId }
  });
  return data;
};

export const updateDiverseContentRange = async (criterionId: number, payload: DiverseContentRangePostRequestDto) => {
  const { data } = await api.put(`${ENDPOINT.DIVERSE_CONTENT_RANGE}/update`, payload, {
    params: { criterionId }
  });
  return data;
};
