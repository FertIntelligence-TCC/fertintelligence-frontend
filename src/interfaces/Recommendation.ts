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

export interface GypsumRecommendationFields {
  gessagem?: GypsumRecommendationPayload | string | null;
  recomendacao_gessagem?: GypsumRecommendationPayload | string | null;
  recomendacaoGessagem?: GypsumRecommendationPayload | string | null;
  gypsumRecommendation?: GypsumRecommendationPayload | string | null;
  gesso_agricola?: GypsumRecommendationPayload | string | null;
  gessoAgricola?: GypsumRecommendationPayload | string | null;
  agriculturalGypsum?: GypsumRecommendationPayload | string | null;
}

export interface GypsumRecommendationPayload {
  [key: string]: unknown;
}

export interface SulfurRecommendationFields {
  enxofre?: SulfurRecommendationPayload | string | null;
  recomendacao_enxofre?: SulfurRecommendationPayload | string | null;
  recomendacaoEnxofre?: SulfurRecommendationPayload | string | null;
  sulfur?: SulfurRecommendationPayload | string | null;
  sulfurRecommendation?: SulfurRecommendationPayload | string | null;
  adubacao_enxofre?: SulfurRecommendationPayload | string | null;
  adubacaoEnxofre?: SulfurRecommendationPayload | string | null;
  sulfurFertilization?: SulfurRecommendationPayload | string | null;
}

export interface SulfurRecommendationPayload {
  [key: string]: unknown;
}

export interface EconomicFertilizerDecisionFields {
  decisao_economica?: EconomicFertilizerDecisionPayload | EconomicFertilizerDecisionPayload[] | string | null;
  decisaoEconomica?: EconomicFertilizerDecisionPayload | EconomicFertilizerDecisionPayload[] | string | null;
  economicDecision?: EconomicFertilizerDecisionPayload | EconomicFertilizerDecisionPayload[] | string | null;
  economic_decision?: EconomicFertilizerDecisionPayload | EconomicFertilizerDecisionPayload[] | string | null;
  decisoes_economicas?: EconomicFertilizerDecisionPayload[] | null;
  decisoesEconomicas?: EconomicFertilizerDecisionPayload[] | null;
  economicDecisions?: EconomicFertilizerDecisionPayload[] | null;
  comparativos_economicos?: EconomicFertilizerDecisionPayload[] | null;
  comparativosEconomicos?: EconomicFertilizerDecisionPayload[] | null;
  economicComparisons?: EconomicFertilizerDecisionPayload[] | null;
  comparativos_economicos_adubos?: EconomicFertilizerDecisionPayload[] | null;
  comparativosEconomicosAdubos?: EconomicFertilizerDecisionPayload[] | null;
  fertilizerEconomicComparisons?: EconomicFertilizerDecisionPayload[] | null;
}

