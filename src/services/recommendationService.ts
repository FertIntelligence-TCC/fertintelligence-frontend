import { ENDPOINT } from "@/constants/Endpoint";
import {
  type FertilizerSourceOption,
  type OrganicFertilizerReferenceNutrient,
  type RecommendationCreatePayload,
  type RecommendationLimingCriteria,
  type RecommendationPrintResponse,
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
  useOrganicFertilizer?: boolean;
  organicFertilizerReferenceNutrient?: OrganicFertilizerReferenceNutrient | "" | null;
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
  useOrganicFertilizer = false,
  organicFertilizerReferenceNutrient,
}: BuildRecommendationCreatePayloadParams): RecommendationCreatePayload {
  const normalizedPropertyId = Number(propertyId);
  const normalizedPlotId = Number(plotId);
  const normalizedPhysicalAnalysisExtractId = Number(physicalAnalysisExtractId);
  const normalizedSoilFertilityAnalysisId = Number(soilFertilityAnalysisId);
  const normalizedSaturationExtractAnalysisExtractId = saturationExtractAnalysisExtractId
    ? Number(saturationExtractAnalysisExtractId)
    : null;
  const normalizedAnnualCropFolderId = Number(annualCropFolderId);
  const normalizedCropId = Number(cropId);
  const normalizedCropFertilizationTableId = Number(cropFertilizationTableId);
  const normalizedSoilFertilityInterpretationTableId = Number(soilFertilityInterpretationTableId);
  const normalizedCropFoliarAnalysisInterpretationTableId = Number(cropFoliarAnalysisInterpretationTableId);

  const payload: RecommendationCreatePayload = {
    tipo_recomendacao: recommendationType,
    propertyId: normalizedPropertyId,
    plotId: normalizedPlotId,
    physicalAnalysisExtractId: normalizedPhysicalAnalysisExtractId,
    soilFertilityAnalysisId: normalizedSoilFertilityAnalysisId,
    saturationExtractAnalysisExtractId: normalizedSaturationExtractAnalysisExtractId,
    annualCropFolderId: normalizedAnnualCropFolderId,
    cropId: normalizedCropId,
    cropFertilizationTableId: normalizedCropFertilizationTableId,
    soilFertilityInterpretationTableId: normalizedSoilFertilityInterpretationTableId,
    cropFoliarAnalysisInterpretationTableId: normalizedCropFoliarAnalysisInterpretationTableId,
    id_propriedade: normalizedPropertyId,
    id_talhao: normalizedPlotId,
    id_extrato_analise_fisica: normalizedPhysicalAnalysisExtractId,
    id_analise_fertilidade_solo: normalizedSoilFertilityAnalysisId,
    id_extrato_analise_extrato_saturacao: normalizedSaturationExtractAnalysisExtractId,
    id_pasta_cultura_anual: normalizedAnnualCropFolderId,
    id_cultura: normalizedCropId,
    id_tabela_adubacao_cultura: normalizedCropFertilizationTableId,
    id_tabela_interpretacao_fertilidade_solo: normalizedSoilFertilityInterpretationTableId,
    id_tabela_interpretacao_analise_foliar: normalizedCropFoliarAnalysisInterpretationTableId,
    cropFertilizationTableGroup,
    soilFertilityInterpretationCriteriaTableGroup: soilFertilityInterpretationTableGroup,
    cropFoliarAnalysisInterpretationTableGroup,
    criterio_calagem: limingCriteria,
    classificacao_textural: normalizeTexturalClassification(texturalClassification),
    origem_adubos: fertilizerSourceOption,
    nome_pasta_recomendacao: recommendationFolderName?.trim() || null,
  };

  if (useOrganicFertilizer) {
    payload.usar_adubo_organico = true;
    if (organicFertilizerReferenceNutrient) {
      payload.nutriente_referencia_adubo_organico = organicFertilizerReferenceNutrient;
    }
  }

  return payload;
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

export async function preparePrintRecommendation(id: number): Promise<RecommendationPrintResponse> {
  const { data } = await api.get<RecommendationPrintResponse>(ENDPOINT.PREPARE_PRINT_RECOMMENDATION, {
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
