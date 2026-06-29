import { Heading, Text, VStack } from "@chakra-ui/react";

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
};

export type RecommendationPrintTableModel = {
  title: string;
  headers: string[];
  rows: string[][];
};

const DEFAULT_MICRONUTRIENT_TECHNICAL_OBSERVATION =
  "Observação técnica não informada pelo backend.";

const lineArrayFields = [
  "adubos_solidos_micronutrientes",
  "adubosSolidosMicronutrientes",
  "solidFertilizersWithMicronutrients",
  "linhas_adubos_solidos_micronutrientes",
  "linhasAdubosSolidosMicronutrientes",
] as const;

const valueFields = {
  micronutrient: ["micronutriente", "micronutrient", "nutrient"],
  fertilizer: ["adubo", "nome_adubo", "nomeAdubo", "fertilizer", "fertilizerName"],
  fertilizerType: ["tipo_adubo", "tipoAdubo", "fertilizerType", "grupo_adubo", "grupoAdubo", "fertilizerGroup"],
  phase: ["fase_aplicacao", "faseAplicacao", "fase", "phase"],
  content: ["teor", "teor_usado", "teorUsado", "usedContent", "contentUsed"],
  micronutrientDose: [
    "dose_micronutriente_kg_ha",
    "doseMicronutrienteKgHa",
    "micronutrientDoseKgHa",
    "kg_ha_micronutriente",
    "kgHaMicronutriente",
  ],
  fertilizerDose: ["dose_kg_ha", "doseKgHa", "kg_ha", "kgHa"],
  linearDose: ["g_m_linear", "gMLinear", "gramas_m_linear", "gramasMLinear", "gramsPerLinearMeter"],
  holeDose: ["g_cova", "gCova", "gramas_cova", "gramasCova", "gramsPerHole"],
  unit: ["unidade_localizada", "unidadeLocalizada", "unidade_aplicavel", "unidadeAplicavel", "applicableUnit"],
  observation: ["observacao_tecnica", "observacaoTecnica", "technicalObservation", "technicalNote"],
  message: ["mensagem", "mensagem_tecnica", "mensagemTecnica", "message", "technicalMessage"],
} as const;

const getFirstText = (
  line: SolidFertilizerWithMicronutrientsLine,
  fields: readonly string[],
): string => getFirstRecommendationText(line, fields);

export const getMicronutrientFertilizerLines = (
  directRecommendation?: RecommendationStructuredFertilizerLines | null,
): SolidFertilizerWithMicronutrientsLine[] => {
  if (!directRecommendation) return [];

  for (const field of lineArrayFields) {
    const value = directRecommendation[field];
    if (Array.isArray(value) && value.length > 0) return value;
  }

  return [];
};

export const hasMicronutrientFertilizerRows = (
  directRecommendation?: RecommendationStructuredFertilizerLines | null,
): boolean =>
  getMicronutrientFertilizerLines(directRecommendation).some((line) =>
    Boolean(
      getFirstText(line, valueFields.micronutrient) ||
        getFirstText(line, valueFields.fertilizer) ||
        getFirstText(line, valueFields.message),
    ),
  );

const getLineLocalizedDose = (line: SolidFertilizerWithMicronutrientsLine) =>
  getLocalizedDose(line, valueFields);

const getMicronutrientTechnicalObservation = (
  line: SolidFertilizerWithMicronutrientsLine,
): string => getFirstText(line, valueFields.observation) || DEFAULT_MICRONUTRIENT_TECHNICAL_OBSERVATION;

