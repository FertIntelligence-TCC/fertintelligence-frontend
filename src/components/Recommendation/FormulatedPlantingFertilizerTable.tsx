import { Badge, Box, Heading, HStack, Table, Text, VStack } from "@chakra-ui/react";

import type {
  DirectRecommendationResponse,
  PlantingFormulatedFertilizerLine,
  RecommendationApplicationUnit,
  RecommendationNpkValues,
} from "@/interfaces/Recommendation";

type FormulatedPlantingFertilizerTableProps = {
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
  "formulados_plantio",
  "formuladosPlantio",
  "plantingFormulatedFertilizers",
  "linhas_formulados_plantio",
  "linhasFormuladosPlantio",
] as const;

const valueFields = {
  phase: ["fase", "phase"],
  fertilizer: [
    "formulado",
    "nome_formulado",
    "nomeFormulado",
    "formulatedFertilizer",
    "formulatedFertilizerName",
    "adubo",
    "nome_adubo",
    "nomeAdubo",
    "fertilizer",
    "fertilizerName",
    "id_formulado",
    "idFormulado",
    "formulatedFertilizerId",
    "id_adubo",
    "adubo_id",
    "fertilizerId",
    "idFertilizante",
  ],
  formula: ["formula", "formula_npk", "formulaNpk", "npkFormula"],
  formulaN: ["formula_n", "formulaN", "n"],
  formulaP: ["formula_p2o5", "formulaP2o5", "formula_p", "formulaP", "p2o5", "p"],
  formulaK: ["formula_k2o", "formulaK2o", "formula_k", "formulaK", "k2o", "k"],
  relation: ["relacao_usada", "relacaoUsada", "relationUsed", "relacao_npk", "relacaoNpk", "relacao", "relation"],
  fertilizerDose: ["dose_kg_ha", "doseKgHa", "kg_ha", "kgHa"],
  linearDose: ["g_m_linear", "gMLinear", "gramas_m_linear", "gramasMLinear", "gramsPerLinearMeter"],
  holeDose: ["g_cova", "gCova", "gramas_cova", "gramasCova", "gramsPerHole"],
  unit: ["unidade_aplicavel", "unidadeAplicavel", "applicableUnit"],
  selectionType: ["tipo_selecao", "tipoSelecao", "selectionType"],
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
  line: PlantingFormulatedFertilizerLine,
  fields: readonly string[],
): string => {
  for (const field of fields) {
    const text = normalizeText(line[field]);
    if (text) return text;
  }

  return "";
};

const isNpkValues = (value: unknown): value is RecommendationNpkValues =>
  Boolean(value && typeof value === "object" && !Array.isArray(value));

const formatNpkValues = (value: RecommendationNpkValues): string => {
  const n = normalizeText(value.n);
  const p = normalizeText(value.p2o5 ?? value.p);
  const k = normalizeText(value.k2o ?? value.k);

  return n || p || k ? `${n || "-"}-${p || "-"}-${k || "-"}` : "";
};

const getFirstNpkText = (
  line: PlantingFormulatedFertilizerLine,
  fields: readonly string[],
): string => {
  for (const field of fields) {
    const value = line[field];
    const text = isNpkValues(value) ? formatNpkValues(value) : normalizeText(value);
    if (text) return text;
  }

  return "";
};

const getFormulaText = (line: PlantingFormulatedFertilizerLine): string => {
  const formula = getFirstNpkText(line, valueFields.formula);
  if (formula) return formula;

  const n = getFirstText(line, valueFields.formulaN);
  const p = getFirstText(line, valueFields.formulaP);
  const k = getFirstText(line, valueFields.formulaK);

  return n || p || k ? `${n || "-"}-${p || "-"}-${k || "-"}` : "";
};

const getRelationText = (line: PlantingFormulatedFertilizerLine): string => {
  const relation = getFirstNpkText(line, valueFields.relation);
  return relation.replace(/-/g, " : ");
};

const normalizeUnit = (value: string): RecommendationApplicationUnit | "" => {
  const unit = value.trim().toUpperCase();
  if (["G_M_LINEAR", "G/M", "G_M", "GRAMAS_M_LINEAR"].includes(unit)) return "G_M_LINEAR";
  if (["G_COVA", "G/COVA", "GRAMAS_COVA"].includes(unit)) return "G_COVA";
  return "";
};

