export type RecommendationType =
  | "ACIDITY_OR_SALINITY_CORRECTION"
  | "FERTILIZATION"
  | "BOTH";

export type FertilizerSourceOption = "PRIVATE" | "PUBLIC" | "DEFAULT" | "ALL" | "BOTH" | "AMBAS";
export type RecommendationTableGroup = "PRIVATE" | "PUBLIC" | "DEFAULT";
export type OrganicFertilizerReferenceNutrient = "NITROGENIO" | "FOSFORO" | "POTASSIO";

export type RecommendationLimingCriteria =
  | "SATURACAO_POR_BASES_TROCAVEIS"
  | "NEUTRALIZACAO_POR_ALUMINIO_TROCAVEL"
  | "ELEVACAO_DO_TEOR_DE_CALCIO_MAIS_MAGNESIO"
  | "NEUTRALIZACAO_POR_ALUMINIO_TROCAVEL_MAIS_ELEVACAO_DO_TEOR_DE_CALCIO_MAIS_MAGNESIO";

export type RecommendationTexturalClassification = "BRASILEIRO" | "AMERICANO";

type FlexibleEnum<T extends string> = T | (string & {});

export type RecommendationApplicationUnit = FlexibleEnum<"KG_HA" | "G_M_LINEAR" | "G_COVA">;

export type DirectRecommendationPhase = FlexibleEnum<"PLANTIO" | "COBERTURA">;

export type DirectRecommendationSelectionType = FlexibleEnum<"DIRETA" | "APROXIMADA">;

export type RecommendationMicronutrientValues = Record<string, number | string | null | undefined>;
export type RecommendationNpkValues = {
  n?: number | string | null;
  p?: number | string | null;
  p2o5?: number | string | null;
  k?: number | string | null;
  k2o?: number | string | null;
};

export interface RecommendationFertilizerLine {
  [key: string]: unknown;
  id?: number | string;

  micronutriente?: string | null;
  micronutrient?: string | null;
  nutrient?: string | null;

  dose_micronutriente_kg_ha?: number | string | null;
  doseMicronutrienteKgHa?: number | string | null;
  micronutrientDoseKgHa?: number | string | null;
  kg_ha_micronutriente?: number | string | null;
  kgHaMicronutriente?: number | string | null;

  id_adubo?: number | string | null;
  adubo_id?: number | string | null;
  fertilizerId?: number | string | null;
  idFertilizante?: number | string | null;
  id_formulado?: number | string | null;
  idFormulado?: number | string | null;
  formulatedFertilizerId?: number | string | null;

  adubo?: string | null;
  nome_adubo?: string | null;
  nomeAdubo?: string | null;
  fertilizer?: string | null;
  fertilizerName?: string | null;
  formulado?: string | null;
  nome_formulado?: string | null;
  nomeFormulado?: string | null;
  formulatedFertilizer?: string | null;
  formulatedFertilizerName?: string | null;

  tipo_adubo?: string | null;
  tipoAdubo?: string | null;
  fertilizerType?: string | null;
  grupo_adubo?: string | null;
  grupoAdubo?: string | null;
  fertilizerGroup?: string | null;

  formula?: RecommendationNpkValues | string | null;
  formula_npk?: RecommendationNpkValues | string | null;
  formulaNpk?: RecommendationNpkValues | string | null;
  npkFormula?: RecommendationNpkValues | string | null;
  n?: number | string | null;
  p?: number | string | null;
  p2o5?: number | string | null;
  k?: number | string | null;
  k2o?: number | string | null;
  formula_n?: number | string | null;
  formulaN?: number | string | null;
  formula_p?: number | string | null;
  formulaP?: number | string | null;
  formula_p2o5?: number | string | null;
  formulaP2o5?: number | string | null;
  formula_k?: number | string | null;
  formulaK?: number | string | null;
  formula_k2o?: number | string | null;
  formulaK2o?: number | string | null;

