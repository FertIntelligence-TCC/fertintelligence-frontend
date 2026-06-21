import { useEffect, useMemo, useState, Dispatch, SetStateAction } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Flex,
  Heading,
  Spinner,
  Text,
  Dialog,
  IconButton,
  SimpleGrid,
  HStack,
  Badge,
  Accordion,
} from "@chakra-ui/react";
import { FiPlus, FiX, FiEye, FiEdit, FiTrash } from "react-icons/fi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import UserLayout from "@/components/Layouts/UserLayout";
import FertName from "@/components/FertName/FertName";
import ConfigMenu from "@/components/ConfigMenu/ConfigMenu";
import FertilizationTableFormFields from "@/components/FertilizationTable/FertilizationTableFormFields";
import type { AnalysisExtractOption } from "@/components/FertilizationTable/Sections/ParametersSection";
import TemporaryLimingCriterionSection from "@/components/FertilizationTable/TemporaryLimingCriterionSection";
import {
  DEFAULT_TABLE_STATE,
  FertilizationTableFormState,
  NutrientRangeRow,
  CropType,
  CropLabels,
  SpacingType,
} from "@/components/FertilizationTable/types";
import {
  createCropFertilizationTable,
  deleteCropFertilizationTable,
  fetchCropFertilizationTables,
  fetchDefaultCropFertilizationTables,
  updateCropFertilizationTable,
} from "@/services/cropFertilizationTableService";
import { useUserStore } from "@/stores/user/user.store";
import { isSupremeUser } from "@/utils/isSupremeUser";

// Services de orquestração e busca
import { createContentRange, fetchContentRangesByTable, updateContentRange, replaceContentRangesByNutrient } from "@/services/contentRangeService";
import { createCoverage, fetchCoveragesByRange, updateCoverage, deleteCoverage } from "@/services/coverageService";

import { CropFertilizationTableCreateRequestDto, CropFertilizationTableResponseDto, ContentRangeResponseDto, CoverageResponseDto } from "@/interfaces/CropFertilizationTable";
import { toaster } from "@/components/ui/toaster";
import { fetchManageableProperties, fetchMyProperties } from "@/services/propertyService";
import { propertyAccessRequestService } from "@/services/propertyAccessRequestService";
import { getPlotsByProperty } from "@/services/plotService";
import { soilAnalysisService } from "@/services/soilAnalysisService";
import { getAuthorizationRoleMode } from "@/interfaces/Authorization";
import type { PropertyResponse } from "@/interfaces/Property";
import type { PlotResponse } from "@/interfaces/Plot";
import { TipoExtrato, type SoilAnalysisResponse } from "@/interfaces/SoilAnalysis";
import { rangeExtractService } from "@/services/rangeExtractService";
import { layerExtractService } from "@/services/layerExtractService";
import { physicalAnalysisExtractService } from "@/services/physicalAnalysisExtractService";
import { fertilityAnalysisExtractService } from "@/services/fertilityAnalysisExtractService";
import type { PhysicalAnalysisExtractResponse } from "@/interfaces/PhysicalAnalysisExtract";
import type { FertilityAnalysisExtractResponse } from "@/interfaces/FertilityAnalysisExtract";

// Estrutura interna combinada (Pai + Filhos)

const LIMING_UNDEFINED_LABEL = "Não é possível definir um critério de calagem";

const formatExtractPosition = (extract: {
  profundidade_inicial?: number;
  profundidade_final?: number;
  camada?: string;
  subcamada?: number;
}) => {
  const depth =
    extract.profundidade_inicial !== undefined && extract.profundidade_final !== undefined
      ? `${extract.profundidade_inicial}-${extract.profundidade_final} cm`
      : undefined;
  const layer = extract.camada ? `Camada ${extract.camada}${extract.subcamada ? `.${extract.subcamada}` : ""}` : undefined;
  return [layer, depth].filter(Boolean).join(" • ");
};

const getAnalysisLabelPrefix = (analysis: SoilAnalysisResponse) =>
  `Análise ${analysis.ano_analise} • ${analysis.laboratorio_responsavel}`;

const mapPhysicalAnalysisOption = (
  extract: PhysicalAnalysisExtractResponse,
  analysis: SoilAnalysisResponse,
): AnalysisExtractOption => ({
  id: extract.id,
  label: `${getAnalysisLabelPrefix(analysis)}${formatExtractPosition(extract) ? ` • ${formatExtractPosition(extract)}` : ""}`,
});

const mapFertilityAnalysisOption = (
  extract: FertilityAnalysisExtractResponse,
  analysis: SoilAnalysisResponse,
): AnalysisExtractOption => ({
  id: extract.id,
  label: `${getAnalysisLabelPrefix(analysis)}${formatExtractPosition(extract) ? ` • ${formatExtractPosition(extract)}` : ""}`,
});

const getLimingCriterionLabel = (value: unknown) => {
  if (!value) return LIMING_UNDEFINED_LABEL;
  const text = String(value);
  const labels: Record<string, string> = {
    SATURACAO_POR_BASES_TROCAVEIS: "SATURAÇÃO POR BASES TROCÁVEIS",
    NEUTRALIZACAO_POR_ALUMINIO_TROCAVEL: "Neutralização do Al trocável",
    NEUTRALIZACAO_ALUMINIO_TROCAVEL: "Neutralização do Al trocável",
    ELEVACAO_DO_TEOR_DE_CALCIO_MAIS_MAGNESIO: "Elevação dos teores de Ca + Mg",
    ELEVACAO__DO_TEOR_DE_CALCIO_MAIS_MAGNESIO: "Elevação dos teores de Ca + Mg",
  };
  return labels[text] ?? text;
};

