export type RecommendationType =
  | "ACIDITY_OR_SALINITY_CORRECTION"
  | "FERTILIZATION"
  | "BOTH";

export type FertilizerSourceOption = "PRIVATE" | "PUBLIC" | "DEFAULT" | "ALL" | "BOTH" | "AMBAS";
export type RecommendationTableGroup = "PRIVATE" | "PUBLIC" | "DEFAULT";

export type RecommendationLimingCriteria =
  | "SATURACAO_POR_BASES_TROCAVEIS"
  | "NEUTRALIZACAO_POR_ALUMINIO_TROCAVEL"
  | "ELEVACAO_DO_TEOR_DE_CALCIO_MAIS_MAGNESIO"
  | "NEUTRALIZACAO_POR_ALUMINIO_TROCAVEL_MAIS_ELEVACAO_DO_TEOR_DE_CALCIO_MAIS_MAGNESIO";

export interface RecommendationCreatePayload {
  tipo_recomendacao: RecommendationType;
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
  origem_adubos: FertilizerSourceOption;
  nome_pasta_recomendacao?: string | null;
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
  tipoRecomendacao?: RecommendationType;
  anoSafra?: number;
  criterioCalagem?: RecommendationLimingCriteria | null;

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

export interface SummaryRecommendationResponse extends RecommendationDocumentTextFields {
  resumo?: string | null;
  summary?: string | null;
  recomendacao_resumida?: string | null;
  recomendacaoResumida?: string | null;
  summaryRecommendation?: string | null;
}

export interface DirectRecommendationResponse extends RecommendationDocumentTextFields {
  recomendacao_direta?: string | null;
  recomendacaoDireta?: string | null;
  direct?: string | null;
  directRecommendation?: string | null;
}

export interface ShoppingListResponse extends RecommendationDocumentTextFields {
  lista_compras?: string | null;
  listaCompras?: string | null;
  shoppingList?: string | null;
}

export const getRecommendationReportText = (
  recommendation?: RecommendationResponse | null,
): string => {
  if (!recommendation) return "";
  return recommendation.laudo_tecnico ?? recommendation.laudoTecnico ?? recommendation.technicalReport ?? "";
};
