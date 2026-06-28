import { Box, Heading, Table, Text, VStack } from "@chakra-ui/react";

import type {
  DirectRecommendationResponse,
  RecommendationApplicationUnit,
  SolidFertilizerWithMicronutrientsLine,
} from "@/interfaces/Recommendation";

type MicronutrientFertilizerTableProps = {
  directRecommendation?: DirectRecommendationResponse | null;
};

type LocalizedDose = {
  label: "g/m linear" | "g/cova";
  value: string;
};

const formatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 4,
});

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

const normalizeText = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  if (typeof value === "number") return formatter.format(value);
  if (typeof value === "string") return value.trim();
  return "";
};

const getFirstText = (
  line: SolidFertilizerWithMicronutrientsLine,
  fields: readonly string[],
): string => {
  for (const field of fields) {
    const text = normalizeText(line[field]);
    if (text) return text;
  }

  return "";
};

const normalizeUnit = (value: string): RecommendationApplicationUnit | "" => {
  const unit = value.trim().toUpperCase();
  if (["G_M_LINEAR", "G/M", "G_M", "GRAMAS_M_LINEAR"].includes(unit)) return "G_M_LINEAR";
  if (["G_COVA", "G/COVA", "GRAMAS_COVA"].includes(unit)) return "G_COVA";
  return "";
};

export const getMicronutrientFertilizerLines = (
  directRecommendation?: DirectRecommendationResponse | null,
): SolidFertilizerWithMicronutrientsLine[] => {
  if (!directRecommendation) return [];

  for (const field of lineArrayFields) {
    const value = directRecommendation[field];
    if (Array.isArray(value) && value.length > 0) return value;
  }

  return [];
};

export const hasMicronutrientFertilizerRows = (
  directRecommendation?: DirectRecommendationResponse | null,
): boolean =>
  getMicronutrientFertilizerLines(directRecommendation).some((line) =>
    Boolean(
      getFirstText(line, valueFields.micronutrient) ||
        getFirstText(line, valueFields.fertilizer) ||
        getFirstText(line, valueFields.message),
    ),
  );

const getLocalizedDose = (line: SolidFertilizerWithMicronutrientsLine): LocalizedDose | null => {
  const unit = normalizeUnit(getFirstText(line, valueFields.unit));

  if (unit === "G_M_LINEAR") {
    return { label: "g/m linear", value: getFirstText(line, valueFields.linearDose) || "-" };
  }

  if (unit === "G_COVA") {
    return { label: "g/cova", value: getFirstText(line, valueFields.holeDose) || "-" };
  }

  const linearDose = getFirstText(line, valueFields.linearDose);
  if (linearDose) return { label: "g/m linear", value: linearDose };

  const holeDose = getFirstText(line, valueFields.holeDose);
  if (holeDose) return { label: "g/cova", value: holeDose };

  return null;
};

const getLocalizedColumnLabel = (localizedDoses: (LocalizedDose | null)[]) => {
  const labels = Array.from(new Set(localizedDoses.map((dose) => dose?.label).filter(Boolean)));
  return labels.length === 1 ? labels[0] : "Aplicação localizada";
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

  const localizedDoses = lines.map(getLocalizedDose);
  const localizedColumnLabel = getLocalizedColumnLabel(localizedDoses);

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
              const observation = getFirstText(line, valueFields.observation);

              return (
                <Table.Row key={String(line.id ?? index)}>
                  <Table.Cell>{getFirstText(line, valueFields.micronutrient) || "-"}</Table.Cell>
                  <Table.Cell>
                    <VStack align="start" gap={1}>
                      <Text>{getFirstText(line, valueFields.fertilizer) || "-"}</Text>
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
                    {localizedDose
                      ? localizedColumnLabel === "Aplicação localizada"
                        ? `${localizedDose.value} ${localizedDose.label}`
                        : localizedDose.value
                      : "-"}
                    {observation ? (
                      <Text color="fg.muted" fontSize="xs" mt={1}>
                        {observation}
                      </Text>
                    ) : null}
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
