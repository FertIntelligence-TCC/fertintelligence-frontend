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
  physicalAnalysisId: string | number;
  fertilityAnalysisId: string | number;
  saturationExtractAnalysisId?: string | number | null;
  annualCropFolderId: string | number;
  cropId: string | number;
  cropFertilizationTableId: string | number;
  soilFertilityInterpretationTableId: string | number;
  cropFoliarAnalysisInterpretationTableId?: string | number | null;
  cropFertilizationTableGroup: RecommendationTableGroup;
  soilFertilityInterpretationTableGroup: RecommendationTableGroup;
  cropFoliarAnalysisInterpretationTableGroup?: RecommendationTableGroup | null;
  limingCriteria?: RecommendationLimingCriteria | null;
  fertilizerSourceOption: FertilizerSourceOption;
  recommendationFolderName?: string | null;
  texturalClassification?: RecommendationTexturalClassification | string | null;
  useOrganicFertilizer?: boolean;
  organicFertilizerId?: string | number | null;
  organicFertilizerReferenceNutrient?: OrganicFertilizerReferenceNutrient | "" | null;
  useOrganoMineralFertilizer?: boolean;
  useBioFertilizer?: boolean;
  useGreenFertilizer?: boolean;
  greenFertilizerId?: string | number | null;
  correctiveSoilFertilization?: {
    adubacaoCorretivaSolo: boolean;
    areaIncorporacaoConversaoRecente: boolean;
    areaDegradadaMaisDeCincoAnosSemAdubacao: boolean;
    areaErosaoLaminarSulcoEmRecuperacao: boolean;
    cultivoAltaTecnologiaAltasProdutividades: boolean;
  };
};

const normalizeTexturalClassification = (
  value?: RecommendationTexturalClassification | string | null,
): RecommendationTexturalClassification => {
  if (value === "AMERICANO" || value === "BRASILEIRO") {
    return value;
  }

  return DEFAULT_TEXTURAL_CLASSIFICATION;
};

const normalizeOptionalNumericId = (value?: string | number | null): number | null => {
  if (value === null || value === undefined || value === "") return null;

  const normalizedValue = Number(value);
  return Number.isFinite(normalizedValue) ? normalizedValue : null;
};

export function buildRecommendationCreatePayload({
  recommendationType,
  propertyId,
  plotId,
  physicalAnalysisId,
  fertilityAnalysisId,
  saturationExtractAnalysisId,
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
  organicFertilizerId,
  organicFertilizerReferenceNutrient,
  useOrganoMineralFertilizer = false,
  useBioFertilizer = false,
  useGreenFertilizer = false,
  greenFertilizerId,
  correctiveSoilFertilization,
}: BuildRecommendationCreatePayloadParams): RecommendationCreatePayload {
  const normalizedPropertyId = Number(propertyId);
  const normalizedPlotId = Number(plotId);
  const normalizedPhysicalAnalysisId = Number(physicalAnalysisId);
  const normalizedFertilityAnalysisId = Number(fertilityAnalysisId);
  const normalizedSaturationExtractAnalysisId = saturationExtractAnalysisId
    ? Number(saturationExtractAnalysisId)
    : null;
  const normalizedAnnualCropFolderId = Number(annualCropFolderId);
  const normalizedCropId = Number(cropId);
  const normalizedCropFertilizationTableId = Number(cropFertilizationTableId);
  const normalizedSoilFertilityInterpretationTableId = Number(soilFertilityInterpretationTableId);
  const normalizedCropFoliarAnalysisInterpretationTableId = normalizeOptionalNumericId(
    cropFoliarAnalysisInterpretationTableId,
  );

  const payload: RecommendationCreatePayload = {
    tipo_recomendacao: recommendationType,
    propertyId: normalizedPropertyId,
    plotId: normalizedPlotId,
    physicalAnalysisId: normalizedPhysicalAnalysisId,
    fertilityAnalysisId: normalizedFertilityAnalysisId,
    saturationExtractAnalysisId: normalizedSaturationExtractAnalysisId,
    annualCropFolderId: normalizedAnnualCropFolderId,
    cropId: normalizedCropId,
    cropFertilizationTableId: normalizedCropFertilizationTableId,
    soilFertilityInterpretationTableId: normalizedSoilFertilityInterpretationTableId,
    cropFoliarAnalysisInterpretationTableId: normalizedCropFoliarAnalysisInterpretationTableId,
    id_propriedade: normalizedPropertyId,
    id_talhao: normalizedPlotId,
    id_analise_fisica: normalizedPhysicalAnalysisId,
    id_analise_fertilidade: normalizedFertilityAnalysisId,
    id_analise_extrato_saturacao: normalizedSaturationExtractAnalysisId,
    id_pasta_cultura_anual: normalizedAnnualCropFolderId,
    id_cultura: normalizedCropId,
    id_tabela_adubacao_cultura: normalizedCropFertilizationTableId,
    id_tabela_interpretacao_fertilidade_solo: normalizedSoilFertilityInterpretationTableId,
    id_tabela_interpretacao_analise_foliar: normalizedCropFoliarAnalysisInterpretationTableId,
    cropFertilizationTableGroup,
    soilFertilityInterpretationCriteriaTableGroup: soilFertilityInterpretationTableGroup,
    cropFoliarAnalysisInterpretationTableGroup: normalizedCropFoliarAnalysisInterpretationTableId
      ? cropFoliarAnalysisInterpretationTableGroup ?? null
      : null,
    criterio_calagem: limingCriteria,
    classificacao_textural: normalizeTexturalClassification(texturalClassification),
    origem_adubos: fertilizerSourceOption,
    nome_pasta_recomendacao: recommendationFolderName?.trim() || null,
    adubacaoCorretivaSolo: correctiveSoilFertilization?.adubacaoCorretivaSolo ?? false,
    areaIncorporacaoConversaoRecente: correctiveSoilFertilization?.areaIncorporacaoConversaoRecente ?? false,
    areaDegradadaMaisDeCincoAnosSemAdubacao:
      correctiveSoilFertilization?.areaDegradadaMaisDeCincoAnosSemAdubacao ?? false,
    areaErosaoLaminarSulcoEmRecuperacao:
      correctiveSoilFertilization?.areaErosaoLaminarSulcoEmRecuperacao ?? false,
    cultivoAltaTecnologiaAltasProdutividades:
      correctiveSoilFertilization?.cultivoAltaTecnologiaAltasProdutividades ?? false,
  };

  if (useOrganicFertilizer) {
    payload.usar_adubo_organico = true;
    const normalizedOrganicFertilizerId = normalizeOptionalNumericId(organicFertilizerId);
    if (normalizedOrganicFertilizerId !== null) {
      payload.id_adubo_organico = normalizedOrganicFertilizerId;
      payload.organicFertilizerId = normalizedOrganicFertilizerId;
    }
    if (organicFertilizerReferenceNutrient) {
      payload.nutriente_referencia_adubo_organico = organicFertilizerReferenceNutrient;
    }
  }

  if (useOrganoMineralFertilizer) {
    payload.usar_adubo_organomineral = true;
  }

  if (useBioFertilizer) {
    payload.usar_biofertilizante = true;
  }

  const normalizedGreenFertilizerId = normalizeOptionalNumericId(greenFertilizerId);
  if (useGreenFertilizer && normalizedGreenFertilizerId !== null) {
    payload.usar_adubo_verde = true;
    payload.greenFertilizerId = normalizedGreenFertilizerId;
    payload.id_adubo_verde = normalizedGreenFertilizerId;
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
