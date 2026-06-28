import { Box, Heading, Input, SimpleGrid, Text, VStack } from "@chakra-ui/react";

import type { PlantSpacingMode } from "@/interfaces/Crop";
import { NativeSelect } from "./RecommendationSelectControls";

type SpacingSectionProps = {
  rowDistance: string;
  plantSpacingMode: PlantSpacingMode;
  plantSpacingValue: string;
  plantsPerHole: string;
  disabled?: boolean;
  warning?: string;
  onRowDistanceChange: (value: string) => void;
  onPlantSpacingModeChange: (value: PlantSpacingMode) => void;
  onPlantSpacingValueChange: (value: string) => void;
  onPlantsPerHoleChange: (value: string) => void;
};

const plantSpacingModeOptions: { value: PlantSpacingMode; label: string }[] = [
  { value: "plants_per_meter", label: "Nº de Plantas/m linear" },
  { value: "holes", label: "Distância entre covas (m)" },
];

const isPlantSpacingMode = (value: string): value is PlantSpacingMode =>
  plantSpacingModeOptions.some((option) => option.value === value);

const parsePositiveNumber = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const calculateSpacingPreview = ({
  rowDistance,
  plantSpacingMode,
  plantSpacingValue,
  plantsPerHole,
}: {
  rowDistance: string;
  plantSpacingMode: PlantSpacingMode;
  plantSpacingValue: string;
  plantsPerHole: string;
}) => {
  const rows = parsePositiveNumber(rowDistance);
  const spacing = parsePositiveNumber(plantSpacingValue);

  if (!rows || !spacing) {
    return {
      population: null,
      holesPerHectare: null,
      warning: "Informe espaçamento positivo entre linhas e plantas para calcular o preview.",
    };
  }

  if (plantSpacingMode === "holes") {
    const plants = parsePositiveNumber(plantsPerHole);

    if (!plants) {
      return {
        population: null,
        holesPerHectare: null,
        warning: "Informe um número positivo de plantas por cova para calcular o preview.",
      };
    }

    const holesPerHectare = 10000 / (rows * spacing);
    const population = holesPerHectare * plants;

    return {
      population: Number.isFinite(population) ? population : null,
      holesPerHectare: Number.isFinite(holesPerHectare) ? holesPerHectare : null,
      warning: null,
    };
  }

  const population = (10000 * spacing) / rows;

  return {
    population: Number.isFinite(population) ? population : null,
    holesPerHectare: null,
    warning: null,
  };
};

const formatPreviewNumber = (value: number | null) =>
  value === null ? "-" : Math.round(value).toLocaleString("pt-BR");

export default function SpacingSection({
  rowDistance,
  plantSpacingMode,
  plantSpacingValue,
  plantsPerHole,
  disabled = false,
  warning,
  onRowDistanceChange,
  onPlantSpacingModeChange,
  onPlantSpacingValueChange,
  onPlantsPerHoleChange,
}: SpacingSectionProps) {
  const plantSpacingFieldLabel =
    plantSpacingMode === "holes" ? "Distância entre covas (m)" : "Nº de Plantas/m linear";
  const spacingPreview = calculateSpacingPreview({
    rowDistance,
    plantSpacingMode,
    plantSpacingValue,
    plantsPerHole,
  });

  return (
    <VStack align="stretch" gap={3}>
      <Heading size="sm" color="gray.600">Espaçamento</Heading>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
        <Box>
          <Text fontSize="sm" mb={1}>Distância entre linhas</Text>
          <Input
            type="number"
            step="0.01"
            value={rowDistance}
            onChange={(event) => onRowDistanceChange(event.target.value)}
            placeholder="Ex: 0.50"
            disabled={disabled}
            aria-label="Distância entre linhas"
          />
        </Box>

        <Box>
          <Text fontSize="sm" mb={1}>Distância entre plantas</Text>
          <NativeSelect
            value={plantSpacingMode}
            onChange={(event) => {
              if (isPlantSpacingMode(event.target.value)) {
                onPlantSpacingModeChange(event.target.value);
              }
            }}
            disabled={disabled}
            aria-label="Distância entre plantas"
          >
            {plantSpacingModeOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </NativeSelect>
        </Box>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: plantSpacingMode === "holes" ? 2 : 1 }} gap={3}>
        <Box>
          <Text fontSize="sm" mb={1}>{plantSpacingFieldLabel}</Text>
          <Input
            type="number"
            step={plantSpacingMode === "holes" ? "0.01" : "0.1"}
            value={plantSpacingValue}
            onChange={(event) => onPlantSpacingValueChange(event.target.value)}
            placeholder={plantSpacingMode === "holes" ? "Ex: 0.25" : "Ex: 12"}
            disabled={disabled}
            aria-label={plantSpacingFieldLabel}
          />
        </Box>

        {plantSpacingMode === "holes" ? (
          <Box>
            <Text fontSize="sm" mb={1}>Nº de Plantas/cova</Text>
            <Input
              type="number"
              step="1"
              value={plantsPerHole}
              onChange={(event) => onPlantsPerHoleChange(event.target.value)}
              placeholder="Ex: 2"
              disabled={disabled}
              aria-label="Nº de Plantas/cova"
            />
          </Box>
        ) : null}
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: plantSpacingMode === "holes" ? 2 : 1 }} gap={3}>
        {plantSpacingMode === "holes" ? (
          <Box>
            <Text fontSize="sm" color="fg.muted">Covas estimadas</Text>
            <Text fontWeight="bold" fontSize="lg">
              {formatPreviewNumber(spacingPreview.holesPerHectare)} covas/ha
            </Text>
          </Box>
        ) : null}

        <Box>
          <Text fontSize="sm" color="fg.muted">População estimada</Text>
          <Text fontWeight="bold" fontSize="lg">
            {formatPreviewNumber(spacingPreview.population)} plantas/ha
          </Text>
        </Box>
      </SimpleGrid>

      {spacingPreview.warning ? (
        <Text fontSize="xs" color="orange.600">{spacingPreview.warning}</Text>
      ) : null}

      {warning ? (
        <Text fontSize="xs" color="fg.muted">{warning}</Text>
      ) : null}
    </VStack>
  );
}
