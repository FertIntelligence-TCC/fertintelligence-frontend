import { Heading, VStack } from "@chakra-ui/react";

import type {
  DirectRecommendationResponse,
  RecommendationStructuredFertilizerLines,
  SolidFertilizerWithMicronutrientsLine,
} from "@/interfaces/Recommendation";
import {
  formatLocalizedDoseForColumn,
  getFirstRecommendationText,
  getLocalizedColumnLabel,
  getLocalizedDose,
} from "@/utils/recommendationLocalizedDose";

import RecommendationTable, { type RecommendationTableColumn } from "./RecommendationTable";

type MicronutrientFertilizerTableProps = {
  directRecommendation?: RecommendationStructuredFertilizerLines | null;
  variant?: "recommendation" | "shopping";
};

export type RecommendationPrintTableModel = {
  title: string;
  headers: string[];
  rows: string[][];
};

const lineArrayFields = [
  "adubos_solidos_micronutrientes",
  "adubosSolidosMicronutrientes",
  "solidFertilizersWithMicronutrients",
  "linhas_adubos_solidos_micronutrientes",
  "linhasAdubosSolidosMicronutrientes",
] as const;

const genericLineArrayFields = [
  "linhas",
  "linhas_recomendacao",
  "linhasRecomendacao",
  "recommendationLines",
  "itens",
  "items",
] as const;

const valueFields = {
  lineType: ["tipo_linha", "tipoLinha", "lineType", "tipo", "type"],
  micronutrient: [
    "micronutriente",
    "micronutrient",
    "nutriente_objetivo",
    "nutrienteObjetivo",
    "nutrientObjective",
    "nutriente",
    "nutrient",
    "objetivo",
    "objective",
  ],
  fertilizer: ["fonte", "source", "insumo", "input", "adubo", "nome_adubo", "nomeAdubo", "fertilizer", "fertilizerName"],
  fertilizerType: [
    "tipo_fonte",
    "tipoFonte",
    "sourceType",
    "tipo_adubo",
    "tipoAdubo",
    "fertilizerType",
    "grupo_adubo",
    "grupoAdubo",
    "fertilizerGroup",
  ],
  phase: ["fase_aplicacao", "faseAplicacao", "fase", "phase"],
  content: ["teor", "teor_usado", "teorUsado", "usedContent", "contentUsed"],
  micronutrientDose: [
    "dose",
    "dose_micronutriente_kg_ha",
    "doseMicronutrienteKgHa",
    "micronutrientDoseKgHa",
    "kg_ha_micronutriente",
    "kgHaMicronutriente",
  ],
  fertilizerDose: ["dose_kg_ha", "doseKgHa", "kg_ha", "kgHa"],
  linearDose: ["g_m_linear", "gMLinear", "gramas_m_linear", "gramasMLinear", "gramsPerLinearMeter"],
  holeDose: ["g_cova", "gCova", "gramas_cova", "gramasCova", "gramsPerHole"],
  unit: ["unidade", "unit", "unidade_localizada", "unidadeLocalizada", "unidade_aplicavel", "unidadeAplicavel", "applicableUnit"],
  quantityPerHectare: ["quantidade_por_hectare", "quantidadePorHectare", "quantityPerHectare", "dose_kg_ha", "doseKgHa", "kg_ha", "kgHa", "dose"],
  totalForArea: ["total_area", "totalArea", "totalForArea", "quantidade_total", "quantidadeTotal", "totalQuantity", "quantidade", "quantity"],
  observation: ["observacao_tecnica", "observacaoTecnica", "technicalObservation", "technicalNote"],
  justification: ["justificativa", "justification", "observacao_tecnica", "observacaoTecnica", "technicalObservation", "technicalNote"],
  limitations: ["limitacoes", "limitações", "limitations"],
  message: ["mensagem", "mensagem_tecnica", "mensagemTecnica", "message", "technicalMessage"],
} as const;

const micronutrientLabels: Record<string, string> = {
  B: "Boro",
  CU: "Cobre",
  FE: "Ferro",
  MN: "Manganês",
  ZN: "Zinco",
};

const getFirstText = (
  line: SolidFertilizerWithMicronutrientsLine,
  fields: readonly string[],
): string => getFirstRecommendationText(line, fields);