const optionalId = (value: string) => (value ? Number(value) : null);

interface HydratedTableData extends CropFertilizationTableResponseDto {
    rangesWithCoverages: (ContentRangeResponseDto & { coverages: CoverageResponseDto[] })[];
}

const normalizeSpacingType = (value: unknown): SpacingType => {
  const normalized = String(value ?? "").trim();
  const aliases: Record<string, SpacingType> = {
    PLANTAS_PER_LINEAR_METER: SpacingType.PLANTAS_POR_METRO_LINEAR,
    PLANTAS_POR_METRO_LINEAR: SpacingType.PLANTAS_POR_METRO_LINEAR,
    PLANTS_PER_LINEAR_METER: SpacingType.PLANTAS_POR_METRO_LINEAR,
    ENTRE_PLANTAS_COVAS: SpacingType.ENTRE_PLANTAS_COVAS,
    BETWEEN_PLANTS_OR_HOLES_IN_METERS: SpacingType.ENTRE_PLANTAS_COVAS,
  };

  if (Object.values(SpacingType).includes(normalized as SpacingType)) return normalized as SpacingType;
  return aliases[normalized] ?? SpacingType.ENTRE_PLANTAS_COVAS;
};

const getAlternativeSpacingMin = (data: Pick<CropFertilizationTableResponseDto, "valor_espacamento_usado">) =>
  data.valor_espacamento_usado ?? "";

const getAlternativeSpacingMax = (data: Pick<CropFertilizationTableResponseDto, "valor_espacamento_usado" | "valor_maximo_espacamento_usado">) =>
  data.valor_maximo_espacamento_usado ?? data.valor_espacamento_usado ?? "";

const canShowLinkedData = (data: CropFertilizationTableResponseDto) =>
  data.pode_visualizar_vinculos ?? data.canViewLinkedData ?? Boolean(data.nome_propriedade ?? data.propertyName ?? data.identificacao_talhao ?? data.plotIdentification ?? data.identificacao_analise_fisica ?? data.physicalAnalysisIdentification ?? data.identificacao_analise_fertilidade ?? data.fertilityAnalysisIdentification);

const formatAnalysisIdentification = (value: unknown) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  const analysis = value as { ano_analise?: number; laboratorio_responsavel?: string; id?: number };
  return [analysis.ano_analise, analysis.laboratorio_responsavel].filter(Boolean).join(" - ") || (analysis.id ? `Análise #${analysis.id}` : "");
};

/**
 * --- Mappers: Hydrated Data -> Form State ---
 */
