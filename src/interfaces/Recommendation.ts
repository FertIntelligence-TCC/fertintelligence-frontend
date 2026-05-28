export type RecommendationType =
  | "ACIDITY_OR_SALINITY_CORRECTION"
  | "FERTILIZATION"
  | "BOTH";

export type RecommendationCropName =
  | "ALGODAO"
  | "AMENDOIM"
  | "CANA_DE_ACUCAR"
  | "FEIJAO_CAUPI"
  | "FEIJAO_COMUM"
  | "GERGELIM"
  | "MAMONA"
  | "MILHO"
  | "SISAL"
  | "SOJA";

export type RecommendationFertilizerOrigin =
  | "PRIVATE"
  | "PUBLIC"
  | "BOTH";

export type RecommendationLimingCriteria =
  | "SATURACAO_POR_BASES_TROCAVEIS"
  | "NEUTRALIZACAO_POR_ALUMINIO_TROCAVEL"
  | "ELEVACAO_DO_TEOR_DE_CALCIO_MAIS_MAGNESIO"
  | "NEUTRALIZACAO_POR_ALUMINIO_TROCAVEL_MAIS_ELEVACAO_DO_TEOR_DE_CALCIO_MAIS_MAGNESIO";

export interface RecommendationCreatePayload {
  tipo_recomendacao: RecommendationType;
  id_propriedade: number;
  id_talhao: number;
  ano_safra: number;
  cultura: RecommendationCropName;
  id_tabela_adubacao_cultura: number;
  id_tabela_interpretacao_fertilidade_solo: number;
  id_tabela_interpretacao_analise_foliar: number;
  criterio_calagem: RecommendationLimingCriteria;
  origem_adubos: RecommendationFertilizerOrigin;
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
  cultura?: RecommendationCropName;
  ano_safra?: number;
  criterio_calagem?: RecommendationLimingCriteria;
  tipoRecomendacao?: RecommendationType;
  anoSafra?: number;
  criterioCalagem?: RecommendationLimingCriteria;

  id_tabela_adubacao_cultura?: number;
  id_tabela_interpretacao_fertilidade_solo?: number;
  id_tabela_interpretacao_analise_foliar?: number;
  idTabelaAdubacaoCultura?: number;
  idTabelaInterpretacaoFertilidadeSolo?: number;
  idTabelaInterpretacaoAnaliseFoliar?: number;

  laudo_tecnico?: string;
  technicalReport?: string;

  printable?: boolean;

  criado_em?: string;
  atualizado_em?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const getRecommendationReportText = (
  recommendation?: RecommendationResponse | null,
): string => {
  if (!recommendation) return "";
  return recommendation.laudo_tecnico ?? recommendation.technicalReport ?? "";
};
