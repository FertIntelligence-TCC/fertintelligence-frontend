import { ENDPOINT } from "@/constants/Endpoint";
import {
  SummaryRecommendationResponse,
  withEmptyRecommendationStructuredArrays,
} from "@/interfaces/Recommendation";

import { api } from "./axios";


export async function getSummaryRecommendationByRecommendation(
  recommendationId: number,
): Promise<SummaryRecommendationResponse> {
  const { data } = await api.get<SummaryRecommendationResponse>(
    ENDPOINT.GET_SUMMARY_RECOMMENDATION_BY_RECOMMENDATION,
    {
      params: { recommendationId },
    },
  );
  return withEmptyRecommendationStructuredArrays(data);
}