const mapHydratedDataToForm = (
  data: HydratedTableData
): FertilizationTableFormState => {
  const makeRowId = (fallback?: unknown) =>
    String(
      fallback ??
        (typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : Math.random())
    );

  // Filtrar e Mapear Ranges
  const processRanges = (nutrientKey: "FOSFORO" | "POTASSIO" | "NITROGENIO") => {
      const ranges = data.rangesWithCoverages.filter(r => r.nutriente === nutrientKey);
      
      // Ordenar por ordem_teor
      ranges.sort((a, b) => a.ordem_teor - b.ordem_teor);

      return ranges.map(r => {
          const nutrientLabel = nutrientKey === "FOSFORO" ? "P2O5" : "K2O";

          let label = "";
          let operatorType: "less" | "between" | "more" = "between";

          if (r.menor_teor === null && r.maior_teor !== null) {
              label = `${nutrientLabel} < ${r.maior_teor}`;
              operatorType = "less";
          } else if (r.menor_teor !== null && r.maior_teor === null) {
              label = `${nutrientLabel} > ${r.menor_teor}`;
              operatorType = "more";
          } else if (r.menor_teor !== null && r.maior_teor !== null) {
              label = `${r.menor_teor} < ${nutrientLabel} < ${r.maior_teor}`;
              operatorType = "between";
          }

          return {
              id: makeRowId(r.id),
              contentRangeId: r.id,
              label,
              operatorType,
              plantio: r.aplicacao_recomendada_plantio == null ? "" : String(r.aplicacao_recomendada_plantio),
              coberturas: r.coverages
                .sort((a, b) => a.ordem_cobertura - b.ordem_cobertura)
                .map(c => ({
                  coverageId: c.id,
                  value: c.aplicacao_recomendada_cobertura == null ? "" : String(c.aplicacao_recomendada_cobertura)
                }))
          } as NutrientRangeRow;
      });
  };

  const faixasP = processRanges("FOSFORO");
  const faixasK = processRanges("POTASSIO");
  
  // Nitrogênio geralmente é 1 range, pegamos suas coberturas
  const nitroRange = data.rangesWithCoverages.find(r => r.nutriente === "NITROGENIO");
  const plantioN = nitroRange?.aplicacao_recomendada_plantio == null ? "" : String(nitroRange.aplicacao_recomendada_plantio);
  const coberturasN = nitroRange 
    ? nitroRange.coverages.sort((a, b) => a.ordem_cobertura - b.ordem_cobertura).map(c => c.aplicacao_recomendada_cobertura == null ? "" : String(c.aplicacao_recomendada_cobertura))
    : [""];

  // Calcular labels de colunas de cobertura baseado no máximo encontrado
  const maxCoverages = Math.max(
      coberturasN.length,
      ...faixasP.map(f => f.coberturas.length),
      ...faixasK.map(f => f.coberturas.length)
  );
  
  const coberturaLabels = Array.from({ length: maxCoverages }, (_, i) => `${i + 1}ª Cobertura`);

  return {
    id: data.id,
    nomeComum: data.nome_comum_cultura as CropType,
    nomeCientifico: data.nome_cientifico_cultura,
    regiao: data.regioes_cultura as any,
    cultivares: data.cultivares || "",

    espacamentoSugeridoTipo: SpacingType.ENTRE_LINHAS,
    espacamentoSugeridoMin: String(data.valor_inicial),
    espacamentoSugeridoMax: String(data.valor_final),

    espacamentoUsadoTipo: normalizeSpacingType(data.espacamento_usado),
    espacamentoUsadoMin: String(getAlternativeSpacingMin(data)),
    espacamentoUsadoMax: String(getAlternativeSpacingMax(data)),

    produtividadeRegional: String(data.produtividade_regional),
    produtividadeEsperada: String(data.produtividade_esperada),

    criterioCalagem: (data.criterio_de_calagem ?? "") as any,
    criterioCalagemIndicado: getLimingCriterionLabel(data.criterio_de_calagem_indicado ?? data.criterio_calagem_indicado ?? data.criterio_de_calagem),
    propertyId: String(data.propertyId ?? data.id_propriedade ?? ""),
    plotId: String(data.plotId ?? data.id_talhao ?? ""),
    physicalAnalysisId: String(data.id_analise_fisica ?? data.physicalAnalysisId ?? data.soilPhysicalAnalysisId ?? data.physicalAnalysisExtractId ?? data.id_extrato_analise_fisica ?? ""),
    fertilityAnalysisId: String(data.id_analise_fertilidade ?? data.fertilityAnalysisId ?? data.soilFertilityAnalysisId ?? data.fertilityAnalysisExtractId ?? data.id_extrato_analise_fertilidade ?? ""),
    linkedPropertyIdentification: canShowLinkedData(data) ? String(data.nome_propriedade ?? data.propertyName ?? "") : "",
    linkedPlotIdentification: canShowLinkedData(data) ? String(data.identificacao_talhao ?? data.plotIdentification ?? "") : "",
    linkedPhysicalAnalysisIdentification: canShowLinkedData(data) ? formatAnalysisIdentification(data.identificacao_analise_fisica ?? data.physicalAnalysisIdentification) : "",
    linkedFertilityAnalysisIdentification: canShowLinkedData(data) ? formatAnalysisIdentification(data.identificacao_analise_fertilidade ?? data.fertilityAnalysisIdentification) : "",
    showLinkedData: canShowLinkedData(data),

    sugestaoEstercoTipo: data.tipo_de_esterco as any,
    sugestaoEstercoQtd: String(data.quantidade_de_esterco),

    sugestaoGessagem: String(data.sugestao_gessagem),
    sugestaoAdubacaoComMicronutrientes: String(data.sugestao_de_adubacao_com_micronutrientes ?? ""),
    dosesMicronutrientes: {
      b: { min: String(data.dose_minima_b ?? ""), max: String(data.dose_maxima_b ?? "") },
      cu: { min: String(data.dose_minima_cu ?? ""), max: String(data.dose_maxima_cu ?? "") },
      fe: { min: String(data.dose_minima_fe ?? ""), max: String(data.dose_maxima_fe ?? "") },
      ni: { min: String(data.dose_minima_ni ?? ""), max: String(data.dose_maxima_ni ?? "") },
      mn: { min: String(data.dose_minima_mn ?? ""), max: String(data.dose_maxima_mn ?? "") },
      mo: { min: String(data.dose_minima_mo ?? ""), max: String(data.dose_maxima_mo ?? "") },
      zn: { min: String(data.dose_minima_zn ?? ""), max: String(data.dose_maxima_zn ?? "") },
    },

    coberturaLabels: coberturaLabels.length > 0 ? coberturaLabels : ["1ª Cobertura"],
    plantioN,
    coberturasN: coberturasN.length > 0 ? coberturasN : [""],

    faixasP,
    faixasK,
    observacoes: data.observacoes || "",
    fontes: data.fontes || "",
    tabelaPublica: Boolean(data.tabela_publica),
  };
};

const SCIENTIFIC_NAME_BY_CROP: Record<string, string> = {
  ALGODAO: "Gossypium_hirsutum",
  AMENDOIM: "Arachis_hypogaea",
  CANA_DE_ACUCAR: "Saccharum_officinarum",
  FEIJAO_CAUPI: "Vigna_unguiculata",
  FEIJAO_COMUM: "Phaseolus_vulgaris",
  GERGELIM: "Sesamum_indicum",
  MAMONA: "Ricinus_communis",
  MILHO: "Zea_mays",
  SISAL: "Agave_sisalana",
  SOJA: "Glycine_max",
};

