import { Box, HStack, Text, VStack } from "@chakra-ui/react";

export interface FertigramRadarChartNutrient {
  name: string;
  shortName?: string | null;
  measuredValue?: number | string | null;
  recommendedMin?: number | string | null;
  recommendedMax?: number | string | null;
  normalizedValue?: number | string | null;
  normalizedAdequateMin?: number | string | null;
  normalizedAdequateMax?: number | string | null;
  unit?: string | null;
  interpretation?: string | null;
  rangeLabel?: string | null;
  observation?: string | null;
}

interface FertigramRadarChartProps {
  title: string;
  nutrients: FertigramRadarChartNutrient[];
  unavailableMessage?: string;
  compact?: boolean;
  dark?: boolean;
}

const CHART_SIZE = 360;
const CHART_CENTER = CHART_SIZE / 2;
const CHART_RADIUS = 120;
const OUTER_SCALE = 3;

interface RadarPoint {
  label: string;
  normalizedMeasured: number;
  normalizedAdequateMin: number;
  normalizedAdequateMax: number;
}

const toNumberOrNull = (value?: number | string | null) => {
  if (typeof value === "string" && value.trim()) {
    const normalizedValue = Number(value.replace(",", "."));
    return Number.isFinite(normalizedValue) ? normalizedValue : null;
  }

  return typeof value === "number" && Number.isFinite(value) ? value : null;
};

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

const getRadarChartPoints = (
  nutrients: FertigramRadarChartNutrient[]
): RadarPoint[] =>
  nutrients
    .map<RadarPoint | null>((item) => {
      const normalizedValue = toNumberOrNull(item.normalizedValue);
      const normalizedAdequateMin = toNumberOrNull(item.normalizedAdequateMin);
      const normalizedAdequateMax = toNumberOrNull(item.normalizedAdequateMax);

      if (
        normalizedValue !== null &&
        normalizedAdequateMin !== null &&
        normalizedAdequateMax !== null &&
        normalizedAdequateMax >= normalizedAdequateMin
      ) {
        return {
          label: item.shortName || item.name,
          normalizedMeasured: clampScale(normalizedValue),
          normalizedAdequateMin: clampScale(normalizedAdequateMin),
          normalizedAdequateMax: clampScale(normalizedAdequateMax),
        };
      }

      const measuredValue = toNumberOrNull(item.measuredValue);
      const recommendedMinimum = toNumberOrNull(item.recommendedMin);
      const recommendedMaximum = toNumberOrNull(item.recommendedMax);

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
        label: item.shortName || item.name,
        normalizedMeasured: clampScale(normalized),
        normalizedAdequateMin: 1,
        normalizedAdequateMax: 2,
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

export default function FertigramRadarChart({
  title,
  nutrients,
  unavailableMessage = "Não há dados suficientes para renderizar este fertigrama visual.",
  compact = false,
  dark = false,
}: FertigramRadarChartProps) {
  const safeNutrients = Array.isArray(nutrients) ? nutrients : [];
  const points = getRadarChartPoints(safeNutrients);
  const totalAxes = points.length;

  if (safeNutrients.length === 0 || totalAxes < 3) {
    return (
      <VStack align="stretch" gap={2} color={dark ? "whiteAlpha.900" : undefined}>
        <Text fontSize="sm" fontWeight="bold" color={dark ? "whiteAlpha.900" : undefined}>
          {title}
        </Text>
        <Text fontSize="sm" color={dark ? "whiteAlpha.700" : "gray.500"} _dark={{ color: "gray.400" }}>
          {unavailableMessage}
        </Text>
      </VStack>
    );
  }

  const measuredPolygon = createPolygon(
    points.map((item) => item.normalizedMeasured),
    totalAxes
  );
  const minReferencePolygon = createPolygon(points.map((item) => item.normalizedAdequateMin), totalAxes);
  const maxReferencePolygon = createPolygon(points.map((item) => item.normalizedAdequateMax), totalAxes);

  return (
    <VStack align="stretch" gap={3} color={dark ? "whiteAlpha.900" : undefined}>
      <Text fontSize="sm" fontWeight="bold" color={dark ? "whiteAlpha.900" : undefined}>
        {title}
      </Text>
      <Box overflowX="auto">
        <Box minW={compact ? "260px" : "300px"} maxW={compact ? "420px" : "520px"} mx="auto">
          <svg width="100%" viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`} role="img" aria-label={title}>
            {[1, 2, 3].map((level) => (
              <circle
                key={level}
                cx={CHART_CENTER}
                cy={CHART_CENTER}
                r={(level / OUTER_SCALE) * CHART_RADIUS}
                fill="none"
                stroke={dark ? "#4A5568" : "#CBD5E0"}
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
                  stroke={dark ? "#2D3748" : "#E2E8F0"}
                  strokeWidth="1"
                />
              );
            })}

            <polygon points={maxReferencePolygon} fill="#38A16933" stroke="#2F855A" />
            <polygon points={minReferencePolygon} fill={dark ? "#111827" : "#fff"} stroke="#2F855A" />
            <polygon points={measuredPolygon} fill="#3182CE55" stroke="#63B3ED" strokeWidth="2" />

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
                  fill={dark ? "#E2E8F0" : "#4A5568"}
                >
                  {point.label}
                </text>
              );
            })}
          </svg>
        </Box>
      </Box>
      <HStack justify="center" gap={4} fontSize="xs" color={dark ? "whiteAlpha.800" : "fg.muted"} wrap="wrap">
        <HStack gap={1}>
          <Box w="10px" h="10px" bg="#3182CE55" borderWidth="1px" borderColor="#63B3ED" />
          <Text>Valor analisado</Text>
        </HStack>
        <HStack gap={1}>
          <Box w="10px" h="10px" bg="#38A16933" borderWidth="1px" borderColor="#2F855A" />
          <Text>Faixa adequada</Text>
        </HStack>
      </HStack>
    </VStack>
  );
}
