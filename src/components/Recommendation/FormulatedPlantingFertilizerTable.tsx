import { Badge, Box, Heading, HStack, Table, Text, VStack } from "@chakra-ui/react";

import type {
  DirectRecommendationResponse,
  PlantingFormulatedFertilizerLine,
  RecommendationNpkValues,
  RecommendationStructuredFertilizerLines,
  TopDressingFormulatedFertilizerLine,
} from "@/interfaces/Recommendation";
import {
  formatLocalizedDoseForColumn,
  getFirstRecommendationText,
  getLocalizedColumnLabel,
  getLocalizedDose,
  normalizeRecommendationText,
} from "@/utils/recommendationLocalizedDose";

type FormulatedPlantingFertilizerTableProps = {
  directRecommendation?: RecommendationStructuredFertilizerLines | null;
};

export type FormulatedFertilizerPrintTableModel = {
  title: string;
  headers: string[];
  rows: string[][];
  warnings: string[];
};

type FormulatedFertilizerLine = PlantingFormulatedFertilizerLine | TopDressingFormulatedFertilizerLine;

type FormulatedFertilizerTableProps<TLine extends FormulatedFertilizerLine> = {
  title: string;
  lines: TLine[];
};

type TopDressingFertilizerGroup = {
  label: string;
  lines: TopDressingFormulatedFertilizerLine[];
};

const lineArrayFields = [
  "formulados_plantio",
  "formuladosPlantio",
  "plantingFormulatedFertilizers",
  "linhas_formulados_plantio",
  "linhasFormuladosPlantio",
] as const;

const topDressingLineArrayFields = [
  "formulados_cobertura",
  "formuladosCobertura",
  "topDressingFormulatedFertilizers",
  "linhas_formulados_cobertura",
  "linhasFormuladosCobertura",
] as const;

