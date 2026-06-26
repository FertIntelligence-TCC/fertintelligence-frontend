import { AxiosError } from "axios";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Heading,
  Input,
  Separator,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
  chakra,
} from "@chakra-ui/react";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog";

import UserLayout from "@/components/Layouts/UserLayout";
import FertName from "@/components/FertName/FertName";
import ConfigMenu from "@/components/ConfigMenu/ConfigMenu";
import { toaster } from "@/components/ui/toaster";
import type { PlotResponse } from "@/interfaces/Plot";
import type { PropertyResponse } from "@/interfaces/Property";
import type { AnnualCropFolderResponseDto } from "@/interfaces/AnnualCropFolder";
import type { CropResponseDto } from "@/interfaces/Crop";
import type { PhysicalAnalysisExtractResponse } from "@/interfaces/PhysicalAnalysisExtract";
import type { FertilityAnalysisExtractResponse } from "@/interfaces/FertilityAnalysisExtract";
import type { SaturationExtractAnalysisExtractResponse } from "@/interfaces/SaturationExtractAnalysisExtract";
import { TipoExtrato, type SoilAnalysisResponse } from "@/interfaces/SoilAnalysis";
import {
  type RecommendationLimingCriteria,
  type RecommendationTableGroup,
  type FertilizerSourceOption,
  type RecommendationCreatePayload,
  type RecommendationResponse,
  type RecommendationType,
  getRecommendationReportText,
} from "@/interfaces/Recommendation";
import { getPlotsByProperty } from "@/services/plotService";
import { fetchManageableProperties, fetchMyProperties } from "@/services/propertyService";
import { propertyAccessRequestService } from "@/services/propertyAccessRequestService";
import { getAuthorizationRoleMode } from "@/interfaces/Authorization";
import { getAllAnnualCropFoldersByPlot } from "@/services/annualCropFolderService";
import { getCropsByFolder } from "@/services/cropService";
import { soilAnalysisService } from "@/services/soilAnalysisService";
import { rangeExtractService } from "@/services/rangeExtractService";
import { layerExtractService } from "@/services/layerExtractService";
import { physicalAnalysisExtractService } from "@/services/physicalAnalysisExtractService";
import { fertilityAnalysisExtractService } from "@/services/fertilityAnalysisExtractService";
import { saturationExtractAnalysisExtractService } from "@/services/saturationExtractAnalysisExtractService";
import {
  fetchCropFertilizationTables,
  fetchDefaultCropFertilizationTables,
  fetchPublicCropFertilizationTables,
} from "@/services/cropFertilizationTableService";
import {
  fetchDefaultSoilFertilityTables,
  fetchPublicSoilFertilityTables,
  fetchSoilFertilityTables,
} from "@/services/soilFertilityInterpretationCriteriaTableService";
import {
  fetchDefaultFoliarTables,
  fetchFoliarTables,
  fetchPublicFoliarTables,
} from "@/services/foliarAnalysisInterpretationTableService";
import {
  deleteRecommendation,
  generateRecommendation,
  getRecommendation,
  getMyRecommendations,
  preparePrintRecommendation,
  improveRecommendationNarrative,
} from "@/services/recommendationService";
import { useUserStore } from "@/stores/user/user.store";
import { LuArrowLeft, LuFileText, LuFolder, LuListChecks, LuShoppingCart } from "react-icons/lu";
import RecommendationReportViewer, {
  parseRecommendationReportBlocks,
} from "@/components/Recommendation/RecommendationReportViewer";

const NativeSelect = chakra("select", {
  base: {
    borderWidth: "1px",
    borderRadius: "md",
    px: 3,
    h: 10,
    width: "100%",
    bg: "bg.panel",
  },
});

type TableSource = "PRIVATE" | "PUBLIC" | "DEFAULT";
type TableGroupValue = TableSource | "";

type TableOption = {
  id: number;
  label: string;
  source: TableSource;
};

type AnalysisExtractOption<TExtract = unknown> = {
  id: number;
  label: string;
  extract: TExtract;
};

type RecommendationDocumentKey = "general" | "summary" | "direct" | "shopping";
type RecommendationDocumentStatus = "generated" | "not_generated" | "loading" | "error";

type RecommendationDocumentView = {
  key: RecommendationDocumentKey;
  title: string;
  description: string;
  status: RecommendationDocumentStatus;
  content: string;
  icon: typeof LuFileText;
};

const documentUnavailableMessages: Record<RecommendationDocumentKey, string> = {
  general: "A Recomendação Geral ainda não possui technicalReport/laudo_tecnico retornado pelo backend.",
  summary: "Documento ainda não gerado. O frontend não possui endpoint real declarado para gerar/carregar a Recomendação Resumida.",
  direct: "Documento ainda não gerado. O frontend não possui endpoint real declarado para gerar/carregar a Recomendação Direta.",
  shopping: "Documento ainda não gerado. O frontend não possui endpoint real declarado para gerar/carregar a Lista de Compras.",
};

type RawTable = {
  id?: number;
  nome?: string;
  name?: string;
  nome_tabela?: string;
  nome_criterios?: string;
  nome_comum_cultura?: string;
  region?: string;
  regiao?: string;
  tabela_publica?: boolean;
  public_table?: boolean;
  publicTable?: boolean;
  public?: boolean;
};


const LIMING_UNDEFINED_LABEL = "Não é possível definir um critério de calagem";
const BASE_SATURATION_LABEL = "SATURAÇÃO POR BASES TROCÁVEIS";
const ALUMINUM_NEUTRALIZATION_LABEL = "Neutralização do Al trocável";
const CALCIUM_MAGNESIUM_LABEL = "Elevação dos teores de Ca + Mg";
const PRNT_WARNING = "Se o calcário comprado tiver PRNT diferente de 100%, corrija o valor de NC multiplicando-o pela expressão 100/PRNT.";

type LimingCriterionPreview = {
  criterionLabel: string;
  limingNeed: number | null;
  warning?: string;
};

const toNullableNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const normalized = typeof value === "string" ? value.trim().replace(",", ".") : value;
  const parsed = typeof normalized === "number" ? normalized : Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const calculateBaseSaturationLiming = (fertilityExtract?: FertilityAnalysisExtractResponse | null): LimingCriterionPreview => {
  const ctcPh7 = toNullableNumber(fertilityExtract?.ctc_ph7);
  const baseSaturation = toNullableNumber(fertilityExtract?.saturacao_bases_v);

  if (ctcPh7 === null || baseSaturation === null) {
    return { criterionLabel: LIMING_UNDEFINED_LABEL, limingNeed: null };
  }

  return {
    criterionLabel: BASE_SATURATION_LABEL,
    limingNeed: Math.max(0, (ctcPh7 * (70 - baseSaturation)) / 100),
    warning: PRNT_WARNING,
  };
};

