import { Box, Text, VStack } from "@chakra-ui/react";

type RecommendationReportViewerProps = {
  reportText: string;
  variant?: "compact" | "modal" | "print";
};

type ReportBlock =
  | { type: "spacing" }
  | { type: "heading"; content: string }
  | { type: "text"; content: string }
  | { type: "table"; rows: string[][] };

const sectionTitleRegex = /^\d+(\.\d+)*\.\s+.+/;

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

    if (sectionTitleRegex.test(trimmedLine)) {
      blocks.push({ type: "heading", content: line });
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
  const headingSize = variant === "print" ? "md" : "sm";
  const textSize = variant === "print" ? "md" : "sm";

  return (
    <VStack align="stretch" gap={2}>
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
            <Box key={`table-${blockIndex}`} overflowX="auto">
              <Box as="table" width="100%" borderCollapse="collapse" fontSize={textSize}>
                <Box as="tbody">
                  {block.rows.map((row, rowIndex) => (
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
          );
        }

        return (
          <Text key={`text-${blockIndex}`} fontSize={textSize} lineHeight="1.65" whiteSpace="pre-wrap">
            {block.content}
          </Text>
        );
      })}
    </VStack>
  );
}
