import { Badge, Box, Heading, HStack, SimpleGrid, Text, VStack } from "@chakra-ui/react";

import type {
  BioFertilizerRecommendationLine,
  GreenFertilizerRecommendationLine,
  GypsumRecommendationFields,
  OrganicFertilizerRecommendationLine,
  OrganoMineralFertilizerRecommendationLine,
  RecommendationFertilizerLine,
  RecommendationStructuredFertilizerLines,
  ShoppingListResponse,
  SulfurRecommendationFields,
} from "@/interfaces/Recommendation";
import {
  getFirstRecommendationText,
  normalizeRecommendationText,
} from "@/utils/recommendationLocalizedDose";

import FormulatedPlantingFertilizerTable, {
  FormulatedTopDressingFertilizerTable,
  hasFormulatedPlantingFertilizerRows,
  hasFormulatedTopDressingFertilizerRows,
} from "./FormulatedPlantingFertilizerTable";
import MicronutrientFertilizerTable, { hasMicronutrientFertilizerRows } from "./MicronutrientFertilizerTable";
import RecommendationTable, { type RecommendationTableColumn } from "./RecommendationTable";

type RecommendationStructuredFertilizerTablesProps = {
  document?: RecommendationStructuredFertilizerLines | null;
  showShoppingListHeader?: boolean;
  technicalWarnings?: string[];
};

type ShoppingListDateValue = NonNullable<ShoppingListResponse["data_plantio"]>;

type AlternativeFertilizerLine =
  | OrganicFertilizerRecommendationLine
  | GreenFertilizerRecommendationLine
  | OrganoMineralFertilizerRecommendationLine
  | BioFertilizerRecommendationLine;

export type AlternativeFertilizerPrintTableModel = {
  title: string;
  headers: string[];
  rows: string[][];
};

type AlternativeFertilizerTableConfig<TLine extends AlternativeFertilizerLine> = {
  title: string;
  lineFields: readonly (keyof RecommendationStructuredFertilizerLines)[];
  lines: TLine[];
};

type AlternativeFertilizerDetail = {
  label: string;
  fields: readonly string[];
};

type GypsumRecommendationViewMode = "general" | "summary" | "direct" | "shopping";
type SulfurRecommendationViewMode = "general" | "summary" | "direct" | "shopping";

export type GypsumRecommendationPrintModel = {
  title: string;
  lines: string[];
  warning?: string;
};

type GypsumRecommendationModel = {
  recommended: boolean;
  insufficientSubsurfaceLayers: boolean;
  dose: string;
  criterion: string;
  evaluatedLayers: string;
  highestClayContent: string;
  reasons: string[];
  mainReason: string;
  applicationGuidance: string;
  notRecommendedJustification: string;
  sulfurEquivalentAlternative: string;
  rawText: string;
};

type SulfurSourceModel = {
  name: string;
  dose: string;
  sulfurProvided: string;
  quantity: string;
};

type SulfurBalanceModel = {
  n: string;
  p2o5: string;
  k2o: string;
  s: string;
};

export type SulfurRecommendationPrintModel = {
  title: string;
  lines: string[];
  warning?: string;
};

type SulfurRecommendationModel = {
  recommended: boolean;
  dose: string;
  layer: string;
  deficiencyLevel: string;
  sources: SulfurSourceModel[];
  finalBalance: SulfurBalanceModel;
  reason: string;
  technicalWarning: string;
  managementGuidance: string[];
  rawText: string;
};

const areaFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 4,
});

const parseDisplayNumber = (value: string): number => {
  const compactValue = value.trim();
  if (!compactValue) return Number.NaN;

  const normalizedValue = compactValue.includes(",")
    ? compactValue.replace(/\./g, "").replace(",", ".")
    : compactValue;

  return Number(normalizedValue);
};

const isInvalidDisplayText = (value: string): boolean =>
  /^(?:nan|null|undefined|[-+]?infinity)$/i.test(value.trim());

const getFirstPresentValue = (
  document: ShoppingListResponse,
  fields: readonly (keyof ShoppingListResponse)[],
): unknown => {
  for (const field of fields) {
    const value = document[field];
    if (value !== null && value !== undefined && value !== "") return value;
  }

  return undefined;
};

const formatShoppingListArea = (value: unknown): string => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? `${areaFormatter.format(value)} ha` : "";
  }

  if (typeof value !== "string") return "";

  const text = value.trim();
  if (!text || isInvalidDisplayText(text)) return "";

  const normalizedNumber = parseDisplayNumber(text);
  if (Number.isFinite(normalizedNumber)) return `${areaFormatter.format(normalizedNumber)} ha`;

  return /\bha\b/i.test(text) ? text : `${text} ha`;
};

const formatShoppingListDate = (value: unknown): string => {
  if (!value) return "";

  if (typeof value === "object" && !Array.isArray(value)) {
    const date = value as ShoppingListDateValue;
    if (typeof date === "string") return formatShoppingListDate(date);

    const day = Number(date.day);
    const month = Number(date.month);
    const year = Number(date.year);

    if (Number.isInteger(day) && Number.isInteger(month) && Number.isInteger(year)) {
      return [
        String(day).padStart(2, "0"),
        String(month).padStart(2, "0"),
        String(year).padStart(4, "0"),
      ].join("/");
    }
  }

  if (typeof value !== "string") return "";

  const text = value.trim();
  if (!text) return "";

  const isoDate = text.match(/^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/);
  if (isoDate) return `${isoDate[3]}/${isoDate[2]}/${isoDate[1]}`;

  return text;
};

const shoppingListAreaFields = [
  "area",
  "area_ha",
  "areaHa",
  "area_usada_no_talhao",
  "areaUsadaNoTalhao",
] as const satisfies readonly (keyof ShoppingListResponse)[];

const shoppingListPlantingDateFields = [
  "data_plantio",
  "dataPlantio",
  "plantingDate",
] as const satisfies readonly (keyof ShoppingListResponse)[];

const organicFertilizerLineFields = [
  "adubos_organicos",
  "adubosOrganicos",
  "organicFertilizers",
  "linhas_adubos_organicos",
  "linhasAdubosOrganicos",
] as const satisfies readonly (keyof RecommendationStructuredFertilizerLines)[];

const greenFertilizerLineFields = [
  "adubos_verdes",
  "adubosVerdes",
  "greenFertilizers",
  "linhas_adubos_verdes",
  "linhasAdubosVerdes",
] as const satisfies readonly (keyof RecommendationStructuredFertilizerLines)[];

const organoMineralFertilizerLineFields = [
  "adubos_organominerais",
  "adubosOrganominerais",
  "organoMineralFertilizers",
  "linhas_adubos_organominerais",
  "linhasAdubosOrganominerais",
] as const satisfies readonly (keyof RecommendationStructuredFertilizerLines)[];

const bioFertilizerLineFields = [
  "biofertilizantes",
  "bioFertilizantes",
  "bioFertilizers",
  "linhas_biofertilizantes",
  "linhasBiofertilizantes",
] as const satisfies readonly (keyof RecommendationStructuredFertilizerLines)[];