const calculateClientLimingCriterion = ({
  physicalExtract,
  fertilityExtract,
}: {
  physicalExtract?: PhysicalAnalysisExtractResponse | null;
  fertilityExtract?: FertilityAnalysisExtractResponse | null;
}): LimingCriterionPreview => {
  if (!fertilityExtract) {
    return { criterionLabel: LIMING_UNDEFINED_LABEL, limingNeed: null };
  }

  const clayContent = toNullableNumber(physicalExtract?.teor_argila);
  if (!physicalExtract || clayContent === null) {
    return calculateBaseSaturationLiming(fertilityExtract);
  }

  const aluminum = toNullableNumber(fertilityExtract.aluminio);
  const calcium = toNullableNumber(fertilityExtract.calcio);
  const magnesium = toNullableNumber(fertilityExtract.magnesio);

  if (aluminum === null || calcium === null || magnesium === null) {
    return calculateBaseSaturationLiming(fertilityExtract);
  }

  const factor = clayContent < 150 ? 1.5 : clayContent <= 350 ? 2 : 2.5;
  const aluminumNeed = Math.max(0, factor * aluminum);
  const calciumMagnesiumNeed = Math.max(0, factor * (2 - (calcium + magnesium)));

  if (aluminumNeed >= calciumMagnesiumNeed) {
    return { criterionLabel: ALUMINUM_NEUTRALIZATION_LABEL, limingNeed: aluminumNeed };
  }

  return { criterionLabel: CALCIUM_MAGNESIUM_LABEL, limingNeed: calciumMagnesiumNeed };
};

const recommendationTypeOptions: { value: RecommendationType; label: string }[] = [
  { value: "ACIDITY_OR_SALINITY_CORRECTION", label: "Correção de acidez/salinidade" },
  { value: "FERTILIZATION", label: "Adubação" },
  { value: "BOTH", label: "Ambos" },
];

const fertilizerOriginOptions: { value: FertilizerSourceOption; label: string }[] = [
  { value: "DEFAULT", label: "Padrão" },
  { value: "PUBLIC", label: "Público" },
  { value: "PRIVATE", label: "Privado" },
  { value: "ALL", label: "Todos" },
];

const tableGroupOptions: { value: TableSource; label: string }[] = [
  { value: "PRIVATE", label: "Privadas" },
  { value: "PUBLIC", label: "Públicas" },
  { value: "DEFAULT", label: "Padrão" },
];

const recommendationTypeValues = recommendationTypeOptions.map((option) => option.value);
const fertilizerSourceValues = fertilizerOriginOptions.map((option) => option.value);
const legacyFertilizerSourceValues: FertilizerSourceOption[] = ["BOTH", "AMBAS"];
const tableGroupValues = tableGroupOptions.map((option) => option.value);

const isRecommendationType = (value: string): value is RecommendationType =>
  recommendationTypeValues.includes(value as RecommendationType);

const isFertilizerSourceOption = (value: string): value is FertilizerSourceOption =>
  fertilizerSourceValues.includes(value as FertilizerSourceOption) ||
  legacyFertilizerSourceValues.includes(value as FertilizerSourceOption);

const normalizeFertilizerSourceOption = (
  value: FertilizerSourceOption,
): FertilizerSourceOption => (legacyFertilizerSourceValues.includes(value) ? "ALL" : value);

const isRecommendationTableGroup = (value: TableGroupValue): value is RecommendationTableGroup =>
  tableGroupValues.includes(value as TableSource);

const canPrintRecommendation = (cargo?: string) => {
  const roleMode = getAuthorizationRoleMode(cargo);
  return roleMode === "SUPREME" || roleMode === "RESIDENT" || roleMode === "CONSULTANT";
};

const normalizeLimingCriteria = (criteria?: string | null): RecommendationLimingCriteria | undefined => {
  if (!criteria) return undefined;
  if (criteria === "PORCENTAGEM_DE_SATURACAO_DAS_BASES") return "SATURACAO_POR_BASES_TROCAVEIS";
  return criteria as RecommendationLimingCriteria;
};

const normalizeTable = (table: RawTable, fallbackSource: TableOption["source"]): TableOption | null => {
  if (!table?.id) return null;
  const isPublic = table.tabela_publica === true || table.public_table === true || table.publicTable === true || table.public === true;
  const source =
    fallbackSource === "DEFAULT" || !isPublic
      ? fallbackSource
      : "PUBLIC";
  const cropName = table.nome_comum_cultura ? ` • ${table.nome_comum_cultura}` : "";
  const region = table.regiao ?? table.region;
  const regionText = region ? ` (${region})` : "";
  const baseName = table.nome ?? table.name ?? table.nome_tabela ?? table.nome_criterios ?? `Tabela ${table.id}`;
  return { id: table.id, label: `${baseName}${cropName}${regionText}`, source };
};

const filterTablesByGroup = (tables: TableOption[], group: TableGroupValue) =>
  group ? tables.filter((table) => table.source === group) : [];

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
): AnalysisExtractOption<PhysicalAnalysisExtractResponse> => ({
  id: extract.id,
  label: `${getAnalysisLabelPrefix(analysis)}${formatExtractPosition(extract) ? ` • ${formatExtractPosition(extract)}` : ""}`,
  extract,
});

const mapFertilityAnalysisOption = (
  extract: FertilityAnalysisExtractResponse,
  analysis: SoilAnalysisResponse,
): AnalysisExtractOption<FertilityAnalysisExtractResponse> => ({
  id: extract.id,
  label: `${getAnalysisLabelPrefix(analysis)}${formatExtractPosition(extract) ? ` • ${formatExtractPosition(extract)}` : ""}`,
  extract,
});

const mapSaturationAnalysisOption = (
  extract: SaturationExtractAnalysisExtractResponse,
  analysis: SoilAnalysisResponse,
): AnalysisExtractOption<SaturationExtractAnalysisExtractResponse> => ({
  id: extract.id,
  label: `${getAnalysisLabelPrefix(analysis)}${formatExtractPosition(extract) ? ` • ${formatExtractPosition(extract)}` : ""}`,
  extract,
});

const getFolderLabel = (folder: AnnualCropFolderResponseDto) =>
  folder.ano_culturas ? `Pasta anual ${folder.ano_culturas}` : `Pasta ${folder.id}`;

const getCropLabel = (crop: CropResponseDto) =>
  [crop.nome?.replace(/_/g, " "), crop.variedade, crop.tipo_cultivo].filter(Boolean).join(" • ") || `Cultura ${crop.id}`;

const getRecommendationFolderName = (recommendation: RecommendationResponse) =>
  recommendation.nome_pasta_recomendacao?.trim() ||
  recommendation.nomePastaRecomendacao?.trim() ||
  `Recomendação #${recommendation.id}`;

const getDocumentStatusLabel = (status: RecommendationDocumentStatus) => {
  if (status === "generated") return "Gerado";
  if (status === "loading") return "Carregando";
  if (status === "error") return "Erro";
  return "Não gerado";
};

const getDocumentStatusColor = (status: RecommendationDocumentStatus) => {
  if (status === "generated") return "green";
  if (status === "loading") return "blue";
  if (status === "error") return "red";
  return "gray";
};

const writePrintableReport = (printWindow: Window, text: string) => {
  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const blocks = parseRecommendationReportBlocks(text);
  const contentHtml = blocks
    .map((block) => {
      if (block.type === "spacing") {
        return "<div class=\"spacing\"></div>";
      }

      if (block.type === "heading") {
        return `<h2>${escapeHtml(block.content)}</h2>`;
      }

      if (block.type === "table") {
        const [headerRow, ...bodyRows] = block.rows;
        const headerHtml = headerRow
          ? `<thead><tr>${headerRow.map((cell) => `<th>${escapeHtml(cell)}</th>`).join("")}</tr></thead>`
          : "";
        const bodyHtml = `<tbody>${bodyRows
          .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`)
          .join("")}</tbody>`;
        return `<table>${headerHtml}${bodyHtml}</table>`;
      }

      return `<p>${escapeHtml(block.content)}</p>`;
    })
    .join("");

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
      .spacing { height: 12px; }
      table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 10pt; }
      th, td { border: 1px solid #000; padding: 8px 10px; text-align: left; vertical-align: top; }
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
    <div class="recommendation-print-document">${contentHtml}</div>
    <div class="footer">Documento emitido pelo sistema FertIntelligence.</div>
  </body>
</html>`);
  doc.close();
};

