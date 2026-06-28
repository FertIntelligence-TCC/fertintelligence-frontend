import type { RecommendationApplicationUnit } from "@/interfaces/Recommendation";

export type LocalizedDoseLabel = "g/m linear" | "g/cova";

export type LocalizedDose = {
  label: LocalizedDoseLabel;
  value: string;
};

export type RecommendationLineRecord = Record<string, unknown>;

type LocalizedDoseFields = {
  linearDose: readonly string[];
  holeDose: readonly string[];
  unit: readonly string[];
};

export const LOCALIZED_APPLICATION_COLUMN_LABEL = "Aplicação localizada";

const formatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 4,
});

export const normalizeRecommendationText = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  if (typeof value === "number") return formatter.format(value);
  if (typeof value === "string") return value.trim();
  return "";
};

export const getFirstRecommendationText = (
  line: RecommendationLineRecord,
  fields: readonly string[],
): string => {
  for (const field of fields) {
    const text = normalizeRecommendationText(line[field]);
    if (text) return text;
  }

  return "";
};

export const normalizeLocalizedApplicationUnit = (
  value: string,
): RecommendationApplicationUnit | "" => {
  const unit = value.trim().toUpperCase();
  if (["G_M_LINEAR", "G/M", "G_M", "GRAMAS_M_LINEAR"].includes(unit)) return "G_M_LINEAR";
  if (["G_COVA", "G/COVA", "GRAMAS_COVA"].includes(unit)) return "G_COVA";
  return "";
};

export const getLocalizedDose = (
  line: RecommendationLineRecord,
  fields: LocalizedDoseFields,
): LocalizedDose | null => {
  const unit = normalizeLocalizedApplicationUnit(getFirstRecommendationText(line, fields.unit));

  if (unit === "G_M_LINEAR") {
    return { label: "g/m linear", value: getFirstRecommendationText(line, fields.linearDose) || "-" };
  }

  if (unit === "G_COVA") {
    return { label: "g/cova", value: getFirstRecommendationText(line, fields.holeDose) || "-" };
  }

  const linearDose = getFirstRecommendationText(line, fields.linearDose);
  if (linearDose) return { label: "g/m linear", value: linearDose };

  const holeDose = getFirstRecommendationText(line, fields.holeDose);
  if (holeDose) return { label: "g/cova", value: holeDose };

  return null;
};

export const getLocalizedColumnLabel = (localizedDoses: (LocalizedDose | null)[]) => {
  const labels = Array.from(
    new Set(localizedDoses.map((dose) => dose?.label).filter((label): label is LocalizedDoseLabel => Boolean(label))),
  );
  return labels.length === 1 ? labels[0] : LOCALIZED_APPLICATION_COLUMN_LABEL;
};

export const formatLocalizedDoseForColumn = (
  localizedDose: LocalizedDose | null,
  columnLabel: string,
): string => {
  if (!localizedDose) return "-";

  return columnLabel === LOCALIZED_APPLICATION_COLUMN_LABEL
    ? `${localizedDose.value} ${localizedDose.label}`
    : localizedDose.value;
};
