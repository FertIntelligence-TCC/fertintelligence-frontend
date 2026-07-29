import type { RecommendationResponse } from "@/interfaces/Recommendation";

export type ReportDocumentKey = "general" | "summary" | "direct" | "shopping";

const unavailableValues = new Set([
  "",
  "-",
  "n/a",
  "nao informado",
  "nao informada",
  "null",
  "undefined",
]);

const normalizeComparableValue = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[.\s]+$/g, "")
    .trim();

export const normalizeReportOptionalValue = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  const text = String(value).trim();
  return unavailableValues.has(normalizeComparableValue(text)) ? "" : text;
};

export const formatReportDate = (value: unknown): string => {
  const normalized = normalizeReportOptionalValue(value);
  if (!normalized) return "";
  const isoMatch = normalized.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;
  if (typeof value !== "object") return normalized;
  const date = value as { day?: number; month?: number; year?: number };
  if (!date.day || !date.month || !date.year) return "";
  return `${String(date.day).padStart(2, "0")}/${String(date.month).padStart(2, "0")}/${date.year}`;
};

export const getRecommendationTypeLabel = (type?: string | null): string => {
  if (type === "FERTILIZATION") return "ADUBAÇÃO";
  if (type === "ACIDITY_OR_SALINITY_CORRECTION") return "CORREÇÃO DO SOLO";
  if (type === "BOTH") return "ADUBAÇÃO E CORREÇÃO DO SOLO";
  return "";
};

const reportTitlePrefix: Record<ReportDocumentKey, string> = {
  general: "RELATÓRIO GERAL DA RECOMENDAÇÃO",
  summary: "RELATÓRIO RESUMIDO DA RECOMENDAÇÃO",
  direct: "RELATÓRIO DIRETO DA RECOMENDAÇÃO",
  shopping: "LISTA DE COMPRAS DA RECOMENDAÇÃO",
};

export type ReportPresentationRow = {
  label: string;
  value: string;
};

export const getReportHeaderRows = (
  recommendation?: RecommendationResponse | null,
): ReportPresentationRow[] => {
  if (!recommendation) return [];
  return [
    { label: "Nome", value: normalizeReportOptionalValue(recommendation.responsavel_tecnico_relatorio) },
    {
      label: "Telefone/WhatsApp",
      value: normalizeReportOptionalValue(recommendation.telefone_responsavel_relatorio),
    },
    { label: "E-mail", value: normalizeReportOptionalValue(recommendation.email_responsavel_relatorio) },
  ].filter((row) => row.value);
};

export const getReportIdentification = (
  recommendation: RecommendationResponse,
  documentKey: ReportDocumentKey,
): { title: string; rows: ReportPresentationRow[] } => {
  const typeLabel = getRecommendationTypeLabel(
    recommendation.tipo_recomendacao ?? recommendation.tipoRecomendacao,
  );
  const municipality = normalizeReportOptionalValue(recommendation.municipio_relatorio);
  const state = normalizeReportOptionalValue(recommendation.uf_relatorio);
  const municipalityState = municipality && state ? `${municipality} – ${state}` : municipality || state;
  const area = recommendation.area_avaliada_ha_relatorio;
  const areaLabel = typeof area === "number" && Number.isFinite(area)
    ? `${area.toLocaleString("pt-BR", { maximumFractionDigits: 4 })} ha`
    : "";

  return {
    title: typeLabel ? `${reportTitlePrefix[documentKey]} DE ${typeLabel}` : reportTitlePrefix[documentKey],
    rows: [
      { label: "Cliente/Produtor", value: normalizeReportOptionalValue(recommendation.cliente_produtor_relatorio) },
      {
        label: "Propriedade",
        value: normalizeReportOptionalValue(recommendation.propriedade_relatorio ?? recommendation.nome_propriedade),
      },
      { label: "Município/UF", value: municipalityState },
      {
        label: "Talhão Nº",
        value: normalizeReportOptionalValue(recommendation.talhao_relatorio ?? recommendation.identificacao_talhao),
      },
      { label: "Área avaliada", value: areaLabel },
      { label: "Cultura prevista", value: normalizeReportOptionalValue(recommendation.cultura) },
      { label: "Safra/Safrinha", value: normalizeReportOptionalValue(recommendation.ano_safra) },
      { label: "Data de plantio", value: formatReportDate(recommendation.data_plantio) },
      {
        label: "Responsável técnico",
        value: normalizeReportOptionalValue(recommendation.responsavel_tecnico_relatorio),
      },
      {
        label: "Registro profissional",
        value: normalizeReportOptionalValue(recommendation.registro_profissional_relatorio),
      },
      { label: "Data de emissão", value: formatReportDate(recommendation.data_emissao_relatorio) },
    ].filter((row) => row.value),
  };
};
