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

const getGenericGroups = (document?: RecommendationFertigramFields | null) => {
  if (!document) return [];

  return [
    ...(Array.isArray(document.fertigramas) ? document.fertigramas : []),
    ...(Array.isArray(document.fertigrams) ? document.fertigrams : []),
    ...(Array.isArray(document.fertigramas_recomendacao) ? document.fertigramas_recomendacao : []),
    ...(Array.isArray(document.fertigramasRecomendacao) ? document.fertigramasRecomendacao : []),
    ...(Array.isArray(document.recommendationFertigramas) ? document.recommendationFertigramas : []),
    ...(Array.isArray(document.recommendationFertigramCharts) ? document.recommendationFertigramCharts : []),
  ];
};

const getSourceGroups = (
  document: RecommendationFertigramFields | null | undefined,
  source: RecommendationFertigramSource,
) => {
  const genericGroups = getGenericGroups(document);
  const sourceReferencedGroups = genericGroups.filter((group) => {
    const text = getText(group);
    return hasChemicalReference(text) || hasFoliarReference(text);
  });
  const sourceGroups = sourceReferencedGroups.length > 0 ? sourceReferencedGroups : genericGroups;
  const filteredGroups = sourceGroups.filter((group) => {
    const text = getText(group);

    if (source === "foliar") return hasFoliarReference(text);
    if (sourceReferencedGroups.length === 0) return !hasFoliarReference(text);
    return hasChemicalReference(text) && !hasFoliarReference(text);
  });

  if (source === "foliar") {
    return [
      ...filteredGroups,
      ...(sourceReferencedGroups.length === 0 ? genericGroups.slice(4) : []),
      ...(Array.isArray(document?.fertigramas_diagnostico_foliar) ? document.fertigramas_diagnostico_foliar : []),
      ...(Array.isArray(document?.diagnostico_foliar_fertigramas) ? document.diagnostico_foliar_fertigramas : []),
      ...(Array.isArray(document?.foliarDiagnosisFertigramas) ? document.foliarDiagnosisFertigramas : []),
    ];
  }

  return [
    ...(sourceReferencedGroups.length === 0 ? filteredGroups.slice(0, 4) : filteredGroups),
    ...(Array.isArray(document?.fertigramas_diagnostico_quimico) ? document.fertigramas_diagnostico_quimico : []),
    ...(Array.isArray(document?.diagnostico_quimico_fertigramas) ? document.diagnostico_quimico_fertigramas : []),
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
  name: getFirstString(item.label, item.rotulo, item.name, item.nutrient, item.nutriente, item.shortLabel, item.rotulo_curto) || "-",
  shortName: getFirstString(item.shortLabel, item.rotulo_curto, item.label, item.rotulo) || "-",
  measuredValue: getFirstValue(item.analyzedValue, item.valor_analisado, item.measuredValue, item.valor),
  recommendedMin: getFirstValue(item.recommendedMin, item.minimo_adequado),
  recommendedMax: getFirstValue(item.recommendedMax, item.maximo_adequado),
  normalizedValue: getFirstValue(item.normalizedValue, item.valor_normalizado),
  normalizedAdequateMin: getFirstValue(item.normalizedAdequateMin, item.minimo_normalizado),
  normalizedAdequateMax: getFirstValue(item.normalizedAdequateMax, item.maximo_normalizado),
  unit: getFirstString(item.unit, item.unidade) || null,
  interpretation: getFirstString(item.interpretation, item.interpretacao) || null,
  rangeLabel: getFirstString(item.rangeLabel, item.faixa, item.faixa_adequada) || null,
  observation: getFirstString(item.observation, item.observacao) || null,
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
        title: getGroupTitle(group, fallbackTitle),
        items: getGroupItems(group).map(toRadarNutrient),
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
