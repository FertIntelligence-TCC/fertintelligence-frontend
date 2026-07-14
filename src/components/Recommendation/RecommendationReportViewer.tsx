import { Box, Text, VStack } from "@chakra-ui/react";
import type { ReactNode } from "react";

import RecommendationTable, { type RecommendationTableColumn } from "./RecommendationTable";

type RecommendationReportViewerProps = {
  reportText: string;
  sectionExtras?: Partial<Record<RecommendationReportSectionKey, ReactNode>>;
  structuredTablesAvailable?: boolean;
};

type RecommendationReportSectionKey = "chemicalDiagnosis" | "foliarDiagnosis" | "summarySoilDiagnosis";

export type ReportBlock =
  | { type: "spacing" }
  | { type: "text"; content: string }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "emptyTable" }
  | { type: "warning"; content: string }
  | { type: "notice"; label: string; content: string; tone: "blue" | "orange" };

const recommendationDocumentFontFamily = "Aptos, Calibri, Arial, sans-serif";
const recommendationDocumentBaseFontSize = "10pt";

const markdownHeadingRegex = /^#{1,6}\s+/;
const markdownTableSeparatorRegex = /^:?-{3,}:?$/;
const tableLikeLineRegex = /^\s*\|.*\|\s*$/;
const emptyTableMessage = "Sem dados calculados para esta seção.";
const nonInformativeTextValues = new Set([
  "-",
  "nao informado",
  "nao informada",
  "nao informados",
  "nao informadas",
  "nao calculado",
  "nao calculada",
  "nao calculados",
  "nao calculadas",
  "nao aplicavel",
  "nao aplicaveis",
  "nao retornado",
  "nao retornada",
  "sem dados",
  "sem dado",
  "sem informacao",
  "sem informacoes",
]);

const normalizeSectionText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const normalizeComparableText = (value: string) =>
  normalizeSectionText(value)
    .replace(/\s+/g, " ")
    .replace(/[.:;]+$/g, "")
    .trim();

export const isRecommendationNonInformativeText = (value: string): boolean =>
  nonInformativeTextValues.has(normalizeComparableText(value));

export const cleanRecommendationDocumentText = (value: string): string => {
  const text = value.trim();
  if (!text || isRecommendationNonInformativeText(text)) return "";
  return text;
};

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
    .map((cell) => cleanRecommendationDocumentText(sanitizeRecommendationPlainTextLine(cell.trim())));

const getDocumentNotice = (
  content: string,
): { label: string; content: string; tone: "blue" | "orange" } | null => {
  const normalizedContent = normalizeComparableText(content);
  const labelMatch = content.match(/^\s*(aviso tecnico|aviso técnico|observacao|observação|dados insuficientes)\s*:\s*(.*)$/i);

  if (labelMatch) {
    const normalizedLabel = normalizeSectionText(labelMatch[1]);
    const label = normalizedLabel.includes("observacao")
      ? "Observação"
      : normalizedLabel.includes("dados insuficientes")
        ? "Dados insuficientes"
        : "Aviso técnico";

    return {
      label,
      content: cleanRecommendationDocumentText(labelMatch[2]) || content,
      tone: label === "Observação" ? "blue" : "orange",
    };
  }

  if (normalizedContent.includes("dados insuficientes")) {
    return { label: "Dados insuficientes", content, tone: "orange" };
  }

  return null;
};