  relacao?: RecommendationNpkValues | string | null;
  relacao_npk?: RecommendationNpkValues | string | null;
  relacaoNpk?: RecommendationNpkValues | string | null;
  relacao_usada?: RecommendationNpkValues | string | null;
  relacaoUsada?: RecommendationNpkValues | string | null;
  relation?: RecommendationNpkValues | string | null;
  relationUsed?: RecommendationNpkValues | string | null;

  teor?: number | string | null;
  teor_usado?: number | string | null;
  teorUsado?: number | string | null;
  usedContent?: number | string | null;
  contentUsed?: number | string | null;

  dose_kg_ha?: number | string | null;
  doseKgHa?: number | string | null;
  kg_ha?: number | string | null;
  kgHa?: number | string | null;

  g_m_linear?: number | string | null;
  gMLinear?: number | string | null;
  gramas_m_linear?: number | string | null;
  gramasMLinear?: number | string | null;
  gramsPerLinearMeter?: number | string | null;

  g_cova?: number | string | null;
  gCova?: number | string | null;
  gramas_cova?: number | string | null;
  gramasCova?: number | string | null;
  gramsPerHole?: number | string | null;

  unidade_aplicavel?: RecommendationApplicationUnit | null;
  unidadeAplicavel?: RecommendationApplicationUnit | null;
  unidade_localizada?: RecommendationApplicationUnit | string | null;
  unidadeLocalizada?: RecommendationApplicationUnit | string | null;
  applicableUnit?: RecommendationApplicationUnit | null;

  fase?: DirectRecommendationPhase | null;
  fase_aplicacao?: DirectRecommendationPhase | string | null;
  faseAplicacao?: DirectRecommendationPhase | string | null;
  phase?: DirectRecommendationPhase | null;

  tipo_selecao?: DirectRecommendationSelectionType | null;
  tipoSelecao?: DirectRecommendationSelectionType | null;
  selectionType?: DirectRecommendationSelectionType | null;

  observacao_tecnica?: string | null;
  observacaoTecnica?: string | null;
  technicalObservation?: string | null;
  technicalNote?: string | null;

  mensagem?: string | null;
  mensagem_tecnica?: string | null;
  mensagemTecnica?: string | null;
  message?: string | null;
  technicalMessage?: string | null;

  micronutrientes?: RecommendationMicronutrientValues | null;
  micronutrientes_aplicados?: RecommendationMicronutrientValues | null;
  micronutrients?: RecommendationMicronutrientValues | null;
  appliedMicronutrients?: RecommendationMicronutrientValues | null;
}

export type SolidFertilizerWithMicronutrientsLine = RecommendationFertilizerLine;
export type PlantingFormulatedFertilizerLine = RecommendationFertilizerLine;
export type TopDressingFormulatedFertilizerLine = RecommendationFertilizerLine;
type NullableRecommendationLineArray<T> = T[] | null;

export interface RecommendationStructuredFertilizerLines {
  adubos_solidos_micronutrientes?: NullableRecommendationLineArray<SolidFertilizerWithMicronutrientsLine>;
  adubosSolidosMicronutrientes?: NullableRecommendationLineArray<SolidFertilizerWithMicronutrientsLine>;
  solidFertilizersWithMicronutrients?: NullableRecommendationLineArray<SolidFertilizerWithMicronutrientsLine>;
  linhas_adubos_solidos_micronutrientes?: NullableRecommendationLineArray<SolidFertilizerWithMicronutrientsLine>;
  linhasAdubosSolidosMicronutrientes?: NullableRecommendationLineArray<SolidFertilizerWithMicronutrientsLine>;

  formulados_plantio?: NullableRecommendationLineArray<PlantingFormulatedFertilizerLine>;
  formuladosPlantio?: NullableRecommendationLineArray<PlantingFormulatedFertilizerLine>;
  plantingFormulatedFertilizers?: NullableRecommendationLineArray<PlantingFormulatedFertilizerLine>;
  linhas_formulados_plantio?: NullableRecommendationLineArray<PlantingFormulatedFertilizerLine>;
  linhasFormuladosPlantio?: NullableRecommendationLineArray<PlantingFormulatedFertilizerLine>;

