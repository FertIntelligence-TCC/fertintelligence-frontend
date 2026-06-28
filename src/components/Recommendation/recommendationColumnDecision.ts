export type RecommendationSpacingMode = "linear" | "holes" | "UNKNOWN";

type RecommendationTableDisplay = {
  rows: string[][];
  warning?: string;
};

const isGramPerMeterHeader = (value: string) => /\bg\s*\/\s*m(?:\b|\s|$)/i.test(value) && !/\bg\s*\/\s*ml\b/i.test(value);

const isGramPerHoleHeader = (value: string) => /\bg\s*\/\s*cova\b/i.test(value);

export const formatRecommendationTableCell = (value: string | undefined) => {
  const normalizedValue = value?.trim();
  return normalizedValue || "-";
};

const hasDisplayValue = (value: string | undefined) => {
  const displayValue = formatRecommendationTableCell(value);
  return displayValue !== "-" && displayValue !== "—";
};

const countFilledCells = (rows: string[][], columns: number[]) =>
  rows.slice(1).reduce((total, row) => total + columns.filter((column) => hasDisplayValue(row[column])).length, 0);

const getUnknownSpacingHiddenColumns = (
  rows: string[][],
  gramPerMeterColumns: number[],
  gramPerHoleColumns: number[],
): { hiddenColumns: number[]; warning: string } => {
  const filledGramPerMeterCells = countFilledCells(rows, gramPerMeterColumns);
  const filledGramPerHoleCells = countFilledCells(rows, gramPerHoleColumns);
  const showHoleColumns = filledGramPerHoleCells > filledGramPerMeterCells;

  return {
    hiddenColumns: showHoleColumns ? gramPerMeterColumns : gramPerHoleColumns,
    warning: showHoleColumns
      ? "Modo de espaçamento não identificado no laudo retornado pelo backend; exibindo apenas g/cova porque essa coluna possui dados preenchidos."
      : "Modo de espaçamento não identificado no laudo retornado pelo backend; exibindo apenas g/m para evitar duplicidade com g/cova.",
  };
};

export const getRecommendationTableDisplay = (
  rows: string[][],
  spacingMode: RecommendationSpacingMode,
): RecommendationTableDisplay => {
  const [headerRow] = rows;
  if (!headerRow) return { rows };

  const gramPerMeterColumns = headerRow
    .map((cell, index) => (isGramPerMeterHeader(cell) ? index : -1))
    .filter((index) => index >= 0);
  const gramPerHoleColumns = headerRow
    .map((cell, index) => (isGramPerHoleHeader(cell) ? index : -1))
    .filter((index) => index >= 0);
  const hasBothUnitColumns = gramPerMeterColumns.length > 0 && gramPerHoleColumns.length > 0;

  if (!hasBothUnitColumns) return { rows };

  const displayDecision =
    spacingMode === "UNKNOWN"
      ? getUnknownSpacingHiddenColumns(rows, gramPerMeterColumns, gramPerHoleColumns)
      : {
          hiddenColumns: spacingMode === "linear" ? gramPerHoleColumns : gramPerMeterColumns,
          warning: undefined,
        };

  const hiddenColumns = new Set(displayDecision.hiddenColumns);
  if (hiddenColumns.size === 0) return { rows };

  return {
    rows: rows.map((row) => row.filter((_, index) => !hiddenColumns.has(index))),
    warning: displayDecision.warning,
  };
};
