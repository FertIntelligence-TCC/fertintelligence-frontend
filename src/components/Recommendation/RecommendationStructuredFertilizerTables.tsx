import { Box, SimpleGrid, Text, VStack } from "@chakra-ui/react";

import type {
  RecommendationStructuredFertilizerLines,
  ShoppingListResponse,
} from "@/interfaces/Recommendation";

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
  if (!text) return "";

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
  hasFormulatedTopDressingFertilizerRows(document);

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
    </VStack>
  );
}
