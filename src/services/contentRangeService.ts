import { ENDPOINT } from "@/constants/Endpoint";
import type {
  ContentRangeCreateRequest,
  ContentRangeReplaceByNutrientRequest,
  ContentRangeResponseDto,
  ContentRangeUpdateRequest,
} from "@/interfaces/CropFertilizationTable";

import { api } from "./axios";

export const createContentRange = async (
  tableId: number,
  payload: ContentRangeCreateRequest
): Promise<ContentRangeResponseDto> => {
  const response = await api.post<ContentRangeResponseDto>(
    `${ENDPOINT.CONTENT_RANGE}/register`,
    payload,
    { params: { tableId } }
  );
  return response.data;
};

export const fetchContentRangesByTable = async (tableId: number): Promise<ContentRangeResponseDto[]> => {
    const response = await api.get<ContentRangeResponseDto[]>(`${ENDPOINT.CONTENT_RANGE}/get-by-table`, {
        params: { tableId }
    });
    return response.data;
};

export const deleteContentRange = async (contentRangeId: number): Promise<void> => {
    await api.delete(`${ENDPOINT.CONTENT_RANGE}/delete`, {
        params: { contentRangeId }
    });
};

export const updateContentRange = async (
  contentRangeId: number,
  payload: ContentRangeUpdateRequest
): Promise<ContentRangeResponseDto> => {
  const response = await api.put<ContentRangeResponseDto>(
    `${ENDPOINT.CONTENT_RANGE}/update`,
    payload,
    { params: { contentRangeId } }
  );
  return response.data;
};

export const replaceContentRangesByNutrient = async (
  tableId: number,
  nutrient: "FOSFORO" | "POTASSIO",
  payload: ContentRangeReplaceByNutrientRequest
): Promise<ContentRangeResponseDto[]> => {
  const response = await api.put<ContentRangeResponseDto[]>(
    `${ENDPOINT.CONTENT_RANGE}/replace-by-nutrient`,
    payload,
    { params: { tableId, nutrient } }
  );
  return response.data;
};

