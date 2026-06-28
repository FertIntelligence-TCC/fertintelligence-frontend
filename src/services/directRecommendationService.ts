import { ENDPOINT } from "@/constants/Endpoint";
import {
  DirectRecommendationResponse,
  withEmptyRecommendationStructuredArrays,
} from "@/interfaces/Recommendation";

import { api } from "./axios";


export async function getDirectRecommendationByRecommendation(
  recommendationId: number,
): Promise<DirectRecommendationResponse> {
  const { data } = await api.get<DirectRecommendationResponse>(
    ENDPOINT.GET_DIRECT_RECOMMENDATION_BY_RECOMMENDATION,
    {
      params: { recommendationId },
    },
  );
  return withEmptyRecommendationStructuredArrays(data);
}