const valueFields = {
  phase: ["fase", "phase"],
  coverage: [
    "cobertura",
    "identificacao_cobertura",
    "identificacaoCobertura",
    "nome_cobertura",
    "nomeCobertura",
    "coverage",
    "coverageName",
    "ordem_cobertura",
    "ordemCobertura",
    "coverageOrder",
  ],
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
  fertilizerType: ["tipo_adubo", "tipoAdubo", "fertilizerType", "grupo_adubo", "grupoAdubo", "fertilizerGroup"],
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

const getFirstText = (
  line: FormulatedFertilizerLine,
  fields: readonly string[],
): string => getFirstRecommendationText(line, fields);

const isNpkValues = (value: unknown): value is RecommendationNpkValues =>
  Boolean(value && typeof value === "object" && !Array.isArray(value));

const formatNpkValues = (value: RecommendationNpkValues): string => {
  const n = normalizeRecommendationText(value.n);
  const p = normalizeRecommendationText(value.p2o5 ?? value.p);
  const k = normalizeRecommendationText(value.k2o ?? value.k);

  return n || p || k ? `${n || "-"}-${p || "-"}-${k || "-"}` : "";
};

const getFirstNpkText = (
  line: FormulatedFertilizerLine,
  fields: readonly string[],
): string => {
  for (const field of fields) {
    const value = line[field];
    const text = isNpkValues(value) ? formatNpkValues(value) : normalizeRecommendationText(value);
    if (text) return text;
  }

  return "";
};

const getFormulaText = (line: FormulatedFertilizerLine): string => {
  const formula = getFirstNpkText(line, valueFields.formula);
  if (formula) return formula;

  const n = getFirstText(line, valueFields.formulaN);
  const p = getFirstText(line, valueFields.formulaP);
  const k = getFirstText(line, valueFields.formulaK);

  return n || p || k ? `${n || "-"}-${p || "-"}-${k || "-"}` : "";
};

const getRelationText = (line: FormulatedFertilizerLine): string => {
  const relation = getFirstNpkText(line, valueFields.relation);
  return relation.replace(/-/g, " : ");
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
  directRecommendation?: RecommendationStructuredFertilizerLines | null,
): PlantingFormulatedFertilizerLine[] => {
  if (!directRecommendation) return [];

  for (const field of lineArrayFields) {
    const value = directRecommendation[field];
    if (Array.isArray(value) && value.length > 0) return value;
  }

  return [];
};

export const getFormulatedTopDressingFertilizerLines = (
  directRecommendation?: RecommendationStructuredFertilizerLines | null,
): TopDressingFormulatedFertilizerLine[] => {
  if (!directRecommendation) return [];

  for (const field of topDressingLineArrayFields) {
    const value = directRecommendation[field];
    if (Array.isArray(value) && value.length > 0) return value;
  }

  return [];
};

const hasFormulatedFertilizerData = (line: FormulatedFertilizerLine): boolean =>
  Boolean(getFirstText(line, valueFields.fertilizer) || getFormulaText(line));

const hasFormulatedFertilizerDisplayContent = (line: FormulatedFertilizerLine): boolean =>
  Boolean(
    hasFormulatedFertilizerData(line) ||
      getFirstText(line, valueFields.message) ||
      getFirstText(line, valueFields.observation),
  );

export const hasFormulatedPlantingFertilizerRows = (
  directRecommendation?: RecommendationStructuredFertilizerLines | null,
): boolean =>
  getFormulatedPlantingFertilizerLines(directRecommendation).some(hasFormulatedFertilizerDisplayContent);

export const hasFormulatedTopDressingFertilizerRows = (
  directRecommendation?: RecommendationStructuredFertilizerLines | null,
): boolean =>
  getFormulatedTopDressingFertilizerLines(directRecommendation).some(hasFormulatedFertilizerDisplayContent);

const getLineLocalizedDose = (line: FormulatedFertilizerLine) =>
  getLocalizedDose(line, valueFields);

const getCoverageLabel = (line: TopDressingFormulatedFertilizerLine): string =>
  getFirstText(line, valueFields.coverage) || getFirstText(line, valueFields.phase);

const groupTopDressingLines = (
  lines: TopDressingFormulatedFertilizerLine[],
): TopDressingFertilizerGroup[] => {
  const groups: TopDressingFertilizerGroup[] = [];

  for (const line of lines) {
    const label = getCoverageLabel(line) || "Cobertura";
    const currentGroup = groups[groups.length - 1];

    if (currentGroup && currentGroup.label === label) {
      currentGroup.lines.push(line);
    } else {
      groups.push({ label, lines: [line] });
    }
  }

  return groups;
};

const buildFormulatedFertilizerTableModel = <TLine extends FormulatedFertilizerLine>(
  title: string,
  lines: TLine[],
): FormulatedFertilizerPrintTableModel | null => {
  const fertilizerLines = lines.filter(hasFormulatedFertilizerData);
  const warnings = lines
    .filter((line) => !hasFormulatedFertilizerData(line))
    .map((line) => getFirstText(line, valueFields.observation) || getFirstText(line, valueFields.message))
    .filter(Boolean);

  if (fertilizerLines.length === 0 && warnings.length === 0) return null;

  const localizedDoses = fertilizerLines.map(getLineLocalizedDose);
  const localizedColumnLabel = getLocalizedColumnLabel(localizedDoses);

  return {
    title,
    headers: [
      "Formulado",
      "Formula N-P2O5-K2O",
      "Relacao",
      "kg/ha",
      localizedColumnLabel,
      "Observacao",
    ],
    rows: fertilizerLines.map((line, index) => {
      const localizedDose = localizedDoses[index];
      const selectionType = normalizeSelectionType(getFirstText(line, valueFields.selectionType));
      const fertilizerType = getFirstText(line, valueFields.fertilizerType);
      const phase = getFirstText(line, valueFields.phase);
      const message = getFirstText(line, valueFields.message);
      const observation = getFirstText(line, valueFields.observation);
      const localizedDoseText = formatLocalizedDoseForColumn(localizedDose, localizedColumnLabel);

      return [
        [
          getFirstText(line, valueFields.fertilizer) || "-",
          fertilizerType ? `Tipo/grupo: ${fertilizerType}` : "",
          selectionType ? `Tipo: ${selectionType}` : "",
          phase ? `Fase: ${phase}` : "",
          message,
        ]
          .filter(Boolean)
          .join("\n"),
        getFormulaText(line) || "-",
        getRelationText(line) || "-",
        getFirstText(line, valueFields.fertilizerDose) || "-",
        localizedDoseText,
        observation || "-",
      ];
    }),
    warnings,
  };
};

export const buildFormulatedPlantingFertilizerTableModels = (
  directRecommendation?: DirectRecommendationResponse | RecommendationStructuredFertilizerLines | null,
): FormulatedFertilizerPrintTableModel[] => {
  const lines = getFormulatedPlantingFertilizerLines(directRecommendation).filter(
    hasFormulatedFertilizerDisplayContent,
  );
  const model = buildFormulatedFertilizerTableModel("Formulados de plantio", lines);
  return model ? [model] : [];
};

export const buildFormulatedTopDressingFertilizerTableModels = (
  directRecommendation?: DirectRecommendationResponse | RecommendationStructuredFertilizerLines | null,
): FormulatedFertilizerPrintTableModel[] => {
  const lines = getFormulatedTopDressingFertilizerLines(directRecommendation).filter(
    hasFormulatedFertilizerDisplayContent,
  );
  return groupTopDressingLines(lines)
    .map((group) => buildFormulatedFertilizerTableModel(`Formulados de cobertura - ${group.label}`, group.lines))
    .filter((model): model is FormulatedFertilizerPrintTableModel => Boolean(model));
};

function FormulatedFertilizerTable<TLine extends FormulatedFertilizerLine>({
  title,
  lines,
}: FormulatedFertilizerTableProps<TLine>) {
  const fertilizerLines = lines.filter(hasFormulatedFertilizerData);
  const warnings = lines
    .filter((line) => !hasFormulatedFertilizerData(line))
    .map((line) => getFirstText(line, valueFields.observation) || getFirstText(line, valueFields.message))
    .filter(Boolean);

  if (fertilizerLines.length === 0 && warnings.length === 0) return null;

  const localizedDoses = fertilizerLines.map(getLineLocalizedDose);
  const localizedColumnLabel = getLocalizedColumnLabel(localizedDoses);

  return (
    <VStack align="stretch" gap={3}>
      <Heading size="sm">{title}</Heading>
      {fertilizerLines.length > 0 ? (
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
              {fertilizerLines.map((line, index) => {
                const localizedDose = localizedDoses[index];
                const selectionType = normalizeSelectionType(getFirstText(line, valueFields.selectionType));
                const fertilizerType = getFirstText(line, valueFields.fertilizerType);
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
                    <Table.Cell>{getFormulaText(line) || "-"}</Table.Cell>
                    <Table.Cell>{getRelationText(line) || "-"}</Table.Cell>
                    <Table.Cell>{getFirstText(line, valueFields.fertilizerDose) || "-"}</Table.Cell>
                    <Table.Cell>
                      {formatLocalizedDoseForColumn(localizedDose, localizedColumnLabel)}
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
      ) : null}
      {warnings.map((warning, index) => (
        <Box key={`${warning}-${index}`} borderWidth="1px" borderRadius="md" borderColor="orange.200" p={3}>
          <Text color="orange.700" fontSize="sm" overflowWrap="anywhere">
            {warning}
          </Text>
        </Box>
      ))}
    </VStack>
  );
}

export function FormulatedTopDressingFertilizerTable({
  directRecommendation,
}: FormulatedPlantingFertilizerTableProps) {
  const lines = getFormulatedTopDressingFertilizerLines(directRecommendation).filter(
    hasFormulatedFertilizerDisplayContent,
  );
  const groups = groupTopDressingLines(lines);

  if (groups.length === 0) return null;

  return (
    <VStack align="stretch" gap={4}>
      <Heading size="sm">Formulados de cobertura</Heading>
      {groups.map((group, index) => (
        <Box key={`${group.label}-${index}`} borderWidth="1px" borderRadius="md" p={3}>
          <FormulatedFertilizerTable title={group.label} lines={group.lines} />
        </Box>
      ))}
    </VStack>
  );
}

export default function FormulatedPlantingFertilizerTable({
  directRecommendation,
}: FormulatedPlantingFertilizerTableProps) {
  const lines = getFormulatedPlantingFertilizerLines(directRecommendation)
    .filter(hasFormulatedFertilizerDisplayContent)
    .slice(0, 2);

  return <FormulatedFertilizerTable title="Formulados de plantio" lines={lines} />;
}
