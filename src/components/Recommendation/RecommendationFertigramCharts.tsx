import { Box, SimpleGrid } from "@chakra-ui/react";

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

const chemicalFertigramOrder = [
  {
    kind: "macro",
    fallbackTitle: "Fertigrama dos macronutrientes",
  },
  {
    kind: "micro",
    fallbackTitle: "Fertigrama dos micronutrientes",
  },
  {
    kind: "remaining-1",
    fallbackTitle: "Fertigrama dos parâmetros químicos restantes I",
  },
  {
    kind: "remaining-2",
    fallbackTitle: "Fertigrama dos parâmetros químicos restantes II",
  },
] as const;

const foliarFertigramOrder = [
  {
    kind: "macro",
    fallbackTitle: "Fertigrama foliar dos macronutrientes",
  },
  {
    kind: "micro",
    fallbackTitle: "Fertigrama foliar dos micronutrientes",
  },
] as const;

const normalizeToken = (value?: string | null) =>
  (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .trim();

const getText = (group: RecommendationFertigramGroup) =>
  normalizeToken([group.sourceSection, group.groupKey, group.title].filter(Boolean).join(" "));

const hasFoliarReference = (text: string) => text.includes("foliar") || text.includes("leaf");

const hasChemicalReference = (text: string) =>
  text.includes("quim") ||
  text.includes("chem") ||
  text.includes("solo") ||
  text.includes("soil") ||
  text.includes("fertilidade");

const getGenericGroups = (document?: RecommendationFertigramFields | null) => {
  if (!document) return [];

  return [
    ...(Array.isArray(document.fertigramas) ? document.fertigramas : []),
    ...(Array.isArray(document.fertigramasRecomendacao) ? document.fertigramasRecomendacao : []),
    ...(Array.isArray(document.recommendationFertigramas) ? document.recommendationFertigramas : []),
    ...(Array.isArray(document.recommendationFertigramCharts) ? document.recommendationFertigramCharts : []),
  ];
};

const getSourceGroups = (
  document: RecommendationFertigramFields | null | undefined,
  source: RecommendationFertigramSource,
) => {
  const genericGroups = getGenericGroups(document).filter((group) => {
    const text = getText(group);

    if (source === "foliar") return hasFoliarReference(text);
    return hasChemicalReference(text) && !hasFoliarReference(text);
  });

  if (source === "foliar") {
    return [
      ...genericGroups,
      ...(Array.isArray(document?.foliarDiagnosisFertigramas) ? document.foliarDiagnosisFertigramas : []),
    ];
  }

  return [
    ...genericGroups,
    ...(Array.isArray(document?.chemicalDiagnosisFertigramas) ? document.chemicalDiagnosisFertigramas : []),
  ];
};

const hasGroupKind = (group: RecommendationFertigramGroup, kind: string) => {
  const text = getText(group);

  if (kind === "macro") return text.includes("macro");
  if (kind === "micro") return text.includes("micro");

  if (kind === "remaining-1") {
    return (
      (text.includes("restante") || text.includes("remaining") || text.includes("parametro")) &&
      (text.includes(" i") || text.includes(" 1") || text.includes("primeir") || text.endsWith("i"))
    );
  }

  return (
    (text.includes("restante") || text.includes("remaining") || text.includes("parametro")) &&
    (text.includes(" ii") || text.includes(" 2") || text.includes("segund") || text.endsWith("ii"))
  );
};

const toRadarNutrient = (item: RecommendationFertigramItem): FertigramRadarChartNutrient => ({
  name: item.label?.trim() || item.shortLabel?.trim() || "-",
  shortName: item.shortLabel?.trim() || item.label?.trim() || "-",
  measuredValue: item.analyzedValue,
  normalizedValue: item.normalizedValue,
  normalizedAdequateMin: item.normalizedAdequateMin,
  normalizedAdequateMax: item.normalizedAdequateMax,
  unit: item.unit,
  interpretation: item.interpretation,
  rangeLabel: item.rangeLabel,
  observation: item.observation,
});

const getGroupsToRender = (
  document: RecommendationFertigramFields | null | undefined,
  source: RecommendationFertigramSource,
) => {
  const groups = getSourceGroups(document, source);
  const orderedGroups = source === "foliar" ? foliarFertigramOrder : chemicalFertigramOrder;

  return orderedGroups
    .map(({ kind, fallbackTitle }) => {
      const group = groups.find((candidate) => hasGroupKind(candidate, kind));
      if (!group) return null;

      return {
        title: group.title?.trim() || fallbackTitle,
        items: Array.isArray(group.items) ? group.items.map(toRadarNutrient) : [],
      };
    })
    .filter((group): group is { title: string; items: FertigramRadarChartNutrient[] } => group !== null);
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
          key={`${source}-${group.title}`}
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
        </Box>
      ))}
    </SimpleGrid>
  );
}
