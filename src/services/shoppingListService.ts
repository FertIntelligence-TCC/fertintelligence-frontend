import { ENDPOINT } from "@/constants/Endpoint";
import {
  ShoppingListResponse,
  withEmptyRecommendationStructuredArrays,
} from "@/interfaces/Recommendation";

import { api } from "./axios";


export async function getShoppingListByRecommendation(
  recommendationId: number,
): Promise<ShoppingListResponse> {
  const { data } = await api.get<ShoppingListResponse>(
    ENDPOINT.GET_SHOPPING_LIST_BY_RECOMMENDATION,
    {
      params: { recommendationId },
    },
  );
  return withEmptyRecommendationStructuredArrays(data);
}
