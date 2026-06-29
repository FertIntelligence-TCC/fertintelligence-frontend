import { Box, Heading, Table, Text, VStack } from "@chakra-ui/react";

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
  phase: ["fase", "phase"],
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
  unit: ["unidade_aplicavel", "unidadeAplicavel", "applicableUnit"],
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

  return (
    <VStack align="stretch" gap={3}>
      <Heading size="sm">Adubos sólidos com micronutrientes</Heading>
      <Box overflowX="auto">
        <Table.Root size="sm" variant="outline" minW="760px">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Micronutriente</Table.ColumnHeader>
              <Table.ColumnHeader>Fonte/adubo</Table.ColumnHeader>
              <Table.ColumnHeader>Teor</Table.ColumnHeader>
              <Table.ColumnHeader>kg/ha micronutriente</Table.ColumnHeader>
              <Table.ColumnHeader>kg/ha adubo</Table.ColumnHeader>
              <Table.ColumnHeader>{localizedColumnLabel}</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {lines.map((line, index) => {
              const localizedDose = localizedDoses[index];
              const message = getFirstText(line, valueFields.message);
              const observation = getMicronutrientTechnicalObservation(line);
              const fertilizerType = getFirstText(line, valueFields.fertilizerType);
              const phase = getFirstText(line, valueFields.phase);

              return (
                <Table.Row key={String(line.id ?? index)}>
                  <Table.Cell>{getFirstText(line, valueFields.micronutrient) || "-"}</Table.Cell>
                  <Table.Cell>
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
                  </Table.Cell>
                  <Table.Cell>{getFirstText(line, valueFields.content) || "-"}</Table.Cell>
                  <Table.Cell>{getFirstText(line, valueFields.micronutrientDose) || "-"}</Table.Cell>
                  <Table.Cell>{getFirstText(line, valueFields.fertilizerDose) || "-"}</Table.Cell>
                  <Table.Cell>
                    {formatLocalizedDoseForColumn(localizedDose, localizedColumnLabel)}
                    <Text color="fg.muted" fontSize="xs" mt={1}>
                      {observation}
                    </Text>
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table.Root>
      </Box>
    </VStack>
  );
}
