import type { CropResponseDto } from "@/interfaces/Crop";
import type {
  FertilizerSourceOption,
  OrganicFertilizerReferenceNutrient,
  RecommendationTableGroup,
  RecommendationTexturalClassification,
  RecommendationType,
} from "@/interfaces/Recommendation";

export const CROP_TABLE_INCOMPATIBILITY_MESSAGE =
  "Cultura Anual e Tabela de Adubação de Culturas incompatíveis!";

const DEFAULT_TEXTURAL_CLASSIFICATION: RecommendationTexturalClassification = "BRASILEIRO";
const recommendationTypeValues: RecommendationType[] = [
  "ACIDITY_OR_SALINITY_CORRECTION",
  "FERTILIZATION",
  "BOTH",
];
const fertilizerSourceValues: FertilizerSourceOption[] = ["PRIVATE", "PUBLIC", "DEFAULT", "ALL"];
const legacyFertilizerSourceValues: FertilizerSourceOption[] = ["BOTH", "AMBAS"];
const tableGroupValues: RecommendationTableGroup[] = ["PRIVATE", "PUBLIC", "DEFAULT"];
const organicFertilizerReferenceNutrientValues: OrganicFertilizerReferenceNutrient[] = [
  "NITROGENIO",
  "FOSFORO",
  "POTASSIO",
];

type FertilizationTableReference = {
  cropName?: string | null;
};

type GenerationValidationInput = {
  recommendationType: string;
  propertyId: string;
  plotId: string;
  physicalAnalysisExtractId: string;
  soilFertilityAnalysisId: string;
  annualCropFolderId: string;
  cropId: string;
  cropFertilizationTableId: string;
  soilFertilityInterpretationTableId: string;
  cropFoliarAnalysisInterpretationTableId: string;
  cropFertilizationTableGroup: string;
  soilFertilityInterpretationTableGroup: string;
  cropFoliarAnalysisInterpretationTableGroup: string;
  fertilizerSourceOption: FertilizerSourceOption | string;
  texturalClassification: RecommendationTexturalClassification | string | null | undefined;
  useOrganicFertilizer?: boolean;
  organicFertilizerReferenceNutrient?: OrganicFertilizerReferenceNutrient | "" | null;
  useGreenFertilizer?: boolean;
  greenFertilizerId?: string | number | null;
  selectedCrop?: CropResponseDto | null;
  selectedCropFertilizationTable?: FertilizationTableReference | null;
};

type ValidGenerationValidation = {
  isValid: true;
  recommendationType: RecommendationType;
  cropFertilizationTableGroup: RecommendationTableGroup;
  soilFertilityInterpretationTableGroup: RecommendationTableGroup;
  cropFoliarAnalysisInterpretationTableGroup: RecommendationTableGroup;
  fertilizerSourceOption: FertilizerSourceOption;
  texturalClassification: RecommendationTexturalClassification;
};

type InvalidGenerationValidation = {
  isValid: false;
  title: string;
  description?: string;
};

export type GenerationValidationResult =
  | ValidGenerationValidation
  | InvalidGenerationValidation;

export const normalizeFertilizerSourceOption = (
  value: FertilizerSourceOption,
): FertilizerSourceOption => (legacyFertilizerSourceValues.includes(value) ? "ALL" : value);

const isRecommendationType = (value: string): value is RecommendationType =>
  recommendationTypeValues.includes(value as RecommendationType);

const isFertilizerSourceOption = (value: string): value is FertilizerSourceOption =>
  fertilizerSourceValues.includes(value as FertilizerSourceOption) ||
  legacyFertilizerSourceValues.includes(value as FertilizerSourceOption);

const isRecommendationTableGroup = (value: string): value is RecommendationTableGroup =>
  tableGroupValues.includes(value as RecommendationTableGroup);

const isOrganicFertilizerReferenceNutrient = (
  value: string,
): value is OrganicFertilizerReferenceNutrient =>
  organicFertilizerReferenceNutrientValues.includes(value as OrganicFertilizerReferenceNutrient);

const isFilledNumericId = (value: string | number | null | undefined) => {
  if (value === null || value === undefined || value === "") return false;
  return Number.isFinite(Number(value));
};

