import { Box, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { FertigramNutrient, FertigramResponse } from "@/interfaces/Fertigram";

interface FertigramViewProps {
  data: FertigramResponse;
}

const formatValue = (value?: string | number | null) => {
  if (value === null || value === undefined || value === "") return "-";
  return value;
};

const formatRecommendedRange = (item: FertigramNutrient) => {
  const minimum = formatValue(item.recommendedMinimum);
  const maximum = formatValue(item.recommendedMaximum);
  const unit = item.unit ?? "";

  if (minimum === "-" && maximum === "-") {
    return "-";
  }

  if (minimum !== "-" && maximum !== "-") {
    return `${minimum} a ${maximum} ${unit}`.trim();
  }

  if (minimum !== "-") {
    return `mín. ${minimum} ${unit}`.trim();
  }

  return `máx. ${maximum} ${unit}`.trim();
};

const hasNutrientData = (item: FertigramNutrient) =>
  item.measuredValue !== null ||
  item.recommendedMinimum !== null ||
  item.recommendedMaximum !== null ||
  item.interpretation !== null;

const NutrientSection = ({
  title,
  nutrients,
  emptyMessage,
}: {
  title: string;
  nutrients: FertigramNutrient[];
  emptyMessage: string;
}) => {
  const safeNutrients = Array.isArray(nutrients) ? nutrients : [];
  const availableNutrients = safeNutrients.filter(hasNutrientData);

  return (
    <VStack align="stretch" gap={3}>
      <Text fontSize="sm" fontWeight="bold">
        {title}
      </Text>

      {availableNutrients.length === 0 ? (
        <Text fontSize="sm" color="gray.500" _dark={{ color: "gray.400" }}>
          {emptyMessage}
        </Text>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
          {availableNutrients.map((item) => (
            <Box
              key={`${title}-${item.nutrient}`}
              borderWidth="1px"
              borderRadius="md"
              p={3}
              bg="gray.50"
              _dark={{ bg: "gray.700", borderColor: "gray.600" }}
            >
              <Text fontWeight="bold" mb={1}>
                {item.nutrient}
              </Text>
              <Text fontSize="sm">
                Encontrado: {formatValue(item.measuredValue)} {item.unit ?? ""}
              </Text>
              <Text fontSize="sm">
                Recomendado: {formatRecommendedRange(item)}
              </Text>
              <Text fontSize="sm">
                Interpretação: {formatValue(item.interpretation)}
              </Text>
            </Box>
          ))}
        </SimpleGrid>
      )}
    </VStack>
  );
};

export default function FertigramView({ data }: FertigramViewProps) {
  const safeMacronutrients = Array.isArray(data?.macronutrients)
    ? data.macronutrients
    : [];
  const safeMicronutrients = Array.isArray(data?.micronutrients)
    ? data.micronutrients
    : [];
  const hasNoNutrients =
    safeMacronutrients.length === 0 && safeMicronutrients.length === 0;

  return (
    <Box borderWidth="1px" borderRadius="md" p={3}>
      <Text fontWeight="bold" mb={2}>
        Fertigrama
      </Text>

      {data.cropName ? (
        <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }} mb={3}>
          Cultura: {data.cropName}
        </Text>
      ) : null}

      {hasNoNutrients ? (
        <Text fontSize="sm" color="gray.500" _dark={{ color: "gray.400" }}>
          Nenhum nutriente disponível para gerar o fertigrama.
        </Text>
      ) : (
        <VStack align="stretch" gap={4}>
          <NutrientSection
            title="Macronutrientes"
            nutrients={safeMacronutrients}
            emptyMessage="Nenhum macronutriente disponível nesta análise."
          />
          <NutrientSection
            title="Micronutrientes"
            nutrients={safeMicronutrients}
            emptyMessage="Nenhum micronutriente disponível nesta análise."
          />
        </VStack>
      )}
    </Box>
  );
}
