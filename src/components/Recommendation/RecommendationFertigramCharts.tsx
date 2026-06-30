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

const getGroupItems = (group: RecommendationFertigramGroup): RecommendationFertigramItem[] => {
  const candidates = [group.items, group.itens, group.nutrientes, group.parametros];
  const items = candidates.find(Array.isArray);
  return items ?? [];
};

const getGroupTitle = (group: RecommendationFertigramGroup, fallbackTitle: string) =>
  getFirstString(group.title, group.titulo, group.rotulo, group.label) || fallbackTitle;

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
    ...(referencedGroups.length === 0 ? genericGroups.slice(0, 4) : [...filteredGroups, ...unreferencedGroups]),
    ...getNestedFertigramDocuments(document).flatMap((candidate) => [
      ...(Array.isArray(candidate.fertigramas_diagnostico_quimico) ? candidate.fertigramas_diagnostico_quimico : []),
      ...(Array.isArray(candidate.diagnostico_quimico_fertigramas) ? candidate.diagnostico_quimico_fertigramas : []),
      ...(Array.isArray(candidate.chemicalDiagnosisFertigramas) ? candidate.chemicalDiagnosisFertigramas : []),
    ]),
  ];
};

const toRadarNutrient = (item: RecommendationFertigramItem): FertigramRadarChartNutrient => ({
  name: getFirstString(item.label, item.rotulo, item.name, item.nutrient, item.nutriente, item.shortLabel, item.rotulo_curto) || "-",
  shortName: getFirstString(item.shortLabel, item.rotulo_curto, item.label, item.rotulo) || "-",
  measuredValue: getFirstValue(item.analyzedValue, item.valor_analisado, item.measuredValue, item.valor),
  recommendedMin: getFirstValue(item.recommendedMin, item.minimo_adequado, item.adequado_min),
  recommendedMax: getFirstValue(item.recommendedMax, item.maximo_adequado, item.adequado_max),
  normalizedValue: getFirstValue(item.normalizedValue, item.valor_normalizado),
  normalizedAdequateMin: getFirstValue(
    item.normalizedAdequateMin,
    item.minimo_normalizado,
    item.adequado_min_normalizado,
  ),
  normalizedAdequateMax: getFirstValue(
    item.normalizedAdequateMax,
    item.maximo_normalizado,
    item.adequado_max_normalizado,
  ),
  unit: getFirstString(item.unit, item.unidade) || null,
  interpretation: getFirstString(item.interpretation, item.interpretacao) || null,
  rangeLabel: getFirstString(item.rangeLabel, item.faixa, item.faixa_adequada) || null,
  observation: getFirstString(item.observation, item.observacao) || null,
});

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
  console.log("🔍 getGroupsToRender - INICIO (ordem)", { document, source });
  const groups = getSourceGroups(document, source);
  console.log("🔍 getGroupsToRender - sourceGroups:", groups);
  console.log("🔍 getGroupsToRender - sourceGroups length:", groups.length);

  const validGroups = groups
    .map((group) => {
      const allItems = getGroupItems(group).map(toRadarNutrient);
      const items = allItems.filter(hasRenderableRadarValues);
      return { group, allItems, items };
    })
    .filter((g) => g.items.length >= 3);

  console.log("🔍 validGroups:", validGroups.length);

  const seenTitles = new Set();
  const uniqueGroups = validGroups.filter((g) => {
    const title = getGroupTitle(g.group, "");
    if (seenTitles.has(title)) return false;
    seenTitles.add(title);
    return true;
  });

  console.log("🔍 uniqueGroups:", uniqueGroups.length);

  const selectedGroups = uniqueGroups.slice(0, 4).map((g, index) => ({
    title: getGroupTitle(g.group, "Fertigrama"),
    items: g.items,
    droppedItemCount: g.allItems.length - g.items.length,
    order: index,
  }));

  console.log("🔍 resultado final:", selectedGroups);
  return selectedGroups;
};

export const hasRecommendationFertigramCharts = (
  document: RecommendationFertigramFields | null | undefined,
  source: RecommendationFertigramSource,
) => getGroupsToRender(document, source).length > 0;

export default function RecommendationFertigramCharts({
  document,
  source,
}: RecommendationFertigramChartsProps) {
  console.log("🔍 RecommendationFertigramCharts recebeu:", { document, source });
console.log("🔍 document keys:", Object.keys(document || {}));
console.log("🔍 document.fertigramas:", document?.fertigramas);
console.log("🔍 document.recomendacao_geral:", document?.recomendacao_geral);
console.log("🔍 document.recomendacao_resumida:", document?.recomendacao_resumida);
console.log("🔍 document.summaryRecommendation:", document?.summaryRecommendation);
console.log("🔍 document.generalRecommendation:", document?.generalRecommendation);
const groups = getGroupsToRender(document, source);
  console.log("🔍 groups encontrados (após getGroupsToRender):", groups);
  console.log("🔍 grupos detalhados:", groups.map(g => ({title: g.title, itemsCount: g.items.length})));


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
