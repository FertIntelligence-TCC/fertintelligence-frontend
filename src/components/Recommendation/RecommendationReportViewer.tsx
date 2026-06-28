import { Box, Text, VStack } from "@chakra-ui/react";

type RecommendationReportViewerProps = {
  reportText: string;
  variant?: "compact" | "modal" | "print";
};

export type ReportBlock =
  | { type: "spacing" }
  | { type: "heading"; content: string }
  | { type: "text"; content: string }
  | { type: "table"; rows: string[][] };

const recommendationDocumentFontFamily = "Aptos, Calibri, Arial, sans-serif";
const recommendationDocumentBaseFontSize = "10pt";
const recommendationDocumentHeadingFontSize = "12pt";
const unknownSpacingModeMessage =
  "Modo de espaçamento não identificado no laudo retornado pelo backend; mantendo colunas g/m e g/cova para conferência técnica.";

const markdownHeadingRegex = /^#{1,6}\s+/;
const sectionTitleRegex = /^\d+(\.\d+)*\.\s+.+/;
const linearSpacingRegex = /\b(plants_per_meter|plantas\s*\/\s*m(?:\s*linear)?|plantas\s+por\s+metro|metro\s+linear)\b/i;
const holeSpacingRegex = /\b(holes|dist[aâ]ncia\s+entre\s+covas|plantas\s*\/\s*cova|plantas\s+por\s+cova|covas\s*\/\s*ha)\b/i;

const normalizeMarkdownHeading = (line: string) => line.trim().replace(markdownHeadingRegex, "");

const isMarkdownTableLine = (line: string) => {
  const trimmedLine = line.trim();
  return trimmedLine.startsWith("|") && trimmedLine.endsWith("|");
};

const isMarkdownTableSeparatorLine = (line: string) => {
  const cells = line
    .trim()
    .slice(1, -1)
    .split("|")
    .map((cell) => cell.trim());

  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
};

const parseMarkdownTableLine = (line: string) =>
  line
    .trim()
    .slice(1, -1)
    .split("|")
    .map((cell) => cell.trim());

const removeMarkdownTables = (reportText: string) =>
  reportText
    .split("\n")
    .filter((line) => !isMarkdownTableLine(line))
    .join("\n");

type RecommendationSpacingMode = "linear" | "holes" | "UNKNOWN";

export const detectRecommendationSpacingMode = (reportText: string): RecommendationSpacingMode => {
  const textWithoutTables = removeMarkdownTables(reportText);
  const hasLinearSpacing = linearSpacingRegex.test(textWithoutTables);
  const hasHoleSpacing = holeSpacingRegex.test(textWithoutTables);

  if (hasLinearSpacing && !hasHoleSpacing) return "linear";
  if (hasHoleSpacing && !hasLinearSpacing) return "holes";
  return "UNKNOWN";
};

const isGramPerMeterHeader = (value: string) => /\bg\s*\/\s*m(?:\b|\s|$)/i.test(value) && !/\bg\s*\/\s*ml\b/i.test(value);

const isGramPerHoleHeader = (value: string) => /\bg\s*\/\s*cova\b/i.test(value);

export const getRecommendationTableDisplay = (
  rows: string[][],
  spacingMode: RecommendationSpacingMode,
): { rows: string[][]; warning?: string } => {
  const [headerRow] = rows;
  if (!headerRow) return { rows };

  const gramPerMeterColumns = headerRow
    .map((cell, index) => (isGramPerMeterHeader(cell) ? index : -1))
    .filter((index) => index >= 0);
  const gramPerHoleColumns = headerRow
    .map((cell, index) => (isGramPerHoleHeader(cell) ? index : -1))
    .filter((index) => index >= 0);
  const hasBothUnitColumns = gramPerMeterColumns.length > 0 && gramPerHoleColumns.length > 0;

  if (spacingMode === "UNKNOWN") {
    return {
      rows,
      warning: hasBothUnitColumns ? unknownSpacingModeMessage : undefined,
    };
  }

  const hiddenColumns = new Set(spacingMode === "linear" ? gramPerHoleColumns : gramPerMeterColumns);
  if (hiddenColumns.size === 0) return { rows };

  return {
    rows: rows.map((row) => row.filter((_, index) => !hiddenColumns.has(index))),
  };
};