const normalizeMicronutrientLabel = (value: string): string => {
  const text = value.trim();
  const upperText = text.toUpperCase();
  return micronutrientLabels[upperText] ?? text;
};

export const getCalculatedMicronutrientLabels = (
  directRecommendation?: RecommendationStructuredFertilizerLines | null,
): string[] =>
  Array.from(
    new Set(
      getMicronutrientFertilizerLines(directRecommendation)
        .filter(hasMicronutrientDisplayContent)
        .map((line) => normalizeMicronutrientLabel(getFirstText(line, valueFields.micronutrient)))
        .filter(Boolean),
    ),
  );

const isMicronutrientTypedLine = (line: SolidFertilizerWithMicronutrientsLine): boolean => {
  const type = getFirstText(line, valueFields.lineType).toUpperCase();
  const sourceType = getFirstText(line, valueFields.fertilizerType).toUpperCase();
  return type === "MICRONUTRIENTE" || sourceType === "MICRONUTRIENTE";
};

const hasMicronutrientDisplayContent = (line: SolidFertilizerWithMicronutrientsLine): boolean =>
  Boolean(
    getFirstText(line, valueFields.micronutrient) ||
      getFirstText(line, valueFields.fertilizer) ||
      getFirstText(line, valueFields.micronutrientDose) ||
      getFirstText(line, valueFields.fertilizerDose) ||
      getFirstText(line, valueFields.message),
  );

const appendUniqueLines = (
  target: SolidFertilizerWithMicronutrientsLine[],
  lines: SolidFertilizerWithMicronutrientsLine[],
  seenKeys: Set<string>,
) => {
  for (const line of lines) {
    const key = String(line.id ?? JSON.stringify(line));
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);
    target.push(line);
  }
};

export const getMicronutrientFertilizerLines = (
  directRecommendation?: RecommendationStructuredFertilizerLines | null,
): SolidFertilizerWithMicronutrientsLine[] => {
  if (!directRecommendation) return [];

  const lines: SolidFertilizerWithMicronutrientsLine[] = [];
  const seenKeys = new Set<string>();

  for (const field of lineArrayFields) {
    const value = directRecommendation[field];
    if (Array.isArray(value) && value.length > 0) {
      appendUniqueLines(lines, value, seenKeys);
    }
  }

  for (const field of genericLineArrayFields) {
    const value = directRecommendation[field];
    if (Array.isArray(value) && value.length > 0) {
      appendUniqueLines(lines, value.filter(isMicronutrientTypedLine), seenKeys);
    }
  }

  return lines;
};

export const hasMicronutrientFertilizerRows = (
  directRecommendation?: RecommendationStructuredFertilizerLines | null,
): boolean =>
  getMicronutrientFertilizerLines(directRecommendation).some(hasMicronutrientDisplayContent);

const getLineLocalizedDose = (line: SolidFertilizerWithMicronutrientsLine) =>
  getLocalizedDose(line, valueFields);

export const buildMicronutrientFertilizerTableModel = (
  directRecommendation?: DirectRecommendationResponse | RecommendationStructuredFertilizerLines | null,
): RecommendationPrintTableModel | null => {
  const lines = getMicronutrientFertilizerLines(directRecommendation).filter(hasMicronutrientDisplayContent);

  if (lines.length === 0) return null;

  const localizedDoses = lines.map(getLineLocalizedDose);
  const localizedColumnLabel = getLocalizedColumnLabel(localizedDoses);

  return {
    title: "Fontes orgânicas, organominerais e micronutrientes",
    headers: [
      "Tipo de fonte",
      "Nutriente/objetivo",
      "Fonte",
      "Dose",
      "Unidade",
      "Justificativa",
      "Limitações",
    ],
    rows: lines.map((line, index) => {
      const localizedDose = localizedDoses[index];
      const message = getFirstText(line, valueFields.message);
      const localizedDoseText = formatLocalizedDoseForColumn(localizedDose, localizedColumnLabel);
      const dose = getFirstText(line, valueFields.fertilizerDose) ||
        getFirstText(line, valueFields.micronutrientDose) ||
        localizedDoseText;
      const unit = getFirstText(line, valueFields.unit) ||
        (localizedDose ? localizedDose.label : "");

      return [
        getFirstText(line, valueFields.fertilizerType) || "Micronutriente",
        normalizeMicronutrientLabel(getFirstText(line, valueFields.micronutrient)) || "-",
        getFirstText(line, valueFields.fertilizer) || "-",
        dose || "-",
        unit || "-",
        getFirstText(line, valueFields.justification) || message || "-",
        getFirstText(line, valueFields.limitations) || "-",
      ];
    }),
  };
};