const gypsumObjectFields = [
  "gessagem",
  "recomendacao_gessagem",
  "recomendacaoGessagem",
  "gypsumRecommendation",
  "gesso_agricola",
  "gessoAgricola",
  "agriculturalGypsum",
] as const;

const sulfurObjectFields = [
  "enxofre",
  "recomendacao_enxofre",
  "recomendacaoEnxofre",
  "sulfur",
  "sulfurRecommendation",
  "adubacao_enxofre",
  "adubacaoEnxofre",
  "sulfurFertilization",
] as const;

const gypsumRecommendedFields = [
  "recomendar_gessagem",
  "recomendarGessagem",
  "gessagem_recomendada",
  "gessagemRecomendada",
  "recommended",
  "isRecommended",
  "recommendGypsum",
  "gypsumRecommended",
] as const;

const gypsumInsufficientLayerFields = [
  "camadas_subsuperficiais_insuficientes",
  "camadasSubsuperficiaisInsuficientes",
  "sem_camadas_subsuperficiais_suficientes",
  "semCamadasSubsuperficiaisSuficientes",
  "insufficientSubsurfaceLayers",
  "missingSubsurfaceLayers",
] as const;

const gypsumSufficientLayerFields = [
  "camadas_subsuperficiais_suficientes",
  "camadasSubsuperficiaisSuficientes",
  "subsurfaceLayersSufficient",
] as const;

const gypsumValueFields = {
  dose: [
    "dose_gesso_kg_ha",
    "doseGessoKgHa",
    "dose_gesso_agricola_kg_ha",
    "doseGessoAgricolaKgHa",
    "gypsumDoseKgHa",
    "agriculturalGypsumDoseKgHa",
    "dose_kg_ha",
    "doseKgHa",
    "kg_ha",
    "kgHa",
  ],
  criterion: ["criterio", "criterio_gessagem", "criterioGessagem", "criterion", "gypsumCriterion"],
  evaluatedLayers: [
    "camadas_subsuperficiais_avaliadas",
    "camadasSubsuperficiaisAvaliadas",
    "camadas_avaliadas",
    "camadasAvaliadas",
    "evaluatedSubsurfaceLayers",
    "evaluatedLayers",
    "layers",
  ],
  highestClayContent: [
    "maior_teor_argila_usado",
    "maiorTeorArgilaUsado",
    "maior_argila_usada",
    "maiorArgilaUsada",
    "highestClayContentUsed",
    "maxClayContentUsed",
  ],
  calciumReason: ["justificativa_ca", "justificativaCa", "calciumJustification", "caJustification"],
  aluminumReason: ["justificativa_al", "justificativaAl", "aluminumJustification", "alJustification"],
  aluminumSaturationReason: [
    "justificativa_m",
    "justificativaM",
    "justificativa_m_percentual",
    "justificativaMPercentual",
    "aluminumSaturationJustification",
    "mPercentJustification",
  ],
  reasons: ["justificativas", "justificativas_tecnicas", "justificativasTecnicas", "reasons", "technicalReasons"],
  mainReason: ["motivo_principal", "motivoPrincipal", "mainReason", "primaryReason"],
  applicationGuidance: [
    "orientacao_aplicacao",
    "orientacaoAplicacao",
    "orientacao",
    "guidance",
    "applicationGuidance",
    "applicationOrientation",
  ],
  notRecommendedJustification: [
    "justificativa_nao_recomendacao",
    "justificativaNaoRecomendacao",
    "motivo_nao_recomendacao",
    "motivoNaoRecomendacao",
    "notRecommendedJustification",
    "noRecommendationReason",
  ],
  sulfurEquivalentAlternative: [
    "alternativa_enxofre_equivalente",
    "alternativaEnxofreEquivalente",
    "enxofre_equivalente",
    "enxofreEquivalente",
    "sulfurEquivalentAlternative",
    "equivalentSulfurAlternative",
  ],
} as const;

const sulfurRecommendedFields = [
  "recomendar_enxofre",
  "recomendarEnxofre",
  "enxofre_recomendado",
  "enxofreRecomendado",
  "recommended",
  "isRecommended",
  "recommendSulfur",
  "sulfurRecommended",
] as const;

const sulfurValueFields = {
  dose: [
    "dose_s_kg_ha",
    "doseSKgHa",
    "dose_enxofre_kg_ha",
    "doseEnxofreKgHa",
    "dose_recomendada_s_kg_ha",
    "doseRecomendadaSKgHa",
    "sulfurDoseKgHa",
    "recommendedSulfurDoseKgHa",
    "dose_kg_ha",
    "doseKgHa",
    "kg_ha",
    "kgHa",
  ],
  layer: [
    "camada_usada",
    "camadaUsada",
    "camada_referencia",
    "camadaReferencia",
    "camada",
    "layer",
    "usedLayer",
    "referenceLayer",
  ],
  deficiencyLevel: [
    "nivel_deficiencia",
    "nivelDeficiencia",
    "interpretacao_deficiencia",
    "interpretacaoDeficiencia",
    "interpretacao",
    "deficiencyLevel",
    "deficiencyInterpretation",
    "interpretation",
  ],
  sources: [
    "fontes_escolhidas",
    "fontesEscolhidas",
    "fontes",
    "sources",
    "chosenSources",
    "sourceLines",
    "linhas_fontes",
    "linhasFontes",
    "itens",
    "items",
  ],
  reason: ["motivo", "motivo_principal", "motivoPrincipal", "justificativa", "justification", "reason", "mainReason"],
  technicalWarning: [
    "aviso_tecnico",
    "avisoTecnico",
    "aviso_tecnico_s",
    "avisoTecnicoS",
    "mensagem_tecnica",
    "mensagemTecnica",
    "technicalWarning",
    "technicalMessage",
    "mensagem",
    "message",
  ],
  managementGuidance: [
    "orientacao_manejo",
    "orientacaoManejo",
    "orientacoes_manejo",
    "orientacoesManejo",
    "managementGuidance",
    "managementGuidelines",
    "orientacao",
    "guidance",
  ],
  finalBalance: ["balanco_nutricional", "balancoNutricional", "nutritionalBalance", "balance"],
  finalBalanceN: ["saldo_final_n", "saldoFinalN", "final_n", "finalN", "n"],
  finalBalanceP2o5: ["saldo_final_p2o5", "saldoFinalP2o5", "final_p2o5", "finalP2o5", "p2o5", "p"],
  finalBalanceK2o: ["saldo_final_k2o", "saldoFinalK2o", "final_k2o", "finalK2o", "k2o", "k"],
  finalBalanceS: ["saldo_final_s", "saldoFinalS", "saldo_final_enxofre", "saldoFinalEnxofre", "final_s", "finalS", "s"],
} as const;

