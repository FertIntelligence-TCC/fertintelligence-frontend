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

const CHART_SIZE = 360;
const CHART_CENTER = CHART_SIZE / 2;
const CHART_RADIUS = 120;
const OUTER_SCALE = 3;

interface RadarPoint {
  label: string;
  normalizedMeasured: number;
  measuredValue: number;
  recommendedMinimum: number;
  recommendedMaximum: number;
  unit?: string | null;
}

const toNumberOrNull = (value?: number | null) =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

const normalizeMeasuredValue = (
  measuredValue: number,
  recommendedMinimum: number,
  recommendedMaximum: number
) => {
  if (recommendedMinimum <= 0 || recommendedMaximum <= 0) return null;
  if (recommendedMaximum < recommendedMinimum) return null;

  if (measuredValue < recommendedMinimum) {
    return Math.max(0, measuredValue / recommendedMinimum);
  }

  if (measuredValue <= recommendedMaximum) {
    if (recommendedMaximum === recommendedMinimum) return 1.5;
    return (
      1 + (measuredValue - recommendedMinimum) / (recommendedMaximum - recommendedMinimum)
    );
  }

  return 2 + (measuredValue - recommendedMaximum) / recommendedMaximum;
};

const clampScale = (value: number) => Math.max(0, Math.min(OUTER_SCALE, value));

const getRadarChartPoints = (nutrients: FertigramNutrient[]): RadarPoint[] =>
  nutrients
    .map<RadarPoint | null>((item) => {
      const measuredValue = toNumberOrNull(item.measuredValue);
      const recommendedMinimum = toNumberOrNull(item.recommendedMinimum);
      const recommendedMaximum = toNumberOrNull(item.recommendedMaximum);
      if (
        measuredValue === null ||
        recommendedMinimum === null ||
        recommendedMaximum === null
      ) {
        return null;
      }
      const normalized = normalizeMeasuredValue(
        measuredValue,
        recommendedMinimum,
        recommendedMaximum
      );
      if (normalized === null) return null;

      return {
        label: item.nutrient,
        normalizedMeasured: clampScale(normalized),
        measuredValue,
        recommendedMinimum,
        recommendedMaximum,
        unit: item.unit,
      };
    })
    .filter((item): item is RadarPoint => item !== null);

const createPolygon = (values: number[], totalAxes: number) =>
  values
    .map((scaleValue, index) => {
      const angle = -Math.PI / 2 + (2 * Math.PI * index) / totalAxes;
      const radius = (clampScale(scaleValue) / OUTER_SCALE) * CHART_RADIUS;
      const x = CHART_CENTER + radius * Math.cos(angle);
      const y = CHART_CENTER + radius * Math.sin(angle);
      return `${x},${y}`;
    })
    .join(" ");

const VisualRadarSection = ({
  title,
  nutrients,
  emptyMessage,
}: {
  title: string;
  nutrients: FertigramNutrient[];
  emptyMessage: string;
}) => {
  const points = getRadarChartPoints(nutrients);
  const totalAxes = points.length;

  if (totalAxes < 3) {
    return (
      <VStack align="stretch" gap={2}>
        <Text fontSize="sm" fontWeight="bold">
          {title}
        </Text>
        <Text fontSize="sm" color="gray.500" _dark={{ color: "gray.400" }}>
          {emptyMessage}
        </Text>
      </VStack>
    );
  }

  const measuredPolygon = createPolygon(
    points.map((item) => item.normalizedMeasured),
    totalAxes
  );
  const minReferencePolygon = createPolygon(new Array(totalAxes).fill(1), totalAxes);
  const maxReferencePolygon = createPolygon(new Array(totalAxes).fill(2), totalAxes);

  return (
    <VStack align="stretch" gap={3}>
      <Text fontSize="sm" fontWeight="bold">
        {title}
      </Text>
      <Box overflowX="auto">
        <Box minW="300px" maxW="520px" mx="auto">
          <svg
            width="100%"
            viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}
            role="img"
            aria-label={title}
          >
            {[1, 2, 3].map((level) => (
              <circle
                key={level}
                cx={CHART_CENTER}
                cy={CHART_CENTER}
                r={(level / OUTER_SCALE) * CHART_RADIUS}
                fill="none"
                stroke="#CBD5E0"
                strokeWidth="1"
              />
            ))}

            {points.map((_, index) => {
              const angle = -Math.PI / 2 + (2 * Math.PI * index) / totalAxes;
              const x = CHART_CENTER + CHART_RADIUS * Math.cos(angle);
              const y = CHART_CENTER + CHART_RADIUS * Math.sin(angle);
              return (
                <line
                  key={`axis-${index}`}
                  x1={CHART_CENTER}
                  y1={CHART_CENTER}
                  x2={x}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeWidth="1"
                />
              );
            })}

            <polygon points={maxReferencePolygon} fill="#38A16933" stroke="#2F855A" />
            <polygon points={minReferencePolygon} fill="#fff" stroke="#2F855A" />
            <polygon
              points={measuredPolygon}
              fill="#3182CE55"
              stroke="#2B6CB0"
              strokeWidth="2"
            />

            {points.map((point, index) => {
              const angle = -Math.PI / 2 + (2 * Math.PI * index) / totalAxes;
              const labelRadius = CHART_RADIUS + 20;
              const x = CHART_CENTER + labelRadius * Math.cos(angle);
              const y = CHART_CENTER + labelRadius * Math.sin(angle);
              return (
                <text
                  key={`${point.label}-${index}`}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="10"
                  fill="#4A5568"
                >
                  {point.label}
                </text>
              );
            })}
          </svg>
        </Box>
      </Box>
    </VStack>
  );
};

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
          <VisualRadarSection
            title="Fertigrama Visual Dos Macronutrientes"
            nutrients={safeMacronutrients}
            emptyMessage="Dados insuficientes para renderizar o fertigrama visual de macronutrientes."
          />
          <VisualRadarSection
            title="Fertigrama Visual Dos Micronutrientes"
            nutrients={safeMicronutrients}
            emptyMessage="Dados insuficientes para renderizar o fertigrama visual de micronutrientes."
          />
        </VStack>
      )}
    </Box>
  );
}