export interface EconomicFertilizerDecisionPayload {
  [key: string]: unknown;
}

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
  nutriente?: string | null;
  nutriente_objetivo?: string | null;
  nutrienteObjetivo?: string | null;
  nutrientObjective?: string | null;
  objetivo?: string | null;
  objective?: string | null;

  tipo?: string | null;
  type?: string | null;
  tipo_linha?: string | null;
  tipoLinha?: string | null;
  lineType?: string | null;
  tipo_fonte?: string | null;
  tipoFonte?: string | null;
  sourceType?: string | null;

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
  c?: number | string | null;
  teor_umidade?: number | string | null;
  teorUmidade?: number | string | null;
  teor_materia_organica?: number | string | null;
  teorMateriaOrganica?: number | string | null;
  teor_cinzas?: number | string | null;
  teorCinzas?: number | string | null;
  produtividade_esperada?: number | string | null;
  produtividadeEsperada?: number | string | null;
  taxa_mineralizacao_ano_1?: number | string | null;
  taxaMineralizacaoAno1?: number | string | null;
  taxa_mineralizacao_ano_2?: number | string | null;
  taxaMineralizacaoAno2?: number | string | null;
  taxa_mineralizacao_ano_3?: number | string | null;
  taxaMineralizacaoAno3?: number | string | null;
  densidade_g_ml?: number | string | null;
  densidadeGMl?: number | string | null;
  concentracao_volume_g_l?: number | string | null;
  concentracaoVolumeGL?: number | string | null;
  concentracao_massa_g_kg?: number | string | null;
  concentracaoMassaGKg?: number | string | null;
  proteinas_g_l?: number | string | null;
  proteinasGL?: number | string | null;
  aminoacidos_g_l?: number | string | null;
  aminoacidosGL?: number | string | null;
  amidos_g_l?: number | string | null;
  amidosGL?: number | string | null;
  acucares_g_l?: number | string | null;
  acucaresGL?: number | string | null;
  compostos_diversos_g_l?: number | string | null;
  compostosDiversosGL?: number | string | null;
  indice_salino?: number | string | null;
  indiceSalino?: number | string | null;
  indice_acidez?: number | string | null;
  indiceAcidez?: number | string | null;

  dose_kg_ha?: number | string | null;
  doseKgHa?: number | string | null;
  kg_ha?: number | string | null;
  kgHa?: number | string | null;
  dose_l_ha?: number | string | null;
  doseLHa?: number | string | null;
  l_ha?: number | string | null;
  lHa?: number | string | null;
  litros_ha?: number | string | null;
  litrosHa?: number | string | null;
  quantidade?: number | string | null;
  quantidade_total?: number | string | null;
  quantidadeTotal?: number | string | null;
  quantity?: number | string | null;
  totalQuantity?: number | string | null;
  total_area?: number | string | null;
  totalArea?: number | string | null;
  totalForArea?: number | string | null;
  unidade_quantidade?: string | null;
  unidadeQuantidade?: string | null;
  quantityUnit?: string | null;
  unidade?: string | null;
  unit?: string | null;

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
  justificativa?: string | null;
  justification?: string | null;
  limitacoes?: string | null;
  limitações?: string | null;
  limitations?: string | null;

  mensagem?: string | null;
  mensagem_tecnica?: string | null;
  mensagemTecnica?: string | null;
  message?: string | null;
  technicalMessage?: string | null;

  n_recomendado_cobertura_kg_ha?: number | string | null;
  nRecomendadoCoberturaKgHa?: number | string | null;
  recommendedTopDressingNKgHa?: number | string | null;
  k2o_recomendado_cobertura_kg_ha?: number | string | null;
  k2oRecomendadoCoberturaKgHa?: number | string | null;
  recommendedTopDressingK2oKgHa?: number | string | null;
  saldo_plantio_n_kg_ha?: number | string | null;
  saldoPlantioNKgHa?: number | string | null;
  plantingBalanceNKgHa?: number | string | null;
  saldo_plantio_k2o_kg_ha?: number | string | null;
  saldoPlantioK2oKgHa?: number | string | null;
  plantingBalanceK2oKgHa?: number | string | null;
  saldo_plantio_s_kg_ha?: number | string | null;
  saldoPlantioSKgHa?: number | string | null;
  plantingBalanceSKgHa?: number | string | null;
  n_fornecido_kg_ha?: number | string | null;
  nFornecidoKgHa?: number | string | null;
  suppliedNKgHa?: number | string | null;
  k2o_fornecido_kg_ha?: number | string | null;
  k2oFornecidoKgHa?: number | string | null;
  suppliedK2oKgHa?: number | string | null;
  s_fornecido_kg_ha?: number | string | null;
  sFornecidoKgHa?: number | string | null;
  enxofre_fornecido_kg_ha?: number | string | null;
  enxofreFornecidoKgHa?: number | string | null;
  suppliedSKgHa?: number | string | null;
  saldo_final_n_kg_ha?: number | string | null;
  saldoFinalNKgHa?: number | string | null;
  finalBalanceNKgHa?: number | string | null;
  saldo_final_k2o_kg_ha?: number | string | null;
  saldoFinalK2oKgHa?: number | string | null;
  finalBalanceK2oKgHa?: number | string | null;
  saldo_final_s_kg_ha?: number | string | null;
  saldoFinalSKgHa?: number | string | null;
  finalBalanceSKgHa?: number | string | null;

  micronutrientes?: RecommendationMicronutrientValues | null;
  micronutrientes_aplicados?: RecommendationMicronutrientValues | null;
  micronutrients?: RecommendationMicronutrientValues | null;
  appliedMicronutrients?: RecommendationMicronutrientValues | null;
}

