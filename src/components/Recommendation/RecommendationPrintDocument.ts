import type { RecommendationPrintResponse } from "@/interfaces/Recommendation";

import {
  buildFormulatedPlantingFertilizerTableModels,
  buildFormulatedTopDressingFertilizerTableModels,
  type FormulatedFertilizerPrintTableModel,
} from "./FormulatedPlantingFertilizerTable";
import {
  buildMicronutrientFertilizerTableModel,
  type RecommendationPrintTableModel,
} from "./MicronutrientFertilizerTable";
import {
  detectRecommendationSpacingMode,
  parseRecommendationReportBlocks,
} from "./RecommendationReportViewer";
import {
  formatRecommendationTableCell,
  getRecommendationTableDisplay,
} from "./recommendationColumnDecision";

type StructuredPrintTableModel =
  | RecommendationPrintTableModel
  | FormulatedFertilizerPrintTableModel;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const getStructuredPrintTableModels = (
  recommendation: RecommendationPrintResponse,
): StructuredPrintTableModel[] => {
  const micronutrientTable = buildMicronutrientFertilizerTableModel(recommendation);

  return [
    ...buildFormulatedPlantingFertilizerTableModels(recommendation),
    ...buildFormulatedTopDressingFertilizerTableModels(recommendation),
    ...(micronutrientTable ? [micronutrientTable] : []),
  ];
};

const renderStructuredTableHtml = (model: StructuredPrintTableModel) => {
  const headerHtml = `<thead><tr>${model.headers
    .map((header) => `<th>${escapeHtml(formatRecommendationTableCell(header))}</th>`)
    .join("")}</tr></thead>`;
  const bodyHtml = `<tbody>${model.rows
    .map((row) =>
      `<tr>${row
        .map((cell) => `<td>${escapeHtml(formatRecommendationTableCell(cell))}</td>`)
        .join("")}</tr>`,
    )
    .join("")}</tbody>`;
  const warningsHtml = "warnings" in model && model.warnings.length
    ? model.warnings
        .map((warning) => `<p class="technical-warning">${escapeHtml(warning)}</p>`)
        .join("")
    : "";

  return `<h2>${escapeHtml(model.title)}</h2><table>${headerHtml}${bodyHtml}</table>${warningsHtml}`;
};

const renderReportTextHtml = (text: string) => {
  const blocks = parseRecommendationReportBlocks(text);
  const spacingMode = detectRecommendationSpacingMode(text);

  return blocks
    .map((block) => {
      if (block.type === "spacing") {
        return '<div class="spacing"></div>';
      }

      if (block.type === "heading") {
        return `<h2>${escapeHtml(block.content)}</h2>`;
      }

      if (block.type === "table") {
        const display = getRecommendationTableDisplay(block.rows, spacingMode);
        const [headerRow, ...bodyRows] = display.rows;
        const headerHtml = headerRow
          ? `<thead><tr>${headerRow.map((cell) => `<th>${escapeHtml(formatRecommendationTableCell(cell))}</th>`).join("")}</tr></thead>`
          : "";
        const bodyHtml = `<tbody>${bodyRows
          .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(formatRecommendationTableCell(cell))}</td>`).join("")}</tr>`)
          .join("")}</tbody>`;
        const warningHtml = display.warning ? `<p class="technical-warning">${escapeHtml(display.warning)}</p>` : "";
        return `${warningHtml}<table>${headerHtml}${bodyHtml}</table>`;
      }

      return `<p>${escapeHtml(block.content)}</p>`;
    })
    .join("");
};

export const writePrintableReport = (
  printWindow: Window,
  text: string,
  printableRecommendation: RecommendationPrintResponse,
) => {
  const contentHtml = renderReportTextHtml(text);
  const structuredTablesHtml = getStructuredPrintTableModels(printableRecommendation)
    .map(renderStructuredTableHtml)
    .join("");
  const structuredContentHtml = structuredTablesHtml
    ? `<div class="spacing"></div>${structuredTablesHtml}`
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
      .spacing { height: 12px; }
      table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 10pt; }
      th, td { border: 1px solid #000; padding: 8px 10px; text-align: left; vertical-align: top; white-space: pre-wrap; }
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
    <div class="recommendation-print-document">${contentHtml}${structuredContentHtml}</div>
    <div class="footer">Documento emitido pelo sistema FertIntelligence.</div>
  </body>
</html>`);
  doc.close();
};
