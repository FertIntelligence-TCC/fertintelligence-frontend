import type { RecommendationPrintResponse } from "@/interfaces/Recommendation";

import {
  buildFormulatedPlantingFertilizerTableModels,
  buildFormulatedTopDressingFertilizerTableModels,
  type FormulatedFertilizerPrintTableModel,
} from "./FormulatedPlantingFertilizerTable";
import {
  buildAlternativeFertilizerTableModels,
  buildGypsumRecommendationPrintModel,
  buildSulfurRecommendationPrintModel,
  type AlternativeFertilizerPrintTableModel,
} from "./RecommendationStructuredFertilizerTables";
import {
  buildMicronutrientFertilizerTableModel,
  type RecommendationPrintTableModel,
} from "./MicronutrientFertilizerTable";
import { parseRecommendationReportBlocks } from "./RecommendationReportViewer";
import { formatRecommendationTableCell } from "./recommendationColumnDecision";

type StructuredPrintTableModel =
  | RecommendationPrintTableModel
  | FormulatedFertilizerPrintTableModel
  | AlternativeFertilizerPrintTableModel;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

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
  Array.from(
    new Set(
      technicalWarningFields
        .map((field) => {
          const value = (recommendation as unknown as Record<string, unknown>)[field];
          return typeof value === "string" ? value.trim() : "";
        })
        .filter(Boolean),
    ),
  );

const getStructuredPrintTableModels = (
  recommendation: RecommendationPrintResponse,
): StructuredPrintTableModel[] => {
  const micronutrientTable = buildMicronutrientFertilizerTableModel(recommendation);

  return [
    ...buildFormulatedPlantingFertilizerTableModels(recommendation),
    ...buildFormulatedTopDressingFertilizerTableModels(recommendation),
    ...buildAlternativeFertilizerTableModels(recommendation),
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
  const headerHtml = `<thead><tr>${headers
    .map((header) => `<th>${escapeHtml(formatRecommendationTableCell(header))}</th>`)
    .join("")}</tr></thead>`;
  const bodyHtml = `<tbody>${rows
    .map((row) =>
      `<tr>${row
        .map((cell) => `<td>${escapeHtml(formatRecommendationTableCell(cell))}</td>`)
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
        return `<p class="technical-warning">${escapeHtml(block.content)}</p>`;
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
  const technicalWarningsHtml = getPrintableTechnicalWarnings(printableRecommendation)
    .map((warning) => `<p class="technical-warning"><strong>Aviso técnico:</strong> ${escapeHtml(warning)}</p>`)
    .join("");
  const structuredTablesHtml = getStructuredPrintTableModels(printableRecommendation)
    .map(renderStructuredTableHtml)
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
    <div class="recommendation-print-document">${contentHtml}${technicalWarningsHtml}${structuredContentHtml}</div>
    <div class="footer">Documento emitido pelo sistema FertIntelligence.</div>
  </body>
</html>`);
  doc.close();
};
