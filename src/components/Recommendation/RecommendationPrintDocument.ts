import type { RecommendationPrintResponse } from "@/interfaces/Recommendation";

import {
  buildFormulatedPlantingFertilizerTableModels,
  buildFormulatedTopDressingFertilizerTableModels,
  type FormulatedFertilizerPrintTableModel,
} from "./FormulatedPlantingFertilizerTable";
import {
  buildAlternativeFertilizerTableModels,
  buildCorrectiveSoilFertilizationPrintTableModels,
  buildFertilizationOptionPrintTableModels,
  buildGypsumRecommendationPrintModel,
  buildSulfurRecommendationPrintModel,
  hasFertilizationOptionContent,
  type AlternativeFertilizerPrintTableModel,
  type CorrectiveSoilFertilizationPrintTableModel,
} from "./RecommendationStructuredFertilizerTables";
import {
  buildMicronutrientFertilizerTableModel,
  type RecommendationPrintTableModel,
} from "./MicronutrientFertilizerTable";
import {
  cleanRecommendationDocumentText,
  isRecommendationNonInformativeText,
  parseRecommendationReportBlocks,
} from "./RecommendationReportViewer";
import { formatRecommendationTableCell } from "./recommendationColumnDecision";

type StructuredPrintTableModel =
  | RecommendationPrintTableModel
  | FormulatedFertilizerPrintTableModel
  | AlternativeFertilizerPrintTableModel
  | CorrectiveSoilFertilizationPrintTableModel
  | ReturnType<typeof buildFertilizationOptionPrintTableModels>[number];

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const LONG_TABLE_CELL_LIMIT = 180;

const normalizeComparableText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[.:;]+$/g, "")
    .trim();

const compactTextList = (values: string[]): string[] => {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const text = cleanRecommendationDocumentText(value);
    if (!text) continue;

    const key = normalizeComparableText(text);
    if (seen.has(key)) continue;

    seen.add(key);
    result.push(text);
  }

  return result;
};

const cleanPrintCell = (value: string) => {
  const text = cleanRecommendationDocumentText(formatRecommendationTableCell(value));
  return text && !isRecommendationNonInformativeText(text) ? text : "";
};

const compactPrintTable = (headers: string[], rows: string[][]) => {
  const cleanedHeaders = headers.map(cleanPrintCell);
  const cleanedRows = rows
    .map((row) => row.map((cell) => cleanPrintCell(cell)))
    .filter((row) => row.some(Boolean));

  if (cleanedRows.length === 0) return null;

  const keptIndexes = cleanedHeaders
    .map((header, index) => ({ header, index }))
    .filter(({ header, index }) => header || cleanedRows.some((row) => Boolean(row[index])));

  if (keptIndexes.length === 0) return null;

  return {
    headers: keptIndexes.map(({ header }) => header),
    rows: cleanedRows.map((row) => keptIndexes.map(({ index }) => row[index] ?? "")),
  };
};

const technicalWarningFields = [
  "mensagem_tecnica",
  "mensagemTecnica",
  "technicalMessage",
  "mensagem",
  "message",
  "observacao_tecnica",
  "observacaoTecnica",
  "technicalObservation",
] as const;

const getPrintableTechnicalWarnings = (recommendation: RecommendationPrintResponse): string[] =>
  compactTextList(
    technicalWarningFields.map((field) => {
      const value = (recommendation as unknown as Record<string, unknown>)[field];
      return typeof value === "string" ? value : "";
    }),
  );

const getStructuredPrintTableModels = (
  recommendation: RecommendationPrintResponse,
): StructuredPrintTableModel[] => {
  const micronutrientTable = buildMicronutrientFertilizerTableModel(recommendation);
  const correctiveTables = buildCorrectiveSoilFertilizationPrintTableModels(recommendation, "general");
  if (hasFertilizationOptionContent(recommendation)) {
    return [
      ...correctiveTables,
      ...buildFertilizationOptionPrintTableModels(recommendation, "general"),
    ];
  }

  return [
    ...correctiveTables,
    ...buildFormulatedPlantingFertilizerTableModels(recommendation),
    ...buildFormulatedTopDressingFertilizerTableModels(recommendation),
    ...buildAlternativeFertilizerTableModels(recommendation),
    ...(micronutrientTable ? [micronutrientTable] : []),
  ];
};

