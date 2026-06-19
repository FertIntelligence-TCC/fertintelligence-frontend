import { ENDPOINT } from "@/constants/Endpoint";
import { api } from "./axios";
import type { ContentRangeCreateRequest, ContentRangeUpdateRequest, ContentRangeResponseDto, ContentRangeReplaceByNutrientRequest } from "@/interfaces/CropFertilizationTable";

export const createContentRange = async (
  tableId: number,
  payload: ContentRangeCreateRequest
): Promise<ContentRangeResponseDto> => {
  const response = await api.post<ContentRangeResponseDto>(
    ENDPOINT.CREATE_CONTENT_RANGE,
    payload,
    { params: { tableId } }
  );
  return response.data;
};

// NOVA FUNÇÃO: Buscar todas as faixas de uma tabela
export const fetchContentRangesByTable = async (tableId: number): Promise<ContentRangeResponseDto[]> => {
    const response = await api.get<ContentRangeResponseDto[]>(ENDPOINT.GET_CONTENT_RANGE_BY_TABLE, {
        params: { tableId }
    });
    return response.data;
};

export const deleteContentRange = async (contentRangeId: number): Promise<void> => {
    await api.delete(ENDPOINT.DELETE_CONTENT_RANGE, {
        params: { contentRangeId }
    });
};


export const updateContentRange = async (
  contentRangeId: number,
  payload: ContentRangeUpdateRequest
): Promise<ContentRangeResponseDto> => {
  const response = await api.put<ContentRangeResponseDto>(
    ENDPOINT.UPDATE_CONTENT_RANGE,
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
    ENDPOINT.REPLACE_BY_NUTRIENT_CONTENT_RANGE,
    payload,
    { params: { tableId, nutrient } }
  );
  return response.data;
};