export type SolidFertilizerWithMicronutrientsLine = RecommendationFertilizerLine;
export type PlantingFormulatedFertilizerLine = RecommendationFertilizerLine;
export type TopDressingFormulatedFertilizerLine = RecommendationFertilizerLine;
export type OrganicFertilizerRecommendationLine = RecommendationFertilizerLine;
export type GreenFertilizerRecommendationLine = RecommendationFertilizerLine;
export type OrganoMineralFertilizerRecommendationLine = RecommendationFertilizerLine;
export type BioFertilizerRecommendationLine = RecommendationFertilizerLine;
type NullableRecommendationLineArray<T> = T[] | null;

export interface RecommendationStructuredFertilizerLines extends GypsumRecommendationFields, SulfurRecommendationFields, EconomicFertilizerDecisionFields {
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

  opcao_1?: RecommendationOptionFertilizationPayload | null;
  opcao1?: RecommendationOptionFertilizationPayload | null;
  option1?: RecommendationOptionFertilizationPayload | null;
  option_1?: RecommendationOptionFertilizationPayload | null;
  adubacao_opcao_1?: RecommendationOptionFertilizationPayload | null;
  adubacaoOpcao1?: RecommendationOptionFertilizationPayload | null;
  fertilizationOption1?: RecommendationOptionFertilizationPayload | null;
  recomendacao_opcao_1?: RecommendationOptionFertilizationPayload | null;
  recomendacaoOpcao1?: RecommendationOptionFertilizationPayload | null;

  opcao_2?: RecommendationOptionFertilizationPayload | null;
  opcao2?: RecommendationOptionFertilizationPayload | null;
  option2?: RecommendationOptionFertilizationPayload | null;
  option_2?: RecommendationOptionFertilizationPayload | null;
  adubacao_opcao_2?: RecommendationOptionFertilizationPayload | null;
  adubacaoOpcao2?: RecommendationOptionFertilizationPayload | null;
  fertilizationOption2?: RecommendationOptionFertilizationPayload | null;
  recomendacao_opcao_2?: RecommendationOptionFertilizationPayload | null;
  recomendacaoOpcao2?: RecommendationOptionFertilizationPayload | null;

  plantio_opcao_1?: NullableRecommendationLineArray<PlantingFormulatedFertilizerLine>;
  plantioOpcao1?: NullableRecommendationLineArray<PlantingFormulatedFertilizerLine>;
  plantingOption1?: NullableRecommendationLineArray<PlantingFormulatedFertilizerLine>;
  formulados_plantio_opcao_1?: NullableRecommendationLineArray<PlantingFormulatedFertilizerLine>;
  formuladosPlantioOpcao1?: NullableRecommendationLineArray<PlantingFormulatedFertilizerLine>;
  cobertura_opcao_1?: NullableRecommendationLineArray<TopDressingFormulatedFertilizerLine>;
  coberturaOpcao1?: NullableRecommendationLineArray<TopDressingFormulatedFertilizerLine>;
  topDressingOption1?: NullableRecommendationLineArray<TopDressingFormulatedFertilizerLine>;
  formulados_cobertura_opcao_1?: NullableRecommendationLineArray<TopDressingFormulatedFertilizerLine>;
  formuladosCoberturaOpcao1?: NullableRecommendationLineArray<TopDressingFormulatedFertilizerLine>;

  plantio_opcao_2?: NullableRecommendationLineArray<RecommendationFertilizerLine>;
  plantioOpcao2?: NullableRecommendationLineArray<RecommendationFertilizerLine>;
  plantingOption2?: NullableRecommendationLineArray<RecommendationFertilizerLine>;
  adubos_simples_plantio?: NullableRecommendationLineArray<RecommendationFertilizerLine>;
  adubosSimplesPlantio?: NullableRecommendationLineArray<RecommendationFertilizerLine>;
  cobertura_opcao_2?: NullableRecommendationLineArray<RecommendationFertilizerLine>;
  coberturaOpcao2?: NullableRecommendationLineArray<RecommendationFertilizerLine>;
  topDressingOption2?: NullableRecommendationLineArray<RecommendationFertilizerLine>;
  adubos_simples_cobertura?: NullableRecommendationLineArray<RecommendationFertilizerLine>;
  adubosSimplesCobertura?: NullableRecommendationLineArray<RecommendationFertilizerLine>;

