import type { RecommendationPrintResponse } from "@/interfaces/Recommendation";
import type { RecommendationDocumentKey } from "./RecommendationFolderDocuments";

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
import {
  getReportHeaderRows,
  getReportIdentification,
  normalizeReportOptionalValue,
} from "./RecommendationReportPresentation";

export { getRecommendationTypeLabel } from "./RecommendationReportPresentation";

type StructuredPrintTableModel =
  | RecommendationPrintTableModel
  | FormulatedFertilizerPrintTableModel
  | AlternativeFertilizerPrintTableModel
  | CorrectiveSoilFertilizationPrintTableModel
  | ReturnType<typeof buildFertilizationOptionPrintTableModels>[number];

const getPrintableDocument = (
  recommendation: RecommendationPrintResponse,
  documentKey: RecommendationDocumentKey,
): RecommendationPrintResponse => {
  const documents = recommendation as RecommendationPrintResponse & {
    recomendacao_resumida?: unknown;
    recomendacao_direta?: unknown;
    lista_compras?: unknown;
  };
  const nestedDocument =
    documentKey === "summary"
      ? documents.recomendacao_resumida
      : documentKey === "direct"
        ? documents.recomendacao_direta
        : documentKey === "shopping"
          ? documents.lista_compras
          : recommendation;
  return nestedDocument && typeof nestedDocument === "object"
    ? nestedDocument as RecommendationPrintResponse
    : recommendation;
};

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
  documentKey: RecommendationDocumentKey,
): StructuredPrintTableModel[] => {
  const printableDocument = getPrintableDocument(recommendation, documentKey);
  const mode = documentKey === "shopping" ? "shopping" : documentKey;
  const micronutrientTable = buildMicronutrientFertilizerTableModel(printableDocument);
  const correctiveTables = buildCorrectiveSoilFertilizationPrintTableModels(printableDocument, mode);
  if (hasFertilizationOptionContent(printableDocument)) {
    return [
      ...correctiveTables,
      ...buildFertilizationOptionPrintTableModels(printableDocument, mode),
    ];
  }

  return [
    ...correctiveTables,
    ...buildFormulatedPlantingFertilizerTableModels(printableDocument),
    ...buildFormulatedTopDressingFertilizerTableModels(printableDocument),
    ...buildAlternativeFertilizerTableModels(printableDocument),
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

const renderGypsumHtml = (
  recommendation: RecommendationPrintResponse,
  documentKey: RecommendationDocumentKey,
) => {
  const model = buildGypsumRecommendationPrintModel(
    getPrintableDocument(recommendation, documentKey),
    documentKey,
  );
  if (!model) return "";

  const warningHtml = model.warning
    ? `<p class="technical-warning"><strong>Aviso técnico:</strong> ${escapeHtml(model.warning)}</p>`
    : "";
  const linesHtml = model.lines
    .map((line) => `<p>${escapeHtml(formatRecommendationTableCell(line))}</p>`)
    .join("");

  return `<h2>${escapeHtml(model.title)}</h2>${warningHtml}${linesHtml}`;
};

const renderSulfurHtml = (
  recommendation: RecommendationPrintResponse,
  documentKey: RecommendationDocumentKey,
) => {
  const model = buildSulfurRecommendationPrintModel(
    getPrintableDocument(recommendation, documentKey),
    documentKey,
  );
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

const renderOptionalLine = (label: string, value: unknown): string => {
  const normalized = normalizeReportOptionalValue(value);
  return normalized
    ? `<div class="identification-row"><strong>${escapeHtml(label)}:</strong> ${escapeHtml(normalized)}</div>`
    : "";
};

export const buildReportPrintHeaderHtml = (
  recommendation: RecommendationPrintResponse,
  logoUrl: string,
): string => {
  const details = getReportHeaderRows(recommendation)
    .map((row) => renderOptionalLine(row.label, row.value))
    .join("");

  return `<header class="report-print-header">
    <img src="${escapeHtml(logoUrl)}" alt="FertIntelligence" />
    <div class="report-print-header-details">${details}</div>
  </header>`;
};

export const buildReportIdentificationHtml = (
  recommendation: RecommendationPrintResponse,
  documentKey: RecommendationDocumentKey,
): string => {
  const identification = getReportIdentification(recommendation, documentKey);
  const rows = identification.rows.map((row) => renderOptionalLine(row.label, row.value)).join("");

  return `<section class="report-identification">
    <h1>${escapeHtml(identification.title)}</h1>
    <div class="report-identification-grid">${rows}</div>
  </section>`;
};

export const buildReportSignatureHtml = (
  recommendation: RecommendationPrintResponse,
): string => {
  const author = normalizeReportOptionalValue(recommendation.autor_assinatura_relatorio);
  if (!author) return "";
  return `<section class="report-signature">
    <div class="signature-line"></div>
    <div>${escapeHtml(author)}</div>
  </section>`;
};

export const writePrintableReport = (
  printWindow: Window,
  text: string,
  printableRecommendation: RecommendationPrintResponse,
  documentKey: RecommendationDocumentKey = "general",
  logoUrl = "",
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
  const structuredTablesHtml = getStructuredPrintTableModels(printableRecommendation, documentKey)
    .map(renderStructuredTableHtml)
    .filter(Boolean)
    .join("");
  const gypsumHtml = renderGypsumHtml(printableRecommendation, documentKey);
  const sulfurHtml = renderSulfurHtml(printableRecommendation, documentKey);
  const structuredContentHtml = structuredTablesHtml || gypsumHtml || sulfurHtml
    ? `<div class="spacing"></div>${sulfurHtml}${gypsumHtml}${structuredTablesHtml}`
    : "";
  const headerHtml = buildReportPrintHeaderHtml(printableRecommendation, logoUrl);
  const identificationHtml = buildReportIdentificationHtml(printableRecommendation, documentKey);
  const signatureHtml = buildReportSignatureHtml(printableRecommendation);

  const doc = printWindow.document;
  doc.open();
  doc.write(`<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Laudo Técnico</title>
    <style>
      @page { size: A4 portrait; margin: 12mm 15mm 18mm; }
      body { font-family: Aptos, Calibri, Arial, sans-serif; margin: 0; line-height: 1.55; color: #000; font-size: 10pt; }
      .recommendation-print-document { font-family: Aptos, Calibri, Arial, sans-serif; font-size: 10pt; }
      h1 { margin: 0 0 14px; font-size: 14pt; text-align: center; }
      h2 { margin: 20px 0 8px; font-size: 12pt; }
      p { margin: 0; white-space: pre-wrap; }
      .technical-warning { color: #c2410c; font-size: 9pt; margin: 6px 0; }
      .table-notes { margin: 4px 0 8px; font-size: 9pt; }
      .table-notes p { margin: 3px 0; }
      .spacing { height: 12px; }
      table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 9pt; }
      th, td { border: 1px solid #000; padding: 6px 8px; text-align: left; vertical-align: top; white-space: pre-wrap; }
      th { font-weight: 700; background: #f2f2f2; }
      .report-page-frame { width: 100%; border: 0; border-collapse: collapse; margin: 0; font-size: inherit; }
      .report-page-frame > thead { display: table-header-group; }
      .report-page-frame > thead > tr > td,
      .report-page-frame > tbody > tr > td { border: 0; padding: 0; }
      .report-page-frame > tbody > tr { break-inside: auto; page-break-inside: auto; }
      .report-print-header { height: 20mm; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #777; padding-bottom: 2mm; margin-bottom: 5mm; background: #fff; }
      .report-print-header img { width: 18mm; height: 18mm; object-fit: contain; }
      .report-print-header-details { text-align: right; font-size: 8.5pt; line-height: 1.35; }
      .report-identification { border: 1px solid #777; padding: 12px; margin-bottom: 18px; break-inside: avoid; page-break-inside: avoid; }
      .report-identification-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 18px; }
      .identification-row { min-width: 0; }
      .report-signature { width: 75mm; margin: 16mm 0 0 auto; text-align: center; break-inside: avoid; page-break-inside: avoid; }
      .signature-line { border-top: 1px solid #000; margin-bottom: 5px; }
      h1, h2 { break-after: avoid; page-break-after: avoid; }
      table, tr, .table-notes, .technical-warning { break-inside: avoid; page-break-inside: avoid; }
      @media print {
        body, .recommendation-print-document { font-family: Aptos, Calibri, Arial, sans-serif; font-size: 10pt; }
        table { font-size: 10pt; }
      }
    </style>
  </head>
  <body>
    <table class="report-page-frame">
      <thead><tr><td>${headerHtml}</td></tr></thead>
      <tbody><tr><td>
        ${identificationHtml}
        <div class="recommendation-print-document">${contentHtml}${technicalWarningsHtml}${structuredContentHtml}</div>
      </td></tr></tbody>
    </table>
    ${signatureHtml}
  </body>
</html>`);
  doc.close();
};