const renderStructuredTableHtml = (model: StructuredPrintTableModel) => {
  const compactTable = compactPrintTable(model.headers, model.rows);
  if (!compactTable) return "";

  const notes: string[] = [];
  const noteMap = new Map<string, number>();
  const renderCell = (cell: string) => {
    const cleanCell = cleanPrintCell(cell);
    if (!cleanCell) return "";
    if (cleanCell.length <= LONG_TABLE_CELL_LIMIT && !cleanCell.includes("\n")) return escapeHtml(cleanCell);

    const key = normalizeComparableText(cleanCell);
    const existingIndex = noteMap.get(key);
    if (existingIndex) return `Ver observação ${existingIndex}`;

    notes.push(cleanCell);
    noteMap.set(key, notes.length);
    return `Ver observação ${notes.length}`;
  };

  const headerHtml = `<thead><tr>${compactTable.headers
    .map((header) => `<th>${escapeHtml(header)}</th>`)
    .join("")}</tr></thead>`;
  const bodyHtml = `<tbody>${compactTable.rows
    .map((row) =>
      `<tr>${row
        .map((cell) => `<td>${renderCell(cell)}</td>`)
        .join("")}</tr>`,
    )
    .join("")}</tbody>`;
  const notesHtml = notes.length
    ? `<div class="table-notes">${notes
        .map((note, index) => `<p><strong>Observação ${index + 1}:</strong> ${escapeHtml(note)}</p>`)
        .join("")}</div>`
    : "";
  const warningsHtml = "warnings" in model && model.warnings.length
    ? compactTextList(model.warnings)
        .map((warning) => `<p class="technical-warning">${escapeHtml(warning)}</p>`)
        .join("")
    : "";

  return `<h2>${escapeHtml(model.title)}</h2><table>${headerHtml}${bodyHtml}</table>${notesHtml}${warningsHtml}`;
};

const renderGypsumHtml = (recommendation: RecommendationPrintResponse) => {
  const model = buildGypsumRecommendationPrintModel(recommendation, "general");
  if (!model) return "";

  const warningHtml = model.warning
    ? `<p class="technical-warning"><strong>Aviso técnico:</strong> ${escapeHtml(model.warning)}</p>`
    : "";
  const linesHtml = model.lines
    .map((line) => `<p>${escapeHtml(formatRecommendationTableCell(line))}</p>`)
    .join("");

  return `<h2>${escapeHtml(model.title)}</h2>${warningHtml}${linesHtml}`;
};

const renderSulfurHtml = (recommendation: RecommendationPrintResponse) => {
  const model = buildSulfurRecommendationPrintModel(recommendation, "general");
  if (!model) return "";

  const warningHtml = model.warning
    ? `<p class="technical-warning"><strong>Aviso técnico:</strong> ${escapeHtml(model.warning)}</p>`
    : "";
  const linesHtml = model.lines
    .map((line) => `<p>${escapeHtml(formatRecommendationTableCell(line))}</p>`)
    .join("");

  return `<h2>${escapeHtml(model.title)}</h2>${warningHtml}${linesHtml}`;
};

const renderLegacyTableHtml = (headers: string[], rows: string[][]) => {
  const compactTable = compactPrintTable(headers, rows);
  if (!compactTable) return "";

  const headerHtml = `<thead><tr>${compactTable.headers
    .map((header) => `<th>${escapeHtml(header)}</th>`)
    .join("")}</tr></thead>`;
  const bodyHtml = `<tbody>${compactTable.rows
    .map((row) =>
      `<tr>${row
        .map((cell) => `<td>${escapeHtml(cleanPrintCell(cell))}</td>`)
        .join("")}</tr>`,
    )
    .join("")}</tbody>`;

  return `<table>${headerHtml}${bodyHtml}</table>`;
};

