import { Box, SimpleGrid, Text } from "@chakra-ui/react";

import FertigramRadarChart, {
  type FertigramRadarChartNutrient,
} from "@/components/Fertigram/FertigramRadarChart";
import type {
  RecommendationFertigramFields,
  RecommendationFertigramGroup,
  RecommendationFertigramItem,
} from "@/interfaces/Recommendation";

export type RecommendationFertigramSource = "chemical" | "foliar";

type RecommendationFertigramChartsProps = {
  document?: RecommendationFertigramFields | null;
  source: RecommendationFertigramSource;
};

const unavailableMessage = "Fertigrama indisponível por falta de faixa adequada estruturada";
const radarOuterScale = 3;

const normalizeToken = (value?: string | null) =>
  (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .trim();

const getFirstString = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }

  return "";
};

const getFirstValue = (...values: unknown[]) => {
  for (const value of values) {
    if (value !== null && value !== undefined && value !== "") return value as number | string | null;
  }

  return null;
};

const toNumberOrNull = (value?: number | string | null) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;

  if (typeof value === "string") {
    const trimmedValue = value.trim();
    if (!trimmedValue) return null;

    const normalizedValue = Number(trimmedValue.replace(",", "."));
    return Number.isFinite(normalizedValue) ? normalizedValue : null;
  }

  return null;
};

const hasRawRadarRange = (
  measuredValue: number | string | null,
  recommendedMin: number | string | null,
  recommendedMax: number | string | null,
) =>
  toNumberOrNull(measuredValue) !== null &&
  toNumberOrNull(recommendedMin) !== null &&
  toNumberOrNull(recommendedMax) !== null;

const scaleUnitNormalizedValue = (value: number | string | null) => {
  const numericValue = toNumberOrNull(value);
  if (numericValue === null) return value;

  return numericValue * radarOuterScale;
};

const normalizeVisualScale = (
  normalizedValue: number | string | null,
  normalizedAdequateMin: number | string | null,
  normalizedAdequateMax: number | string | null,
) => {
  const values = [
    toNumberOrNull(normalizedValue),
    toNumberOrNull(normalizedAdequateMin),
    toNumberOrNull(normalizedAdequateMax),
  ];

  const usesUnitScale = values.every((value) => value !== null && value >= 0 && value <= 1);

  if (!usesUnitScale) {
    return {
      normalizedValue,
      normalizedAdequateMin,
      normalizedAdequateMax,
    };
  }

  return {
    normalizedValue: scaleUnitNormalizedValue(normalizedValue),
    normalizedAdequateMin: scaleUnitNormalizedValue(normalizedAdequateMin),
    normalizedAdequateMax: scaleUnitNormalizedValue(normalizedAdequateMax),
  };
};

const getGroupItems = (group: RecommendationFertigramGroup): RecommendationFertigramItem[] => {
  const candidates = [group.items, group.itens, group.nutrientes, group.parametros];
  const items = candidates.find(Array.isArray);
  return items ?? [];
};

const getGroupTitle = (group: RecommendationFertigramGroup, fallbackTitle: string) =>
  getFirstString(group.title, group.titulo, group.rotulo, group.label) || fallbackTitle;

const getGroupIdentity = (group: RecommendationFertigramGroup, fallbackIndex: number) =>
  [
    group.sourceSection,
    group.secao_origem,
    group.groupKey,
    group.chave_grupo,
    group.title,
    group.titulo,
    group.rotulo,
    group.label,
  ]
    .map((value) => (typeof value === "string" ? normalizeToken(value) : ""))
    .filter(Boolean)
    .join("|") || `fertigrama-${fallbackIndex}`;

const getText = (group: RecommendationFertigramGroup) =>
  normalizeToken(
    [
      group.sourceSection,
      group.secao_origem,
      group.groupKey,
      group.chave_grupo,
      group.title,
      group.titulo,
      group.rotulo,
      group.label,
    ]
      .filter(Boolean)
      .join(" "),
  );

const hasFoliarReference = (text: string) => text.includes("foliar") || text.includes("leaf");