const normalizeTexturalClassification = (
  value: RecommendationTexturalClassification | string | null | undefined,
): RecommendationTexturalClassification => {
  if (value === "AMERICANO" || value === "BRASILEIRO") return value;
  return DEFAULT_TEXTURAL_CLASSIFICATION;
};

const normalizeComparableCropName = (value?: string | null): string | null => {
  const normalized = value?.trim();
  return normalized || null;
};

const isAnnualCropCompatibleWithFertilizationTable = (
  crop?: CropResponseDto | null,
  table?: FertilizationTableReference | null,
) => {
  const cropName = normalizeComparableCropName(crop?.nome);
  const tableCropName = normalizeComparableCropName(table?.cropName);

  // Alguns endpoints legados podem omitir nome_comum_cultura; sem os dois nomes não há comparação segura no frontend.
  if (!cropName || !tableCropName) return true;

  return cropName === tableCropName;
};

export function validateRecommendationGeneration({
  recommendationType,
  propertyId,
  plotId,
  physicalAnalysisExtractId,
  soilFertilityAnalysisId,
  annualCropFolderId,
  cropId,
  cropFertilizationTableId,
  soilFertilityInterpretationTableId,
  cropFoliarAnalysisInterpretationTableId,
  cropFertilizationTableGroup,
  soilFertilityInterpretationTableGroup,
  cropFoliarAnalysisInterpretationTableGroup,
  fertilizerSourceOption,
  texturalClassification,
  useOrganicFertilizer = false,
  organicFertilizerReferenceNutrient,
  useGreenFertilizer = false,
  greenFertilizerId,
  selectedCrop,
  selectedCropFertilizationTable,
}: GenerationValidationInput): GenerationValidationResult {
  if (
    !recommendationType ||
    !propertyId ||
    !plotId ||
    !physicalAnalysisExtractId ||
    !soilFertilityAnalysisId ||
    !annualCropFolderId ||
    !cropId ||
    !cropFertilizationTableId ||
    !soilFertilityInterpretationTableId ||
    !cropFoliarAnalysisInterpretationTableId ||
    !fertilizerSourceOption
  ) {
    return {
      isValid: false,
      title: "Campos obrigatórios",
      description: "Preencha todos os campos necessários antes de gerar a recomendação.",
    };
  }

  if (
    !isRecommendationType(recommendationType) ||
    !isRecommendationTableGroup(cropFertilizationTableGroup) ||
    !isRecommendationTableGroup(soilFertilityInterpretationTableGroup) ||
    !isRecommendationTableGroup(cropFoliarAnalysisInterpretationTableGroup) ||
    !isFertilizerSourceOption(fertilizerSourceOption)
  ) {
    return {
      isValid: false,
      title: "Parâmetros inválidos",
      description: "Revise tipo de recomendação, grupos de tabelas e origem dos adubos antes de gerar.",
    };
  }

  if (useOrganicFertilizer) {
    if (
      !organicFertilizerReferenceNutrient ||
      !isOrganicFertilizerReferenceNutrient(organicFertilizerReferenceNutrient)
    ) {
      return {
        isValid: false,
        title: "Nutriente de referência obrigatório.",
        description: "Selecione o nutriente que será usado como referência para o adubo orgânico.",
      };
    }
  }

  if (useGreenFertilizer && !isFilledNumericId(greenFertilizerId)) {
    return {
      isValid: false,
      title: "Adubo verde obrigatório.",
      description: "Selecione o adubo verde que será usado na recomendação.",
    };
  }

  if (!selectedCrop) {
    return {
      isValid: false,
      title: "Cultura indisponível",
      description: "A cultura selecionada não foi carregada a partir da pasta anual. Selecione a pasta anual novamente antes de gerar.",
    };
  }

  if (!isAnnualCropCompatibleWithFertilizationTable(selectedCrop, selectedCropFertilizationTable)) {
    return {
      isValid: false,
      title: CROP_TABLE_INCOMPATIBILITY_MESSAGE,
    };
  }

  return {
    isValid: true,
    recommendationType,
    cropFertilizationTableGroup,
    soilFertilityInterpretationTableGroup,
    cropFoliarAnalysisInterpretationTableGroup,
    fertilizerSourceOption: normalizeFertilizerSourceOption(fertilizerSourceOption),
    texturalClassification: normalizeTexturalClassification(texturalClassification),
  };
}
