import { ENDPOINT } from "@/constants/Endpoint";
import { api } from "./axios";
import {
  DiverseContentRangeResponseDto,
  DiverseContentRangeCreateRequestDto,
  DiverseContentRangePostRequestDto
} from "@/interfaces/DiverseContentRange";


export const getDiverseContentRangeByTable = async (tableId: number): Promise<DiverseContentRangeResponseDto | null> => {
  try {
    const { data } = await api.get(ENDPOINT.GET_BY_TABLE_DIVERSE_CONTENT_RANGE, {
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
  const { data } = await api.post(ENDPOINT.CREATE_DIVERSE_CONTENT_RANGE, payload, {
    params: { tableId }
  });
  return data;
};

export const updateDiverseContentRange = async (criterionId: number, payload: DiverseContentRangePostRequestDto) => {
  const { data } = await api.put(ENDPOINT.UPDATE_DIVERSE_CONTENT_RANGE, payload, {
    params: { criterionId }
  });
  return data;
};