  adubos_organicos?: NullableRecommendationLineArray<OrganicFertilizerRecommendationLine>;
  adubosOrganicos?: NullableRecommendationLineArray<OrganicFertilizerRecommendationLine>;
  organicFertilizers?: NullableRecommendationLineArray<OrganicFertilizerRecommendationLine>;
  linhas_adubos_organicos?: NullableRecommendationLineArray<OrganicFertilizerRecommendationLine>;
  linhasAdubosOrganicos?: NullableRecommendationLineArray<OrganicFertilizerRecommendationLine>;

  adubos_verdes?: NullableRecommendationLineArray<GreenFertilizerRecommendationLine>;
  adubosVerdes?: NullableRecommendationLineArray<GreenFertilizerRecommendationLine>;
  greenFertilizers?: NullableRecommendationLineArray<GreenFertilizerRecommendationLine>;
  linhas_adubos_verdes?: NullableRecommendationLineArray<GreenFertilizerRecommendationLine>;
  linhasAdubosVerdes?: NullableRecommendationLineArray<GreenFertilizerRecommendationLine>;

  adubos_organominerais?: NullableRecommendationLineArray<OrganoMineralFertilizerRecommendationLine>;
  adubosOrganominerais?: NullableRecommendationLineArray<OrganoMineralFertilizerRecommendationLine>;
  organoMineralFertilizers?: NullableRecommendationLineArray<OrganoMineralFertilizerRecommendationLine>;
  linhas_adubos_organominerais?: NullableRecommendationLineArray<OrganoMineralFertilizerRecommendationLine>;
  linhasAdubosOrganominerais?: NullableRecommendationLineArray<OrganoMineralFertilizerRecommendationLine>;

  biofertilizantes?: NullableRecommendationLineArray<BioFertilizerRecommendationLine>;
  bioFertilizantes?: NullableRecommendationLineArray<BioFertilizerRecommendationLine>;
  bioFertilizers?: NullableRecommendationLineArray<BioFertilizerRecommendationLine>;
  linhas_biofertilizantes?: NullableRecommendationLineArray<BioFertilizerRecommendationLine>;
  linhasBiofertilizantes?: NullableRecommendationLineArray<BioFertilizerRecommendationLine>;

  linhas?: NullableRecommendationLineArray<RecommendationFertilizerLine>;
  linhas_recomendacao?: NullableRecommendationLineArray<RecommendationFertilizerLine>;
  linhasRecomendacao?: NullableRecommendationLineArray<RecommendationFertilizerLine>;
  recommendationLines?: NullableRecommendationLineArray<RecommendationFertilizerLine>;
  itens?: NullableRecommendationLineArray<RecommendationFertilizerLine>;
  items?: NullableRecommendationLineArray<RecommendationFertilizerLine>;
}

