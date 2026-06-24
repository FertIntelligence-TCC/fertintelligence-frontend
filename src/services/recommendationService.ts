import { ENDPOINT } from "@/constants/Endpoint";
import { RecommendationCreatePayload, RecommendationResponse } from "@/interfaces/Recommendation";

import { api } from "./axios";


export async function generateRecommendation(
  payload: RecommendationCreatePayload,
): Promise<RecommendationResponse> {
  const { data } = await api.post<RecommendationResponse>(ENDPOINT.GENERATE_RECOMMENDATION, payload);
  return data;
}

export async function getRecommendation(id: number): Promise<RecommendationResponse> {
  const { data } = await api.get<RecommendationResponse>(ENDPOINT.GET_RECOMMENDATION, {
    params: { id },
  });
  return data;
}

export async function getMyRecommendations(): Promise<RecommendationResponse[]> {
  const { data } = await api.get<RecommendationResponse[]>(ENDPOINT.GET_MY_RECOMMENDATION);
  return data;
}

export async function getRecommendationsByProperty(
  propertyId: number,
): Promise<RecommendationResponse[]> {
  const { data } = await api.get<RecommendationResponse[]>(ENDPOINT.GET_BY_PROPERTY_RECOMMENDATION, {
    params: { propertyId },
  });
  return data;
}

export async function getRecommendationsByPlot(plotId: number): Promise<RecommendationResponse[]> {
  const { data } = await api.get<RecommendationResponse[]>(ENDPOINT.GET_BY_PLOT_RECOMMENDATION, {
    params: { plotId },
  });
  return data;
}

export async function preparePrintRecommendation(id: number): Promise<RecommendationResponse> {
  const { data } = await api.get<RecommendationResponse>(ENDPOINT.PREPARE_PRINT_RECOMMENDATION, {
    params: { id },
  });
  return data;
}

export async function deleteRecommendation(id: number): Promise<void> {
  await api.delete(ENDPOINT.DELETE_RECOMMENDATION, {
    params: { id },
  });
}

export async function improveRecommendationNarrative(id: number): Promise<RecommendationResponse> {
  const { data } = await api.post<RecommendationResponse>(ENDPOINT.IMPROVE_NARRATIVE_RECOMMENDATION, undefined, {
    params: { id },
  });
  return data;
}