export const buildMicronutrientFertilizerTableModel = (
  directRecommendation?: DirectRecommendationResponse | RecommendationStructuredFertilizerLines | null,
): RecommendationPrintTableModel | null => {
  const lines = getMicronutrientFertilizerLines(directRecommendation).filter((line) =>
    Boolean(
      getFirstText(line, valueFields.micronutrient) ||
        getFirstText(line, valueFields.fertilizer) ||
        getFirstText(line, valueFields.message),
    ),
  );

  if (lines.length === 0) return null;

  const localizedDoses = lines.map(getLineLocalizedDose);
  const localizedColumnLabel = getLocalizedColumnLabel(localizedDoses);

  return {
    title: "Adubos sólidos com micronutrientes",
    headers: [
      "Micronutriente",
      "Fonte/adubo",
      "Teor",
      "kg/ha micronutriente",
      "kg/ha adubo",
      localizedColumnLabel,
    ],
    rows: lines.map((line, index) => {
      const localizedDose = localizedDoses[index];
      const message = getFirstText(line, valueFields.message);
      const observation = getMicronutrientTechnicalObservation(line);
      const fertilizerType = getFirstText(line, valueFields.fertilizerType);
      const phase = getFirstText(line, valueFields.phase);
      const fertilizer = getFirstText(line, valueFields.fertilizer) || "-";
      const localizedDoseText = formatLocalizedDoseForColumn(localizedDose, localizedColumnLabel);

      return [
        getFirstText(line, valueFields.micronutrient) || "-",
        [
          fertilizer,
          fertilizerType ? `Tipo/grupo: ${fertilizerType}` : "",
          phase ? `Fase: ${phase}` : "",
          message,
        ]
          .filter(Boolean)
          .join("\n"),
        getFirstText(line, valueFields.content) || "-",
        getFirstText(line, valueFields.micronutrientDose) || "-",
        getFirstText(line, valueFields.fertilizerDose) || "-",
        [localizedDoseText, observation].join("\n"),
      ];
    }),
  };
};

export default function MicronutrientFertilizerTable({
  directRecommendation,
}: MicronutrientFertilizerTableProps) {
  const lines = getMicronutrientFertilizerLines(directRecommendation).filter((line) =>
    Boolean(
      getFirstText(line, valueFields.micronutrient) ||
        getFirstText(line, valueFields.fertilizer) ||
        getFirstText(line, valueFields.message),
    ),
  );

  if (lines.length === 0) return null;

  const localizedDoses = lines.map(getLineLocalizedDose);
  const tableModel = buildMicronutrientFertilizerTableModel(directRecommendation);
  const localizedColumnLabel = tableModel?.headers[5] ?? getLocalizedColumnLabel(localizedDoses);
  const columns: RecommendationTableColumn[] = [
    { key: "micronutrient", header: "Micronutriente", minW: "140px" },
    { key: "fertilizer", header: "Fonte/adubo", minW: "220px" },
    { key: "content", header: "Teor", minW: "100px" },
    { key: "micronutrientDose", header: "kg/ha micronutriente", minW: "150px" },
    { key: "fertilizerDose", header: "kg/ha adubo", minW: "120px" },
    { key: "localizedDose", header: localizedColumnLabel, minW: "180px" },
  ];

  return (
    <VStack align="stretch" gap={3}>
      <Heading size="sm">Adubos sólidos com micronutrientes</Heading>
      <RecommendationTable
        columns={columns}
        rows={lines}
        minW="920px"
        getRowKey={(line, index) => String(line.id ?? index)}
        renderCell={(line, column, rowIndex) => {
          const localizedDose = localizedDoses[rowIndex];
          const message = getFirstText(line, valueFields.message);
          const observation = getMicronutrientTechnicalObservation(line);
          const fertilizerType = getFirstText(line, valueFields.fertilizerType);
          const phase = getFirstText(line, valueFields.phase);

          if (column.key === "micronutrient") return getFirstText(line, valueFields.micronutrient) || "-";
          if (column.key === "content") return getFirstText(line, valueFields.content) || "-";
          if (column.key === "micronutrientDose") return getFirstText(line, valueFields.micronutrientDose) || "-";
          if (column.key === "fertilizerDose") return getFirstText(line, valueFields.fertilizerDose) || "-";
          if (column.key === "localizedDose") {
            return (
              <>
                {formatLocalizedDoseForColumn(localizedDose, localizedColumnLabel)}
                <Text color="fg.muted" fontSize="xs" mt={1} whiteSpace="pre-wrap" overflowWrap="anywhere">
                  {observation}
                </Text>
              </>
            );
          }

          return (
            <VStack align="start" gap={1}>
              <Text>{getFirstText(line, valueFields.fertilizer) || "-"}</Text>
              {fertilizerType ? (
                <Text color="fg.muted" fontSize="xs">
                  Tipo/grupo: {fertilizerType}
                </Text>
              ) : null}
              {phase ? (
                <Text color="fg.muted" fontSize="xs">
                  Fase: {phase}
                </Text>
              ) : null}
              {message ? (
                <Text color="orange.600" fontSize="xs">
                  {message}
                </Text>
              ) : null}
            </VStack>
          );
        }}
      />
    </VStack>
  );
}