export interface RecommendationOptionFertilizationPayload {
  [key: string]: unknown;
  plantio?: NullableRecommendationLineArray<RecommendationFertilizerLine> | RecommendationFertilizerLine | null;
  planting?: NullableRecommendationLineArray<RecommendationFertilizerLine> | RecommendationFertilizerLine | null;
  adubacao_plantio?: NullableRecommendationLineArray<RecommendationFertilizerLine> | RecommendationFertilizerLine | null;
  adubacaoPlantio?: NullableRecommendationLineArray<RecommendationFertilizerLine> | RecommendationFertilizerLine | null;
  cobertura?: NullableRecommendationLineArray<RecommendationFertilizerLine> | RecommendationFertilizerLine | null;
  topDressing?: NullableRecommendationLineArray<RecommendationFertilizerLine> | RecommendationFertilizerLine | null;
  adubacao_cobertura?: NullableRecommendationLineArray<RecommendationFertilizerLine> | RecommendationFertilizerLine | null;
  adubacaoCobertura?: NullableRecommendationLineArray<RecommendationFertilizerLine> | RecommendationFertilizerLine | null;
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
  "plantio_opcao_1",
  "plantioOpcao1",
  "plantingOption1",
  "formulados_plantio_opcao_1",
  "formuladosPlantioOpcao1",
  "cobertura_opcao_1",
  "coberturaOpcao1",
  "topDressingOption1",
  "formulados_cobertura_opcao_1",
  "formuladosCoberturaOpcao1",
  "plantio_opcao_2",
  "plantioOpcao2",
  "plantingOption2",
  "adubos_simples_plantio",
  "adubosSimplesPlantio",
  "cobertura_opcao_2",
  "coberturaOpcao2",
  "topDressingOption2",
  "adubos_simples_cobertura",
  "adubosSimplesCobertura",
  "adubos_organicos",
  "adubosOrganicos",
  "organicFertilizers",
  "linhas_adubos_organicos",
  "linhasAdubosOrganicos",
  "adubos_verdes",
  "adubosVerdes",
  "greenFertilizers",
  "linhas_adubos_verdes",
  "linhasAdubosVerdes",
  "adubos_organominerais",
  "adubosOrganominerais",
  "organoMineralFertilizers",
  "linhas_adubos_organominerais",
  "linhasAdubosOrganominerais",
  "biofertilizantes",
  "bioFertilizantes",
  "bioFertilizers",
  "linhas_biofertilizantes",
  "linhasBiofertilizantes",
  "decisoes_economicas",
  "decisoesEconomicas",
  "economicDecisions",
  "comparativos_economicos",
  "comparativosEconomicos",
  "economicComparisons",
  "comparativos_economicos_adubos",
  "comparativosEconomicosAdubos",
  "fertilizerEconomicComparisons",
  "linhas",
  "linhas_recomendacao",
  "linhasRecomendacao",
  "recommendationLines",
  "itens",
  "items",
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

export interface RecommendationFertilizerModalityPayload {
  usar_adubo_organico?: boolean;
  nutriente_referencia_adubo_organico?: OrganicFertilizerReferenceNutrient;
  usar_adubo_organomineral?: boolean;
  usar_biofertilizante?: boolean;
  usar_adubo_verde?: boolean;
  greenFertilizerId?: number;
  id_adubo_verde?: number;
}

export interface RecommendationCreatePayload extends RecommendationFertilizerModalityPayload {
  tipo_recomendacao: RecommendationType;
  propertyId: number;
  plotId: number;
  physicalAnalysisId: number;
  fertilityAnalysisId: number;
  saturationExtractAnalysisId: number | null;
  annualCropFolderId: number;
  cropId: number;
  cropFertilizationTableId: number;
  soilFertilityInterpretationTableId: number;
  cropFoliarAnalysisInterpretationTableId: number | null;
  id_propriedade: number;
  id_talhao: number;
  id_analise_fisica: number;
  id_analise_fertilidade: number;
  id_analise_extrato_saturacao: number | null;
  id_pasta_cultura_anual: number;
  id_cultura: number;
  id_tabela_adubacao_cultura: number;
  id_tabela_interpretacao_fertilidade_solo: number;
  id_tabela_interpretacao_analise_foliar: number | null;
  cropFertilizationTableGroup: RecommendationTableGroup;
  soilFertilityInterpretationCriteriaTableGroup: RecommendationTableGroup;
  cropFoliarAnalysisInterpretationTableGroup: RecommendationTableGroup | null;
  criterio_calagem?: RecommendationLimingCriteria | null;
  classificacao_textural: RecommendationTexturalClassification;
  origem_adubos: FertilizerSourceOption;
  nome_pasta_recomendacao?: string | null;
}

export interface RecommendationResponse extends RecommendationFertigramFields, GypsumRecommendationFields, SulfurRecommendationFields, EconomicFertilizerDecisionFields {
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

export interface RecommendationFertigramItem {
  [key: string]: unknown;
  label?: string | null;
  rotulo?: string | null;
  shortLabel?: string | null;
  rotulo_curto?: string | null;
  valor_analisado?: number | string | null;
  analyzedValue?: number | string | null;
  valor?: number | string | null;
  unit?: string | null;
  unidade?: string | null;
  valor_normalizado?: number | string | null;
  normalizedValue?: number | string | null;
  minimo_normalizado?: number | string | null;
  adequado_min_normalizado?: number | string | null;
  normalizedAdequateMin?: number | string | null;
  maximo_normalizado?: number | string | null;
  adequado_max_normalizado?: number | string | null;
  normalizedAdequateMax?: number | string | null;
  minimo_adequado?: number | string | null;
  adequado_min?: number | string | null;
  maximo_adequado?: number | string | null;
  adequado_max?: number | string | null;
  recommendedMin?: number | string | null;
  recommendedMax?: number | string | null;
  interpretacao?: string | null;
  interpretation?: string | null;
  faixa?: string | null;
  faixa_adequada?: string | null;
  rangeLabel?: string | null;
  observacao?: string | null;
  observation?: string | null;
}

export interface RecommendationFertigramGroup {
  [key: string]: unknown;
  title?: string | null;
  titulo?: string | null;
  groupKey?: string | null;
  chave_grupo?: string | null;
  sourceSection?: string | null;
  secao_origem?: string | null;
  items?: RecommendationFertigramItem[] | null;
  itens?: RecommendationFertigramItem[] | null;
  nutrientes?: RecommendationFertigramItem[] | null;
  parametros?: RecommendationFertigramItem[] | null;
}

export interface RecommendationFertigramFields {
  fertigramas?: RecommendationFertigramGroup[] | null;
  fertigrams?: RecommendationFertigramGroup[] | null;
  fertigramas_recomendacao?: RecommendationFertigramGroup[] | null;
  fertigramasRecomendacao?: RecommendationFertigramGroup[] | null;
  recommendationFertigramas?: RecommendationFertigramGroup[] | null;
  recommendationFertigramCharts?: RecommendationFertigramGroup[] | null;
  fertigramas_diagnostico_quimico?: RecommendationFertigramGroup[] | null;
  diagnostico_quimico_fertigramas?: RecommendationFertigramGroup[] | null;
  chemicalDiagnosisFertigramas?: RecommendationFertigramGroup[] | null;
  fertigramas_diagnostico_foliar?: RecommendationFertigramGroup[] | null;
  diagnostico_foliar_fertigramas?: RecommendationFertigramGroup[] | null;
  foliarDiagnosisFertigramas?: RecommendationFertigramGroup[] | null;
  recomendacao_geral?: RecommendationFertigramFields | string | null;
  recomendacao_resumida?: RecommendationFertigramFields | string | null;
  summaryRecommendation?: RecommendationFertigramFields | string | null;
  generalRecommendation?: RecommendationFertigramFields | string | null;
  selectedRecommendation?: RecommendationFertigramFields | null;
  selectedSummaryRecommendation?: RecommendationFertigramFields | null;
  selectedGeneralRecommendation?: RecommendationFertigramFields | null;
}

export interface RecommendationPrintResponse
  extends RecommendationResponse,
    RecommendationStructuredFertilizerLines,
    GypsumRecommendationFields,
    SulfurRecommendationFields,
    EconomicFertilizerDecisionFields,
    RecommendationFertigramFields {}

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
  mensagem?: string | null;
  mensagem_tecnica?: string | null;
  mensagemTecnica?: string | null;
  message?: string | null;
  technicalMessage?: string | null;
  observacao_tecnica?: string | null;
  observacaoTecnica?: string | null;
  technicalObservation?: string | null;
}

export interface SummaryRecommendationResponse
  extends RecommendationDocumentTextFields,
    RecommendationStructuredFertilizerLines,
    GypsumRecommendationFields,
    SulfurRecommendationFields,
    EconomicFertilizerDecisionFields,
    RecommendationFertigramFields {
  resumo?: string | null;
  summary?: string | null;
  recomendacao_resumida?: string | null;
  recomendacaoResumida?: string | null;
  summaryRecommendation?: string | null;
}

export interface DirectRecommendationResponse
  extends RecommendationDocumentTextFields,
    RecommendationStructuredFertilizerLines,
    GypsumRecommendationFields,
    SulfurRecommendationFields,
    EconomicFertilizerDecisionFields,
    RecommendationFertigramFields {
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
    RecommendationStructuredFertilizerLines,
    GypsumRecommendationFields,
    SulfurRecommendationFields,
    EconomicFertilizerDecisionFields {
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
