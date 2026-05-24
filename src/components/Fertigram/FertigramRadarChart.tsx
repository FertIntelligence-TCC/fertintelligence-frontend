import { Box, Text, VStack } from "@chakra-ui/react";

export interface FertigramRadarChartNutrient {
  name: string;
  measuredValue?: number | null;
  recommendedMin?: number | null;
  recommendedMax?: number | null;
  unit?: string | null;
  interpretation?: string | null;
}

interface FertigramRadarChartProps {
  title: string;
  nutrients: FertigramRadarChartNutrient[];
}

const CHART_SIZE = 360;
const CHART_CENTER = CHART_SIZE / 2;
const CHART_RADIUS = 120;
const OUTER_SCALE = 3;

interface RadarPoint {
  label: string;
  normalizedMeasured: number;
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

const getRadarChartPoints = (
  nutrients: FertigramRadarChartNutrient[]
): RadarPoint[] =>
  nutrients
    .map<RadarPoint | null>((item) => {
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
        label: item.name,
        normalizedMeasured: clampScale(normalized),
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
}: FertigramRadarChartProps) {
  const safeNutrients = Array.isArray(nutrients) ? nutrients : [];
  const points = getRadarChartPoints(safeNutrients);
  const totalAxes = points.length;

  if (safeNutrients.length === 0 || totalAxes < 3) {
    return (
      <VStack align="stretch" gap={2}>
        <Text fontSize="sm" fontWeight="bold">
          {title}
        </Text>
        <Text fontSize="sm" color="gray.500" _dark={{ color: "gray.400" }}>
          Não há dados suficientes para renderizar este fertigrama visual.
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
          <svg width="100%" viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`} role="img" aria-label={title}>
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
            <polygon points={measuredPolygon} fill="#3182CE55" stroke="#2B6CB0" strokeWidth="2" />

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
}
