import { Box, SimpleGrid, Text } from "@chakra-ui/react";

type LimingPreviewFieldsProps = {
  criterionLabel: string;
  limingNeed: number | null;
  warning?: string;
  formatLimingNeed: (value: number) => string;
};

export default function LimingPreviewFields({
  criterionLabel,
  limingNeed,
  warning,
  formatLimingNeed,
}: LimingPreviewFieldsProps) {
  return (
    <Box>
      <SimpleGrid columns={{ base: 1, sm: limingNeed === null ? 1 : 2 }} gap={2}>
        <Box>
          <Text fontSize="sm" mb={1}>Critério de calagem</Text>
          <Box
            borderWidth="1px"
            borderRadius="md"
            px={3}
            py={2}
            minH={10}
            bg="bg.panel"
            color="fg.muted"
            aria-label="Critério de calagem"
          >
            {criterionLabel}
          </Box>
        </Box>
        {limingNeed !== null ? (
          <Box>
            <Text fontSize="sm" mb={1}>Necessidade de calagem estimada (t/ha, PRNT 100%)</Text>
            <Box
              borderWidth="1px"
              borderRadius="md"
              px={3}
              py={2}
              minH={10}
              bg="bg.panel"
              color="fg.muted"
              aria-label="Necessidade de calagem estimada (t/ha, PRNT 100%)"
            >
              {formatLimingNeed(limingNeed)}
            </Box>
          </Box>
        ) : null}
      </SimpleGrid>
      {warning ? (
        <Text mt={2} fontSize="xs" color="fg.muted">{warning}</Text>
      ) : null}
    </Box>
  );
}

