import { VStack } from "@chakra-ui/react";

import type { RecommendationStructuredFertilizerLines } from "@/interfaces/Recommendation";

import FormulatedPlantingFertilizerTable, {
  FormulatedTopDressingFertilizerTable,
  hasFormulatedPlantingFertilizerRows,
  hasFormulatedTopDressingFertilizerRows,
} from "./FormulatedPlantingFertilizerTable";
import MicronutrientFertilizerTable, { hasMicronutrientFertilizerRows } from "./MicronutrientFertilizerTable";

type RecommendationStructuredFertilizerTablesProps = {
  document?: RecommendationStructuredFertilizerLines | null;
};

export const hasStructuredRecommendationContent = (
  document?: RecommendationStructuredFertilizerLines | null,
): boolean =>
  hasMicronutrientFertilizerRows(document) ||
  hasFormulatedPlantingFertilizerRows(document) ||
  hasFormulatedTopDressingFertilizerRows(document);

export default function RecommendationStructuredFertilizerTables({
  document,
}: RecommendationStructuredFertilizerTablesProps) {
  if (!hasStructuredRecommendationContent(document)) return null;

  return (
    <VStack align="stretch" gap={4}>
      <FormulatedPlantingFertilizerTable directRecommendation={document} />
      <FormulatedTopDressingFertilizerTable directRecommendation={document} />
      <MicronutrientFertilizerTable directRecommendation={document} />
    </VStack>
  );
}