const sulfurSourceValueFields = {
  name: [
    "fonte",
    "source",
    "insumo",
    "input",
    "adubo",
    "nome_adubo",
    "nomeAdubo",
    "fertilizer",
    "fertilizerName",
    "nome",
    "name",
  ],
  dose: ["dose_fonte_kg_ha", "doseFonteKgHa", "dose_kg_ha", "doseKgHa", "kg_ha", "kgHa", "dose"],
  sulfurProvided: [
    "s_fornecido_kg_ha",
    "sFornecidoKgHa",
    "enxofre_fornecido_kg_ha",
    "enxofreFornecidoKgHa",
    "sulfurProvidedKgHa",
    "providedSulfurKgHa",
  ],
  quantity: [
    "quantidade_total",
    "quantidadeTotal",
    "totalQuantity",
    "total_area",
    "totalArea",
    "totalForArea",
    "quantidade",
    "quantity",
  ],
  quantityUnit: ["unidade_quantidade", "unidadeQuantidade", "quantityUnit", "unidade", "unit"],
} as const;

const insufficientSubsurfaceLayersMessage =
  "Não é possível recomendar gessagem sem análises das camadas subsuperficiais 21–40 cm e/ou 41–60 cm.";

const alternativeValueFields = {
  fertilizer: [
    "adubo",
    "nome_adubo",
    "nomeAdubo",
    "fertilizer",
    "fertilizerName",
    "id_adubo",
    "adubo_id",
    "fertilizerId",
    "idFertilizante",
  ],
  fertilizerType: ["tipo_adubo", "tipoAdubo", "fertilizerType", "grupo_adubo", "grupoAdubo", "fertilizerGroup"],
  phase: ["fase_aplicacao", "faseAplicacao", "fase", "phase"],
  fertilizerDose: ["dose_kg_ha", "doseKgHa", "kg_ha", "kgHa"],
  liquidDose: ["dose_l_ha", "doseLHa", "l_ha", "lHa", "litros_ha", "litrosHa"],
  totalQuantity: ["quantidade_total", "quantidadeTotal", "totalQuantity", "quantidade", "quantity"],
  quantityUnit: ["unidade_quantidade", "unidadeQuantidade", "quantityUnit"],
  n: ["n"],
  p: ["p2o5", "p"],
  k: ["k2o", "k"],
  observation: ["observacao_tecnica", "observacaoTecnica", "technicalObservation", "technicalNote", "observacao"],
  message: ["mensagem", "mensagem_tecnica", "mensagemTecnica", "message", "technicalMessage"],
} as const;

const organicDetails: AlternativeFertilizerDetail[] = [
  { label: "C", fields: ["c"] },
  { label: "Umidade", fields: ["teor_umidade", "teorUmidade"] },
  { label: "Matéria orgânica", fields: ["teor_materia_organica", "teorMateriaOrganica"] },
  { label: "Cinzas", fields: ["teor_cinzas", "teorCinzas"] },
  { label: "Mineralização ano 1", fields: ["taxa_mineralizacao_ano_1", "taxaMineralizacaoAno1"] },
  { label: "Mineralização ano 2", fields: ["taxa_mineralizacao_ano_2", "taxaMineralizacaoAno2"] },
  { label: "Mineralização ano 3", fields: ["taxa_mineralizacao_ano_3", "taxaMineralizacaoAno3"] },
];

const greenDetails: AlternativeFertilizerDetail[] = [
  { label: "C", fields: ["c"] },
  { label: "Produtividade esperada", fields: ["produtividade_esperada", "produtividadeEsperada"] },
  { label: "Mineralização ano 1", fields: ["taxa_mineralizacao_ano_1", "taxaMineralizacaoAno1"] },
  { label: "Mineralização ano 2", fields: ["taxa_mineralizacao_ano_2", "taxaMineralizacaoAno2"] },
  { label: "Mineralização ano 3", fields: ["taxa_mineralizacao_ano_3", "taxaMineralizacaoAno3"] },
];

const organoMineralDetails: AlternativeFertilizerDetail[] = [
  { label: "C", fields: ["c"] },
  { label: "Índice salino", fields: ["indice_salino", "indiceSalino"] },
  { label: "Índice acidez", fields: ["indice_acidez", "indiceAcidez"] },
];

const bioFertilizerDetails: AlternativeFertilizerDetail[] = [
  { label: "Densidade", fields: ["densidade_g_ml", "densidadeGMl"] },
  { label: "Concentração volume", fields: ["concentracao_volume_g_l", "concentracaoVolumeGL"] },
  { label: "Concentração massa", fields: ["concentracao_massa_g_kg", "concentracaoMassaGKg"] },
  { label: "Proteínas", fields: ["proteinas_g_l", "proteinasGL"] },
  { label: "Aminoácidos", fields: ["aminoacidos_g_l", "aminoacidosGL"] },
  { label: "Amidos", fields: ["amidos_g_l", "amidosGL"] },
  { label: "Açúcares", fields: ["acucares_g_l", "acucaresGL"] },
  { label: "Compostos diversos", fields: ["compostos_diversos_g_l", "compostosDiversosGL"] },
  { label: "Índice salino", fields: ["indice_salino", "indiceSalino"] },
  { label: "Índice acidez", fields: ["indice_acidez", "indiceAcidez"] },
];

const getFirstText = (line: RecommendationFertilizerLine, fields: readonly string[]): string =>
  getFirstRecommendationText(line, fields);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const getFirstBoolean = (line: Record<string, unknown>, fields: readonly string[]): boolean | null => {
  for (const field of fields) {
    const value = line[field];
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (["true", "sim", "yes", "1"].includes(normalized)) return true;
      if (["false", "nao", "não", "no", "0"].includes(normalized)) return false;
    }
    if (typeof value === "number" && Number.isFinite(value)) return value !== 0;
  }

  return null;
};

const normalizeTextList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => normalizeTextList(item))
      .filter(Boolean);
  }

  if (isRecord(value)) {
    return Object.entries(value)
      .map(([key, item]) => {
        const text = normalizeRecommendationText(item);
        return text ? `${key}: ${text}` : "";
      })
      .filter(Boolean);
  }

  const text = normalizeRecommendationText(value);
  return text ? [text] : [];
};

const getFirstTextList = (line: Record<string, unknown>, fields: readonly string[]): string[] => {
  for (const field of fields) {
    const values = normalizeTextList(line[field]);
    if (values.length > 0) return values;
  }

  return [];
};

const getFirstAnyText = (line: Record<string, unknown>, fields: readonly string[]): string =>
  getFirstRecommendationText(line, fields);

const getGypsumPayload = (
  document?: GypsumRecommendationFields | null,
): Record<string, unknown> | string | null => {
  if (!document) return null;

  const record = document as Record<string, unknown>;
  for (const field of gypsumObjectFields) {
    const value = record[field];
    if (isRecord(value)) return value;
    if (Array.isArray(value)) {
      const firstRecord = value.find(isRecord);
      if (firstRecord) return firstRecord;

      const firstText = value.map(normalizeRecommendationText).find(Boolean);
      if (firstText) return firstText;
    }
    const text = normalizeRecommendationText(value);
    if (text) return text;
  }

  const hasFlatGypsumField = [
    ...gypsumRecommendedFields,
    ...gypsumInsufficientLayerFields,
    ...gypsumSufficientLayerFields,
    ...Object.values(gypsumValueFields).flat(),
  ].some((field) => record[field] !== null && record[field] !== undefined && record[field] !== "");

  return hasFlatGypsumField ? record : null;
};

