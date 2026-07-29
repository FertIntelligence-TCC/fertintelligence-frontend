import { Box, Flex, Heading, Image, SimpleGrid, Text, VStack } from "@chakra-ui/react";

import reportLogoUrl from "@/assets/fertintelligence-logo.svg";
import type { RecommendationResponse } from "@/interfaces/Recommendation";

import {
  getReportHeaderRows,
  getReportIdentification,
  type ReportDocumentKey,
} from "./RecommendationReportPresentation";

type RecommendationReportHeaderProps = {
  recommendation: RecommendationResponse;
  documentKey: ReportDocumentKey;
};

export default function RecommendationReportHeader({
  recommendation,
  documentKey,
}: RecommendationReportHeaderProps) {
  const headerRows = getReportHeaderRows(recommendation);
  const identification = getReportIdentification(recommendation, documentKey);

  return (
    <VStack
      as="header"
      className="recommendation-report-header"
      align="stretch"
      gap={4}
      aria-label="Identificação do relatório"
    >
      <Flex
        align={{ base: "start", md: "center" }}
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        gap={4}
        borderBottomWidth="1px"
        borderColor="border.muted"
        pb={4}
      >
        <Image
          src={reportLogoUrl}
          alt="FertIntelligence"
          boxSize={{ base: "72px", md: "84px" }}
          objectFit="contain"
          flexShrink={0}
        />
        {headerRows.length ? (
          <VStack align={{ base: "start", md: "end" }} gap={1} minW={0}>
            {headerRows.map((row) => (
              <Text key={row.label} overflowWrap="anywhere" textAlign={{ base: "left", md: "right" }}>
                <Text as="span" fontWeight="semibold">{row.label}:</Text> {row.value}
              </Text>
            ))}
          </VStack>
        ) : null}
      </Flex>

      <Box borderWidth="1px" borderColor="border.muted" borderRadius="md" p={{ base: 3, md: 4 }}>
        <Heading as="h2" size="sm" textAlign="center" mb={identification.rows.length ? 4 : 0}>
          {identification.title}
        </Heading>
        {identification.rows.length ? (
          <SimpleGrid columns={{ base: 1, md: 2 }} gapX={6} gapY={2}>
            {identification.rows.map((row) => (
              <Text key={row.label} minW={0} overflowWrap="anywhere">
                <Text as="span" fontWeight="semibold">{row.label}:</Text> {row.value}
              </Text>
            ))}
          </SimpleGrid>
        ) : null}
      </Box>
    </VStack>
  );
}