  formulados_cobertura?: NullableRecommendationLineArray<TopDressingFormulatedFertilizerLine>;
  formuladosCobertura?: NullableRecommendationLineArray<TopDressingFormulatedFertilizerLine>;
  topDressingFormulatedFertilizers?: NullableRecommendationLineArray<TopDressingFormulatedFertilizerLine>;
  linhas_formulados_cobertura?: NullableRecommendationLineArray<TopDressingFormulatedFertilizerLine>;
  linhasFormuladosCobertura?: NullableRecommendationLineArray<TopDressingFormulatedFertilizerLine>;
}

const recommendationStructuredArrayFields = [
  "adubos_solidos_micronutrientes",
  "adubosSolidosMicronutrientes",
  "solidFertilizersWithMicronutrients",
  "linhas_adubos_solidos_micronutrientes",
  "linhasAdubosSolidosMicronutrientes",
  "formulados_plantio",
  "formuladosPlantio",
  "plantingFormulatedFertilizers",
  "linhas_formulados_plantio",
  "linhasFormuladosPlantio",
  "formulados_cobertura",
  "formuladosCobertura",
  "topDressingFormulatedFertilizers",
  "linhas_formulados_cobertura",
  "linhasFormuladosCobertura",
] as const satisfies readonly (keyof RecommendationStructuredFertilizerLines)[];

export function withEmptyRecommendationStructuredArrays<T extends RecommendationStructuredFertilizerLines>(
  data: T,
): T {
  const normalized = { ...data } as T & Record<keyof RecommendationStructuredFertilizerLines, unknown>;

  for (const field of recommendationStructuredArrayFields) {
    if (!Array.isArray(normalized[field])) {
      normalized[field] = [];
    }
  }

  return normalized;
}

export interface RecommendationCreatePayload {
  tipo_recomendacao: RecommendationType;
  propertyId: number;
  plotId: number;
  physicalAnalysisExtractId: number;
  soilFertilityAnalysisId: number;
  saturationExtractAnalysisExtractId: number | null;
  annualCropFolderId: number;
  cropId: number;
  cropFertilizationTableId: number;
  soilFertilityInterpretationTableId: number;
  cropFoliarAnalysisInterpretationTableId: number;
  id_propriedade: number;
  id_talhao: number;
  id_extrato_analise_fisica: number;
  id_analise_fertilidade_solo: number;
  id_extrato_analise_extrato_saturacao: number | null;
  id_pasta_cultura_anual: number;
  id_cultura: number;
  id_tabela_adubacao_cultura: number;
  id_tabela_interpretacao_fertilidade_solo: number;
  id_tabela_interpretacao_analise_foliar: number;
  cropFertilizationTableGroup: RecommendationTableGroup;
  soilFertilityInterpretationCriteriaTableGroup: RecommendationTableGroup;
  cropFoliarAnalysisInterpretationTableGroup: RecommendationTableGroup;
  criterio_calagem?: RecommendationLimingCriteria | null;
  classificacao_textural: RecommendationTexturalClassification;
  origem_adubos: FertilizerSourceOption;
  nome_pasta_recomendacao?: string | null;
  usar_adubo_organico?: boolean;
  nutriente_referencia_adubo_organico?: OrganicFertilizerReferenceNutrient;
  usar_adubo_organomineral?: boolean;
  usar_adubo_verde?: boolean;
  greenFertilizerId?: number;
  id_adubo_verde?: number;
}

export interface RecommendationResponse {
  id: number;

  id_usuario_criador?: number;
  nome_usuario_criador?: string;
  idUsuarioCriador?: number;
  nomeUsuarioCriador?: string;