const normalizeDoseText = (value: string): string => {
  if (!value) return "";
  return /\bkg\s*\/?\s*ha\b/i.test(value) ? value : `${value} kg/ha`;
};

const normalizeHighestClayText = (value: string): string => {
  if (!value) return "";
  return /(%|g\s*\/?\s*kg|dag\s*\/?\s*kg)/i.test(value) ? value : `${value} g/kg`;
};

export const getGypsumRecommendationModel = (
  document?: GypsumRecommendationFields | null,
): GypsumRecommendationModel | null => {
  const payload = getGypsumPayload(document);
  if (!payload) return null;

  if (typeof payload === "string") {
    return {
      recommended: false,
      insufficientSubsurfaceLayers: false,
      dose: "",
      criterion: "",
      evaluatedLayers: "",
      highestClayContent: "",
      reasons: [],
      mainReason: "",
      applicationGuidance: "",
      notRecommendedJustification: "",
      sulfurEquivalentAlternative: "",
      rawText: payload,
    };
  }

  const dose = normalizeDoseText(getFirstAnyText(payload, gypsumValueFields.dose));
  const recommendedFlag = getFirstBoolean(payload, gypsumRecommendedFields);
  const insufficientFlag = getFirstBoolean(payload, gypsumInsufficientLayerFields);
  const sufficientFlag = getFirstBoolean(payload, gypsumSufficientLayerFields);
  const evaluatedLayers = getFirstTextList(payload, gypsumValueFields.evaluatedLayers).join(", ");
  const reasons = [
    ...getFirstTextList(payload, gypsumValueFields.calciumReason),
    ...getFirstTextList(payload, gypsumValueFields.aluminumReason),
    ...getFirstTextList(payload, gypsumValueFields.aluminumSaturationReason),
    ...getFirstTextList(payload, gypsumValueFields.reasons),
  ];
  const notRecommendedJustification = getFirstAnyText(payload, gypsumValueFields.notRecommendedJustification);
  const recommended = recommendedFlag ?? Boolean(dose);
  const insufficientSubsurfaceLayers = insufficientFlag === true || sufficientFlag === false;

  return {
    recommended,
    insufficientSubsurfaceLayers,
    dose,
    criterion: getFirstAnyText(payload, gypsumValueFields.criterion),
    evaluatedLayers,
    highestClayContent: normalizeHighestClayText(getFirstAnyText(payload, gypsumValueFields.highestClayContent)),
    reasons: Array.from(new Set(reasons)),
    mainReason: getFirstAnyText(payload, gypsumValueFields.mainReason) || reasons[0] || notRecommendedJustification,
    applicationGuidance: getFirstAnyText(payload, gypsumValueFields.applicationGuidance),
    notRecommendedJustification,
    sulfurEquivalentAlternative: getFirstTextList(payload, gypsumValueFields.sulfurEquivalentAlternative).join("\n"),
    rawText: "",
  };
};

export const hasGypsumRecommendationContent = (
  document?: GypsumRecommendationFields | null,
): boolean => Boolean(getGypsumRecommendationModel(document));

const getSulfurPayload = (
  document?: SulfurRecommendationFields | null,
): Record<string, unknown> | string | null => {
  if (!document) return null;

  const record = document as Record<string, unknown>;
  for (const field of sulfurObjectFields) {
    const value = record[field];
    if (isRecord(value)) return value;
    if (Array.isArray(value)) {
      const firstRecord = value.find(isRecord);
      if (firstRecord) return firstRecord;

      const firstText = value.map(normalizeRecommendationText).find(Boolean);
      if (firstText) return firstText;
    }
    const text = normalizeRecommendationText(value);
    if (text) return text;
  }

  const hasFlatSulfurField = [
    ...sulfurRecommendedFields,
    ...Object.values(sulfurValueFields).flat(),
  ].some((field) => record[field] !== null && record[field] !== undefined && record[field] !== "");

  return hasFlatSulfurField ? record : null;
};

const getFirstRecord = (line: Record<string, unknown>, fields: readonly string[]): Record<string, unknown> | null => {
  for (const field of fields) {
    const value = line[field];
    if (isRecord(value)) return value;
  }

  return null;
};

const getFirstRecordList = (line: Record<string, unknown>, fields: readonly string[]): Record<string, unknown>[] => {
  for (const field of fields) {
    const value = line[field];
    if (Array.isArray(value)) return value.filter(isRecord);
    if (isRecord(value)) return [value];
  }

  return [];
};

const getSulfurSourceModel = (source: Record<string, unknown>): SulfurSourceModel => {
  const quantity = getFirstAnyText(source, sulfurSourceValueFields.quantity);
  const quantityUnit = getFirstAnyText(source, sulfurSourceValueFields.quantityUnit);

  return {
    name: getFirstAnyText(source, sulfurSourceValueFields.name),
    dose: normalizeDoseText(getFirstAnyText(source, sulfurSourceValueFields.dose)),
    sulfurProvided: normalizeDoseText(getFirstAnyText(source, sulfurSourceValueFields.sulfurProvided)),
    quantity: quantity && quantityUnit ? `${quantity} ${quantityUnit}` : quantity,
  };
};

const hasSulfurSourceContent = (source: SulfurSourceModel): boolean =>
  Boolean(source.name || source.dose || source.sulfurProvided || source.quantity);

const getSulfurFinalBalance = (payload: Record<string, unknown>): SulfurBalanceModel => {
  const balanceRecord = getFirstRecord(payload, sulfurValueFields.finalBalance) ?? payload;

  return {
    n: normalizeDoseText(getFirstAnyText(balanceRecord, sulfurValueFields.finalBalanceN)),
    p2o5: normalizeDoseText(getFirstAnyText(balanceRecord, sulfurValueFields.finalBalanceP2o5)),
    k2o: normalizeDoseText(getFirstAnyText(balanceRecord, sulfurValueFields.finalBalanceK2o)),
    s: normalizeDoseText(getFirstAnyText(balanceRecord, sulfurValueFields.finalBalanceS)),
  };
};

const getSulfurDefaultGuidance = (model: Pick<SulfurRecommendationModel, "sources">): string[] => {
  const sourceNames = model.sources.map((source) => source.name.toLowerCase()).join(" ");
  const hasGypsum = /gesso|gypsum/.test(sourceNames);
  const hasFormulatedWithoutSulfur = /formulado/.test(sourceNames) && !/\bs\b|enxofre|sulfur/.test(sourceNames);

  return [
    "S é nutriente secundário de plantio.",
    "Aplicar na linha de plantio.",
    hasFormulatedWithoutSulfur || hasGypsum
      ? "Quando usado formulado sem S, complementar com gesso agrícola."
      : "",
    model.sources.length > 1
      ? "Quando usados adubos simples, seguir a combinação escolhida pelo backend."
      : "",
  ].filter(Boolean);
};