const mapFormToRequest = (
  form: FertilizationTableFormState,
  _physicalAnalysisOptions: AnalysisExtractOption[],
  _fertilityAnalysisOptions: AnalysisExtractOption[]
): CropFertilizationTableCreateRequestDto => {
  const num = (v: unknown) => {
    const n = typeof v === "number" ? v : parseFloat(String(v));
    return Number.isFinite(n) ? n : 0;
  };

  return {
    nome_comum_cultura: form.nomeComum,
    nome_cientifico_cultura: SCIENTIFIC_NAME_BY_CROP[String(form.nomeComum)] ?? String(form.nomeCientifico).replace(/ /g, "_"),
    cultivares: form.cultivares,
    regioes_cultura: form.regiao,

    espacamentos_sugeridos: SpacingType.ENTRE_LINHAS,
    valor_inicial: num(form.espacamentoSugeridoMin),
    valor_final: num(form.espacamentoSugeridoMax),

    espacamento_usado: form.espacamentoUsadoTipo || SpacingType.ENTRE_PLANTAS_COVAS,
    valor_espacamento_usado: num(form.espacamentoUsadoMin),
    valor_maximo_espacamento_usado: num(form.espacamentoUsadoMax),

    produtividade_regional: num(form.produtividadeRegional),
    produtividade_esperada: num(form.produtividadeEsperada),

    criterio_de_calagem: form.criterioCalagem || null,
    propertyId: optionalId(form.propertyId),
    plotId: optionalId(form.plotId),
    physicalAnalysisId: optionalId(form.physicalAnalysisId),
    fertilityAnalysisId: optionalId(form.fertilityAnalysisId),
    id_analise_fisica: optionalId(form.physicalAnalysisId),
    id_analise_fertilidade: optionalId(form.fertilityAnalysisId),

    tipo_de_esterco: form.sugestaoEstercoTipo,
    quantidade_de_esterco: num(form.sugestaoEstercoQtd),

    sugestao_gessagem: num(form.sugestaoGessagem),
    sugestao_de_adubacao_com_micronutrientes: num(form.sugestaoAdubacaoComMicronutrientes),
    dose_minima_b: num(form.dosesMicronutrientes.b.min),
    dose_maxima_b: num(form.dosesMicronutrientes.b.max),
    dose_minima_cu: num(form.dosesMicronutrientes.cu.min),
    dose_maxima_cu: num(form.dosesMicronutrientes.cu.max),
    dose_minima_fe: num(form.dosesMicronutrientes.fe.min),
    dose_maxima_fe: num(form.dosesMicronutrientes.fe.max),
    dose_minima_ni: num(form.dosesMicronutrientes.ni.min),
    dose_maxima_ni: num(form.dosesMicronutrientes.ni.max),
    dose_minima_mn: num(form.dosesMicronutrientes.mn.min),
    dose_maxima_mn: num(form.dosesMicronutrientes.mn.max),
    dose_minima_mo: num(form.dosesMicronutrientes.mo.min),
    dose_maxima_mo: num(form.dosesMicronutrientes.mo.max),
    dose_minima_zn: num(form.dosesMicronutrientes.zn.min),
    dose_maxima_zn: num(form.dosesMicronutrientes.zn.max),

    observacoes: form.observacoes,
    fontes: form.fontes,
    tabela_publica: form.tabelaPublica,
  } as any;
};

const parseLabel = (label: string) => {
  const parseNumber = (value: string) => {
    const match = value.replace(",", ".").match(/-?\d+(?:\.\d+)?/);
    return match ? parseFloat(match[0]) : null;
  };

  let smallest: number | null = null;
  let largest: number | null = null;

  if (label.includes("<") && label.split("<").length === 3) {
    const parts = label.split("<");
    smallest = parseNumber(parts[0]);
    largest = parseNumber(parts[2]);
  } else if (label.includes("<")) {
    const parts = label.split("<");
    largest = parseNumber(parts[1]);
  } else if (label.includes(">")) {
    const parts = label.split(">");
    smallest = parseNumber(parts[1]);
  }

  return { smallest, largest };
};

const toNumberOrNull = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : parseFloat(String(value));
  return Number.isFinite(n) ? n : null;
};

const buildRangeBounds = (
  rows: NutrientRangeRow[],
  index: number,
  previousLargest: number | null
) => {
  const row = rows[index];
  const { smallest, largest } = parseLabel(row.label);
  const isLastRange = index === rows.length - 1;

  return {
    smallest: index === 0 ? smallest : previousLargest,
    largest: isLastRange ? null : largest,
    nextPreviousLargest: largest,
  };
};


const normalizeRangeRowsForSave = (rows: NutrientRangeRow[]) => {
  return [...rows].sort((a, b) => {
    const pa = parseLabel(a.label);
    const pb = parseLabel(b.label);

    const rank = (row: NutrientRangeRow) => {
      if (row.operatorType === "less") return 0;
      if (row.operatorType === "between") return 1;
      return 2;
    };

    const rankDiff = rank(a) - rank(b);
    if (rankDiff !== 0) return rankDiff;

    const aStart = pa.smallest ?? Number.NEGATIVE_INFINITY;
    const bStart = pb.smallest ?? Number.NEGATIVE_INFINITY;

    return aStart - bStart;
  });
};

const buildReplaceRangesPayload = (rows: NutrientRangeRow[]) => {
  const normalizedRows = normalizeRangeRowsForSave(rows);
  let previousLargest: number | null = null;

  return normalizedRows.map((row, index) => {
    const bounds = buildRangeBounds(normalizedRows, index, previousLargest);
    previousLargest = bounds.nextPreviousLargest;

    return {
      id: row.contentRangeId,
      ordem_teor: index + 1,
      menor_teor: bounds.smallest,
      maior_teor: bounds.largest,
      aplicacao_recomendada_plantio: toNumberOrNull(row.plantio),
      coberturas: row.coberturas.map((cell, coverageIndex) => ({
        id: cell.coverageId,
        ordem_cobertura: coverageIndex + 1,
        aplicacao_recomendada_cobertura: toNumberOrNull(cell.value),
      })),
    };
  });
};

