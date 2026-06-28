export type RecommendationSpacingMode = "linear" | "holes" | "UNKNOWN";

const unknownSpacingModeMessage =
  "Modo de espaçamento não identificado no laudo retornado pelo backend; mantendo colunas g/m e g/cova para conferência técnica.";

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