export const getSulfurRecommendationModel = (
  document?: SulfurRecommendationFields | null,
): SulfurRecommendationModel | null => {
  const payload = getSulfurPayload(document);
  if (!payload) return null;

  if (typeof payload === "string") {
    return {
      recommended: false,
      dose: "",
      layer: "",
      deficiencyLevel: "",
      sources: [],
      finalBalance: { n: "", p2o5: "", k2o: "", s: "" },
      reason: "",
      technicalWarning: payload,
      managementGuidance: [],
      rawText: "",
    };
  }

  const sources = getFirstRecordList(payload, sulfurValueFields.sources)
    .map(getSulfurSourceModel)
    .filter(hasSulfurSourceContent);
  const dose = normalizeDoseText(getFirstAnyText(payload, sulfurValueFields.dose));
  const recommendedFlag = getFirstBoolean(payload, sulfurRecommendedFields);
  const technicalWarning = getFirstAnyText(payload, sulfurValueFields.technicalWarning);
  const modelWithoutGuidance = {
    sources,
  };
  const managementGuidance = [
    ...getFirstTextList(payload, sulfurValueFields.managementGuidance),
    ...getSulfurDefaultGuidance(modelWithoutGuidance),
  ];

  return {
    recommended: recommendedFlag ?? Boolean(dose || sources.length),
    dose,
    layer: getFirstAnyText(payload, sulfurValueFields.layer) || (dose || sources.length ? "0 a 20 cm" : ""),
    deficiencyLevel: getFirstAnyText(payload, sulfurValueFields.deficiencyLevel),
    sources,
    finalBalance: getSulfurFinalBalance(payload),
    reason: getFirstAnyText(payload, sulfurValueFields.reason) || getFirstAnyText(payload, sulfurValueFields.deficiencyLevel),
    technicalWarning,
    managementGuidance: Array.from(new Set(managementGuidance)),
    rawText: "",
  };
};

export const hasSulfurRecommendationContent = (
  document?: SulfurRecommendationFields | null,
): boolean => Boolean(getSulfurRecommendationModel(document));

const getAlternativeFertilizerLines = <TLine extends AlternativeFertilizerLine>(
  document: RecommendationStructuredFertilizerLines | null | undefined,
  fields: readonly (keyof RecommendationStructuredFertilizerLines)[],
): TLine[] => {
  if (!document) return [];

  for (const field of fields) {
    const value = document[field];
    if (Array.isArray(value) && value.length > 0) return value as TLine[];
  }

  return [];
};

const getNpkText = (line: AlternativeFertilizerLine): string => {
  const n = getFirstText(line, alternativeValueFields.n);
  const p = getFirstText(line, alternativeValueFields.p);
  const k = getFirstText(line, alternativeValueFields.k);

  return n || p || k ? `${n || "-"}-${p || "-"}-${k || "-"}` : "";
};

const getDoseText = (line: AlternativeFertilizerLine): string => {
  const solidDose = getFirstText(line, alternativeValueFields.fertilizerDose);
  if (solidDose) return solidDose;

  const liquidDose = getFirstText(line, alternativeValueFields.liquidDose);
  return liquidDose ? `${liquidDose} L/ha` : "";
};

const getQuantityText = (line: AlternativeFertilizerLine): string => {
  const quantity = getFirstText(line, alternativeValueFields.totalQuantity);
  if (!quantity) return "";

  const unit = getFirstText(line, alternativeValueFields.quantityUnit);
  return unit ? `${quantity} ${unit}` : quantity;
};

const getDetailText = (line: AlternativeFertilizerLine, details: AlternativeFertilizerDetail[]): string =>
  details
    .map((detail) => {
      const value = getFirstText(line, detail.fields);
      return value ? `${detail.label}: ${value}` : "";
    })
    .filter(Boolean)
    .join("\n");

const hasAlternativeFertilizerDisplayContent = (line: AlternativeFertilizerLine): boolean =>
  Boolean(
    getFirstText(line, alternativeValueFields.fertilizer) ||
      getDoseText(line) ||
      getQuantityText(line) ||
      getFirstText(line, alternativeValueFields.message) ||
      getFirstText(line, alternativeValueFields.observation),
  );

const getAlternativeFertilizerTableConfigs = (
  document?: RecommendationStructuredFertilizerLines | null,
): AlternativeFertilizerTableConfig<AlternativeFertilizerLine>[] => [
  {
    title: "Adubação orgânica",
    lineFields: organicFertilizerLineFields,
    lines: getAlternativeFertilizerLines<OrganicFertilizerRecommendationLine>(document, organicFertilizerLineFields),
  },
  {
    title: "Adubação verde",
    lineFields: greenFertilizerLineFields,
    lines: getAlternativeFertilizerLines<GreenFertilizerRecommendationLine>(document, greenFertilizerLineFields),
  },
  {
    title: "Organominerais",
    lineFields: organoMineralFertilizerLineFields,
    lines: getAlternativeFertilizerLines<OrganoMineralFertilizerRecommendationLine>(
      document,
      organoMineralFertilizerLineFields,
    ),
  },
  {
    title: "Biofertilizantes",
    lineFields: bioFertilizerLineFields,
    lines: getAlternativeFertilizerLines<BioFertilizerRecommendationLine>(document, bioFertilizerLineFields),
  },
];

const getAlternativeDetails = (
  lineFields: readonly (keyof RecommendationStructuredFertilizerLines)[],
): AlternativeFertilizerDetail[] => {
  if (lineFields === organicFertilizerLineFields) return organicDetails;
  if (lineFields === greenFertilizerLineFields) return greenDetails;
  if (lineFields === organoMineralFertilizerLineFields) return organoMineralDetails;
  return bioFertilizerDetails;
};

export const hasAlternativeFertilizerRows = (
  document?: RecommendationStructuredFertilizerLines | null,
): boolean =>
  getAlternativeFertilizerTableConfigs(document).some((config) =>
    config.lines.some(hasAlternativeFertilizerDisplayContent),
  );

export const buildAlternativeFertilizerTableModels = (
  document?: RecommendationStructuredFertilizerLines | null,
): AlternativeFertilizerPrintTableModel[] =>
  getAlternativeFertilizerTableConfigs(document)
    .map((config) => {
      const lines = config.lines.filter(hasAlternativeFertilizerDisplayContent);
      if (lines.length === 0) return null;
      const details = getAlternativeDetails(config.lineFields);

      return {
        title: config.title,
        headers: ["Adubo", "N-P2O5-K2O", "Dose", "Quantidade", "Detalhes", "Observação"],
        rows: lines.map((line) => {
          const fertilizerType = getFirstText(line, alternativeValueFields.fertilizerType);
          const phase = getFirstText(line, alternativeValueFields.phase);
          const message = getFirstText(line, alternativeValueFields.message);
          const observation = getFirstText(line, alternativeValueFields.observation);

          return [
            [
              getFirstText(line, alternativeValueFields.fertilizer) || "-",
              fertilizerType ? `Tipo/grupo: ${fertilizerType}` : "",
              phase ? `Fase: ${phase}` : "",
              message,
            ]
              .filter(Boolean)
              .join("\n"),
            getNpkText(line) || "-",
            getDoseText(line) || "-",
            getQuantityText(line) || "-",
            getDetailText(line, details) || "-",
            normalizeRecommendationText(observation) || "-",
          ];
        }),
      } satisfies AlternativeFertilizerPrintTableModel;
    })
    .filter((model): model is AlternativeFertilizerPrintTableModel => Boolean(model));