export default function MicronutrientFertilizerTable({
  directRecommendation,
  variant = "recommendation",
}: MicronutrientFertilizerTableProps) {
  const lines = getMicronutrientFertilizerLines(directRecommendation).filter(hasMicronutrientDisplayContent);

  if (lines.length === 0) return null;

  const localizedDoses = lines.map(getLineLocalizedDose);
  const localizedColumnLabel = getLocalizedColumnLabel(localizedDoses);
  const columns: RecommendationTableColumn[] = variant === "shopping"
    ? [
        { key: "input", header: "Insumo", minW: "220px" },
        { key: "group", header: "Tipo/grupo", minW: "150px" },
        { key: "phase", header: "Fase", minW: "120px" },
        { key: "quantityPerHectare", header: "Quantidade por hectare", minW: "170px" },
        { key: "localizedUnit", header: "Unidade localizada", minW: "160px" },
        { key: "totalForArea", header: "Total para a área", minW: "150px" },
      ]
    : [
        { key: "sourceType", header: "Tipo de fonte", minW: "150px" },
        { key: "objective", header: "Nutriente/objetivo", minW: "160px" },
        { key: "source", header: "Fonte", minW: "220px" },
        { key: "dose", header: "Dose", minW: "120px" },
        { key: "unit", header: "Unidade", minW: "130px" },
        { key: "justification", header: "Justificativa", minW: "240px" },
        { key: "limitations", header: "Limitações", minW: "200px" },
      ];

  return (
    <VStack align="stretch" gap={3}>
      <Heading size="sm">
        {variant === "shopping" ? "Micronutrientes" : "Fontes orgânicas, organominerais e micronutrientes"}
      </Heading>
      <RecommendationTable
        columns={columns}
        rows={lines}
        minW={variant === "shopping" ? "970px" : "1160px"}
        getRowKey={(line, index) => String(line.id ?? index)}
        renderCell={(line, column, rowIndex) => {
          const localizedDose = localizedDoses[rowIndex];
          const message = getFirstText(line, valueFields.message);
          const localizedDoseText = formatLocalizedDoseForColumn(localizedDose, localizedColumnLabel);
          const sourceType = getFirstText(line, valueFields.fertilizerType) || "Micronutriente";
          const micronutrient = normalizeMicronutrientLabel(getFirstText(line, valueFields.micronutrient)) || "-";
          const source = getFirstText(line, valueFields.fertilizer) || "-";
          const dose = getFirstText(line, valueFields.fertilizerDose) ||
            getFirstText(line, valueFields.micronutrientDose) ||
            localizedDoseText;
          const unit = getFirstText(line, valueFields.unit) ||
            (localizedDose ? localizedDose.label : "");

          if (variant === "shopping") {
            if (column.key === "input") return source;
            if (column.key === "group") return sourceType;
            if (column.key === "phase") return getFirstText(line, valueFields.phase) || "-";
            if (column.key === "quantityPerHectare") {
              return getFirstText(line, valueFields.quantityPerHectare) || dose || "-";
            }
            if (column.key === "localizedUnit") return unit || "-";
            if (column.key === "totalForArea") return getFirstText(line, valueFields.totalForArea) || "-";
          }

          if (column.key === "sourceType") return sourceType;
          if (column.key === "objective") return micronutrient;
          if (column.key === "source") return source;
          if (column.key === "dose") return dose || "-";
          if (column.key === "unit") return unit || "-";
          if (column.key === "justification") return getFirstText(line, valueFields.justification) || message || "-";
          if (column.key === "limitations") return getFirstText(line, valueFields.limitations) || "-";

          return "-";
        }}
      />
    </VStack>
  );
}