const hasChemicalReference = (text: string) =>
  text.includes("quim") ||
  text.includes("chem") ||
  text.includes("solo") ||
  text.includes("soil") ||
  text.includes("fertilidade");

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const getNestedFertigramDocuments = (
  document?: RecommendationFertigramFields | null,
): RecommendationFertigramFields[] => {
  if (!document) return [];

  const candidates: RecommendationFertigramFields[] = [document];
  const record = document as Record<string, unknown>;

  [
    "recomendacao_geral",
    "recomendacao_resumida",
    "summaryRecommendation",
    "generalRecommendation",
    "selectedRecommendation",
    "selectedSummaryRecommendation",
    "selectedGeneralRecommendation",
  ].forEach((field) => {
    const value = record[field];
    if (isRecord(value)) candidates.push(value as RecommendationFertigramFields);
  });

  return candidates;
};

const getGenericGroups = (document?: RecommendationFertigramFields | null) => {
  const documents = getNestedFertigramDocuments(document);

  return documents.flatMap((candidate) => [
    ...(Array.isArray(candidate.fertigramas) ? candidate.fertigramas : []),
    ...(Array.isArray(candidate.fertigrams) ? candidate.fertigrams : []),
    ...(Array.isArray(candidate.fertigramas_recomendacao) ? candidate.fertigramas_recomendacao : []),
    ...(Array.isArray(candidate.fertigramasRecomendacao) ? candidate.fertigramasRecomendacao : []),
    ...(Array.isArray(candidate.recommendationFertigramas) ? candidate.recommendationFertigramas : []),
    ...(Array.isArray(candidate.recommendationFertigramCharts) ? candidate.recommendationFertigramCharts : []),
  ]);
};

const getSourceGroups = (
  document: RecommendationFertigramFields | null | undefined,
  source: RecommendationFertigramSource,
) => {
  const genericGroups = getGenericGroups(document);
  const referencedGroups = genericGroups.filter((group) => {
    const text = getText(group);
    return hasChemicalReference(text) || hasFoliarReference(text);
  });
  const unreferencedGroups = genericGroups.filter((group) => {
    const text = getText(group);
    return !hasChemicalReference(text) && !hasFoliarReference(text);
  });
  const filteredGroups = referencedGroups.filter((group) => {
    const text = getText(group);

    if (source === "foliar") return hasFoliarReference(text);
    return hasChemicalReference(text) && !hasFoliarReference(text);
  });

  if (source === "foliar") {
    return [
      ...filteredGroups,
      ...(referencedGroups.length === 0 ? genericGroups.slice(4) : unreferencedGroups),
      ...getNestedFertigramDocuments(document).flatMap((candidate) => [
        ...(Array.isArray(candidate.fertigramas_diagnostico_foliar) ? candidate.fertigramas_diagnostico_foliar : []),
        ...(Array.isArray(candidate.diagnostico_foliar_fertigramas) ? candidate.diagnostico_foliar_fertigramas : []),
        ...(Array.isArray(candidate.foliarDiagnosisFertigramas) ? candidate.foliarDiagnosisFertigramas : []),
      ]),
    ];
  }

  return [
    ...(referencedGroups.length === 0 ? genericGroups : [...filteredGroups, ...unreferencedGroups]),
    ...getNestedFertigramDocuments(document).flatMap((candidate) => [
      ...(Array.isArray(candidate.fertigramas_diagnostico_quimico) ? candidate.fertigramas_diagnostico_quimico : []),
      ...(Array.isArray(candidate.diagnostico_quimico_fertigramas) ? candidate.diagnostico_quimico_fertigramas : []),
      ...(Array.isArray(candidate.chemicalDiagnosisFertigramas) ? candidate.chemicalDiagnosisFertigramas : []),
    ]),
  ];
};