function ShoppingListHeader({ document }: { document: ShoppingListResponse }) {
  const area = formatShoppingListArea(getFirstPresentValue(document, shoppingListAreaFields));
  const plantingDate = formatShoppingListDate(getFirstPresentValue(document, shoppingListPlantingDateFields));
  const missingValues = [
    area ? "" : "área",
    plantingDate ? "" : "data de plantio",
  ].filter(Boolean);

  return (
    <VStack align="stretch" gap={2}>
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
        <Box>
          <Text color="fg.muted" fontSize="xs">
            Área
          </Text>
          <Text fontWeight="medium">{area || "-"}</Text>
        </Box>
        <Box>
          <Text color="fg.muted" fontSize="xs">
            Data de plantio
          </Text>
          <Text fontWeight="medium">{plantingDate || "-"}</Text>
        </Box>
      </SimpleGrid>
      {missingValues.length > 0 ? (
        <Text color="orange.600" fontSize="xs">
          Aviso técnico: {missingValues.join(" e ")}{" "}
          {missingValues.length > 1 ? "não informadas" : "não informada"} pelo backend.
        </Text>
      ) : null}
    </VStack>
  );
}

const getGypsumNotRecommendedText = (model: GypsumRecommendationModel): string => {
  if (model.insufficientSubsurfaceLayers) return insufficientSubsurfaceLayersMessage;
  return (
    model.notRecommendedJustification ||
    model.mainReason ||
    "Camadas subsuperficiais avaliadas, sem condição crítica para recomendação de gessagem."
  );
};

export const buildGypsumRecommendationPrintModel = (
  document?: GypsumRecommendationFields | null,
  mode: GypsumRecommendationViewMode = "general",
): GypsumRecommendationPrintModel | null => {
  const model = getGypsumRecommendationModel(document);
  if (!model) return null;

  if (model.rawText) {
    return { title: "Gessagem", lines: [model.rawText] };
  }

  if (!model.recommended) {
    return {
      title: "Gessagem",
      lines: [getGypsumNotRecommendedText(model)],
      warning: model.insufficientSubsurfaceLayers ? insufficientSubsurfaceLayersMessage : undefined,
    };
  }

  if (mode === "direct") {
    return {
      title: "Gessagem",
      lines: [
        `Aplicar ${model.dose || "dose retornada pelo backend"} de gesso agrícola${
          model.applicationGuidance ? `. ${model.applicationGuidance}` : "."
        }`,
      ],
    };
  }

  if (mode === "summary") {
    return {
      title: "Gessagem",
      lines: [`Dose: ${model.dose || "-"}`, `Motivo principal: ${model.mainReason || model.criterion || "-"}`],
    };
  }

  if (mode === "shopping") {
    return {
      title: "Gesso agrícola",
      lines: [
        `Dose: ${model.dose || "-"}`,
        model.sulfurEquivalentAlternative
          ? `Alternativa por enxofre equivalente: ${model.sulfurEquivalentAlternative}`
          : "",
      ].filter(Boolean),
    };
  }

  return {
    title: "Gessagem",
    lines: [
      `Dose de gesso agrícola: ${model.dose || "-"}`,
      `Critério usado: ${model.criterion || "-"}`,
      `Camada(s) subsuperficial(is) avaliadas: ${model.evaluatedLayers || "-"}`,
      `Maior teor de argila usado: ${model.highestClayContent || "-"}`,
      model.reasons.length ? `Justificativa: ${model.reasons.join("; ")}` : "",
      `Orientação de aplicação: ${model.applicationGuidance || "-"}`,
    ].filter(Boolean),
  };
};

export function GypsumRecommendationSection({
  document,
  mode,
}: {
  document?: GypsumRecommendationFields | null;
  mode: GypsumRecommendationViewMode;
}) {
  const model = getGypsumRecommendationModel(document);
  if (!model) return null;

  if (model.rawText) {
    return (
      <VStack align="stretch" gap={2}>
        <Heading size="sm">Gessagem</Heading>
        <Text whiteSpace="pre-wrap">{model.rawText}</Text>
      </VStack>
    );
  }

  if (!model.recommended) {
    const isWarning = model.insufficientSubsurfaceLayers;
    return (
      <Box
        borderWidth="1px"
        borderColor={isWarning ? "orange.200" : undefined}
        bg={isWarning ? "orange.50" : undefined}
        p={3}
        borderRadius="md"
      >
        <VStack align="stretch" gap={2}>
          <HStack gap={2} wrap="wrap">
            <Heading size="sm">Gessagem</Heading>
            <Badge colorPalette={isWarning ? "orange" : "gray"}>
              {isWarning ? "Aviso técnico" : "Não recomendada"}
            </Badge>
          </HStack>
          <Text color={isWarning ? "orange.700" : undefined}>{getGypsumNotRecommendedText(model)}</Text>
        </VStack>
      </Box>
    );
  }

  if (mode === "direct") {
    return (
      <Box borderWidth="1px" borderRadius="md" p={3}>
        <VStack align="stretch" gap={2}>
          <HStack gap={2} wrap="wrap">
            <Heading size="sm">Gessagem</Heading>
            <Badge colorPalette="green">Recomendada</Badge>
          </HStack>
          <Text fontWeight="medium">
            Aplicar {model.dose || "a dose retornada pelo backend"} de gesso agrícola.
          </Text>
          {model.applicationGuidance ? <Text>{model.applicationGuidance}</Text> : null}
        </VStack>
      </Box>
    );
  }

  if (mode === "summary") {
    return (
      <Box borderWidth="1px" borderRadius="md" p={3}>
        <VStack align="stretch" gap={2}>
          <HStack gap={2} wrap="wrap">
            <Heading size="sm">Gessagem</Heading>
            <Badge colorPalette="green">Recomendada</Badge>
          </HStack>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
            <Box>
              <Text color="fg.muted" fontSize="xs">Dose</Text>
              <Text fontWeight="medium">{model.dose || "-"}</Text>
            </Box>
            <Box>
              <Text color="fg.muted" fontSize="xs">Motivo principal</Text>
              <Text>{model.mainReason || model.criterion || "-"}</Text>
            </Box>
          </SimpleGrid>
        </VStack>
      </Box>
    );
  }

  if (mode === "shopping") {
    return (
      <VStack align="stretch" gap={3}>
        <Heading size="sm">Gesso agrícola</Heading>
        <RecommendationTable
          columns={[
            { key: "item", header: "Item", minW: "180px" },
            { key: "dose", header: "Dose", minW: "140px" },
            { key: "alternative", header: "Alternativa", minW: "260px" },
          ]}
          rows={[
            [
              "Gesso agrícola",
              model.dose || "-",
              model.sulfurEquivalentAlternative
                ? `Enxofre equivalente: ${model.sulfurEquivalentAlternative}`
                : "-",
            ],
          ]}
          minW="620px"
          renderCell={(row, _column, _rowIndex, columnIndex) => (
            <Text whiteSpace="pre-wrap" overflowWrap="anywhere">
              {row[columnIndex] || "-"}
            </Text>
          )}
        />
      </VStack>
    );
  }

  return (
    <Box borderWidth="1px" borderRadius="md" p={3}>
      <VStack align="stretch" gap={3}>
        <HStack gap={2} wrap="wrap">
          <Heading size="sm">Gessagem</Heading>
          <Badge colorPalette="green">Recomendada</Badge>
        </HStack>
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
          <Box>
            <Text color="fg.muted" fontSize="xs">Dose de gesso agrícola</Text>
            <Text fontWeight="medium">{model.dose || "-"}</Text>
          </Box>
          <Box>
            <Text color="fg.muted" fontSize="xs">Critério usado</Text>
            <Text>{model.criterion || "-"}</Text>
          </Box>
          <Box>
            <Text color="fg.muted" fontSize="xs">Camada(s) subsuperficial(is) avaliadas</Text>
            <Text>{model.evaluatedLayers || "-"}</Text>
          </Box>
          <Box>
            <Text color="fg.muted" fontSize="xs">Maior teor de argila usado</Text>
            <Text>{model.highestClayContent || "-"}</Text>
          </Box>
        </SimpleGrid>
        {model.reasons.length > 0 ? (
          <Box>
            <Text color="fg.muted" fontSize="xs">Justificativa por Ca2+, Al3+ e/ou m%</Text>
            <VStack align="stretch" gap={1} mt={1}>
              {model.reasons.map((reason) => (
                <Text key={reason}>{reason}</Text>
              ))}
            </VStack>
          </Box>
        ) : null}
        <Box>
          <Text color="fg.muted" fontSize="xs">Orientação de aplicação</Text>
          <Text>{model.applicationGuidance || "-"}</Text>
        </Box>
      </VStack>
    </Box>
  );
}

