import { RecommendationCreatePayload, RecommendationResponse } from "@/interfaces/Recommendation";
import { AxiosError } from "axios";

import { api } from "./axios";

const ENDPOINT = "/recommendation";

export async function generateRecommendation(
  payload: RecommendationCreatePayload,
): Promise<RecommendationResponse> {
  try {
    const { data } = await api.post<RecommendationResponse>(`${ENDPOINT}/generate`, payload);
    return data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    const message = String(axiosError.response?.data?.message ?? "").toLowerCase();
    const shouldRetryWithoutFertilizerSource =
      axiosError.response?.status === 400 &&
      (message.includes("origem_adubos") || message.includes("origem adubos"));

    if (!shouldRetryWithoutFertilizerSource) {
      throw error;
    }

    const { origem_adubos, ...legacyPayload } = payload;
    const { data } = await api.post<RecommendationResponse>(`${ENDPOINT}/generate`, legacyPayload);
    return data;
  }
}

export async function getRecommendation(id: number): Promise<RecommendationResponse> {
  const { data } = await api.get<RecommendationResponse>(`${ENDPOINT}/get`, {
    params: { id },
  });
  return data;
}

export async function getMyRecommendations(): Promise<RecommendationResponse[]> {
  const { data } = await api.get<RecommendationResponse[]>(`${ENDPOINT}/my`);
  return data;
}

export async function getRecommendationsByProperty(
  propertyId: number,
): Promise<RecommendationResponse[]> {
  const { data } = await api.get<RecommendationResponse[]>(`${ENDPOINT}/property`, {
    params: { propertyId },
  });
  return data;
}

export async function getRecommendationsByPlot(plotId: number): Promise<RecommendationResponse[]> {
  const { data } = await api.get<RecommendationResponse[]>(`${ENDPOINT}/plot`, {
    params: { plotId },
  });
  return data;
}

export async function preparePrintRecommendation(id: number): Promise<RecommendationResponse> {
  const { data } = await api.get<RecommendationResponse>(`${ENDPOINT}/print`, {
    params: { id },
  });
  return data;
}

export async function deleteRecommendation(id: number): Promise<void> {
  await api.delete(`${ENDPOINT}/delete`, {
    params: { id },
  });
}

export async function improveRecommendationNarrative(id: number): Promise<RecommendationResponse> {
  const { data } = await api.post<RecommendationResponse>(`${ENDPOINT}/improve-narrative`, undefined, {
    params: { id },
  });
  return data;
}