const toRadarNutrient = (item: RecommendationFertigramItem): FertigramRadarChartNutrient => {
  const measuredValue = getFirstValue(item.analyzedValue, item.valor_analisado, item.measuredValue, item.valor);
  const recommendedMin = getFirstValue(item.recommendedMin, item.minimo_adequado, item.adequado_min);
  const recommendedMax = getFirstValue(item.recommendedMax, item.maximo_adequado, item.adequado_max);
  const normalizedScale = normalizeVisualScale(
    getFirstValue(item.normalizedValue, item.valor_normalizado),
    getFirstValue(
      item.normalizedAdequateMin,
      item.minimo_normalizado,
      item.adequado_min_normalizado,
    ),
    getFirstValue(
      item.normalizedAdequateMax,
      item.maximo_normalizado,
      item.adequado_max_normalizado,
    ),
  );
  const useRawValues = hasRawRadarRange(measuredValue, recommendedMin, recommendedMax);

  return {
    name: getFirstString(item.label, item.rotulo, item.name, item.nutrient, item.nutriente, item.shortLabel, item.rotulo_curto) || "-",
    shortName: getFirstString(item.shortLabel, item.rotulo_curto, item.label, item.rotulo) || "-",
    measuredValue,
    recommendedMin,
    recommendedMax,
    normalizedValue: useRawValues ? null : normalizedScale.normalizedValue,
    normalizedAdequateMin: useRawValues ? null : normalizedScale.normalizedAdequateMin,
    normalizedAdequateMax: useRawValues ? null : normalizedScale.normalizedAdequateMax,
    unit: getFirstString(item.unit, item.unidade) || null,
    interpretation: getFirstString(item.interpretation, item.interpretacao) || null,
    rangeLabel: getFirstString(item.rangeLabel, item.faixa, item.faixa_adequada) || null,
    observation: getFirstString(item.observation, item.observacao) || null,
  };
};

const hasRenderableRadarValues = (item: FertigramRadarChartNutrient) => {
  const normalizedValue = toNumberOrNull(item.normalizedValue);
  const normalizedAdequateMin = toNumberOrNull(item.normalizedAdequateMin);
  const normalizedAdequateMax = toNumberOrNull(item.normalizedAdequateMax);

  if (
    normalizedValue !== null &&
    normalizedAdequateMin !== null &&
    normalizedAdequateMax !== null &&
    normalizedAdequateMax >= normalizedAdequateMin
  ) {
    return true;
  }

  return (
    toNumberOrNull(item.measuredValue) !== null &&
    toNumberOrNull(item.recommendedMin) !== null &&
    toNumberOrNull(item.recommendedMax) !== null
  );
};

const getGroupsToRender = (document: RecommendationFertigramFields | null | undefined, source: RecommendationFertigramSource) => {
  const groups = getSourceGroups(document, source);

  const validGroups = groups
    .map((group, index) => {
      const allItems = getGroupItems(group).map(toRadarNutrient);
      const items = allItems.filter(hasRenderableRadarValues);
      return { group, allItems, items, identity: getGroupIdentity(group, index) };
    })
    .filter((g) => g.items.length > 0);

  const seenGroups = new Set<string>();
  const uniqueGroups = validGroups.filter((g) => {
    if (seenGroups.has(g.identity)) return false;
    seenGroups.add(g.identity);
    return true;
  });

  return uniqueGroups.map((g, index) => ({
    title: getGroupTitle(g.group, "Fertigrama"),
    items: g.items,
    droppedItemCount: g.allItems.length - g.items.length,
    order: index,
  }));
};

export const hasRecommendationFertigramCharts = (
  document: RecommendationFertigramFields | null | undefined,
  source: RecommendationFertigramSource,
) => getGroupsToRender(document, source).length > 0;

export default function RecommendationFertigramCharts({
  document,
  source,
}: RecommendationFertigramChartsProps) {
  const groups = getGroupsToRender(document, source);

  if (groups.length === 0) return null;

  return (
    <SimpleGrid columns={{ base: 1, lg: 2 }} gap={4}>
      {groups.map((group) => (
        <Box
          key={`${source}-${group.order}-${group.title}`}
          borderWidth="1px"
          borderColor="whiteAlpha.200"
          borderRadius="md"
          p={4}
          bg="gray.950"
          boxShadow="md"
        >
          <FertigramRadarChart
            title={group.title}
            nutrients={group.items}
            unavailableMessage={unavailableMessage}
            compact
            dark
          />
          {import.meta.env.DEV && group.droppedItemCount > 0 ? (
            <Text mt={2} fontSize="xs" color="orange.300">
              Aviso técnico: {group.droppedItemCount} item(ns) do fertigrama foram ignorados por dados numéricos
              incompletos.
            </Text>
          ) : null}
        </Box>
      ))}
    </SimpleGrid>
  );
}