const getSulfurPrimarySource = (model: SulfurRecommendationModel): string =>
  model.sources[0]?.name || "fonte retornada pelo backend";

const getSulfurBalanceLines = (model: SulfurRecommendationModel): string[] => [
  model.finalBalance.n ? `Saldo final de N: ${model.finalBalance.n}` : "",
  model.finalBalance.p2o5 ? `Saldo final de P2O5: ${model.finalBalance.p2o5}` : "",
  model.finalBalance.k2o ? `Saldo final de K2O: ${model.finalBalance.k2o}` : "",
  model.finalBalance.s ? `Saldo final de S: ${model.finalBalance.s}` : "",
].filter(Boolean);

export const buildSulfurRecommendationPrintModel = (
  document?: SulfurRecommendationFields | null,
  mode: SulfurRecommendationViewMode = "general",
): SulfurRecommendationPrintModel | null => {
  const model = getSulfurRecommendationModel(document);
  if (!model) return null;

  if (!model.recommended) {
    return {
      title: "Enxofre (S)",
      lines: [model.technicalWarning || "Critério de S não retornado pelo backend."],
      warning: model.technicalWarning || undefined,
    };
  }

  if (mode === "direct") {
    return {
      title: "Enxofre (S)",
      lines: [
        `Aplicar ${model.dose || "a dose retornada pelo backend"} de S na linha de plantio usando ${getSulfurPrimarySource(model)}.`,
      ],
    };
  }

  if (mode === "summary") {
    return {
      title: "Enxofre (S)",
      lines: [
        `Dose de S: ${model.dose || "-"}`,
        `Fonte principal: ${getSulfurPrimarySource(model)}`,
        `Motivo: ${model.reason || model.deficiencyLevel || "-"}`,
      ],
    };
  }

  if (mode === "shopping") {
    return {
      title: "Fontes de Enxofre (S)",
      lines: model.sources.length
        ? model.sources.map((source) =>
            [
              source.name || "Fonte retornada pelo backend",
              source.dose ? `dose ${source.dose}` : "",
              source.quantity ? `quantidade ${source.quantity}` : "",
              source.sulfurProvided ? `S fornecido ${source.sulfurProvided}` : "",
            ].filter(Boolean).join(" - "),
          )
        : [`Dose de S: ${model.dose || "-"}`],
    };
  }

  return {
    title: "Enxofre (S)",
    lines: [
      `Dose recomendada de S: ${model.dose || "-"}`,
      `Camada usada: ${model.layer || "0 a 20 cm"}`,
      `Nível de deficiência: ${model.deficiencyLevel || "-"}`,
      model.sources.length
        ? `Fontes escolhidas: ${model.sources.map((source) => source.name || "Fonte sem nome").join("; ")}`
        : "",
      ...model.sources.map((source) =>
        [
          source.name || "Fonte sem nome",
          source.dose ? `dose ${source.dose}` : "",
          source.sulfurProvided ? `S fornecido ${source.sulfurProvided}` : "",
        ].filter(Boolean).join(" - "),
      ),
      ...getSulfurBalanceLines(model),
      ...model.managementGuidance.map((line) => `Manejo: ${line}`),
    ].filter(Boolean),
  };
};