  id_propriedade?: number;
  nome_propriedade?: string;
  idPropriedade?: number;
  nomePropriedade?: string;

  id_talhao?: number;
  identificacao_talhao?: string;
  idTalhao?: number;
  identificacaoTalhao?: string;

  tipo_recomendacao?: RecommendationType;
  cultura?: string;
  ano_safra?: number;
  criterio_calagem?: RecommendationLimingCriteria | null;
  classificacao_textural?: RecommendationTexturalClassification | null;
  tipoRecomendacao?: RecommendationType;
  anoSafra?: number;
  criterioCalagem?: RecommendationLimingCriteria | null;
  classificacaoTextural?: RecommendationTexturalClassification | null;
  texturalClassification?: RecommendationTexturalClassification | null;

  origem_adubos?: FertilizerSourceOption;
  origemAdubos?: FertilizerSourceOption;

  nome_pasta_recomendacao?: string | null;
  nomePastaRecomendacao?: string | null;

  id_tabela_adubacao_cultura?: number;
  id_tabela_interpretacao_fertilidade_solo?: number;
  id_tabela_interpretacao_analise_foliar?: number;
  idTabelaAdubacaoCultura?: number;
  idTabelaInterpretacaoFertilidadeSolo?: number;
  idTabelaInterpretacaoAnaliseFoliar?: number;

  physicalAnalysisExtractId?: number;
  soilFertilityAnalysisId?: number;
  saturationExtractAnalysisExtractId?: number;
  annualCropFolderId?: number;
  cropId?: number;

  laudo_tecnico?: string;
  laudoTecnico?: string;
  technicalReport?: string;

  printable?: boolean;

  criado_em?: string;
  atualizado_em?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RecommendationPrintResponse
  extends RecommendationResponse,
    RecommendationStructuredFertilizerLines {}

interface RecommendationDocumentTextFields {
  id?: number;
  recommendationId?: number;
  id_recommendation?: number;
  conteudo?: string | null;
  content?: string | null;
  texto?: string | null;
  text?: string | null;
  documento?: string | null;
  document?: string | null;
  markdown?: string | null;
  relatorio?: string | null;
  report?: string | null;
}

export interface SummaryRecommendationResponse
  extends RecommendationDocumentTextFields,
    RecommendationStructuredFertilizerLines {
  resumo?: string | null;
  summary?: string | null;
  recomendacao_resumida?: string | null;
  recomendacaoResumida?: string | null;
  summaryRecommendation?: string | null;
}

export interface DirectRecommendationResponse
  extends RecommendationDocumentTextFields,
    RecommendationStructuredFertilizerLines {
  recomendacao_direta?: string | null;
  recomendacaoDireta?: string | null;
  direct?: string | null;
  directRecommendation?: string | null;
  observacoes_adubacao?: string | null;
  observacoesAdubacao?: string | null;
  fertilizationObservations?: string | null;
  fertilizationObservation?: string | null;
}

export interface ShoppingListResponse
  extends RecommendationDocumentTextFields,
    RecommendationStructuredFertilizerLines {
  lista_compras?: string | null;
  listaCompras?: string | null;
  shoppingList?: string | null;
  area?: number | string | null;
  area_ha?: number | string | null;
  areaHa?: number | string | null;
  area_usada_no_talhao?: number | string | null;
  areaUsadaNoTalhao?: number | string | null;
  data_plantio?: { day?: number | string; month?: number | string; year?: number | string } | string | null;
  dataPlantio?: { day?: number | string; month?: number | string; year?: number | string } | string | null;
  plantingDate?: { day?: number | string; month?: number | string; year?: number | string } | string | null;
}

export const getRecommendationReportText = (
  recommendation?: RecommendationResponse | null,
): string => {
  if (!recommendation) return "";
  return recommendation.laudo_tecnico ?? recommendation.laudoTecnico ?? recommendation.technicalReport ?? "";
};