const normalizeSelectionType = (value: string): string => {
  const selectionType = value.trim();
  if (!selectionType) return "";

  const upperSelectionType = selectionType.toUpperCase();
  if (upperSelectionType === "DIRETA") return "direta";
  if (upperSelectionType === "APROXIMADA") return "aproximado";

  return selectionType;
};

const isApproximateSelection = (value: string): boolean => {
  const selectionType = value.trim().toUpperCase();
  return selectionType === "APROXIMADA" || selectionType === "APROXIMADO" || selectionType.includes("APROX");
};

export const getFormulatedPlantingFertilizerLines = (
  directRecommendation?: DirectRecommendationResponse | null,
): PlantingFormulatedFertilizerLine[] => {
  if (!directRecommendation) return [];

  for (const field of lineArrayFields) {
    const value = directRecommendation[field];
    if (Array.isArray(value) && value.length > 0) return value;
  }

  return [];
};

export const hasFormulatedPlantingFertilizerRows = (
  directRecommendation?: DirectRecommendationResponse | null,
): boolean =>
  getFormulatedPlantingFertilizerLines(directRecommendation).some((line) =>
    Boolean(
      getFirstText(line, valueFields.fertilizer) ||
        getFormulaText(line) ||
        getFirstText(line, valueFields.message),
    ),
  );

const getLocalizedDose = (line: PlantingFormulatedFertilizerLine): LocalizedDose | null => {
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
  return labels.length === 1 ? labels[0] : "Aplicacao localizada";
};

export default function FormulatedPlantingFertilizerTable({
  directRecommendation,
}: FormulatedPlantingFertilizerTableProps) {
  const lines = getFormulatedPlantingFertilizerLines(directRecommendation)
    .filter((line) =>
      Boolean(
        getFirstText(line, valueFields.fertilizer) ||
          getFormulaText(line) ||
          getFirstText(line, valueFields.message),
      ),
    )
    .slice(0, 2);

  if (lines.length === 0) return null;

  const localizedDoses = lines.map(getLocalizedDose);
  const localizedColumnLabel = getLocalizedColumnLabel(localizedDoses);

  return (
    <VStack align="stretch" gap={3}>
      <Heading size="sm">Formulados de plantio</Heading>
      <Box overflowX="auto">
        <Table.Root size="sm" variant="outline" minW="860px">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Formulado</Table.ColumnHeader>
              <Table.ColumnHeader>Formula N-P2O5-K2O</Table.ColumnHeader>
              <Table.ColumnHeader>Relacao</Table.ColumnHeader>
              <Table.ColumnHeader>kg/ha</Table.ColumnHeader>
              <Table.ColumnHeader>{localizedColumnLabel}</Table.ColumnHeader>
              <Table.ColumnHeader>Observacao</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {lines.map((line, index) => {
              const localizedDose = localizedDoses[index];
              const selectionType = normalizeSelectionType(getFirstText(line, valueFields.selectionType));
              const phase = getFirstText(line, valueFields.phase);
              const message = getFirstText(line, valueFields.message);
              const observation = getFirstText(line, valueFields.observation);

              return (
                <Table.Row key={String(line.id ?? index)}>
                  <Table.Cell>
                    <VStack align="start" gap={1}>
                      <HStack gap={2} wrap="wrap">
                        <Text>{getFirstText(line, valueFields.fertilizer) || "-"}</Text>
                        {selectionType ? (
                          <Badge colorPalette={isApproximateSelection(selectionType) ? "orange" : "green"}>
                            {selectionType}
                          </Badge>
                        ) : null}
                      </HStack>
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
                  <Table.Cell>{getFormulaText(line) || "-"}</Table.Cell>
                  <Table.Cell>{getRelationText(line) || "-"}</Table.Cell>
                  <Table.Cell>{getFirstText(line, valueFields.fertilizerDose) || "-"}</Table.Cell>
                  <Table.Cell>
                    {localizedDose
                      ? localizedColumnLabel === "Aplicacao localizada"
                        ? `${localizedDose.value} ${localizedDose.label}`
                        : localizedDose.value
                      : "-"}
                  </Table.Cell>
                  <Table.Cell>
                    {observation ? (
                      <Text color="fg.muted" fontSize="xs">
                        {observation}
                      </Text>
                    ) : (
                      "-"
                    )}
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