const upsertCoverages = async (
  contentRangeId: number,
  coberturas: { coverageId?: number; value: string }[]
) => {
  const existingCoverages = (await fetchCoveragesByRange(contentRangeId))
    .sort((a, b) => a.ordem_cobertura - b.ordem_cobertura);

  const usedCoverageIds = new Set<number>();

  for (let i = 0; i < coberturas.length; i++) {
    const cell = coberturas[i];
    const existingByIndex = existingCoverages[i];
    const coverageId = cell.coverageId ?? existingByIndex?.id;

    const payload = {
      novo_ordem_cobertura: i + 1,
      novo_aplicacao_recomendada_cobertura: toNumberOrNull(cell.value),
    };

    if (coverageId) {
      usedCoverageIds.add(coverageId);
      await updateCoverage(coverageId, payload);
    } else {
      const created = await createCoverage(contentRangeId, {
        ordem_cobertura: i + 1,
        aplicacao_recomendada_cobertura: toNumberOrNull(cell.value),
      });
      usedCoverageIds.add(created.id);
    }
  }

  const coveragesToDelete = existingCoverages
    .filter((coverage) => !usedCoverageIds.has(coverage.id))
    .sort((a, b) => b.ordem_cobertura - a.ordem_cobertura);

  for (const coverage of coveragesToDelete) {
    await deleteCoverage(coverage.id);
  }
};

const updateExistingContentRangesWithCoverages = async (
  tableId: number,
  form: FertilizationTableFormState
) => {
  const currentRanges = await fetchContentRangesByTable(tableId);

  const nitroRange =
    currentRanges.find((r) => r.nutriente === "NITROGENIO") ?? null;

  if (nitroRange) {
    await updateContentRange(nitroRange.id, {
      novo_nutriente: "NITROGENIO",
      novo_ordem_teor: 1,
      novo_menor_teor: null,
      novo_maior_teor: null,
      novo_aplicacao_recomendada_plantio: toNumberOrNull(form.plantioN),
    });

    const existingNitroCoverages = await fetchCoveragesByRange(nitroRange.id);
    const nitroCells = form.coberturasN.map((value, index) => ({
      coverageId: existingNitroCoverages
        .sort((a, b) => a.ordem_cobertura - b.ordem_cobertura)[index]?.id,
      value,
    }));

    await upsertCoverages(nitroRange.id, nitroCells);
  } else {
    const createdNitroRange = await createContentRange(tableId, {
      nutriente: "NITROGENIO",
      ordem_teor: 1,
      menor_teor: null,
      maior_teor: null,
      aplicacao_recomendada_plantio: toNumberOrNull(form.plantioN),
    });

    await upsertCoverages(
      createdNitroRange.id,
      form.coberturasN.map((value) => ({ value }))
    );
  }

  await replaceContentRangesByNutrient(tableId, "FOSFORO", {
    faixas: buildReplaceRangesPayload(form.faixasP),
  });

  await replaceContentRangesByNutrient(tableId, "POTASSIO", {
    faixas: buildReplaceRangesPayload(form.faixasK),
  });
};

type Mode = "create" | "edit" | "view";

function TableCard(props: {
  table: CropFertilizationTableResponseDto;
  isSelected: boolean;
  onSelect: () => void;
  onView: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const { table, isSelected, onSelect, onView, onEdit, onDelete } = props;
  const cropLabel = CropLabels[table.nome_comum_cultura as CropType] || table.nome_comum_cultura;

  return (
    <Box
      borderWidth="1px"
      borderRadius="md"
      boxShadow="md"
      bg={{ base: "white", _dark: "gray.700" }}
      p={4}
      cursor="pointer"
      transition="all 0.2s"
      _hover={{ borderColor: "green.400", shadow: "lg" }}
      borderColor={isSelected ? "green.500" : "gray.200"}
      borderLeftWidth={isSelected ? "4px" : "1px"}
      onClick={onSelect}
      position="relative"
    >
      <Flex justify="space-between" align="start">
        <Box>
          <Badge colorPalette="green" mb={1}>{table.regioes_cultura}</Badge>
          <Text fontWeight="bold" fontSize="lg" color="green.700" _dark={{ color: "green.300" }}>
            {cropLabel}
          </Text>
          <Text fontSize="xs" color="gray.500" fontStyle="italic" mb={2}>
            {table.nome_cientifico_cultura}
          </Text>
        </Box>
      </Flex>
      
      <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }} mt={1}>
        <Text as="span" fontWeight="semibold">Cultivares:</Text> {table.cultivares || "Não informado"}
      </Text>

      {table.observacoes && (
        <Text fontSize="xs" color="gray.500" _dark={{ color: "gray.300" }} mt={2} lineClamp={2}>
          <Text as="span" fontWeight="semibold">Observações:</Text> {table.observacoes}
        </Text>
      )}

      {table.fontes && (
        <Text fontSize="xs" color="gray.500" _dark={{ color: "gray.300" }} mt={1} lineClamp={2}>
          <Text as="span" fontWeight="semibold">Fontes:</Text> {table.fontes}
        </Text>
      )}

      {isSelected && (
        <HStack justify="flex-end" gap={2} mt={4} animation="fade-in 0.2s">
          <IconButton
            size="sm"
            aria-label="Visualizar Dados"
            borderRadius="full"
            variant="ghost"
            colorPalette="blue"
            onClick={(e) => { e.stopPropagation(); onView(); }}
          >
            <FiEye />
          </IconButton>
          {onEdit && (
            <IconButton
              size="sm"
              aria-label="Editar"
              borderRadius="full"
              variant="ghost"
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
            >
              <FiEdit />
            </IconButton>
          )}
          {onDelete && (
            <IconButton
              size="sm"
              aria-label="Deletar"
              borderRadius="full"
              colorPalette="red"
              variant="ghost"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
            >
              <FiTrash />
            </IconButton>
          )}
        </HStack>
      )}
    </Box>
  );
}

