import { Box, Text, VStack } from "@chakra-ui/react";
import type { ReactNode } from "react";

import RecommendationTable, { type RecommendationTableColumn } from "./RecommendationTable";

type RecommendationReportViewerProps = {
  reportText: string;
  sectionExtras?: Partial<Record<RecommendationReportSectionKey, ReactNode>>;
};

type RecommendationReportSectionKey = "chemicalDiagnosis" | "foliarDiagnosis" | "summarySoilDiagnosis";

export type ReportBlock =
  | { type: "spacing" }
  | { type: "text"; content: string }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "warning"; content: string };

const recommendationDocumentFontFamily = "Aptos, Calibri, Arial, sans-serif";
const recommendationDocumentBaseFontSize = "10pt";

const markdownHeadingRegex = /^#{1,6}\s+/;
const markdownTableSeparatorRegex = /^:?-{3,}:?$/;
const tableLikeLineRegex = /^\s*\|.*\|\s*$/;

const normalizeSectionText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const getSectionKeyFromText = (content: string): RecommendationReportSectionKey | null => {
  const normalizedContent = normalizeSectionText(content);

  if (normalizedContent.includes("diagnostico") && normalizedContent.includes("foliar")) {
    return "foliarDiagnosis";
  }

  if (
    normalizedContent.includes("diagnostico") &&
    normalizedContent.includes("fertilidade") &&
    normalizedContent.includes("solo") &&
    normalizedContent.includes("area avaliada")
  ) {
    return "summarySoilDiagnosis";
  }

  if (normalizedContent.includes("diagnostico") && normalizedContent.includes("quimic")) {
    return "chemicalDiagnosis";
  }

  return null;
};

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

const parseTableLineCells = (line: string): string[] =>
  line
    .trim()
    .slice(1, -1)
    .split("|")
    .map((cell) => sanitizeRecommendationPlainTextLine(cell.trim()));

const isValidTableSeparator = (line: string, expectedColumnCount: number) => {
  if (!isMarkdownTableSeparatorLine(line)) return false;

  const cells = line
    .trim()
    .slice(1, -1)
    .split("|")
    .map((cell) => cell.trim());

  return cells.length === expectedColumnCount;
};

const tryParseLegacyPipeTable = (
  lines: string[],
  startIndex: number,
): { block: ReportBlock; nextIndex: number } | null => {
  const headerLine = lines[startIndex];
  const separatorLine = lines[startIndex + 1];

  if (!isMarkdownTableLine(headerLine) || !separatorLine) return null;

  const headers = parseTableLineCells(headerLine);
  if (headers.length < 2 || !isValidTableSeparator(separatorLine, headers.length)) return null;

  const rows: string[][] = [];
  let cursor = startIndex + 2;

  while (cursor < lines.length && isMarkdownTableLine(lines[cursor])) {
    const row = parseTableLineCells(lines[cursor]);
    if (row.length !== headers.length) break;
    rows.push(row);
    cursor += 1;
  }

  if (rows.length === 0) return null;

  return {
    block: { type: "table", headers, rows },
    nextIndex: cursor,
  };
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
  let foundInvalidTableLikeContent = false;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const parsedTable = tryParseLegacyPipeTable(lines, lineIndex);
    if (parsedTable) {
      blocks.push(parsedTable.block);
      lineIndex = parsedTable.nextIndex - 1;
      continue;
    }

    const line = lines[lineIndex];
    const sanitizedLine = sanitizeRecommendationPlainTextLine(line);
    if (!sanitizedLine.trim()) {
      blocks.push({ type: "spacing" });
      continue;
    }

    if (tableLikeLineRegex.test(line) && !isMarkdownTableSeparatorLine(line)) {
      foundInvalidTableLikeContent = true;
    }

    blocks.push({ type: "text", content: sanitizedLine });
  }

  if (foundInvalidTableLikeContent) {
    blocks.unshift({
      type: "warning",
      content:
        "Aviso técnico: o backend retornou conteúdo tabular em texto legado sem estrutura suficiente para montar uma tabela com segurança.",
    });
  }

  return blocks;
};

export default function RecommendationReportViewer({
  reportText,
  sectionExtras = {},
}: RecommendationReportViewerProps) {
  if (!reportText?.trim()) {
    return <Text>Nenhum laudo retornado.</Text>;
  }

  const blocks = parseRecommendationReportBlocks(reportText);
  let activeSectionKey: RecommendationReportSectionKey | null = null;
  const renderedSectionExtras = new Set<RecommendationReportSectionKey>();

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

        if (block.type === "warning") {
          return (
            <Text key={`warning-${blockIndex}`} color="orange.600" fontSize="xs" lineHeight="1.45">
              {block.content}
            </Text>
          );
        }

        if (block.type === "table") {
          const columns: RecommendationTableColumn[] = block.headers.map((header, headerIndex) => ({
            key: `${header}-${headerIndex}`,
            header: header || "-",
            minW: header.length > 18 ? "180px" : "120px",
          }));
          const extra =
            activeSectionKey && !renderedSectionExtras.has(activeSectionKey)
              ? sectionExtras[activeSectionKey]
              : null;

          if (activeSectionKey && extra) {
            renderedSectionExtras.add(activeSectionKey);
          }

          return (
            <VStack key={`table-${blockIndex}`} align="stretch" gap={3}>
              <RecommendationTable
                columns={columns}
                rows={block.rows}
                minW={`${Math.max(block.headers.length * 150, 720)}px`}
                renderCell={(row, _column, _rowIndex, columnIndex) => (
                  <Text whiteSpace="pre-wrap" overflowWrap="anywhere">
                    {row[columnIndex] || "-"}
                  </Text>
                )}
              />
              {extra}
            </VStack>
          );
        }

        const nextSectionKey = getSectionKeyFromText(block.content);
        const previousSectionExtra =
          nextSectionKey &&
          activeSectionKey &&
          nextSectionKey !== activeSectionKey &&
          !renderedSectionExtras.has(activeSectionKey)
            ? sectionExtras[activeSectionKey]
            : null;

        if (previousSectionExtra && activeSectionKey) {
          renderedSectionExtras.add(activeSectionKey);
        }

        activeSectionKey = nextSectionKey ?? activeSectionKey;

        return (
          <VStack key={`text-${blockIndex}`} align="stretch" gap={3}>
            {previousSectionExtra}
            <Text fontSize={recommendationDocumentBaseFontSize} lineHeight="1.55" whiteSpace="pre-wrap">
              {block.content}
            </Text>
          </VStack>
        );
      })}
      {activeSectionKey && !renderedSectionExtras.has(activeSectionKey) ? sectionExtras[activeSectionKey] : null}
    </VStack>
  );
}