const renderReportTextHtml = (text: string) => {
  const blocks = parseRecommendationReportBlocks(text);

  return blocks
    .map((block) => {
      if (block.type === "spacing") {
        return '<div class="spacing"></div>';
      }

      if (block.type === "table") {
        return renderLegacyTableHtml(block.headers, block.rows);
      }

      if (block.type === "warning") {
        const content = cleanRecommendationDocumentText(block.content);
        return content ? `<p class="technical-warning">${escapeHtml(content)}</p>` : "";
      }

      if (block.type === "notice") {
        const content = cleanRecommendationDocumentText(block.content);
        return content ? `<p class="technical-warning"><strong>${escapeHtml(block.label)}:</strong> ${escapeHtml(content)}</p>` : "";
      }

      if (block.type === "emptyTable") {
        return "<p>Sem dados calculados para esta seção.</p>";
      }

      const content = cleanRecommendationDocumentText(block.content);
      return content ? `<p>${escapeHtml(content)}</p>` : "";
    })
    .join("");
};

export const writePrintableReport = (
  printWindow: Window,
  text: string,
  printableRecommendation: RecommendationPrintResponse,
) => {
  const contentHtml = renderReportTextHtml(text);
  const renderedReportWarningKeys = new Set(
    parseRecommendationReportBlocks(text)
      .filter((block) => block.type === "warning" || block.type === "notice")
      .map((block) => normalizeComparableText(block.content)),
  );
  const technicalWarningsHtml = getPrintableTechnicalWarnings(printableRecommendation)
    .filter((warning) => !renderedReportWarningKeys.has(normalizeComparableText(warning)))
    .map((warning) => `<p class="technical-warning"><strong>Aviso técnico:</strong> ${escapeHtml(warning)}</p>`)
    .join("");
  const structuredTablesHtml = getStructuredPrintTableModels(printableRecommendation)
    .map(renderStructuredTableHtml)
    .filter(Boolean)
    .join("");
  const gypsumHtml = renderGypsumHtml(printableRecommendation);
  const sulfurHtml = renderSulfurHtml(printableRecommendation);
  const structuredContentHtml = structuredTablesHtml || gypsumHtml || sulfurHtml
    ? `<div class="spacing"></div>${sulfurHtml}${gypsumHtml}${structuredTablesHtml}`
    : "";

  const doc = printWindow.document;
  doc.open();
  doc.write(`<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Laudo Técnico</title>
    <style>
      body { font-family: Aptos, Calibri, Arial, sans-serif; padding: 32px; line-height: 1.55; color: #000; font-size: 10pt; }
      .recommendation-print-document { font-family: Aptos, Calibri, Arial, sans-serif; font-size: 10pt; }
      h1 { margin: 0 0 24px; font-size: 14pt; }
      h2 { margin: 20px 0 8px; font-size: 12pt; }
      p { margin: 0; white-space: pre-wrap; }
      .technical-warning { color: #c2410c; font-size: 9pt; margin: 6px 0; }
      .table-notes { margin: 4px 0 8px; font-size: 9pt; }
      .table-notes p { margin: 3px 0; }
      .spacing { height: 12px; }
      table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 9pt; }
      th, td { border: 1px solid #000; padding: 6px 8px; text-align: left; vertical-align: top; white-space: pre-wrap; }
      th { font-weight: 700; background: #f2f2f2; }
      .footer { margin-top: 36px; }
      @media print {
        body, .recommendation-print-document { font-family: Aptos, Calibri, Arial, sans-serif; font-size: 10pt; }
        table { font-size: 10pt; }
      }
    </style>
  </head>
  <body>
    <h1>Laudo Técnico de Recomendação Agrícola</h1>
    <div class="recommendation-print-document">${contentHtml}${technicalWarningsHtml}${structuredContentHtml}</div>
    <div class="footer">Documento emitido pelo sistema FertIntelligence.</div>
  </body>
</html>`);
  doc.close();
};