export function SulfurRecommendationSection({
  document,
  mode,
}: {
  document?: SulfurRecommendationFields | null;
  mode: SulfurRecommendationViewMode;
}) {
  const model = getSulfurRecommendationModel(document);
  if (!model) return null;

  if (!model.recommended) {
    return (
      <Box borderWidth="1px" borderColor="orange.200" bg="orange.50" p={3} borderRadius="md">
        <VStack align="stretch" gap={2}>
          <HStack gap={2} wrap="wrap">
            <Heading size="sm">Enxofre (S)</Heading>
            <Badge colorPalette="orange">Aviso técnico</Badge>
          </HStack>
          <Text color="orange.700">
            {model.technicalWarning || "Dados ou critério de S não retornados pelo backend."}
          </Text>
        </VStack>
      </Box>
    );
  }

  if (mode === "direct") {
    return (
      <Box borderWidth="1px" borderRadius="md" p={3}>
        <VStack align="stretch" gap={2}>
          <HStack gap={2} wrap="wrap">
            <Heading size="sm">Enxofre (S)</Heading>
            <Badge colorPalette="green">Plantio</Badge>
          </HStack>
          <Text fontWeight="medium">
            Aplicar {model.dose || "a dose retornada pelo backend"} de S na linha de plantio usando{" "}
            {getSulfurPrimarySource(model)}.
          </Text>
        </VStack>
      </Box>
    );
  }

  if (mode === "summary") {
    return (
      <Box borderWidth="1px" borderRadius="md" p={3}>
        <VStack align="stretch" gap={2}>
          <HStack gap={2} wrap="wrap">
            <Heading size="sm">Enxofre (S)</Heading>
            <Badge colorPalette="green">Recomendado</Badge>
          </HStack>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={3}>
            <Box>
              <Text color="fg.muted" fontSize="xs">Dose de S</Text>
              <Text fontWeight="medium">{model.dose || "-"}</Text>
            </Box>
            <Box>
              <Text color="fg.muted" fontSize="xs">Fonte principal</Text>
              <Text>{getSulfurPrimarySource(model)}</Text>
            </Box>
            <Box>
              <Text color="fg.muted" fontSize="xs">Motivo</Text>
              <Text>{model.reason || model.deficiencyLevel || "-"}</Text>
            </Box>
          </SimpleGrid>
        </VStack>
      </Box>
    );
  }

  if (mode === "shopping") {
    if (model.sources.length === 0) return null;

    return (
      <VStack align="stretch" gap={3}>
        <Heading size="sm">Fontes de Enxofre (S)</Heading>
        <RecommendationTable
          columns={[
            { key: "source", header: "Fonte", minW: "220px" },
            { key: "dose", header: "Dose", minW: "130px" },
            { key: "quantity", header: "Quantidade", minW: "150px" },
            { key: "sulfurProvided", header: "S fornecido", minW: "150px" },
          ]}
          rows={model.sources}
          minW="760px"
          getRowKey={(source, index) => `${source.name}-${index}`}
          renderCell={(source, column) => {
            if (column.key === "source") return source.name || "-";
            if (column.key === "dose") return source.dose || "-";
            if (column.key === "quantity") return source.quantity || "-";
            return source.sulfurProvided || "-";
          }}
        />
      </VStack>
    );
  }

  return (
    <Box borderWidth="1px" borderRadius="md" p={3}>
      <VStack align="stretch" gap={3}>
        <HStack gap={2} wrap="wrap">
          <Heading size="sm">Enxofre (S)</Heading>
          <Badge colorPalette="green">Recomendado</Badge>
        </HStack>
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
          <Box>
            <Text color="fg.muted" fontSize="xs">Dose recomendada de S</Text>
            <Text fontWeight="medium">{model.dose || "-"}</Text>
          </Box>
          <Box>
            <Text color="fg.muted" fontSize="xs">Camada usada</Text>
            <Text>{model.layer || "0 a 20 cm"}</Text>
          </Box>
          <Box>
            <Text color="fg.muted" fontSize="xs">Nível de deficiência</Text>
            <Text>{model.deficiencyLevel || "-"}</Text>
          </Box>
          <Box>
            <Text color="fg.muted" fontSize="xs">Saldo final de S</Text>
            <Text>{model.finalBalance.s || "-"}</Text>
          </Box>
        </SimpleGrid>

        {model.sources.length > 0 ? (
          <RecommendationTable
            columns={[
              { key: "source", header: "Fonte", minW: "220px" },
              { key: "dose", header: "Dose da fonte", minW: "150px" },
              { key: "sulfurProvided", header: "S fornecido", minW: "150px" },
            ]}
            rows={model.sources}
            minW="620px"
            getRowKey={(source, index) => `${source.name}-${index}`}
            renderCell={(source, column) => {
              if (column.key === "source") return source.name || "-";
              if (column.key === "dose") return source.dose || "-";
              return source.sulfurProvided || "-";
            }}
          />
        ) : null}

        {getSulfurBalanceLines(model).length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 4 }} gap={3}>
            <Box>
              <Text color="fg.muted" fontSize="xs">Saldo final de N</Text>
              <Text>{model.finalBalance.n || "-"}</Text>
            </Box>
            <Box>
              <Text color="fg.muted" fontSize="xs">Saldo final de P2O5</Text>
              <Text>{model.finalBalance.p2o5 || "-"}</Text>
            </Box>
            <Box>
              <Text color="fg.muted" fontSize="xs">Saldo final de K2O</Text>
              <Text>{model.finalBalance.k2o || "-"}</Text>
            </Box>
            <Box>
              <Text color="fg.muted" fontSize="xs">Saldo final de S</Text>
              <Text>{model.finalBalance.s || "-"}</Text>
            </Box>
          </SimpleGrid>
        ) : null}

        <Box>
          <Text color="fg.muted" fontSize="xs">Orientação de manejo</Text>
          <VStack align="stretch" gap={1} mt={1}>
            {model.managementGuidance.map((guidance) => (
              <Text key={guidance}>{guidance}</Text>
            ))}
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
}

export const hasStructuredRecommendationContent = (
  document?: RecommendationStructuredFertilizerLines | null,
): boolean =>
  hasMicronutrientFertilizerRows(document) ||
  hasFormulatedPlantingFertilizerRows(document) ||
  hasFormulatedTopDressingFertilizerRows(document) ||
  hasAlternativeFertilizerRows(document) ||
  hasGypsumRecommendationContent(document) ||
  hasSulfurRecommendationContent(document);

function AlternativeFertilizerTables({
  document,
}: {
  document?: RecommendationStructuredFertilizerLines | null;
}) {
  const tableModels = buildAlternativeFertilizerTableModels(document);
  const columns: RecommendationTableColumn[] = [
    { key: "fertilizer", header: "Adubo", minW: "240px" },
    { key: "npk", header: "N-P2O5-K2O", minW: "130px" },
    { key: "dose", header: "Dose", minW: "130px" },
    { key: "quantity", header: "Quantidade", minW: "140px" },
    { key: "details", header: "Detalhes", minW: "220px" },
    { key: "observation", header: "Observação", minW: "240px" },
  ];

  if (tableModels.length === 0) return null;

  return (
    <VStack align="stretch" gap={4}>
      {tableModels.map((model) => (
        <VStack key={model.title} align="stretch" gap={3}>
          <Heading size="sm">{model.title}</Heading>
          <RecommendationTable
            columns={columns}
            rows={model.rows}
            minW="980px"
            getRowKey={(_row, rowIndex) => `${model.title}-${rowIndex}`}
            renderCell={(row, _column, _rowIndex, columnIndex) => (
              <Text whiteSpace="pre-wrap" overflowWrap="anywhere">
                {row[columnIndex] || "-"}
              </Text>
            )}
          />
        </VStack>
      ))}
    </VStack>
  );
}

export default function RecommendationStructuredFertilizerTables({
  document,
  showShoppingListHeader = false,
}: RecommendationStructuredFertilizerTablesProps) {
  const displayDocument = document;

  if (!hasStructuredRecommendationContent(displayDocument)) return null;

  return (
    <VStack align="stretch" gap={4}>
      {showShoppingListHeader && displayDocument ? (
        <ShoppingListHeader document={displayDocument as ShoppingListResponse} />
      ) : null}
      <FormulatedPlantingFertilizerTable directRecommendation={displayDocument} />
      <FormulatedTopDressingFertilizerTable directRecommendation={displayDocument} />
      <MicronutrientFertilizerTable
        directRecommendation={displayDocument}
        variant={showShoppingListHeader ? "shopping" : "recommendation"}
      />
      <AlternativeFertilizerTables document={displayDocument} />
      <SulfurRecommendationSection document={displayDocument} mode={showShoppingListHeader ? "shopping" : "direct"} />
      <GypsumRecommendationSection document={displayDocument} mode={showShoppingListHeader ? "shopping" : "direct"} />
    </VStack>
  );
}
