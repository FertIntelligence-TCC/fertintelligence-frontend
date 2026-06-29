import { Box, Text, VStack } from "@chakra-ui/react";

type RecommendationReportViewerProps = {
  reportText: string;
};

export type ReportBlock =
  | { type: "spacing" }
  | { type: "text"; content: string };

const recommendationDocumentFontFamily = "Aptos, Calibri, Arial, sans-serif";
const recommendationDocumentBaseFontSize = "10pt";

const markdownHeadingRegex = /^#{1,6}\s+/;
const markdownTableSeparatorRegex = /^:?-{3,}:?$/;

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

  return cells.length > 0 && cells.every((cell) => markdownTableSeparatorRegex.test(cell));
};

const sanitizeMarkdownTableLine = (line: string) =>
  line
    .trim()
    .slice(1, -1)
    .split("|")
    .map((cell) => cell.trim())
    .filter(Boolean)
    .join("    ");

export const sanitizeRecommendationPlainTextLine = (line: string) => {
  if (isMarkdownTableSeparatorLine(line)) return "";
  if (isMarkdownTableLine(line)) return sanitizeMarkdownTableLine(line);

  return line
    .replace(markdownHeadingRegex, "")
    .replace(/^\s*>\s?/, "")
    .replace(/^(\s*)[-*+]\s+/, "$1")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1");
};

export const parseRecommendationReportBlocks = (reportText: string): ReportBlock[] => {
  const lines = reportText.split("\n");
  const blocks: ReportBlock[] = [];

  lines.forEach((line) => {
    const sanitizedLine = sanitizeRecommendationPlainTextLine(line);
    if (!sanitizedLine.trim()) {
      blocks.push({ type: "spacing" });
      return;
    }

    blocks.push({ type: "text", content: sanitizedLine });
  });

  return blocks;
};

export default function RecommendationReportViewer({
  reportText,
}: RecommendationReportViewerProps) {
  if (!reportText?.trim()) {
    return <Text>Nenhum laudo retornado.</Text>;
  }

  const blocks = parseRecommendationReportBlocks(reportText);

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

        return (
          <Text key={`text-${blockIndex}`} fontSize={recommendationDocumentBaseFontSize} lineHeight="1.55" whiteSpace="pre-wrap">
            {block.content}
          </Text>
        );
      })}
    </VStack>
  );
}