const compactParsedTable = (headers: string[], rows: string[][]): { headers: string[]; rows: string[][] } | null => {
  const rowHasContent = (row: string[]) => row.some((cell) => Boolean(cleanRecommendationDocumentText(cell)));
  const nonEmptyRows = rows.filter(rowHasContent);
  if (nonEmptyRows.length === 0) return null;

  const keptIndexes = headers
    .map((header, index) => ({ header, index }))
    .filter(({ header, index }) =>
      Boolean(cleanRecommendationDocumentText(header)) ||
      nonEmptyRows.some((row) => Boolean(cleanRecommendationDocumentText(row[index] ?? ""))),
    );

  if (keptIndexes.length === 0) return null;

  return {
    headers: keptIndexes.map(({ header }) => header),
    rows: nonEmptyRows.map((row) => keptIndexes.map(({ index }) => row[index] ?? "")),
  };
};

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

  const compactTable = compactParsedTable(headers, rows);
  if (!compactTable) {
    return {
      block: { type: "emptyTable" },
      nextIndex: cursor,
    };
  }

  return {
    block: { type: "table", headers: compactTable.headers, rows: compactTable.rows },
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

export const parseRecommendationReportBlocks = (
  reportText: string,
  structuredTablesAvailable = false,
): ReportBlock[] => {
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
    const cleanLine = cleanRecommendationDocumentText(sanitizedLine);
    if (!cleanLine) {
      blocks.push({ type: "spacing" });
      continue;
    }

    if (tableLikeLineRegex.test(line) && !isMarkdownTableSeparatorLine(line)) {
      foundInvalidTableLikeContent = true;
    }

    const notice = getDocumentNotice(cleanLine);
    blocks.push(notice ? { type: "notice", ...notice } : { type: "text", content: cleanLine });
  }

  if (foundInvalidTableLikeContent && !structuredTablesAvailable) {
    blocks.unshift({
      type: "warning",
      content:
        "Aviso técnico: o backend retornou conteúdo tabular em texto legado sem estrutura suficiente para montar uma tabela com segurança.",
    });
  }

  return blocks;
};

function RecommendationNoticeBlock({
  label,
  content,
  tone,
}: {
  label: string;
  content: string;
  tone: "blue" | "orange";
}) {
  const palette = tone === "blue"
    ? {
        borderColor: "blue.200",
        bg: "blue.50",
        labelColor: "blue.700",
        textColor: "blue.800",
        darkBg: "blue.950",
        darkBorder: "blue.700",
      }
    : {
        borderColor: "orange.200",
        bg: "orange.50",
        labelColor: "orange.700",
        textColor: "orange.800",
        darkBg: "orange.950",
        darkBorder: "orange.700",
      };

  return (
    <Box
      borderWidth="1px"
      borderColor={palette.borderColor}
      bg={palette.bg}
      borderRadius="md"
      p={3}
      _dark={{ bg: palette.darkBg, borderColor: palette.darkBorder }}
    >
      <Text color={palette.labelColor} fontSize="xs" fontWeight="semibold" mb={1}>
        {label}
      </Text>
      <Text color={palette.textColor} fontSize="sm" lineHeight="1.5" whiteSpace="pre-wrap" overflowWrap="anywhere">
        {content}
      </Text>
    </Box>
  );
}

export default function RecommendationReportViewer({
  reportText,
  sectionExtras = {},
  structuredTablesAvailable = false,
}: RecommendationReportViewerProps) {
  if (!reportText?.trim()) {
    return <Text>Nenhum laudo retornado.</Text>;
  }

  const blocks = parseRecommendationReportBlocks(reportText, structuredTablesAvailable);
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
            <RecommendationNoticeBlock
              key={`warning-${blockIndex}`}
              label="Aviso técnico"
              content={block.content}
              tone="orange"
            />
          );
        }

        if (block.type === "notice") {
          return (
            <RecommendationNoticeBlock
              key={`notice-${blockIndex}`}
              label={block.label}
              content={block.content}
              tone={block.tone}
            />
          );
        }

        if (block.type === "emptyTable") {
          return (
            <Box
              key={`empty-table-${blockIndex}`}
              borderWidth="1px"
              borderColor="gray.200"
              bg="gray.50"
              borderRadius="md"
              p={3}
              _dark={{ bg: "gray.900", borderColor: "gray.700" }}
            >
              <Text color="fg.muted" fontSize="sm">
                {emptyTableMessage}
              </Text>
            </Box>
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
      {Object.entries(sectionExtras).map(([sectionKey, extra]) => {
        const typedSectionKey = sectionKey as RecommendationReportSectionKey;
        if (!extra || renderedSectionExtras.has(typedSectionKey)) return null;

        renderedSectionExtras.add(typedSectionKey);
        return <Box key={`section-extra-fallback-${sectionKey}`}>{extra}</Box>;
      })}
    </VStack>
  );
}