type Props = {
  variant?: "mine" | "default";
};

export default function CropFertilizationTable({ variant = "mine" }: Props) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const user = useUserStore((s) => s.user);
  const isDefaultView = variant === "default";
  const isSupreme = isSupremeUser(user);
  const usesDefaultTables = isDefaultView;
  const canManage = !isDefaultView || isSupreme;
  const queryKey = usesDefaultTables ? ["crop-fertilization-tables-default"] : ["crop-fertilization-tables"];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false); // Spinner para carregamento de detalhes

  const [mode, setMode] = useState<Mode>("create");
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [activeTable, setActiveTable] = useState<CropFertilizationTableResponseDto | null>(null);

  const [createForm, setCreateForm] = useState<FertilizationTableFormState>(DEFAULT_TABLE_STATE);
  const [editForm, setEditForm] = useState<FertilizationTableFormState>(DEFAULT_TABLE_STATE);

  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [plots, setPlots] = useState<PlotResponse[]>([]);
  const [physicalAnalyses, setPhysicalAnalyses] = useState<AnalysisExtractOption[]>([]);
  const [fertilityAnalyses, setFertilityAnalyses] = useState<AnalysisExtractOption[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [loadingPlots, setLoadingPlots] = useState(false);
  const [loadingPhysicalAnalyses, setLoadingPhysicalAnalyses] = useState(false);
  const [loadingFertilityAnalyses, setLoadingFertilityAnalyses] = useState(false);

  const form = mode === "create" ? createForm : editForm;
  const setForm = mode === "create" ? setCreateForm : setEditForm;
  const isReadOnly = mode === "view"; 

  const modalTitle = useMemo(() => {
    if (mode === "create") return "Criar Tabela";
    if (mode === "edit") return "Editar Tabela";
    return "Visualizar Tabela";
  }, [mode]);

  useEffect(() => {
    if (!isModalOpen) return;

    const loadAccessibleProperties = () => {
      const roleMode = getAuthorizationRoleMode(user?.cargo);

      if (roleMode === "SUPREME" || roleMode === "MANAGER") {
        return fetchManageableProperties();
      }

      if (roleMode === "OWNER") {
        return fetchMyProperties();
      }

      return propertyAccessRequestService.getMyApprovedProperties();
    };

    setLoadingProperties(true);
    loadAccessibleProperties()
      .then(setProperties)
      .catch((error) => {
        console.error(error);
        toaster.create({ title: "Falha ao carregar propriedades.", type: "error" });
      })
      .finally(() => setLoadingProperties(false));
  }, [isModalOpen, user?.cargo]);

  useEffect(() => {
    if (!isModalOpen || !form.propertyId) {
      setPlots([]);
      return;
    }
    setLoadingPlots(true);
    getPlotsByProperty(Number(form.propertyId))
      .then(setPlots)
      .catch((error) => {
        console.error(error);
        toaster.create({ title: "Falha ao carregar talhões.", type: "error" });
      })
      .finally(() => setLoadingPlots(false));
  }, [isModalOpen, form.propertyId]);

  useEffect(() => {
    if (!isModalOpen || !form.plotId) {
      setPhysicalAnalyses([]);
      setFertilityAnalyses([]);
      return;
    }
    let isCurrent = true;
    setLoadingPhysicalAnalyses(true);
    setLoadingFertilityAnalyses(true);

    const loadAnalysisExtracts = async () => {
      try {
        const soilAnalyses = await soilAnalysisService.getByPlotId(form.plotId);
        const physicalOptions: AnalysisExtractOption[] = [];
        const fertilityOptions: AnalysisExtractOption[] = [];

        for (const analysis of soilAnalyses ?? []) {
          const isLayerAnalysis = analysis.tipo_extrato === TipoExtrato.CAMADAS;
          const containers = isLayerAnalysis
            ? await layerExtractService.getByAnalysisId(analysis.id)
            : await rangeExtractService.getByAnalysisId(analysis.id);

          if (!isCurrent) return;

          for (const container of containers ?? []) {
            const containerId = container.id;
            const [physicalExtracts, fertilityExtracts] = await Promise.all([
              isLayerAnalysis
                ? physicalAnalysisExtractService.getByLayerExtractId(containerId)
                : physicalAnalysisExtractService.getByRangeExtractId(containerId),
              isLayerAnalysis
                ? fertilityAnalysisExtractService.getByLayerExtractId(containerId)
                : fertilityAnalysisExtractService.getByRangeExtractId(containerId),
            ]);

            physicalOptions.push(...(physicalExtracts ?? []).map((extract) => mapPhysicalAnalysisOption(extract, analysis)));
            fertilityOptions.push(...(fertilityExtracts ?? []).map((extract) => mapFertilityAnalysisOption(extract, analysis)));
          }
        }

        if (!isCurrent) return;

        setPhysicalAnalyses(physicalOptions);
        setFertilityAnalyses(fertilityOptions);
      } catch (error) {
        console.error(error);
        if (isCurrent) toaster.create({ title: "Falha ao carregar extratos de análise do talhão.", type: "error" });
      } finally {
        if (isCurrent) {
          setLoadingPhysicalAnalyses(false);
          setLoadingFertilityAnalyses(false);
        }
      }
    };

    void loadAnalysisExtracts();

    return () => { isCurrent = false; };
  }, [isModalOpen, form.plotId]);

  const {
    data: tables = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey,
    queryFn: usesDefaultTables ? fetchDefaultCropFertilizationTables : fetchCropFertilizationTables,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCropFertilizationTable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      setIsDeleteOpen(false);
      setSelectedTableId(null);
      toaster.create({ title: "Tabela removida.", type: "success" });
    },
    onError: () => toaster.create({ title: "Erro ao remover tabela.", type: "error" }),
  });

  // --- LÓGICA DE HIDRATAÇÃO (Busca dados filhos sob demanda) ---
  const fetchAndHydrateTable = async (table: CropFertilizationTableResponseDto) => {
      setIsLoadingDetails(true);
      try {
          // 1. Buscar intervalos da tabela
          const ranges = await fetchContentRangesByTable(table.id);
          
          // 2. Buscar coberturas para cada intervalo
          const rangesWithCoverages = await Promise.all(ranges.map(async (range) => {
              const coverages = await fetchCoveragesByRange(range.id);
              return { ...range, coverages };
          }));

          // 3. Montar objeto completo
          const hydratedData: HydratedTableData = { ...table, rangesWithCoverages };
          
          // 4. Mapear para o formulário
          const formData = mapHydratedDataToForm(hydratedData);
          setEditForm(formData);
          
          // 5. Abrir Modal
          setIsModalOpen(true);
      } catch (error) {
          console.error(error);
          toaster.create({ title: "Erro ao carregar detalhes da tabela.", type: "error" });
      } finally {
          setIsLoadingDetails(false);
      }
  };

  const openCreate = () => {
    setMode("create");
    setActiveTable(null);
    setCreateForm(DEFAULT_TABLE_STATE);
    setIsModalOpen(true);
  };

  const openView = (table: CropFertilizationTableResponseDto) => {
    setMode("view");
    setActiveTable(table);
    fetchAndHydrateTable(table);
  };

  const openEdit = (table: CropFertilizationTableResponseDto) => {
    setMode("edit");
    setActiveTable(table);
    fetchAndHydrateTable(table);
  };

  const requestDelete = (table: any) => {
    setActiveTable(table);
    setIsDeleteOpen(true);
  };

  const handleTableSelection = (tableId: number) => {
    setSelectedTableId((prev) => (prev === tableId ? null : tableId));
  };

  const handleSave = async () => {
    if (isReadOnly) {
      setIsModalOpen(false);
      return;
    }

    const payloadTable = mapFormToRequest(form, physicalAnalyses, fertilityAnalyses);

    if (mode === "edit") {
      if (!activeTable) return;
      setIsOrchestrating(true);
      try {
        await updateCropFertilizationTable({ id: activeTable.id, payload: payloadTable });
        await updateExistingContentRangesWithCoverages(activeTable.id, form);

        queryClient.invalidateQueries({ queryKey });
        setIsModalOpen(false);
        toaster.create({ title: "Tabela atualizada com sucesso.", type: "success" });
      } catch (error) {
        console.error(error);
        toaster.create({ title: "Erro ao atualizar tabela.", type: "error" });
      } finally {
        setIsOrchestrating(false);
      }
      return;
    }

    setIsOrchestrating(true);
    try {
      const newTable = await createCropFertilizationTable(payloadTable);
      await updateExistingContentRangesWithCoverages(newTable.id, form);

      queryClient.invalidateQueries({ queryKey });
      setIsModalOpen(false);
      setCreateForm(DEFAULT_TABLE_STATE);
      toaster.create({ title: "Tabela criada com sucesso!", type: "success" });
    } catch (error) {
      console.error(error);
      toaster.create({ title: "Erro ao salvar tabela completa.", type: "error" });
    } finally {
      setIsOrchestrating(false);
    }
  };

  const handleConfirmDelete = () => {
    if (!activeTable) return;
    deleteMutation.mutate(activeTable.id);
  };

  const isSaving = isOrchestrating;

  const handleFormChange =
    (setter: Dispatch<SetStateAction<FertilizationTableFormState>>) =>
    (field: keyof FertilizationTableFormState, value: any) => {
      setter((prev) => {
        if (field === "propertyId") {
          return { ...prev, propertyId: value, plotId: "", physicalAnalysisId: "", fertilityAnalysisId: "", criterioCalagemIndicado: LIMING_UNDEFINED_LABEL };
        }
        if (field === "plotId") {
          return { ...prev, plotId: value, physicalAnalysisId: "", fertilityAnalysisId: "", criterioCalagemIndicado: LIMING_UNDEFINED_LABEL };
        }
        if (field === "fertilityAnalysisId") {
          return { ...prev, fertilityAnalysisId: value, criterioCalagemIndicado: value ? "SATURAÇÃO POR BASES TROCÁVEIS" : LIMING_UNDEFINED_LABEL };
        }
        return { ...prev, [field]: value };
      });
    };

  return (
    <UserLayout>
      <FertName subtitle={isDefaultView ? "Tabelas Padrão de Adubação" : "Tabelas de Adubação"} />
      <ConfigMenu />

      <Box pt={{ base: 16, md: 24 }} px={{ base: 4, md: 8 }} w="full">
        <Flex direction="column" gap={6}>
          <Button
            variant="outline"
            alignSelf="flex-start"
            onClick={() => navigate(isDefaultView ? "/fertintelligence/fertilization-table-management/default" : "/fertintelligence/fertilization-table-management")}
          >
            Voltar para o painel
          </Button>
          <Heading as="h1" size="lg" color="white">
            {canManage ? "Gerenciar Tabelas de Cultura" : "Tabelas Padrão de Cultura"}
          </Heading>
          <HStack>
            {canManage && (
              <Button
                alignSelf="flex-start"
                colorPalette="green"
                onClick={openCreate}
                display="inline-flex"
                alignItems="center"
                gap={2}
              >
                <FiPlus /> Nova Tabela
              </Button>
            )}
            <Button variant="outline" colorPalette="green" onClick={() => navigate("/fertintelligence/fertilization-table-management/crop-fertilization-table/public") }>
              Consultar tabelas públicas
            </Button>
          </HStack>

          {/* Loading de Hidratação Global (Overlay simples) */}
          {isLoadingDetails && (
              <Box position="fixed" inset={0} bg="blackAlpha.600" zIndex={2000} display="flex" justifyContent="center" alignItems="center">
                  <Spinner size="xl" color="white" />
              </Box>
          )}

          <Accordion.Root collapsible defaultValue={["list"]}>
            <Accordion.Item value="list">
              <Accordion.ItemTrigger>
                <Box flex="1" textAlign="left">
                  <Heading size="md">Tabelas de Adubação</Heading>
                </Box>
              </Accordion.ItemTrigger>
              <Accordion.ItemContent>
                <Accordion.ItemBody>
                  <Box mt={2}>
                    {isLoading ? (
                      <Flex justify="center" minH="200px" align="center"><Spinner color="white" size="lg" /></Flex>
                    ) : isError ? (
                      <Text color="red.300">Erro ao carregar tabelas.</Text>
                    ) : tables.length === 0 ? (
                      <Text color="white">Nenhuma tabela cadastrada.</Text>
                    ) : (
                      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
                        {tables.map((table: any) => (
                          <TableCard
                            key={table.id}
                            table={table}
                            isSelected={selectedTableId === table.id}
                            onSelect={() => handleTableSelection(table.id)}
                            onView={() => openView(table)}
                            onEdit={canManage ? () => openEdit(table) : undefined}
                            onDelete={canManage ? () => requestDelete(table) : undefined}
                          />
                        ))}
                      </SimpleGrid>
                    )}
                  </Box>
                </Accordion.ItemBody>
              </Accordion.ItemContent>
            </Accordion.Item>
          </Accordion.Root>
        </Flex>
      </Box>

      {/* --- Dialog Principal --- */}
      <Dialog.Root open={isModalOpen} onOpenChange={(e) => setIsModalOpen(e.open)} size="xl" scrollBehavior="inside" motionPreset="slide-in-bottom">
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content bg="white" _dark={{ bg: "gray.800" }}>
            <Dialog.Header>
              <Flex justify="space-between" align="center">
                <Dialog.Title>{modalTitle}</Dialog.Title>
                <Dialog.CloseTrigger asChild>
                  <IconButton size="sm" variant="ghost" aria-label="Fechar" onClick={() => setIsModalOpen(false)}>
                    <FiX />
                  </IconButton>
                </Dialog.CloseTrigger>
              </Flex>
            </Dialog.Header>

            <Dialog.Body py={6}>
              <FertilizationTableFormFields
                form={form}
                onFormChange={handleFormChange(setForm)}
                readOnly={isReadOnly}
                properties={properties}
                plots={plots}
                physicalAnalyses={physicalAnalyses}
                fertilityAnalyses={fertilityAnalyses}
                loadingProperties={loadingProperties}
                loadingPlots={loadingPlots}
                loadingPhysicalAnalyses={loadingPhysicalAnalyses}
                loadingFertilityAnalyses={loadingFertilityAnalyses}
              />
              {isReadOnly && activeTable && user?.id !== activeTable.id_criador && (
                <TemporaryLimingCriterionSection key={activeTable.id} tableId={activeTable.id} />
              )}
            </Dialog.Body>

            <Dialog.Footer borderTopWidth="1px" _dark={{ borderColor: "gray.700" }}>
              <Flex gap={3}>
                <Button onClick={() => setIsModalOpen(false)} colorPalette={isReadOnly ? "blue" : "red"} variant={isReadOnly ? "solid" : "ghost"}>
                  {isReadOnly ? "Fechar" : "Cancelar"}
                </Button>
                {!isReadOnly && (
                  <Button colorPalette="green" onClick={handleSave} loading={isSaving}>
                    Salvar
                  </Button>
                )}
              </Flex>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>

      {/* --- Dialog Exclusão --- */}
      <Dialog.Root open={isDeleteOpen} onOpenChange={(e) => setIsDeleteOpen(e.open)} role="alertdialog">
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content bg="white" _dark={{ bg: "gray.800" }}>
            <Dialog.Header><Dialog.Title>Excluir Tabela</Dialog.Title></Dialog.Header>
            <Dialog.Body>
              <Text>Tem certeza que deseja excluir a tabela de "
                <Text as="span" fontWeight="bold">{activeTable?.nome_comum_cultura}</Text>"?
              </Text>
              <Text fontSize="sm" color="gray.500" mt={2}>Esta ação não pode ser desfeita.</Text>
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={deleteMutation.isPending}>Cancelar</Button>
              <Button colorPalette="red" onClick={handleConfirmDelete} loading={deleteMutation.isPending} ml={3}>Excluir</Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </UserLayout>
  );
}
