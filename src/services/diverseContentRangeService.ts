import { api } from "./axios";
import {
  DiverseContentRangeResponseDto,
  DiverseContentRangeCreateRequestDto,
  DiverseContentRangePostRequestDto
} from "@/interfaces/DiverseContentRange";

const ENDPOINT = "/diverse-content-range";

export const getDiverseContentRangeByTable = async (tableId: number): Promise<DiverseContentRangeResponseDto | null> => {
  try {
    const { data } = await api.get(`${ENDPOINT}/get-by-table`, {
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
  const { data } = await api.post(`${ENDPOINT}/register`, payload, {
    params: { tableId }
  });
  return data;
};

export const updateDiverseContentRange = async (criterionId: number, payload: DiverseContentRangePostRequestDto) => {
  const { data } = await api.put(`${ENDPOINT}/update`, payload, {
    params: { criterionId }
  });
  return data;
};