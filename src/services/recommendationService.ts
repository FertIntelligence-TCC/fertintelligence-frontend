import { ENDPOINT } from "@/constants/Endpoint";
import {
  type FertilizerSourceOption,
  type RecommendationCreatePayload,
  type RecommendationLimingCriteria,
  type RecommendationResponse,
  type RecommendationTableGroup,
  type RecommendationTexturalClassification,
  type RecommendationType,
} from "@/interfaces/Recommendation";

import { api } from "./axios";

const DEFAULT_TEXTURAL_CLASSIFICATION: RecommendationTexturalClassification = "BRASILEIRO";

type BuildRecommendationCreatePayloadParams = {
  recommendationType: RecommendationType;
  propertyId: string | number;
  plotId: string | number;
  physicalAnalysisExtractId: string | number;
  soilFertilityAnalysisId: string | number;
  saturationExtractAnalysisExtractId?: string | number | null;
  annualCropFolderId: string | number;
  cropId: string | number;
  cropFertilizationTableId: string | number;
  soilFertilityInterpretationTableId: string | number;
  cropFoliarAnalysisInterpretationTableId: string | number;
  cropFertilizationTableGroup: RecommendationTableGroup;
  soilFertilityInterpretationTableGroup: RecommendationTableGroup;
  cropFoliarAnalysisInterpretationTableGroup: RecommendationTableGroup;
  limingCriteria?: RecommendationLimingCriteria | null;
  fertilizerSourceOption: FertilizerSourceOption;
  recommendationFolderName?: string | null;
  texturalClassification?: RecommendationTexturalClassification | string | null;
};

const normalizeTexturalClassification = (
  value?: RecommendationTexturalClassification | string | null,
): RecommendationTexturalClassification => {
  if (value === "AMERICANO" || value === "BRASILEIRO") {
    return value;
  }

  return DEFAULT_TEXTURAL_CLASSIFICATION;
};

export function buildRecommendationCreatePayload({
  recommendationType,
  propertyId,
  plotId,
  physicalAnalysisExtractId,
  soilFertilityAnalysisId,
  saturationExtractAnalysisExtractId,
  annualCropFolderId,
  cropId,
  cropFertilizationTableId,
  soilFertilityInterpretationTableId,
  cropFoliarAnalysisInterpretationTableId,
  cropFertilizationTableGroup,
  soilFertilityInterpretationTableGroup,
  cropFoliarAnalysisInterpretationTableGroup,
  limingCriteria = null,
  fertilizerSourceOption,
  recommendationFolderName,
  texturalClassification,
}: BuildRecommendationCreatePayloadParams): RecommendationCreatePayload {
  return {
    tipo_recomendacao: recommendationType,
    id_propriedade: Number(propertyId),
    id_talhao: Number(plotId),
    id_extrato_analise_fisica: Number(physicalAnalysisExtractId),
    id_analise_fertilidade_solo: Number(soilFertilityAnalysisId),
    id_extrato_analise_extrato_saturacao: saturationExtractAnalysisExtractId
      ? Number(saturationExtractAnalysisExtractId)
      : null,
    id_pasta_cultura_anual: Number(annualCropFolderId),
    id_cultura: Number(cropId),
    id_tabela_adubacao_cultura: Number(cropFertilizationTableId),
    id_tabela_interpretacao_fertilidade_solo: Number(soilFertilityInterpretationTableId),
    id_tabela_interpretacao_analise_foliar: Number(cropFoliarAnalysisInterpretationTableId),
    cropFertilizationTableGroup,
    soilFertilityInterpretationCriteriaTableGroup: soilFertilityInterpretationTableGroup,
    cropFoliarAnalysisInterpretationTableGroup,
    criterio_calagem: limingCriteria,
    classificacao_textural: normalizeTexturalClassification(texturalClassification),
    origem_adubos: fertilizerSourceOption,
    nome_pasta_recomendacao: recommendationFolderName?.trim() || null,
  };
}

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