function RecommendationReportTable({
  rows,
  spacingMode,
  blockIndex,
}: {
  rows: string[][];
  spacingMode: RecommendationSpacingMode;
  blockIndex: number;
}) {
  const display = getRecommendationTableDisplay(rows, spacingMode);

  return (
    <VStack key={`table-${blockIndex}`} align="stretch" gap={1}>
      {display.warning ? (
        <Text color="orange.600" fontSize="xs">
          {display.warning}
        </Text>
      ) : null}
      <Box overflowX="auto">
        <Box as="table" width="100%" borderCollapse="collapse" fontSize={recommendationDocumentBaseFontSize}>
          <Box as="tbody">
            {display.rows.map((row, rowIndex) => (
              <Box as="tr" key={`row-${blockIndex}-${rowIndex}`}>
                {row.map((cell, cellIndex) => (
                  <Box
                    as={rowIndex === 0 ? "th" : "td"}
                    key={`cell-${blockIndex}-${rowIndex}-${cellIndex}`}
                    borderWidth="1px"
                    px={3}
                    py={2}
                    textAlign="left"
                    verticalAlign="top"
                    fontWeight={rowIndex === 0 ? "semibold" : "normal"}
                  >
                    {cell}
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </VStack>
  );
}

export const parseRecommendationReportBlocks = (reportText: string): ReportBlock[] => {
  const lines = reportText.split("\n");
  const blocks: ReportBlock[] = [];
  let tableRows: string[][] = [];

  const flushTable = () => {
    if (tableRows.length > 0) {
      blocks.push({ type: "table", rows: tableRows });
      tableRows = [];
    }
  };

  lines.forEach((line) => {
    const trimmedLine = line.trim();

    if (isMarkdownTableLine(line)) {
      if (!isMarkdownTableSeparatorLine(line)) {
        tableRows.push(parseMarkdownTableLine(line));
      }
      return;
    }

    flushTable();

    if (!trimmedLine) {
      blocks.push({ type: "spacing" });
      return;
    }

    const headingContent = normalizeMarkdownHeading(line);
    if (sectionTitleRegex.test(headingContent)) {
      blocks.push({ type: "heading", content: headingContent });
      return;
    }

    blocks.push({ type: "text", content: line });
  });

  flushTable();
  return blocks;
};

export default function RecommendationReportViewer({
  reportText,
  variant = "compact",
}: RecommendationReportViewerProps) {
  if (!reportText?.trim()) {
    return <Text>Nenhum laudo retornado.</Text>;
  }

  const blocks = parseRecommendationReportBlocks(reportText);
  const spacingMode = detectRecommendationSpacingMode(reportText);
  const headingSize = variant === "print" ? "13pt" : recommendationDocumentHeadingFontSize;

  return (
    <VStack
      align="stretch"
      className="recommendation-document-viewer"
      fontFamily={recommendationDocumentFontFamily}
      fontSize={recommendationDocumentBaseFontSize}
      gap={2}
      lineHeight="1.55"
    >
      {blocks.map((block, blockIndex) => {
        if (block.type === "spacing") {
          return <Box key={`spacing-${blockIndex}`} h={3} />;
        }

        if (block.type === "heading") {
          return (
            <Text key={`heading-${blockIndex}`} fontSize={headingSize} fontWeight="bold" mt={2}>
              {block.content}
            </Text>
          );
        }

        if (block.type === "table") {
          return (
            <RecommendationReportTable
              key={`table-${blockIndex}`}
              rows={block.rows}
              spacingMode={spacingMode}
              blockIndex={blockIndex}
            />
          );
        }

        return (
          <Text key={`text-${blockIndex}`} fontSize={recommendationDocumentBaseFontSize} lineHeight="1.55" whiteSpace="pre-wrap">
            {block.content}
          </Text>
        );
      })}
    </VStack>
  );
}