export default function Recommendation() {
  const user = useUserStore((s) => s.user);
  const navigate = useNavigate();
  const userCanPrint = canPrintRecommendation(user?.cargo);


  const [recommendationType, setRecommendationType] = useState("");
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [selectedPlotId, setSelectedPlotId] = useState("");
  const [physicalAnalysisExtractId, setPhysicalAnalysisExtractId] = useState("");
  const [soilFertilityAnalysisId, setSoilFertilityAnalysisId] = useState("");
  const [saturationExtractAnalysisExtractId, setSaturationExtractAnalysisExtractId] = useState("");
  const [annualCropFolderId, setAnnualCropFolderId] = useState("");
  const [cropId, setCropId] = useState("");
  const [cropFertilizationTableGroup, setCropFertilizationTableGroup] = useState<TableGroupValue>("");
  const [soilFertilityInterpretationTableGroup, setSoilFertilityInterpretationTableGroup] = useState<TableGroupValue>("");
  const [cropFoliarAnalysisInterpretationTableGroup, setCropFoliarAnalysisInterpretationTableGroup] = useState<TableGroupValue>("");
  const [cropFertilizationTableId, setCropFertilizationTableId] = useState("");
  const [soilFertilityInterpretationTableId, setSoilFertilityInterpretationTableId] = useState("");
  const [cropFoliarAnalysisInterpretationTableId, setCropFoliarAnalysisInterpretationTableId] = useState("");
  const [fertilizerSourceOption, setFertilizerSourceOption] = useState<FertilizerSourceOption>("ALL");
  const [recommendationFolderName, setRecommendationFolderName] = useState("");

  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [plots, setPlots] = useState<PlotResponse[]>([]);
  const [physicalAnalysisOptions, setPhysicalAnalysisOptions] = useState<AnalysisExtractOption<PhysicalAnalysisExtractResponse>[]>([]);
  const [soilFertilityAnalysisOptions, setSoilFertilityAnalysisOptions] = useState<AnalysisExtractOption<FertilityAnalysisExtractResponse>[]>([]);
  const [saturationExtractAnalysisOptions, setSaturationExtractAnalysisOptions] = useState<AnalysisExtractOption<SaturationExtractAnalysisExtractResponse>[]>([]);
  const [annualCropFolders, setAnnualCropFolders] = useState<AnnualCropFolderResponseDto[]>([]);
  const [crops, setCrops] = useState<CropResponseDto[]>([]);
  const [cropFertilizationTables, setCropFertilizationTables] = useState<TableOption[]>([]);
  const [soilFertilityTables, setSoilFertilityTables] = useState<TableOption[]>([]);
  const [foliarInterpretationTables, setFoliarInterpretationTables] = useState<TableOption[]>([]);
  const [selectedRecommendation, setSelectedRecommendation] = useState<RecommendationResponse | null>(null);
  const [recommendationsHistory, setRecommendationsHistory] = useState<RecommendationResponse[]>([]);

  const [loadingProperties, setLoadingProperties] = useState(false);
  const [loadingPlots, setLoadingPlots] = useState(false);
  const [loadingPlotAnalyses, setLoadingPlotAnalyses] = useState(false);
  const [loadingAnnualCropFolders, setLoadingAnnualCropFolders] = useState(false);
  const [loadingCrops, setLoadingCrops] = useState(false);
  const [loadingTables, setLoadingTables] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyErrorMessage, setHistoryErrorMessage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [openingRecommendationId, setOpeningRecommendationId] = useState<number | null>(null);
  const [selectedDocumentKey, setSelectedDocumentKey] = useState<RecommendationDocumentKey>("general");
  const [documentErrors, setDocumentErrors] = useState<Partial<Record<RecommendationDocumentKey, string>>>({});
  const [loadingDocumentKey, setLoadingDocumentKey] = useState<RecommendationDocumentKey | null>(null);
  const [printing, setPrinting] = useState(false);
  const [improvingNarrative, setImprovingNarrative] = useState(false);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);

  const selectedProperty = useMemo(() => properties.find((p) => String(p.id) === selectedPropertyId), [properties, selectedPropertyId]);
  const selectedPlot = useMemo(() => plots.find((p) => String(p.id) === selectedPlotId), [plots, selectedPlotId]);
  const filteredCropFertilizationTables = useMemo(
    () => filterTablesByGroup(cropFertilizationTables, cropFertilizationTableGroup),
    [cropFertilizationTables, cropFertilizationTableGroup],
  );
  const filteredSoilFertilityTables = useMemo(
    () => filterTablesByGroup(soilFertilityTables, soilFertilityInterpretationTableGroup),
    [soilFertilityTables, soilFertilityInterpretationTableGroup],
  );
  const filteredFoliarInterpretationTables = useMemo(
    () => filterTablesByGroup(foliarInterpretationTables, cropFoliarAnalysisInterpretationTableGroup),
    [foliarInterpretationTables, cropFoliarAnalysisInterpretationTableGroup],
  );

  useEffect(() => {
    setSelectedDocumentKey("general");
    setDocumentErrors({});
    setLoadingDocumentKey(null);
  }, [selectedRecommendation?.id]);
  const selectedPhysicalAnalysisExtract = useMemo(
    () => physicalAnalysisOptions.find((analysis) => String(analysis.id) === physicalAnalysisExtractId)?.extract ?? null,
    [physicalAnalysisOptions, physicalAnalysisExtractId],
  );
  const selectedSoilFertilityAnalysisExtract = useMemo(
    () => soilFertilityAnalysisOptions.find((analysis) => String(analysis.id) === soilFertilityAnalysisId)?.extract ?? null,
    [soilFertilityAnalysisOptions, soilFertilityAnalysisId],
  );
  const limingCriterionPreview = useMemo(
    () => calculateClientLimingCriterion({
      physicalExtract: selectedPhysicalAnalysisExtract,
      fertilityExtract: selectedSoilFertilityAnalysisExtract,
    }),
    [selectedPhysicalAnalysisExtract, selectedSoilFertilityAnalysisExtract],
  );

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      setHistoryErrorMessage(null);
      setRecommendationsHistory(await getMyRecommendations());
    } catch (error) {
      console.error(error);
      setRecommendationsHistory([]);
      setHistoryErrorMessage("Não foi possível carregar seu histórico de recomendações agora. Tente novamente em instantes.");
      toaster.create({ title: "Falha ao carregar histórico.", type: "error" });
    } finally { setLoadingHistory(false); }
  };

  useEffect(() => {
    const loadProperties = async () => {
      setLoadingProperties(true);
      try {
        const roleMode = getAuthorizationRoleMode(user?.cargo);
        const data = roleMode === "SUPREME" || roleMode === "MANAGER"
          ? await fetchManageableProperties()
          : roleMode === "OWNER"
            ? await fetchMyProperties()
            : await propertyAccessRequestService.getMyApprovedProperties();
        setProperties(data ?? []);
      } catch (error) {
        console.error(error);
        setProperties([]);
        toaster.create({ title: "Falha ao carregar propriedades.", type: "error" });
      } finally { setLoadingProperties(false); }
    };

    void Promise.all([loadProperties(), loadHistory()]);
  }, [user?.cargo]);

  useEffect(() => {
    const loadCropTables = async () => {
      if (!cropFertilizationTableGroup) {
        setCropFertilizationTables([]);
        return;
      }
      setLoadingTables(true);
      try {
        let data: TableOption[];
        switch (cropFertilizationTableGroup) {
          case "PRIVATE":
            data = (await fetchCropFertilizationTables()).map(t => normalizeTable(t, "PRIVATE")).filter(Boolean) as TableOption[];
            break;
          case "PUBLIC":
            data = (await fetchPublicCropFertilizationTables()).map(t => normalizeTable(t, "PUBLIC")).filter(Boolean) as TableOption[];
            break;
          case "DEFAULT":
            data = (await fetchDefaultCropFertilizationTables()).map(t => normalizeTable(t, "DEFAULT")).filter(Boolean) as TableOption[];
            break;
          default:
            data = [];
        }
        setCropFertilizationTables(data);
      } catch (error) {
        console.error(error);
        toaster.create({ title: "Falha ao carregar tabelas de adubação.", type: "error" });
        setCropFertilizationTables([]);
      } finally { setLoadingTables(false); }
    };
    loadCropTables();
  }, [cropFertilizationTableGroup]);

  useEffect(() => {
    const loadSoilTables = async () => {
      if (!soilFertilityInterpretationTableGroup) {
        setSoilFertilityTables([]);
        return;
      }
      setLoadingTables(true);
      try {
        let data: TableOption[];
        switch (soilFertilityInterpretationTableGroup) {
          case "PRIVATE":
            data = (await fetchSoilFertilityTables()).map(t => normalizeTable(t, "PRIVATE")).filter(Boolean) as TableOption[];
            break;
          case "PUBLIC":
            data = (await fetchPublicSoilFertilityTables()).map(t => normalizeTable(t, "PUBLIC")).filter(Boolean) as TableOption[];
            break;
          case "DEFAULT":
            data = (await fetchDefaultSoilFertilityTables()).map(t => normalizeTable(t, "DEFAULT")).filter(Boolean) as TableOption[];
            break;
          default:
            data = [];
        }
        setSoilFertilityTables(data);
      } catch (error) {
        console.error(error);
        toaster.create({ title: "Falha ao carregar tabelas de fertilidade.", type: "error" });
        setSoilFertilityTables([]);
      } finally { setLoadingTables(false); }
    };
    loadSoilTables();
  }, [soilFertilityInterpretationTableGroup]);

  useEffect(() => {
    const loadFoliarTables = async () => {
      if (!cropFoliarAnalysisInterpretationTableGroup) {
        setFoliarInterpretationTables([]);
        setCropFoliarAnalysisInterpretationTableId("");
        return;
      }
      setLoadingTables(true);
      setCropFoliarAnalysisInterpretationTableId("");
      try {
        let data: TableOption[];
        switch (cropFoliarAnalysisInterpretationTableGroup) {
          case "PRIVATE":
            data = (await fetchFoliarTables()).map(t => normalizeTable(t, "PRIVATE")).filter(Boolean) as TableOption[];
            break;
          case "PUBLIC":
            data = (await fetchPublicFoliarTables()).map(t => normalizeTable(t, "PUBLIC")).filter(Boolean) as TableOption[];
            break;
          case "DEFAULT":
            data = (await fetchDefaultFoliarTables()).map(t => normalizeTable(t, "DEFAULT")).filter(Boolean) as TableOption[];
            break;
          default:
            data = [];
        }
        setFoliarInterpretationTables(data);
      } catch (error) {
        console.error(error);
        toaster.create({ title: "Falha ao carregar tabelas foliares.", type: "error" });
        setFoliarInterpretationTables([]);
      } finally { setLoadingTables(false); }
    };
    loadFoliarTables();
  }, [cropFoliarAnalysisInterpretationTableGroup]);

  useEffect(() => {
    const loadPlots = async () => {
      if (!selectedPropertyId) {
        setPlots([]);
        setSelectedPlotId("");
        return;
      }
      setLoadingPlots(true);
      setSelectedPlotId("");
      setPlots([]);
      try {
        setPlots(await getPlotsByProperty(Number(selectedPropertyId)));
      } catch (error) {
        console.error(error);
        toaster.create({ title: "Falha ao carregar talhões.", type: "error" });
      } finally { setLoadingPlots(false); }
    };

    void loadPlots();
  }, [selectedPropertyId]);

  useEffect(() => {
    let isCurrent = true;

    const resetPlotDependencies = () => {
      setPhysicalAnalysisExtractId("");
      setSoilFertilityAnalysisId("");
      setSaturationExtractAnalysisExtractId("");
      setAnnualCropFolderId("");
      setCropId("");
      setPhysicalAnalysisOptions([]);
      setSoilFertilityAnalysisOptions([]);
      setSaturationExtractAnalysisOptions([]);
      setAnnualCropFolders([]);
      setCrops([]);
    };

    const loadPlotDependencies = async () => {
      resetPlotDependencies();

      if (!selectedPlotId) return;

      setLoadingPlotAnalyses(true);
      setLoadingAnnualCropFolders(true);

      try {
        const plotId = Number(selectedPlotId);
        const [soilAnalyses, folders] = await Promise.all([
          soilAnalysisService.getByPlotId(plotId),
          getAllAnnualCropFoldersByPlot(plotId),
        ]);

        if (!isCurrent) return;

        const physicalOptions: AnalysisExtractOption<PhysicalAnalysisExtractResponse>[] = [];
        const fertilityOptions: AnalysisExtractOption<FertilityAnalysisExtractResponse>[] = [];
        const saturationOptions: AnalysisExtractOption<SaturationExtractAnalysisExtractResponse>[] = [];

        for (const analysis of soilAnalyses ?? []) {
          const isLayerAnalysis = analysis.tipo_extrato === TipoExtrato.CAMADAS;
          const containers = isLayerAnalysis
            ? await layerExtractService.getByAnalysisId(analysis.id)
            : await rangeExtractService.getByAnalysisId(analysis.id);

          if (!isCurrent) return;

          for (const container of containers ?? []) {
            const containerId = container.id;
            const [physicalExtracts, fertilityExtracts, saturationExtracts] = await Promise.all([
              isLayerAnalysis
                ? physicalAnalysisExtractService.getByLayerExtractId(containerId)
                : physicalAnalysisExtractService.getByRangeExtractId(containerId),
              isLayerAnalysis
                ? fertilityAnalysisExtractService.getByLayerExtractId(containerId)
                : fertilityAnalysisExtractService.getByRangeExtractId(containerId),
              isLayerAnalysis
                ? saturationExtractAnalysisExtractService.getByLayerExtractId(containerId)
                : saturationExtractAnalysisExtractService.getByRangeExtractId(containerId),
            ]);

            physicalOptions.push(...(physicalExtracts ?? []).map((extract) => mapPhysicalAnalysisOption(extract, analysis)));
            fertilityOptions.push(...(fertilityExtracts ?? []).map((extract) => mapFertilityAnalysisOption(extract, analysis)));
            saturationOptions.push(...(saturationExtracts ?? []).map((extract) => mapSaturationAnalysisOption(extract, analysis)));
          }
        }

        if (!isCurrent) return;

        setPhysicalAnalysisOptions(physicalOptions);
        setSoilFertilityAnalysisOptions(fertilityOptions);
        setSaturationExtractAnalysisOptions(saturationOptions);
        setAnnualCropFolders(folders ?? []);
      } catch (error) {
        console.error(error);
        if (!isCurrent) return;
        toaster.create({ title: "Falha ao carregar dados do talhão.", type: "error" });
      } finally {
        if (isCurrent) {
          setLoadingPlotAnalyses(false);
          setLoadingAnnualCropFolders(false);
        }
      }
    };

    void loadPlotDependencies();

    return () => { isCurrent = false; };
  }, [selectedPlotId]);

  useEffect(() => {
    let isCurrent = true;

    const loadCrops = async () => {
      setCropId("");
      setCrops([]);

      if (!annualCropFolderId) return;

      setLoadingCrops(true);
      try {
        const data = await getCropsByFolder(Number(annualCropFolderId));
        if (isCurrent) setCrops(data ?? []);
      } catch (error) {
        console.error(error);
        if (isCurrent) toaster.create({ title: "Falha ao carregar culturas da pasta anual.", type: "error" });
      } finally {
        if (isCurrent) setLoadingCrops(false);
      }
    };

    void loadCrops();

    return () => { isCurrent = false; };
  }, [annualCropFolderId]);

  const handleGenerate = async () => {
    if (!recommendationType || !selectedPropertyId || !selectedPlotId || !physicalAnalysisExtractId || !soilFertilityAnalysisId || !saturationExtractAnalysisExtractId || !annualCropFolderId || !cropId || !cropFertilizationTableId || !soilFertilityInterpretationTableId || !cropFoliarAnalysisInterpretationTableId || !fertilizerSourceOption) {
      toaster.create({ title: "Campos obrigatórios", description: "Preencha todos os campos necessários antes de gerar a recomendação.", type: "warning" });
      return;
    }

    if (
      !isRecommendationType(recommendationType) ||
      !isRecommendationTableGroup(cropFertilizationTableGroup) ||
      !isRecommendationTableGroup(soilFertilityInterpretationTableGroup) ||
      !isRecommendationTableGroup(cropFoliarAnalysisInterpretationTableGroup) ||
      !isFertilizerSourceOption(fertilizerSourceOption)
    ) {
      toaster.create({
        title: "Parâmetros inválidos",
        description: "Revise tipo de recomendação, grupos de tabelas e origem dos adubos antes de gerar.",
        type: "warning",
      });
      return;
    }

    setGenerating(true);
    try {
      const payload: RecommendationCreatePayload = {
        tipo_recomendacao: recommendationType,
        id_propriedade: Number(selectedPropertyId),
        id_talhao: Number(selectedPlotId),
        id_extrato_analise_fisica: Number(physicalAnalysisExtractId),
        id_analise_fertilidade_solo: Number(soilFertilityAnalysisId),
        id_extrato_analise_extrato_saturacao: Number(saturationExtractAnalysisExtractId),
        id_pasta_cultura_anual: Number(annualCropFolderId),
        id_cultura: Number(cropId),
        id_tabela_adubacao_cultura: Number(cropFertilizationTableId),
        id_tabela_interpretacao_fertilidade_solo: Number(soilFertilityInterpretationTableId),
        id_tabela_interpretacao_analise_foliar: Number(cropFoliarAnalysisInterpretationTableId),
        cropFertilizationTableGroup,
        soilFertilityInterpretationCriteriaTableGroup: soilFertilityInterpretationTableGroup,
        cropFoliarAnalysisInterpretationTableGroup: cropFoliarAnalysisInterpretationTableGroup,
        criterio_calagem: null,
        origem_adubos: normalizeFertilizerSourceOption(fertilizerSourceOption),
        nome_pasta_recomendacao: recommendationFolderName.trim() || null,
      };
      const result = await generateRecommendation(payload);
      setSelectedRecommendation(result);
      toaster.create({ title: "Recomendação gerada com sucesso.", type: "success" });
      await loadHistory();
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("Erro ao gerar recomendação:", axiosError.response?.data || error);
      toaster.create({
        title: "Falha ao gerar recomendação.",
        description: "O endpoint recommendation/generate recusou o payload atual. Confira se as tabelas escolhidas pertencem aos grupos informados.",
        type: "error",
      });
    } finally { setGenerating(false); }
  };

  const handleImproveNarrative = async () => {
    if (!selectedRecommendation?.id) {
      toaster.create({
        title: "Laudo indisponível",
        description: "Nenhum laudo foi encontrado para melhorar.",
        type: "warning",
      });
      return;
    }

    try {
      setImprovingNarrative(true);
      const improvedRecommendation = await improveRecommendationNarrative(selectedRecommendation.id);
      setSelectedRecommendation(improvedRecommendation);
      toaster.create({ title: "Texto do laudo melhorado com sucesso.", type: "success" });
      await loadHistory();
    } catch (error) {
      console.error(error);
      toaster.create({ title: "Falha ao melhorar texto do laudo.", type: "error" });
    } finally {
      setImprovingNarrative(false);
    }
  };

  const handlePrintRecommendation = async () => {
    if (!selectedRecommendation?.id) {
      toaster.create({
        title: "Laudo indisponível",
        description: "Nenhum laudo foi encontrado para impressão.",
        type: "warning",
      });
      return;
    }

    try {
      setPrinting(true);
      const printableRecommendation = await preparePrintRecommendation(selectedRecommendation.id);
      const printableReportText = getRecommendationReportText(printableRecommendation);

      if (!printableReportText?.trim()) {
        toaster.create({
          title: "Laudo indisponível",
          description: "Nenhum laudo foi encontrado para impressão.",
          type: "warning",
        });
        return;
      }

      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toaster.create({
          title: "Erro ao imprimir",
          description: "Não foi possível abrir a janela de impressão.",
          type: "error",
        });
        return;
      }

      writePrintableReport(printWindow, printableReportText);
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
      };
    } catch (error) {
      console.error(error);
      if (error instanceof AxiosError && error.response?.status === 403) {
        toaster.create({
          title: "Acesso negado",
          description: "Seu usuário não possui permissão para emitir laudos formais.",
          type: "error",
        });
        return;
      }
      toaster.create({
        title: "Erro ao imprimir",
        description: "Não foi possível preparar o laudo para impressão.",
        type: "error",
      });
    } finally {
      setPrinting(false);
    }
  };

  const reportText = getRecommendationReportText(selectedRecommendation);
  const recommendationDocuments = useMemo<RecommendationDocumentView[]>(() => {
    const hasGeneralReport = Boolean(reportText?.trim());

    return [
      {
        key: "general",
        title: "Recomendação Geral",
        description: hasGeneralReport
          ? "Documento principal da pasta."
          : "Aguardando conteúdo retornado pelo backend.",
        status: loadingDocumentKey === "general"
          ? "loading"
          : documentErrors.general
            ? "error"
            : hasGeneralReport
              ? "generated"
              : "not_generated",
        content: reportText,
        icon: LuFileText,
      },
      {
        key: "summary",
        title: "Recomendação Resumida",
        description: "Aguardando documento salvo ou endpoint real do backend.",
        status: loadingDocumentKey === "summary" ? "loading" : documentErrors.summary ? "error" : "not_generated",
        content: "",
        icon: LuListChecks,
      },
      {
        key: "direct",
        title: "Recomendação Direta",
        description: "Aguardando documento salvo ou endpoint real do backend.",
        status: loadingDocumentKey === "direct" ? "loading" : documentErrors.direct ? "error" : "not_generated",
        content: "",
        icon: LuFileText,
      },
      {
        key: "shopping",
        title: "Lista de Compras",
        description: "Aguardando documento salvo ou endpoint real do backend.",
        status: loadingDocumentKey === "shopping" ? "loading" : documentErrors.shopping ? "error" : "not_generated",
        content: "",
        icon: LuShoppingCart,
      },
    ];
  }, [documentErrors, loadingDocumentKey, reportText]);
  const selectedDocument = recommendationDocuments.find((document) => document.key === selectedDocumentKey) ?? recommendationDocuments[0];
  const selectedDocumentError = documentErrors[selectedDocument.key];

  const handleOpenRecommendation = async (item: RecommendationResponse) => {
    if (!item.id) {
      setSelectedRecommendation(item);
      return;
    }

    setOpeningRecommendationId(item.id);
    try {
      const detailedRecommendation = await getRecommendation(item.id);
      setSelectedRecommendation(detailedRecommendation);
    } catch (error) {
      console.error(error);
      setSelectedRecommendation(item);
      toaster.create({
        title: "Detalhe indisponível",
        description: "Não foi possível buscar recommendation/get. Abrindo os dados já carregados no histórico.",
        type: "warning",
      });
    } finally {
      setOpeningRecommendationId(null);
    }
  };

  const handleSelectDocument = async (document: RecommendationDocumentView) => {
    setSelectedDocumentKey(document.key);

    if (document.status === "generated") {
      return;
    }

    if (!selectedRecommendation?.id || loadingDocumentKey) {
      return;
    }

    setLoadingDocumentKey(document.key);
    setDocumentErrors((currentErrors) => ({ ...currentErrors, [document.key]: undefined }));

    try {
      const refreshedRecommendation = await getRecommendation(selectedRecommendation.id);
      setSelectedRecommendation(refreshedRecommendation);

      const refreshedGeneralReport = getRecommendationReportText(refreshedRecommendation);
      if (document.key === "general" && refreshedGeneralReport.trim()) {
        return;
      }

      const message = documentUnavailableMessages[document.key];
      setDocumentErrors((currentErrors) => ({ ...currentErrors, [document.key]: message }));
      toaster.create({
        title: "Documento ainda não gerado.",
        description: message,
        type: "warning",
      });
    } catch (error) {
      console.error(error);
      const message = "Não foi possível gerar o documento.";
      setDocumentErrors((currentErrors) => ({ ...currentErrors, [document.key]: message }));
      toaster.create({
        title: message,
        description: "Falha ao consultar o backend para carregar o documento solicitado.",
        type: "error",
      });
    } finally {
      setLoadingDocumentKey(null);
    }
  };

  const physicalAnalysisPlaceholder = !selectedPlotId
    ? "Selecione um talhão para ver análises físicas"
    : physicalAnalysisOptions.length
      ? "Análise física do talhão"
      : "Nenhuma análise encontrada";
  const soilFertilityAnalysisPlaceholder = !selectedPlotId
    ? "Selecione um talhão para ver análises de fertilidade"
    : soilFertilityAnalysisOptions.length
      ? "Análise de fertilidade do talhão"
      : "Nenhuma análise encontrada";
  const saturationExtractAnalysisPlaceholder = !selectedPlotId
    ? "Selecione um talhão para ver análises de extrato de saturação"
    : saturationExtractAnalysisOptions.length
      ? "Análise de extrato de saturação do talhão"
      : "Nenhuma análise encontrada";
  const annualCropFolderPlaceholder = !selectedPlotId
    ? "Selecione um talhão para ver pastas anuais"
    : annualCropFolders.length
      ? "Pasta de culturas anuais"
      : "Nenhuma pasta encontrada";
  const cropPlaceholder = !annualCropFolderId
    ? "Selecione uma pasta anual para ver culturas"
    : crops.length
      ? "Cultura da pasta anual"
      : "Nenhuma cultura encontrada";
  const getTableChoicePlaceholder = (group: TableGroupValue, tables: TableOption[]) => {
    if (!group) return "Selecione o grupo da tabela";
    return tables.length ? "Escolha da tabela" : "Nenhuma tabela encontrada";
  };
  const renderTableSelectors = ({
    label,
    group,
    tableId,
    tables,
    onGroupChange,
    onTableChange,
  }: {
    label: string;
    group: TableGroupValue;
    tableId: string;
    tables: TableOption[];
    onGroupChange: (value: TableGroupValue) => void;
    onTableChange: (value: string) => void;
  }) => (
    <Box>
      <Text fontSize="sm" mb={1}>{label}</Text>
      <SimpleGrid columns={{ base: 1, sm: 2 }} gap={2}>
        <NativeSelect
          value={group}
          onChange={(e) => {
            onGroupChange(e.target.value as TableGroupValue);
            onTableChange("");
          }}
          disabled={loadingTables}
          aria-label={`${label}: grupo da tabela`}
        >
          <option value="">Grupo da tabela</option>
          {tableGroupOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </NativeSelect>
        <NativeSelect
          value={tableId}
          onChange={(e) => onTableChange(e.target.value)}
          disabled={loadingTables || !group || tables.length === 0}
          aria-label={`${label}: escolha da tabela`}
        >
          <option value="">{getTableChoicePlaceholder(group, tables)}</option>
          {tables.map((table) => (
            <option key={`${table.source}-${table.id}`} value={table.id}>{table.label}</option>
          ))}
        </NativeSelect>
      </SimpleGrid>
    </Box>
  );

  return (
    <UserLayout><FertName subtitle="Módulo de recomendações" /><ConfigMenu />
      <Box px={4} py={8} maxW="1200px" mx="auto">
        <Button variant="outline" mb={4} onClick={() => navigate("/fertintelligence/home")}>
          <LuArrowLeft /> Voltar para o painel
        </Button>
        <VStack align="start" gap={3} mb={6}><Heading size="xl">Gerar Recomendação</Heading><Text color="fg.muted">Gere recomendações técnicas preliminares para correção e adubação.</Text></VStack>
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
          <Box borderWidth="1px" borderRadius="lg" p={6}><Heading size="md" mb={3}>Formulário técnico</Heading><Separator mb={4} />
            <VStack align="stretch" gap={3}>
              <NativeSelect value={recommendationType} onChange={(e) => setRecommendationType(e.target.value)}><option value="">Tipo de recomendação</option>{recommendationTypeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</NativeSelect>
              <NativeSelect value={selectedPropertyId} onChange={(e) => setSelectedPropertyId(e.target.value)} disabled={loadingProperties}>{loadingProperties ? <option>Carregando...</option> : <><option value="">Propriedade</option>{properties.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}</>}</NativeSelect>
              <NativeSelect value={selectedPlotId} onChange={(e) => setSelectedPlotId(e.target.value)} disabled={!selectedPropertyId || loadingPlots}>{loadingPlots ? <option>Carregando...</option> : <><option value="">Talhão</option>{plots.map((p) => <option key={p.id} value={p.id}>{p.identificacao ?? `Talhão ${p.id}`}</option>)}</>}</NativeSelect>
              <NativeSelect value={physicalAnalysisExtractId} onChange={(e) => setPhysicalAnalysisExtractId(e.target.value)} disabled={!selectedPlotId || loadingPlotAnalyses || physicalAnalysisOptions.length === 0}>{loadingPlotAnalyses ? <option>Carregando análises físicas...</option> : <><option value="">{physicalAnalysisPlaceholder}</option>{physicalAnalysisOptions.map((analysis) => <option key={analysis.id} value={analysis.id}>{analysis.label}</option>)}</>}</NativeSelect>
              <NativeSelect value={soilFertilityAnalysisId} onChange={(e) => setSoilFertilityAnalysisId(e.target.value)} disabled={!selectedPlotId || loadingPlotAnalyses || soilFertilityAnalysisOptions.length === 0}>{loadingPlotAnalyses ? <option>Carregando análises de fertilidade...</option> : <><option value="">{soilFertilityAnalysisPlaceholder}</option>{soilFertilityAnalysisOptions.map((analysis) => <option key={analysis.id} value={analysis.id}>{analysis.label}</option>)}</>}</NativeSelect>
              <NativeSelect value={saturationExtractAnalysisExtractId} onChange={(e) => setSaturationExtractAnalysisExtractId(e.target.value)} disabled={!selectedPlotId || loadingPlotAnalyses || saturationExtractAnalysisOptions.length === 0}>{loadingPlotAnalyses ? <option>Carregando análises de extrato de saturação...</option> : <><option value="">{saturationExtractAnalysisPlaceholder}</option>{saturationExtractAnalysisOptions.map((analysis) => <option key={analysis.id} value={analysis.id}>{analysis.label}</option>)}</>}</NativeSelect>
              <NativeSelect value={annualCropFolderId} onChange={(e) => setAnnualCropFolderId(e.target.value)} disabled={!selectedPlotId || loadingAnnualCropFolders || annualCropFolders.length === 0}>{loadingAnnualCropFolders ? <option>Carregando pastas anuais...</option> : <><option value="">{annualCropFolderPlaceholder}</option>{annualCropFolders.map((folder) => <option key={folder.id} value={folder.id}>{getFolderLabel(folder)}</option>)}</>}</NativeSelect>
              <NativeSelect value={cropId} onChange={(e) => setCropId(e.target.value)} disabled={!annualCropFolderId || loadingCrops || crops.length === 0}>{loadingCrops ? <option>Carregando culturas...</option> : <><option value="">{cropPlaceholder}</option>{crops.map((crop) => <option key={crop.id} value={crop.id}>{getCropLabel(crop)}</option>)}</>}</NativeSelect>
              {renderTableSelectors({
                label: "Tabela de adubação de culturas",
                group: cropFertilizationTableGroup,
                tableId: cropFertilizationTableId,
                tables: filteredCropFertilizationTables,
                onGroupChange: setCropFertilizationTableGroup,
                onTableChange: setCropFertilizationTableId,
              })}
              {renderTableSelectors({
                label: "Tabela de interpretação da fertilidade do solo",
                group: soilFertilityInterpretationTableGroup,
                tableId: soilFertilityInterpretationTableId,
                tables: filteredSoilFertilityTables,
                onGroupChange: setSoilFertilityInterpretationTableGroup,
                onTableChange: setSoilFertilityInterpretationTableId,
              })}
              {renderTableSelectors({
                label: "Tabela de interpretação de análise foliar",
                group: cropFoliarAnalysisInterpretationTableGroup,
                tableId: cropFoliarAnalysisInterpretationTableId,
                tables: filteredFoliarInterpretationTables,
                onGroupChange: setCropFoliarAnalysisInterpretationTableGroup,
                onTableChange: setCropFoliarAnalysisInterpretationTableId,
              })}
              <Box>
                <SimpleGrid columns={{ base: 1, sm: limingCriterionPreview.limingNeed === null ? 1 : 2 }} gap={2}>
                  <Box>
                    <Text fontSize="sm" mb={1}>Critério de calagem</Text>
                    <Box borderWidth="1px" borderRadius="md" px={3} py={2} minH={10} bg="bg.panel" color="fg.muted" aria-label="Critério de calagem">
                      {limingCriterionPreview.criterionLabel}
                    </Box>
                  </Box>
                  {limingCriterionPreview.limingNeed !== null ? (
                    <Box>
                      <Text fontSize="sm" mb={1}>Necessidade de calagem estimada (t/ha, PRNT 100%)</Text>
                      <Box borderWidth="1px" borderRadius="md" px={3} py={2} minH={10} bg="bg.panel" color="fg.muted" aria-label="Necessidade de calagem estimada (t/ha, PRNT 100%)">
                        {limingCriterionPreview.limingNeed.toFixed(2)}
                      </Box>
                    </Box>
                  ) : null}
                </SimpleGrid>
                {limingCriterionPreview.warning ? (
                  <Text mt={2} fontSize="xs" color="fg.muted">{limingCriterionPreview.warning}</Text>
                ) : null}
              </Box>
              <Box>
                <Text fontSize="sm" mb={1}>Quais adubos usar?</Text>
                <NativeSelect value={normalizeFertilizerSourceOption(fertilizerSourceOption)} onChange={(e) => setFertilizerSourceOption(e.target.value as FertilizerSourceOption)} aria-label="Quais adubos usar?">{fertilizerOriginOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</NativeSelect>
              </Box>
              <Box>
                <Text fontSize="sm" mb={1}>Nome da pasta de recomendação?</Text>
                <Input
                  value={recommendationFolderName}
                  onChange={(e) => setRecommendationFolderName(e.target.value)}
                  aria-label="Nome da pasta de recomendação?"
                />
              </Box>
              <Button colorPalette="blue" onClick={handleGenerate} loading={generating}>Gerar Recomendação</Button>
            </VStack>
          </Box>
          <Box borderWidth="1px" borderRadius="lg" p={6}><Flex justify="space-between" align="center" mb={3} gap={2}><Heading size="md">Pasta da Recommendation</Heading>{selectedRecommendation && selectedDocument?.status === "generated" ? <Button size="xs" variant="ghost" onClick={() => setIsFullscreenOpen(true)}>Tela cheia</Button> : null}</Flex><Separator mb={4} />
            {selectedRecommendation ? (
              <VStack align="stretch" gap={4}>
                <Flex justify="space-between" align={{ base: "start", md: "center" }} gap={3} wrap="wrap">
                  <HStack gap={2}>
                    <LuFolder />
                    <Heading size="sm">{getRecommendationFolderName(selectedRecommendation)}</Heading>
                    <Badge colorPalette={userCanPrint ? "green" : "orange"}>{userCanPrint ? "Laudo imprimível" : "Laudo não imprimível"}</Badge>
                  </HStack>
                  <HStack gap={2} wrap="wrap">
                    <Button variant="outline" disabled={selectedDocument?.status !== "generated"} onClick={async () => { if (!selectedDocument?.content) { toaster.create({ title: "Nenhum documento para copiar.", type: "warning" }); return; } try { await navigator.clipboard.writeText(selectedDocument.content); toaster.create({ title: "Documento copiado para a área de transferência.", type: "success" }); } catch (error) { console.error(error); toaster.create({ title: "Falha ao copiar documento.", type: "error" }); } }}>Copiar Documento</Button>
                    {selectedDocument?.key === "general" ? <Button variant="subtle" loading={improvingNarrative} onClick={handleImproveNarrative}>{improvingNarrative ? "Melhorando..." : "Melhorar Texto do Laudo"}</Button> : null}
                    {userCanPrint && selectedRecommendation.printable !== false && selectedDocument?.key === "general" ? <Button colorPalette="blue" loading={printing} onClick={handlePrintRecommendation}>Imprimir Laudo</Button> : null}
                  </HStack>
                </Flex>
                <Flex gap={2} wrap="wrap"><Badge>ID {selectedRecommendation.id}</Badge><Badge>Propriedade {selectedRecommendation.nome_propriedade ?? selectedProperty?.nome ?? selectedRecommendation.id_propriedade ?? "-"}</Badge><Badge>Talhão {selectedRecommendation.identificacao_talhao ?? selectedPlot?.identificacao ?? selectedRecommendation.id_talhao ?? "-"}</Badge><Badge>Cultura {selectedRecommendation.cultura ?? "-"}</Badge><Badge>Ano {selectedRecommendation.ano_safra ?? "-"}</Badge><Badge>Tipo {selectedRecommendation.tipo_recomendacao ?? "-"}</Badge></Flex>
                <SimpleGrid columns={{ base: 1, sm: 2 }} gap={3}>
                  {recommendationDocuments.map((document) => {
                    const DocumentIcon = document.icon;
                    const isSelected = selectedDocumentKey === document.key;
                    return (
                      <Box key={document.key} as="button" textAlign="left" borderWidth="1px" borderRadius="md" p={4} borderColor={isSelected ? "blue.400" : undefined} bg={isSelected ? "blue.50" : "bg.panel"} _dark={isSelected ? { bg: "blue.950", borderColor: "blue.400" } : undefined} aria-disabled={Boolean(loadingDocumentKey)} opacity={loadingDocumentKey && loadingDocumentKey !== document.key ? 0.65 : 1} cursor={loadingDocumentKey ? "not-allowed" : "pointer"} onClick={() => { void handleSelectDocument(document); }}>
                        <Flex justify="space-between" align="start" gap={3}>
                          <HStack align="start" gap={3}>
                            <Box fontSize="xl" color={document.status === "generated" ? "green.600" : "fg.muted"}>{document.status === "loading" ? <Spinner size="sm" /> : <DocumentIcon />}</Box>
                            <VStack align="start" gap={1}>
                              <Text fontWeight="semibold">{document.title}</Text>
                              <Text fontSize="xs" color="fg.muted">{document.description}</Text>
                            </VStack>
                          </HStack>
                          <Badge colorPalette={getDocumentStatusColor(document.status)}>{getDocumentStatusLabel(document.status)}</Badge>
                        </Flex>
                      </Box>
                    );
                  })}
                </SimpleGrid>
                <Box fontSize="sm" borderWidth="1px" borderRadius="md" p={4} maxH="600px" overflowY="auto">
                  {selectedDocument?.status === "generated" ? (
                    <RecommendationReportViewer reportText={selectedDocument.content} variant="compact" />
                  ) : selectedDocument?.status === "loading" ? (
                    <HStack gap={2}>
                      <Spinner size="sm" />
                      <Text color="fg.muted">Gerando documento...</Text>
                    </HStack>
                  ) : (
                    <VStack align="start" gap={2}>
                      <Text fontWeight="semibold">{selectedDocument?.title}</Text>
                      <Text color="fg.muted">Documento ainda não gerado para esta pasta.</Text>
                      {selectedDocumentError ? <Text color="orange.600" fontSize="sm">{selectedDocumentError}</Text> : null}
                    </VStack>
                  )}
                </Box>
                <Text fontSize="xs" color="fg.muted">A Recomendação Geral usa o laudo técnico legado quando o backend retorna technicalReport, laudo_tecnico ou laudoTecnico. Os demais documentos não são montados no frontend; quando não há endpoint real declarado, a tela apenas informa a indisponibilidade técnica.</Text>
                <Text fontSize="xs" color="fg.muted">A melhoria de texto não altera cálculos, doses ou recomendações técnicas.</Text>
                {!userCanPrint ? <Box borderWidth="1px" borderRadius="md" borderColor="orange.200" bg="orange.50" p={3} fontSize="sm">Apenas agrônomos residentes ou consultores podem emitir laudo formal para assinatura.</Box> : null}
              </VStack>
            ) : <Text color="fg.muted">Nenhuma recomendação gerada ainda.</Text>}
          </Box>
        </SimpleGrid>

        <Box borderWidth="1px" borderRadius="lg" p={6} mt={4}><Heading size="md" mb={3}>Minhas Recomendações</Heading><Separator mb={4} />
          {loadingHistory ? <Spinner /> : historyErrorMessage ? <Text color="orange.600">{historyErrorMessage}</Text> : recommendationsHistory.length === 0 ? <Text color="fg.muted">Nenhuma recomendação encontrada.</Text> : <VStack align="stretch" gap={3}>{recommendationsHistory.map((item) => (<Flex key={item.id} borderWidth="1px" borderRadius="md" p={3} justify="space-between" wrap="wrap" gap={3}><VStack align="start" gap={1}><Text fontWeight="bold">{getRecommendationFolderName(item)}</Text><Text fontSize="sm">Propriedade: {item.nome_propriedade ?? item.id_propriedade ?? "-"} • Talhão: {item.identificacao_talhao ?? item.id_talhao ?? "-"}</Text><Text fontSize="sm">Cultura: {item.cultura ?? "-"} • Ano: {item.ano_safra ?? "-"} • Tipo: {item.tipo_recomendacao ?? "-"} • Calagem: {normalizeLimingCriteria(item.criterio_calagem ?? item.criterioCalagem) ?? "-"}</Text></VStack><Flex gap={2}><Button size="sm" loading={openingRecommendationId === item.id} onClick={() => void handleOpenRecommendation(item)}>Abrir</Button><Button size="sm" colorPalette="red" loading={deletingId === item.id} onClick={async () => { if (!window.confirm("Deseja excluir esta recomendação?")) return; setDeletingId(item.id); try { await deleteRecommendation(item.id); if (selectedRecommendation?.id === item.id) setSelectedRecommendation(null); toaster.create({ title: "Recomendação excluída com sucesso.", type: "success" }); await loadHistory(); } catch (error) { console.error(error); toaster.create({ title: "Falha ao excluir recomendação.", type: "error" }); } finally { setDeletingId(null); } }}>Excluir</Button></Flex></Flex>))}</VStack>}
        </Box>
      </Box>

      <DialogRoot
        open={isFullscreenOpen}
        onOpenChange={(event) => setIsFullscreenOpen(event.open)}
        size="cover"
        placement="center"
      >
        <DialogContent w="85vw" maxW="85vw" h="85vh">
          <DialogHeader>
            <DialogTitle>{selectedDocument?.title ?? "Documento da Recommendation"}</DialogTitle>
          </DialogHeader>
          <DialogBody overflow="hidden" pb={4}>
            <Box
              fontSize="sm"
              borderWidth="1px"
              borderRadius="md"
              p={4}
              h="100%"
              overflowY="auto"
              overflowX="auto"
            >
              {selectedDocument?.status === "generated" ? (
                <RecommendationReportViewer reportText={selectedDocument.content} variant="modal" />
              ) : (
                <Text color="fg.muted">Documento ainda não gerado para esta pasta.</Text>
              )}
            </Box>
          </DialogBody>
          <DialogCloseTrigger />
        </DialogContent>
      </DialogRoot>
    </UserLayout>
  );
}
