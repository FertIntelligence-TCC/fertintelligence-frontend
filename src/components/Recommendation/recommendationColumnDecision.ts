import { LOCALIZED_APPLICATION_COLUMN_LABEL } from "@/utils/recommendationLocalizedDose";

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

const getFirstDisplayValue = (row: string[], columns: number[]) => {
  for (const column of columns) {
    const value = formatRecommendationTableCell(row[column]);
    if (hasDisplayValue(value)) return value;
  }

  return "";
};

const getLocalizedApplicationCell = (
  row: string[],
  spacingMode: RecommendationSpacingMode,
  gramPerMeterColumns: number[],
  gramPerHoleColumns: number[],
) => {
  const gramPerMeterValue = getFirstDisplayValue(row, gramPerMeterColumns);
  const gramPerHoleValue = getFirstDisplayValue(row, gramPerHoleColumns);

  if (gramPerMeterValue && gramPerHoleValue) {
    return spacingMode === "holes"
      ? `${gramPerHoleValue} g/cova`
      : `${gramPerMeterValue} g/m linear`;
  }

  if (gramPerMeterValue) return `${gramPerMeterValue} g/m linear`;
  if (gramPerHoleValue) return `${gramPerHoleValue} g/cova`;
  return "-";
};

const mergeLocalizedApplicationColumns = (
  rows: string[][],
  spacingMode: RecommendationSpacingMode,
  gramPerMeterColumns: number[],
  gramPerHoleColumns: number[],
): string[][] => {
  const localizedColumns = [...gramPerMeterColumns, ...gramPerHoleColumns].sort((a, b) => a - b);
  const firstLocalizedColumn = localizedColumns[0];
  const hiddenColumns = new Set(localizedColumns.filter((column) => column !== firstLocalizedColumn));

  return rows.map((row, rowIndex) =>
    row
      .map((cell, index) => {
        if (index !== firstLocalizedColumn) return cell;
        if (rowIndex === 0) return LOCALIZED_APPLICATION_COLUMN_LABEL;
        return getLocalizedApplicationCell(row, spacingMode, gramPerMeterColumns, gramPerHoleColumns);
      })
      .filter((_, index) => !hiddenColumns.has(index)),
  );
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

  if (spacingMode === "UNKNOWN") {
    return {
      rows: mergeLocalizedApplicationColumns(rows, spacingMode, gramPerMeterColumns, gramPerHoleColumns),
      warning:
        "Modo de espaçamento não identificado no laudo retornado pelo backend; exibindo a unidade localizada preenchida em cada linha.",
    };
  }

  const hasMixedLocalizedRows = rows.slice(1).some((row) => {
    const hasGramPerMeterValue = Boolean(getFirstDisplayValue(row, gramPerMeterColumns));
    const hasGramPerHoleValue = Boolean(getFirstDisplayValue(row, gramPerHoleColumns));
    return hasGramPerMeterValue !== hasGramPerHoleValue;
  });

  if (hasMixedLocalizedRows) {
    return {
      rows: mergeLocalizedApplicationColumns(rows, spacingMode, gramPerMeterColumns, gramPerHoleColumns),
    };
  }

  const columnDisplayDecision =
    {
      hiddenColumns: spacingMode === "linear" ? gramPerHoleColumns : gramPerMeterColumns,
      warning: undefined,
    };

  const hiddenColumns = new Set(columnDisplayDecision.hiddenColumns);
  if (hiddenColumns.size === 0) return { rows };

  return {
    rows: rows.map((row) => row.filter((_, index) => !hiddenColumns.has(index))),
    warning: columnDisplayDecision.warning,
  };
};
