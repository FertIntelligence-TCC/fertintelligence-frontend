import { Box, Heading, SimpleGrid, Table, Text, VStack } from "@chakra-ui/react";

import type {
  BioFertilizerRecommendationLine,
  GreenFertilizerRecommendationLine,
  OrganicFertilizerRecommendationLine,
  OrganoMineralFertilizerRecommendationLine,
  RecommendationFertilizerLine,
  RecommendationStructuredFertilizerLines,
  ShoppingListResponse,
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

type RecommendationStructuredFertilizerTablesProps = {
  document?: RecommendationStructuredFertilizerLines | null;
  showShoppingListHeader?: boolean;
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

export const hasStructuredRecommendationContent = (
  document?: RecommendationStructuredFertilizerLines | null,
): boolean =>
  hasMicronutrientFertilizerRows(document) ||
  hasFormulatedPlantingFertilizerRows(document) ||
  hasFormulatedTopDressingFertilizerRows(document) ||
  hasAlternativeFertilizerRows(document);

function AlternativeFertilizerTables({
  document,
}: {
  document?: RecommendationStructuredFertilizerLines | null;
}) {
  const tableModels = buildAlternativeFertilizerTableModels(document);

  if (tableModels.length === 0) return null;

  return (
    <VStack align="stretch" gap={4}>
      {tableModels.map((model) => (
        <VStack key={model.title} align="stretch" gap={3}>
          <Heading size="sm">{model.title}</Heading>
          <Box overflowX="auto">
            <Table.Root size="sm" variant="outline" minW="860px">
              <Table.Header>
                <Table.Row>
                  {model.headers.map((header) => (
                    <Table.ColumnHeader key={header}>{header}</Table.ColumnHeader>
                  ))}
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {model.rows.map((row, rowIndex) => (
                  <Table.Row key={`${model.title}-${rowIndex}`}>
                    {row.map((cell, cellIndex) => (
                      <Table.Cell key={`${model.title}-${rowIndex}-${cellIndex}`}>
                        <Text whiteSpace="pre-wrap" overflowWrap="anywhere">
                          {cell}
                        </Text>
                      </Table.Cell>
                    ))}
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        </VStack>
      ))}
    </VStack>
  );
}

export default function RecommendationStructuredFertilizerTables({
  document,
  showShoppingListHeader = false,
}: RecommendationStructuredFertilizerTablesProps) {
  if (!hasStructuredRecommendationContent(document)) return null;

  return (
    <VStack align="stretch" gap={4}>
      {showShoppingListHeader && document ? (
        <ShoppingListHeader document={document as ShoppingListResponse} />
      ) : null}
      <FormulatedPlantingFertilizerTable directRecommendation={document} />
      <FormulatedTopDressingFertilizerTable directRecommendation={document} />
      <MicronutrientFertilizerTable directRecommendation={document} />
      <AlternativeFertilizerTables document={document} />
    </VStack>
  );
}
