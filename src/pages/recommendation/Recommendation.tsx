import { AxiosError } from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Heading,
  Input,
  Separator,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";

import UserLayout from "@/components/Layouts/UserLayout";
import FertName from "@/components/FertName/FertName";
import ConfigMenu from "@/components/ConfigMenu/ConfigMenu";
import reportLogoUrl from "@/assets/fertintelligence-logo.svg";
import { toaster } from "@/components/ui/toaster";
import type { PlotResponse } from "@/interfaces/Plot";
import type { PropertyResponse } from "@/interfaces/Property";
import type { AnnualCropFolderResponseDto } from "@/interfaces/AnnualCropFolder";
import type { GreenFertilizerResponseDto, OrganicFertilizerResponseDto } from "@/interfaces/Fertilizer";
import { TipoExtrato, type SoilAnalysisResponse } from "@/interfaces/SoilAnalysis";
import {
  type RecommendationLimingCriteria,
  type FertilizerSourceOption,
  type OrganicFertilizerReferenceNutrient,
  type DirectRecommendationResponse,
  type RecommendationResponse,
  type RecommendationPrintResponse,
  type ShoppingListResponse,
  type SummaryRecommendationResponse,
  type RecommendationType,
  type CorrectiveSoilFertilizationPayload,
  getRecommendationReportText,
} from "@/interfaces/Recommendation";
import { getPlotsByProperty } from "@/services/plotService";
import { fetchManageableProperties, fetchMyProperties } from "@/services/propertyService";
import { propertyAccessRequestService } from "@/services/propertyAccessRequestService";
import { getAuthorizationRoleMode } from "@/interfaces/Authorization";
import { getAllAnnualCropFoldersByPlot } from "@/services/annualCropFolderService";
import { soilAnalysisService } from "@/services/soilAnalysisService";
import { rangeExtractService } from "@/services/rangeExtractService";
import { layerExtractService } from "@/services/layerExtractService";
import { physicalAnalysisExtractService } from "@/services/physicalAnalysisExtractService";
import { fertilityAnalysisExtractService } from "@/services/fertilityAnalysisExtractService";
import { saturationExtractAnalysisExtractService } from "@/services/saturationExtractAnalysisExtractService";
import {
  calculateTemporaryLimingCriterion,
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
  fetchDefaultGreenFertilizers,
  fetchGreenFertilizers,
  fetchPublicGreenFertilizers,
} from "@/services/greenFertilizerService";
import {
  fetchDefaultOrganicFertilizers,
  fetchOrganicFertilizers,
  fetchPublicOrganicFertilizers,
} from "@/services/organicFertilizerService";
import {
  buildRecommendationCreatePayload,
  deleteRecommendation,
  generateRecommendation,
  getRecommendation,
  getMyRecommendations,
  preparePrintRecommendation,
  improveRecommendationNarrative,
} from "@/services/recommendationService";
import { getSummaryRecommendationByRecommendation } from "@/services/summaryRecommendationService";
import { getDirectRecommendationByRecommendation } from "@/services/directRecommendationService";
import { getShoppingListByRecommendation } from "@/services/shoppingListService";
import { useUserStore } from "@/stores/user/user.store";
import { LuArrowLeft } from "react-icons/lu";
import RecommendationFolderDocuments, {
  buildRecommendationDocumentViews,
  hasDirectFertilizationObservations,
  hasDirectNpkFertilizerRows,
  type RecommendationDocumentKey,
  type RecommendationDocumentView,
} from "@/components/Recommendation/RecommendationFolderDocuments";
import RecommendationHistoryList from "@/components/Recommendation/RecommendationHistoryList";
import FertAiPanel from "@/components/FertAi/FertAiPanel";
import { writePrintableReport } from "@/components/Recommendation/RecommendationPrintDocument";
import {
  hasEconomicFertilizerDecisionContent,
  hasGypsumRecommendationContent,
  hasSulfurRecommendationContent,
  hasStructuredRecommendationContent,
} from "@/components/Recommendation/RecommendationStructuredFertilizerTables";
import { hasMicronutrientFertilizerRows } from "@/components/Recommendation/MicronutrientFertilizerTable";
import { hasRecommendationFertigramCharts } from "@/components/Recommendation/RecommendationFertigramCharts";
import TextureClassificationSystemSelect, {
  type TextureClassificationSystem,
} from "@/components/Recommendation/TextureClassificationSystemSelect";
import AnalysisSelectors from "@/components/Recommendation/AnalysisSelectors";
import CropTableSelectors from "@/components/Recommendation/CropTableSelectors";
import LimingPreviewFields from "@/components/Recommendation/LimingPreviewFields";
import PropertyPlotSelectors from "@/components/Recommendation/PropertyPlotSelectors";
import SpacingSection from "@/components/Recommendation/SpacingSection";
import {
  type AnalysisOption,
  type TableGroupValue,
  type TableOption,
  NativeSelect,
} from "@/components/Recommendation/RecommendationSelectControls";
import {
  normalizeFertilizerSourceOption,
  validateRecommendationGeneration,
} from "@/components/Recommendation/generationValidation";
import {
  type CropSpacingFormState,
  useRecommendationCrops,
} from "@/components/Recommendation/useRecommendationCrops";

const documentUnavailableMessages: Record<RecommendationDocumentKey, string> = {
  general: "Documento ainda não gerado.",
  summary: "Documento ainda não gerado.",
  direct: "Documento ainda não gerado.",
  shopping: "Documento ainda não gerado.",
};

const documentLoadErrorMessage = "Não foi possível carregar este documento.";

type RecommendationTableApiResponse = {
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


type LimingCriterionPreview = {
  criterionLabel: string;
  limingNeed: number | null;
  warning?: string;
};

const adjustedLimingNeedFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatAdjustedLimingNeed = (value: number): string =>
  adjustedLimingNeedFormatter.format(value);

const defaultLimingCriterionPreview: LimingCriterionPreview = {
  criterionLabel: "Calculado pelo backend",
  limingNeed: null,
  warning: "O critério e a necessidade de calagem são definidos durante a geração, usando a análise completa selecionada.",
};

const limingCriterionLabels: Record<string, string> = {
  SATURACAO_POR_BASES_TROCAVEIS: "SATURAÇÃO POR BASES TROCÁVEIS",
  PORCENTAGEM_DE_SATURACAO_DAS_BASES: "SATURAÇÃO POR BASES TROCÁVEIS",
  NEUTRALIZACAO_POR_ALUMINIO_TROCAVEL: "Neutralização do Al trocável",
  NEUTRALIZACAO_ALUMINIO_TROCAVEL: "Neutralização do Al trocável",
  ELEVACAO_DO_TEOR_DE_CALCIO_MAIS_MAGNESIO: "Elevação dos teores de Ca + Mg",
  ELEVACAO__DO_TEOR_DE_CALCIO_MAIS_MAGNESIO: "Elevação dos teores de Ca + Mg",
  NEUTRALIZACAO_POR_ALUMINIO_TROCAVEL_MAIS_ELEVACAO_DO_TEOR_DE_CALCIO_MAIS_MAGNESIO:
    "Neutralização por Al trocável + elevação de Ca + Mg",
};

const getLimingCriterionPreviewText = (value: unknown): string | null => {
  if (!value) return null;
  const text = String(value).trim();
  return text ? limingCriterionLabels[text] ?? text : null;
};

const getApiErrorMessage = (error: unknown): string | null => {
  if (!(error instanceof AxiosError)) return null;

  const data = error.response?.data;
  if (typeof data === "string") return data;
  if (!data || typeof data !== "object") return null;

  const record = data as Record<string, unknown>;
  for (const field of ["message", "mensagem", "mensagem_tecnica", "mensagemTecnica", "error", "detail"]) {
    const message = getLimingCriterionPreviewText(record[field]);
    if (message) return message;
  }

  return null;
};

const toRequiredNumericId = (value: string): number | null => {
  if (!value) return null;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
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

const organicFertilizerReferenceNutrientOptions: {
  value: OrganicFertilizerReferenceNutrient;
  label: string;
}[] = [
  { value: "NITROGENIO", label: "Nitrogênio (N)" },
  { value: "FOSFORO", label: "Fósforo (P2O5)" },
  { value: "POTASSIO", label: "Potássio (K2O)" },
];

const correctiveSoilFertilizationQuestions: {
  field: keyof Omit<CorrectiveSoilFertilizationPayload, "adubacaoCorretivaSolo">;
  label: string;
}[] = [
  {
    field: "areaIncorporacaoConversaoRecente",
    label: "A área é de incorporação / conversão recente (1 a 2 anos) de área nativa ou pastagem?",
  },
  {
    field: "areaDegradadaMaisDeCincoAnosSemAdubacao",
    label: "A área está degradada por mais de 5 anos de cultivos sem adubação?",
  },
  {
    field: "areaErosaoLaminarSulcoEmRecuperacao",
    label:
      "A área sofreu erosão laminar ou em sulco e está em recuperação após cuidados de Manejo e Conservação do Solo?",
  },
  {
    field: "cultivoAltaTecnologiaAltasProdutividades",
    label:
      "Pretende fazer cultivo com alta tecnologia e obtenção de altas produtividades, com uso intensivo de capital?",
  },
];

const defaultCorrectiveSoilFertilization: CorrectiveSoilFertilizationPayload = {
  adubacaoCorretivaSolo: false,
  areaIncorporacaoConversaoRecente: false,
  areaDegradadaMaisDeCincoAnosSemAdubacao: false,
  areaErosaoLaminarSulcoEmRecuperacao: false,
  cultivoAltaTecnologiaAltasProdutividades: false,
};

const getGreenFertilizerLabel = (fertilizer: GreenFertilizerResponseDto) => fertilizer.nome_adubo;

const deduplicateGreenFertilizers = (fertilizers: GreenFertilizerResponseDto[]) =>
  Array.from(new Map(fertilizers.map((fertilizer) => [fertilizer.id, fertilizer])).values());
const deduplicateOrganicFertilizers = (fertilizers: OrganicFertilizerResponseDto[]) =>
  Array.from(new Map(fertilizers.map((fertilizer) => [fertilizer.id, fertilizer])).values());

const initialCropSpacingForm: CropSpacingFormState = {
  rowDistance: "",
  plantSpacingMode: "plants_per_meter",
  plantSpacingValue: "",
  plantsPerHole: "",
};

const canPrintRecommendation = (cargo?: string) => {
  const roleMode = getAuthorizationRoleMode(cargo);
  return roleMode === "SUPREME" || roleMode === "RESIDENT" || roleMode === "CONSULTANT";
};

const normalizeLimingCriteria = (criteria?: string | null): RecommendationLimingCriteria | undefined => {
  if (!criteria) return undefined;
  if (criteria === "PORCENTAGEM_DE_SATURACAO_DAS_BASES") return "SATURACAO_POR_BASES_TROCAVEIS";
  return criteria as RecommendationLimingCriteria;
};

const normalizeTable = (table: RecommendationTableApiResponse, fallbackSource: TableOption["source"]): TableOption | null => {
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
  return { id: table.id, label: `${baseName}${cropName}${regionText}`, source, cropName: table.nome_comum_cultura ?? null };
};

const filterTablesByGroup = (tables: TableOption[], group: TableGroupValue) =>
  group ? tables.filter((table) => table.source === group) : [];

type TableFetchers = Record<Exclude<TableGroupValue, "">, () => Promise<RecommendationTableApiResponse[]>>;

const getAxiosStatus = (error: unknown): number | null =>
  error instanceof AxiosError ? error.response?.status ?? null : null;

const normalizeTableResponse = (response: unknown): RecommendationTableApiResponse[] => {
  if (Array.isArray(response)) return response as RecommendationTableApiResponse[];
  if (!response || typeof response !== "object") return [];

  const record = response as Record<string, unknown>;
  if (Array.isArray(record.content)) return record.content as RecommendationTableApiResponse[];
  if (Array.isArray(record.data)) return record.data as RecommendationTableApiResponse[];
  return [];
};

const isNotFoundError = (error: unknown) =>
  getAxiosStatus(error) === 404;

const isRecoverableTableLoadError = (error: unknown) => {
  const status = getAxiosStatus(error);
  return status === 404 || status === 500;
};

const logRecoverableTableLoadError = (
  label: string,
  group: TableGroupValue,
  error: unknown,
) => {
  const status = getAxiosStatus(error);
  console.warn(
    `[Recommendation] ${label} indisponível no carregamento inicial; usando lista vazia.`,
    { group, status, error },
  );
};

const loadTableOptionsByGroup = async (
  group: TableGroupValue,
  fetchers: TableFetchers,
): Promise<TableOption[]> => {
  if (!group) return [];
  try {
    return normalizeTableResponse(await fetchers[group]())
	.map((table) => normalizeTable(table, group))
	.filter(Boolean) as TableOption[];
  } catch (error) {
    if (isNotFoundError(error)) return [];
    throw error;
  }
};

const getAnalysisLabelPrefix = (analysis: SoilAnalysisResponse) =>
  `Análise ${analysis.ano_analise} • ${analysis.laboratorio_responsavel}`;

const mapAnalysisOption = (analysis: SoilAnalysisResponse): AnalysisOption<SoilAnalysisResponse> => ({
  id: analysis.id,
  label: `${getAnalysisLabelPrefix(analysis)} • ${analysis.tipo_extrato}`,
  analysis,
});

const getRecommendationFolderName = (recommendation: RecommendationResponse) =>
  recommendation.nome_pasta_recomendacao?.trim() ||
  recommendation.nomePastaRecomendacao?.trim() ||
  `Recomendação #${recommendation.id}`;

type RecommendationDocumentResponse =
  | SummaryRecommendationResponse
  | DirectRecommendationResponse
  | ShoppingListResponse;

type LoadedRecommendationFolderDocument = {
  text: string;
  technicalWarnings: string[];
  summaryRecommendationDocument?: SummaryRecommendationResponse;
  directRecommendationDocument?: DirectRecommendationResponse;
  shoppingListDocument?: ShoppingListResponse;
};

const commonDocumentTextFields = [
  "conteudo",
  "content",
  "texto",
  "text",
  "documento",
  "document",
  "markdown",
  "relatorio",
  "report",
];

const documentSpecificTextFields: Record<Exclude<RecommendationDocumentKey, "general">, string[]> = {
  summary: ["resumo", "summary", "recomendacao_resumida", "recomendacaoResumida", "summaryRecommendation"],
  direct: ["recomendacao_direta", "recomendacaoDireta", "direct", "directRecommendation"],
  shopping: ["lista_compras", "listaCompras", "shoppingList"],
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

const getTextField = (value: unknown): string => {
  if (typeof value !== "string") return "";
  return value.trim();
};

const getRecommendationDocumentTechnicalWarnings = (
  document: RecommendationDocumentResponse | string | null | undefined,
): string[] => {
  if (!document || typeof document !== "object") return [];

  const record = document as Record<string, unknown>;
  return Array.from(
    new Set(
      technicalWarningFields
        .map((field) => getTextField(record[field]))
        .filter(Boolean),
    ),
  );
};

const getRecommendationDocumentText = (
  document: RecommendationDocumentResponse | string | null | undefined,
  key: Exclude<RecommendationDocumentKey, "general">,
): string => {
  const directText = getTextField(document);
  if (directText) return directText;

  if (!document || typeof document !== "object") return "";

  const record = document as Record<string, unknown>;
  for (const field of [...documentSpecificTextFields[key], ...commonDocumentTextFields]) {
	const text = getTextField(record[field]);
	if (text) return text;
  }

  return "";
};

export default function Recommendation() {
  const user = useUserStore((s) => s.user);
  const navigate = useNavigate();
  const userCanPrint = canPrintRecommendation(user?.cargo);


  const [recommendationType, setRecommendationType] = useState("");
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [selectedPlotId, setSelectedPlotId] = useState("");
  const [physicalAnalysisId, setPhysicalAnalysisId] = useState("");
  const [fertilityAnalysisId, setFertilityAnalysisId] = useState("");
  const [saturationExtractAnalysisId, setSaturationExtractAnalysisId] = useState("");
  const [annualCropFolderId, setAnnualCropFolderId] = useState("");
  const [cropId, setCropId] = useState("");
  const [cropFertilizationTableGroup, setCropFertilizationTableGroup] = useState<TableGroupValue>("");
  const [soilFertilityInterpretationTableGroup, setSoilFertilityInterpretationTableGroup] = useState<TableGroupValue>("");
  const [cropFoliarAnalysisInterpretationTableGroup, setCropFoliarAnalysisInterpretationTableGroup] = useState<TableGroupValue>("");
  const [cropFertilizationTableId, setCropFertilizationTableId] = useState("");
  const [soilFertilityInterpretationTableId, setSoilFertilityInterpretationTableId] = useState("");
  const [cropFoliarAnalysisInterpretationTableId, setCropFoliarAnalysisInterpretationTableId] = useState("");
  const [fertilizerSourceOption, setFertilizerSourceOption] = useState<FertilizerSourceOption>("ALL");
  const [useOrganicFertilizer, setUseOrganicFertilizer] = useState(false);
  const [organicFertilizerId, setOrganicFertilizerId] = useState("");
  const [organicFertilizerReferenceNutrient, setOrganicFertilizerReferenceNutrient] =
    useState<OrganicFertilizerReferenceNutrient | "">("");
  const [useOrganoMineralFertilizer, setUseOrganoMineralFertilizer] = useState(false);
  const [useBioFertilizer, setUseBioFertilizer] = useState(false);
  const [useGreenFertilizer, setUseGreenFertilizer] = useState(false);
  const [greenFertilizerId, setGreenFertilizerId] = useState("");
  const [correctiveSoilFertilization, setCorrectiveSoilFertilization] =
    useState<CorrectiveSoilFertilizationPayload>(defaultCorrectiveSoilFertilization);
  const [textureClassificationSystem, setTextureClassificationSystem] =
    useState<TextureClassificationSystem>("BRASILEIRO");
  const [recommendationFolderName, setRecommendationFolderName] = useState("");
  const [reportMunicipality, setReportMunicipality] = useState("");
  const [reportState, setReportState] = useState("");
  const [reportProfessionalRegistration, setReportProfessionalRegistration] = useState("");
  const [cropSpacingForm, setCropSpacingForm] = useState<CropSpacingFormState>(initialCropSpacingForm);

  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [plots, setPlots] = useState<PlotResponse[]>([]);
  const [physicalAnalysisOptions, setPhysicalAnalysisOptions] = useState<AnalysisOption<SoilAnalysisResponse>[]>([]);
  const [fertilityAnalysisOptions, setFertilityAnalysisOptions] = useState<AnalysisOption<SoilAnalysisResponse>[]>([]);
  const [saturationExtractAnalysisOptions, setSaturationExtractAnalysisOptions] = useState<AnalysisOption<SoilAnalysisResponse>[]>([]);
  const [annualCropFolders, setAnnualCropFolders] = useState<AnnualCropFolderResponseDto[]>([]);
  const [cropFertilizationTables, setCropFertilizationTables] = useState<TableOption[]>([]);
  const [soilFertilityTables, setSoilFertilityTables] = useState<TableOption[]>([]);
  const [foliarInterpretationTables, setFoliarInterpretationTables] = useState<TableOption[]>([]);
  const [greenFertilizers, setGreenFertilizers] = useState<GreenFertilizerResponseDto[]>([]);
  const [organicFertilizers, setOrganicFertilizers] = useState<OrganicFertilizerResponseDto[]>([]);
  const [selectedRecommendation, setSelectedRecommendation] = useState<RecommendationResponse | null>(null);
  const [recommendationsHistory, setRecommendationsHistory] = useState<RecommendationResponse[]>([]);

  const [loadingProperties, setLoadingProperties] = useState(false);
  const [loadingPlots, setLoadingPlots] = useState(false);
  const [loadingPlotAnalyses, setLoadingPlotAnalyses] = useState(false);
  const [loadingAnnualCropFolders, setLoadingAnnualCropFolders] = useState(false);
  const [loadingTables, setLoadingTables] = useState(false);
  const [loadingGreenFertilizers, setLoadingGreenFertilizers] = useState(false);
  const [loadingOrganicFertilizers, setLoadingOrganicFertilizers] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyErrorMessage, setHistoryErrorMessage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [openingRecommendationId, setOpeningRecommendationId] = useState<number | null>(null);
  const [selectedDocumentKey, setSelectedDocumentKey] = useState<RecommendationDocumentKey>("general");
  const [loadedDocuments, setLoadedDocuments] = useState<Partial<Record<RecommendationDocumentKey, string>>>({});
  const [summaryRecommendationDocument, setSummaryRecommendationDocument] =
    useState<SummaryRecommendationResponse | null>(null);
  const [directRecommendationDocument, setDirectRecommendationDocument] =
    useState<DirectRecommendationResponse | null>(null);
  const [shoppingListDocument, setShoppingListDocument] = useState<ShoppingListResponse | null>(null);
  const [notGeneratedDocuments, setNotGeneratedDocuments] = useState<Partial<Record<RecommendationDocumentKey, boolean>>>({});
  const [documentErrors, setDocumentErrors] = useState<Partial<Record<RecommendationDocumentKey, string>>>({});
  const [documentTechnicalWarnings, setDocumentTechnicalWarnings] =
    useState<Partial<Record<RecommendationDocumentKey, string[]>>>({});
  const [loadingDocumentKey, setLoadingDocumentKey] = useState<RecommendationDocumentKey | null>(null);
  const [printing, setPrinting] = useState(false);
  const [improvingNarrative, setImprovingNarrative] = useState(false);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [limingCriterionPreview, setLimingCriterionPreview] =
    useState<LimingCriterionPreview>(defaultLimingCriterionPreview);

  const restorePageInteractionStyles = useCallback(() => {
	if (typeof document === "undefined") return;

	document.body.style.overflow = "";
	document.body.style.pointerEvents = "";
	document.documentElement.style.overflow = "";
  }, []);

  const closeFullscreenRecommendation = useCallback(() => {
	setIsFullscreenOpen(false);
	setSelectedDocumentKey("general");
	setLoadingDocumentKey(null);
	restorePageInteractionStyles();
  }, [restorePageInteractionStyles]);

  const handleFullscreenOpenChange = useCallback(
	(open: boolean) => {
  	if (open) {
    	setIsFullscreenOpen(true);
    	return;
  	}

  	closeFullscreenRecommendation();
	},
	[closeFullscreenRecommendation],
  );

  useEffect(() => {
	if (!isFullscreenOpen) {
  	restorePageInteractionStyles();
  	return undefined;
	}

	return () => {
  	restorePageInteractionStyles();
	};
  }, [isFullscreenOpen, restorePageInteractionStyles]);

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
  const selectedCropFertilizationTable = useMemo(
	() => cropFertilizationTables.find((table) => String(table.id) === cropFertilizationTableId) ?? null,
	[cropFertilizationTables, cropFertilizationTableId],
  );
  const handleCropLoadError = useCallback(() => {
	toaster.create({ title: "Falha ao carregar culturas da pasta anual.", type: "error" });
  }, []);
  const handleCropSpacingChange = useCallback((nextSpacingForm: CropSpacingFormState) => {
	setCropSpacingForm(nextSpacingForm);
  }, []);
  const {
	crops,
	loadingCrops,
	selectedCrop,
	selectedCropSpacingWarning,
  } = useRecommendationCrops({
	annualCropFolderId,
	cropId,
	onCropChange: setCropId,
	onSpacingChange: handleCropSpacingChange,
	onLoadError: handleCropLoadError,
  });

  useEffect(() => {
	setSelectedDocumentKey("general");
	setLoadedDocuments({});
	setSummaryRecommendationDocument(null);
	setDirectRecommendationDocument(null);
	setShoppingListDocument(null);
	setNotGeneratedDocuments({});
	setDocumentErrors({});
	setDocumentTechnicalWarnings({});
	setLoadingDocumentKey(null);
  }, [selectedRecommendation?.id]);
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
    	const tables = await loadTableOptionsByGroup(cropFertilizationTableGroup, {
      	PRIVATE: fetchCropFertilizationTables,
      	PUBLIC: fetchPublicCropFertilizationTables,
      	DEFAULT: fetchDefaultCropFertilizationTables,
    	});
    	setCropFertilizationTables(tables);
    	if (!tables.some((table) => String(table.id) === cropFertilizationTableId)) {
      	setCropFertilizationTableId("");
    	}
  	} catch (error) {
    	if (isRecoverableTableLoadError(error)) {
      	logRecoverableTableLoadError("Tabelas de adubação", cropFertilizationTableGroup, error);
    	} else {
      	console.error(error);
    	}
    	setCropFertilizationTables([]);
    	setCropFertilizationTableId("");
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
    	const tables = await loadTableOptionsByGroup(soilFertilityInterpretationTableGroup, {
      	PRIVATE: fetchSoilFertilityTables,
      	PUBLIC: fetchPublicSoilFertilityTables,
      	DEFAULT: fetchDefaultSoilFertilityTables,
    	});
    	setSoilFertilityTables(tables);
    	if (!tables.some((table) => String(table.id) === soilFertilityInterpretationTableId)) {
      	setSoilFertilityInterpretationTableId("");
    	}
  	} catch (error) {
    	if (isRecoverableTableLoadError(error)) {
      	logRecoverableTableLoadError("Tabelas de fertilidade do solo", soilFertilityInterpretationTableGroup, error);
    	} else {
      	console.error(error);
    	}
    	setSoilFertilityTables([]);
    	setSoilFertilityInterpretationTableId("");
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
    	const tables = await loadTableOptionsByGroup(cropFoliarAnalysisInterpretationTableGroup, {
      	PRIVATE: fetchFoliarTables,
      	PUBLIC: fetchPublicFoliarTables,
      	DEFAULT: fetchDefaultFoliarTables,
    	});
    	setFoliarInterpretationTables(tables);
    	if (!tables.some((table) => String(table.id) === cropFoliarAnalysisInterpretationTableId)) {
      	setCropFoliarAnalysisInterpretationTableId("");
    	}
  	} catch (error) {
    	if (isRecoverableTableLoadError(error)) {
      	logRecoverableTableLoadError("Tabelas foliares", cropFoliarAnalysisInterpretationTableGroup, error);
    	} else {
      	console.error(error);
    	}
    	setFoliarInterpretationTables([]);
    	setCropFoliarAnalysisInterpretationTableId("");
  	} finally { setLoadingTables(false); }
	};
	loadFoliarTables();
  }, [cropFoliarAnalysisInterpretationTableGroup]);

  useEffect(() => {
    const loadOrganicFertilizers = async () => {
      if (!useOrganicFertilizer) {
        setOrganicFertilizers([]);
        setOrganicFertilizerId("");
        return;
      }
      setLoadingOrganicFertilizers(true);
      setOrganicFertilizerId("");
      try {
        const normalizedSource = normalizeFertilizerSourceOption(fertilizerSourceOption);
        const fertilizers = normalizedSource === "PUBLIC"
          ? await fetchPublicOrganicFertilizers()
          : normalizedSource === "DEFAULT"
            ? await fetchDefaultOrganicFertilizers()
            : normalizedSource === "PRIVATE"
              ? await fetchOrganicFertilizers()
              : deduplicateOrganicFertilizers((await Promise.all([
                  fetchOrganicFertilizers(),
                  fetchPublicOrganicFertilizers(),
                  fetchDefaultOrganicFertilizers(),
                ])).flat());
        setOrganicFertilizers(fertilizers ?? []);
      } catch (error) {
        console.error(error);
        setOrganicFertilizers([]);
        toaster.create({ title: "Falha ao carregar adubos orgânicos.", type: "error" });
      } finally {
        setLoadingOrganicFertilizers(false);
      }
    };
    void loadOrganicFertilizers();
  }, [fertilizerSourceOption, useOrganicFertilizer]);

  useEffect(() => {
	const loadGreenFertilizers = async () => {
  	if (!useGreenFertilizer) {
    	setGreenFertilizers([]);
    	setGreenFertilizerId("");
    	return;
  	}

  	setLoadingGreenFertilizers(true);
  	setGreenFertilizerId("");

  	try {
    	const normalizedSource = normalizeFertilizerSourceOption(fertilizerSourceOption);
    	const fertilizers =
      	normalizedSource === "PUBLIC"
        	? await fetchPublicGreenFertilizers()
        	: normalizedSource === "DEFAULT"
          	? await fetchDefaultGreenFertilizers()
          	: normalizedSource === "PRIVATE"
            	? await fetchGreenFertilizers()
            	: deduplicateGreenFertilizers(
                	(await Promise.all([
                  	fetchGreenFertilizers(),
                  	fetchPublicGreenFertilizers(),
                  	fetchDefaultGreenFertilizers(),
                	])).flat(),
              	);

    	setGreenFertilizers(fertilizers ?? []);
  	} catch (error) {
    	console.error(error);
    	setGreenFertilizers([]);
    	toaster.create({
      	title: "Falha ao carregar adubos verdes.",
      	description: "Não foi possível listar os adubos verdes disponíveis para a origem selecionada.",
      	type: "error",
    	});
  	} finally {
    	setLoadingGreenFertilizers(false);
  	}
	};

	void loadGreenFertilizers();
  }, [fertilizerSourceOption, useGreenFertilizer]);

  useEffect(() => {
	let isCurrent = true;

	const requiredIds = {
  	cropFertilizationTableId: toRequiredNumericId(cropFertilizationTableId),
  	propertyId: toRequiredNumericId(selectedPropertyId),
  	plotId: toRequiredNumericId(selectedPlotId),
  	fertilityAnalysisId: toRequiredNumericId(fertilityAnalysisId),
	};

	const canResolveLimingCriterion = Object.values(requiredIds).every((id) => id !== null);

	if (!canResolveLimingCriterion) {
  	setLimingCriterionPreview(defaultLimingCriterionPreview);
  	return () => { isCurrent = false; };
	}

	const physicalAnalysisNumber = physicalAnalysisId ? Number(physicalAnalysisId) : null;
	const saturationExtractAnalysisNumber = saturationExtractAnalysisId ? Number(saturationExtractAnalysisId) : null;

	setLimingCriterionPreview({
  	criterionLabel: "Consultando backend...",
  	limingNeed: null,
  	warning: "O critério de calagem será resolvido pelo backend a partir das análises completas selecionadas.",
	});

	const loadLimingCriterionPreview = async () => {
  	try {
    	const response = await calculateTemporaryLimingCriterion({
      	cropFertilizationTableId: requiredIds.cropFertilizationTableId as number,
      	propertyId: requiredIds.propertyId as number,
      	plotId: requiredIds.plotId as number,
      	physicalAnalysisId: physicalAnalysisNumber,
      	fertilityAnalysisId: requiredIds.fertilityAnalysisId as number,
      	saturationExtractAnalysisId: saturationExtractAnalysisNumber,
      	id_propriedade: requiredIds.propertyId as number,
      	id_talhao: requiredIds.plotId as number,
      	id_analise_fisica: physicalAnalysisNumber,
      	id_analise_fertilidade: requiredIds.fertilityAnalysisId as number,
      	id_analise_extrato_saturacao: saturationExtractAnalysisNumber,
      	id_tabela_adubacao_cultura: requiredIds.cropFertilizationTableId as number,
    	});

    	if (!isCurrent) return;

    	const criterionLabel = getLimingCriterionPreviewText(
      	response.indicatedLimingCriterion ??
      	response.criterio_de_calagem_indicado ??
      	response.criterio_calagem_indicado ??
      	response.criterioCalagemIndicado ??
      	response.criterio_de_calagem
    	);
    	const backendMessage = getLimingCriterionPreviewText(
      	response.message ??
      	response.mensagem ??
      	response.mensagem_tecnica ??
      	response.mensagemTecnica ??
      	response.error ??
      	response.detail
    	);

    	setLimingCriterionPreview({
      	criterionLabel: criterionLabel ?? backendMessage ?? "Critério não informado pelo backend",
      	limingNeed: null,
      	warning: criterionLabel
        	? backendMessage ?? "Critério informado pelo backend para as análises completas selecionadas."
        	: "O backend não retornou um critério válido para as análises completas selecionadas.",
    	});
  	} catch (error) {
    	console.error(error);
    	if (!isCurrent) return;

    	const backendMessage = getApiErrorMessage(error);
    	setLimingCriterionPreview({
      	criterionLabel: backendMessage ?? "Critério não informado pelo backend",
      	limingNeed: null,
      	warning: backendMessage
        	? "Mensagem retornada pelo backend ao resolver o critério temporário."
        	: "Não foi possível consultar o backend para resolver o critério temporário.",
    	});
  	}
	};

	void loadLimingCriterionPreview();

	return () => { isCurrent = false; };
  }, [
	cropFertilizationTableId,
	fertilityAnalysisId,
	physicalAnalysisId,
	saturationExtractAnalysisId,
	selectedPlotId,
	selectedPropertyId,
  ]);

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
  	setPhysicalAnalysisId("");
  	setFertilityAnalysisId("");
  	setSaturationExtractAnalysisId("");
  	setAnnualCropFolderId("");
  	setCropId("");
  	setPhysicalAnalysisOptions([]);
  	setFertilityAnalysisOptions([]);
  	setSaturationExtractAnalysisOptions([]);
  	setAnnualCropFolders([]);
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

    	const physicalOptions: AnalysisOption<SoilAnalysisResponse>[] = [];
    	const fertilityOptions: AnalysisOption<SoilAnalysisResponse>[] = [];
    	const saturationOptions: AnalysisOption<SoilAnalysisResponse>[] = [];

    	for (const analysis of soilAnalyses ?? []) {
      	const isLayerAnalysis = analysis.tipo_extrato === TipoExtrato.CAMADAS;
      	const containers = isLayerAnalysis
        	? await layerExtractService.getByAnalysisId(analysis.id)
        	: await rangeExtractService.getByAnalysisId(analysis.id);

      	if (!isCurrent) return;

      	let hasPhysicalExtract = false;
      	let hasFertilityExtract = false;
      	let hasSaturationExtract = false;

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

        	hasPhysicalExtract = hasPhysicalExtract || Boolean(physicalExtracts?.length);
        	hasFertilityExtract = hasFertilityExtract || Boolean(fertilityExtracts?.length);
        	hasSaturationExtract = hasSaturationExtract || Boolean(saturationExtracts?.length);
      	}

      	if (hasPhysicalExtract) physicalOptions.push(mapAnalysisOption(analysis));
      	if (hasFertilityExtract) fertilityOptions.push(mapAnalysisOption(analysis));
      	if (hasSaturationExtract) saturationOptions.push(mapAnalysisOption(analysis));
    	}

    	if (!isCurrent) return;

    	setPhysicalAnalysisOptions(physicalOptions);
    	setFertilityAnalysisOptions(fertilityOptions);
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

  const handleGenerate = async () => {
    if (useOrganicFertilizer && !organicFertilizerId) {
      toaster.create({
        title: "Selecione o adubo orgânico.",
        description: "A recomendação orgânica exige a seleção explícita de um produto.",
        type: "warning",
      });
      return;
    }
	const validation = validateRecommendationGeneration({
  	recommendationType,
  	propertyId: selectedPropertyId,
  	plotId: selectedPlotId,
  	physicalAnalysisId,
  	fertilityAnalysisId,
  	annualCropFolderId,
  	cropId,
  	cropFertilizationTableId,
  	soilFertilityInterpretationTableId,
  	cropFoliarAnalysisInterpretationTableId,
  	cropFertilizationTableGroup,
  	soilFertilityInterpretationTableGroup,
  	cropFoliarAnalysisInterpretationTableGroup,
  	fertilizerSourceOption,
  	texturalClassification: textureClassificationSystem,
  	useOrganicFertilizer,
  	organicFertilizerReferenceNutrient,
  	useGreenFertilizer,
  	greenFertilizerId,
  	selectedCrop,
  	selectedCropFertilizationTable,
	});

	if (!validation.isValid) {
  	toaster.create({ title: validation.title, description: validation.description, type: "warning" });
  	return;
	}

	setGenerating(true);
	try {
  	const payload = buildRecommendationCreatePayload({
    	recommendationType: validation.recommendationType,
    	propertyId: selectedPropertyId,
    	plotId: selectedPlotId,
    	physicalAnalysisId,
    	fertilityAnalysisId,
    	saturationExtractAnalysisId,
    	annualCropFolderId,
    	cropId,
    	cropFertilizationTableId,
    	soilFertilityInterpretationTableId,
    	cropFoliarAnalysisInterpretationTableId,
    	cropFertilizationTableGroup: validation.cropFertilizationTableGroup,
    	soilFertilityInterpretationTableGroup: validation.soilFertilityInterpretationTableGroup,
    	cropFoliarAnalysisInterpretationTableGroup: validation.cropFoliarAnalysisInterpretationTableGroup,
    	limingCriteria: null,
    	fertilizerSourceOption: validation.fertilizerSourceOption,
    	recommendationFolderName,
      reportMunicipality,
      reportState,
      reportProfessionalRegistration,
    	texturalClassification: validation.texturalClassification,
    	useOrganicFertilizer,
        organicFertilizerId,
    	organicFertilizerReferenceNutrient,
    	useOrganoMineralFertilizer,
    	useBioFertilizer,
    	useGreenFertilizer,
    	greenFertilizerId,
    	correctiveSoilFertilization,
  	});
  	const result = await generateRecommendation(payload);
  	setSelectedRecommendation(result);
  	toaster.create({ title: "Recomendação gerada com sucesso.", type: "success" });
  	await loadHistory();
	} catch (error) {
  	const axiosError = error as AxiosError;
  	console.error("Erro ao gerar recomendação:", axiosError.response?.data || error);
  	toaster.create({
    	title: "Falha ao gerar recomendação.",
    	description: "O backend recusou o payload atual. Confira se as tabelas escolhidas pertencem aos grupos informados.",
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
    const printableDocuments = printableRecommendation as RecommendationPrintResponse & {
      recomendacao_resumida?: SummaryRecommendationResponse | string | null;
      recomendacao_direta?: DirectRecommendationResponse | string | null;
      lista_compras?: ShoppingListResponse | string | null;
    };
    const printableReportText = selectedDocumentKey === "general"
      ? getRecommendationReportText(printableRecommendation)
      : getRecommendationDocumentText(
          selectedDocumentKey === "summary"
            ? printableDocuments.recomendacao_resumida
            : selectedDocumentKey === "direct"
              ? printableDocuments.recomendacao_direta
              : printableDocuments.lista_compras,
          selectedDocumentKey,
        );

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

    writePrintableReport(
      printWindow,
      printableReportText,
      printableRecommendation,
      selectedDocumentKey,
      reportLogoUrl,
    );
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

  const loadRecommendationFolderDocument = async (
	key: Exclude<RecommendationDocumentKey, "general">,
	recommendationId: number,
  ): Promise<LoadedRecommendationFolderDocument> => {
	if (key === "summary") {
  	const document = await getSummaryRecommendationByRecommendation(recommendationId);
  	return {
    	text: getRecommendationDocumentText(document, key),
    	technicalWarnings: getRecommendationDocumentTechnicalWarnings(document),
    	summaryRecommendationDocument: document,
  	};
	}

	if (key === "direct") {
  	const document = await getDirectRecommendationByRecommendation(recommendationId);
  	return {
    	text: getRecommendationDocumentText(document, key),
    	technicalWarnings: getRecommendationDocumentTechnicalWarnings(document),
    	directRecommendationDocument: document,
  	};
	}

	const document = await getShoppingListByRecommendation(recommendationId);
	return {
  	text: getRecommendationDocumentText(document, key),
  	technicalWarnings: getRecommendationDocumentTechnicalWarnings(document),
  	shoppingListDocument: document,
	};
  };

  const reportText = getRecommendationReportText(selectedRecommendation);
  const structuredDocuments = useMemo<Partial<Record<RecommendationDocumentKey, boolean>>>(
	() => ({
    general:
      hasEconomicFertilizerDecisionContent(selectedRecommendation) ||
      hasGypsumRecommendationContent(selectedRecommendation) ||
      hasSulfurRecommendationContent(selectedRecommendation),
  	summary:
      hasEconomicFertilizerDecisionContent(summaryRecommendationDocument) ||
      hasMicronutrientFertilizerRows(summaryRecommendationDocument) ||
      hasRecommendationFertigramCharts(summaryRecommendationDocument, "chemical") ||
      hasGypsumRecommendationContent(summaryRecommendationDocument) ||
      hasSulfurRecommendationContent(summaryRecommendationDocument) ||
      Boolean(documentTechnicalWarnings.summary?.length),
  	direct:
      hasEconomicFertilizerDecisionContent(directRecommendationDocument) ||
      hasDirectFertilizationObservations(directRecommendationDocument) ||
      hasDirectNpkFertilizerRows(directRecommendationDocument) ||
      Boolean(documentTechnicalWarnings.direct?.length),
  	shopping:
      hasStructuredRecommendationContent(shoppingListDocument) ||
      Boolean(documentTechnicalWarnings.shopping?.length),
	}),
	[directRecommendationDocument, documentTechnicalWarnings, selectedRecommendation, shoppingListDocument, summaryRecommendationDocument],
  );
  const recommendationDocuments = useMemo<RecommendationDocumentView[]>(() => {
	return buildRecommendationDocumentViews({
  	reportText,
  	loadedDocuments,
  	notGeneratedDocuments,
  	documentErrors,
  	loadingDocumentKey,
  	structuredDocuments,
	});
  }, [documentErrors, loadedDocuments, loadingDocumentKey, notGeneratedDocuments, reportText, structuredDocuments]);
  const selectedDocument = recommendationDocuments.find((document) => document.key === selectedDocumentKey) ?? recommendationDocuments[0];
  const selectedDocumentError = documentErrors[selectedDocument.key];

  const handleCopySelectedDocument = async () => {
	if (!selectedDocument?.content) {
  	toaster.create({ title: "Nenhum documento para copiar.", type: "warning" });
  	return;
	}

	try {
  	await navigator.clipboard.writeText(selectedDocument.content);
  	toaster.create({ title: "Documento copiado para a área de transferência.", type: "success" });
	} catch (error) {
  	console.error(error);
  	toaster.create({ title: "Falha ao copiar documento.", type: "error" });
	}
  };

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
    	description: "Não foi possível buscar o detalhe completo. Abrindo os dados já carregados no histórico.",
    	type: "warning",
  	});
	} finally {
  	setOpeningRecommendationId(null);
	}
  };

  const handleDeleteRecommendation = async (item: RecommendationResponse) => {
	setDeletingId(item.id);
	try {
  	await deleteRecommendation(item.id);
  	if (selectedRecommendation?.id === item.id) setSelectedRecommendation(null);
  	toaster.create({ title: "Recomendação excluída com sucesso.", type: "success" });
  	await loadHistory();
	} catch (error) {
  	console.error(error);
  	toaster.create({ title: "Falha ao excluir recomendação.", type: "error" });
	} finally {
  	setDeletingId(null);
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
	setNotGeneratedDocuments((currentDocuments) => ({ ...currentDocuments, [document.key]: false }));
	setDocumentTechnicalWarnings((currentWarnings) => ({ ...currentWarnings, [document.key]: [] }));

	try {
  	if (document.key === "general") {
    	const refreshedRecommendation = await getRecommendation(selectedRecommendation.id);
    	setSelectedRecommendation(refreshedRecommendation);

    	const refreshedGeneralReport = getRecommendationReportText(refreshedRecommendation);
    	if (!refreshedGeneralReport.trim()) {
      	const message = documentUnavailableMessages[document.key];
      	setNotGeneratedDocuments((currentDocuments) => ({ ...currentDocuments, [document.key]: true }));
      	toaster.create({
        	title: message,
        	type: "warning",
      	});
    	}
    	return;
  	}

  	const loadedDocument = await loadRecommendationFolderDocument(document.key, selectedRecommendation.id);
  	if (loadedDocument.summaryRecommendationDocument) {
    	setSummaryRecommendationDocument(loadedDocument.summaryRecommendationDocument);
  	}
  	if (loadedDocument.directRecommendationDocument) {
    	setDirectRecommendationDocument(loadedDocument.directRecommendationDocument);
  	}
  	if (loadedDocument.shoppingListDocument) {
    	setShoppingListDocument(loadedDocument.shoppingListDocument);
  	}
  	setDocumentTechnicalWarnings((currentWarnings) => ({
    	...currentWarnings,
    	[document.key]: loadedDocument.technicalWarnings,
  	}));

	const hasShoppingStructuredContent = hasStructuredRecommendationContent(loadedDocument.shoppingListDocument);
  	const hasDirectNpkStructuredContent = hasDirectNpkFertilizerRows(
    	loadedDocument.directRecommendationDocument,
  	);
  	const hasDirectFertilizationObservationContent = hasDirectFertilizationObservations(
    	loadedDocument.directRecommendationDocument,
  	);
  	const hasSummaryMicronutrients = hasMicronutrientFertilizerRows(
        loadedDocument.summaryRecommendationDocument,
  	);
  	const hasSummaryFertigramCharts = hasRecommendationFertigramCharts(
        loadedDocument.summaryRecommendationDocument,
        "chemical",
  	);
    const hasSummarySulfurContent = hasSulfurRecommendationContent(
        loadedDocument.summaryRecommendationDocument,
    );
	if (
      loadedDocument.text.trim() ||
      loadedDocument.technicalWarnings.length > 0 ||
      hasSummaryMicronutrients ||
      hasSummaryFertigramCharts ||
      hasSummarySulfurContent ||
      hasDirectNpkStructuredContent ||
      hasDirectFertilizationObservationContent ||
      hasShoppingStructuredContent
    ) {
    	setLoadedDocuments((currentDocuments) => ({ ...currentDocuments, [document.key]: loadedDocument.text }));
    	return;
  	}

  	const message = documentUnavailableMessages[document.key];
  	setNotGeneratedDocuments((currentDocuments) => ({ ...currentDocuments, [document.key]: true }));
  	toaster.create({ title: message, type: "warning" });
	} catch (error) {
  	console.error(error);
  	if (error instanceof AxiosError && error.response?.status === 404) {
    	const message = documentUnavailableMessages[document.key];
    	setNotGeneratedDocuments((currentDocuments) => ({ ...currentDocuments, [document.key]: true }));
    	toaster.create({ title: message, type: "warning" });
    	return;
  	}

  	setDocumentErrors((currentErrors) => ({ ...currentErrors, [document.key]: documentLoadErrorMessage }));
  	toaster.create({
    	title: documentLoadErrorMessage,
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
	: fertilityAnalysisOptions.length
  	? "Análise de fertilidade do talhão"
  	: "Nenhuma análise encontrada";
  const saturationExtractAnalysisPlaceholder = !selectedPlotId
	? "Selecione um talhão para ver análises de extrato de saturação"
	: saturationExtractAnalysisOptions.length
  	? "Opcional: análise de extrato de saturação do talhão"
  	: "Opcional: nenhuma análise encontrada";
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
          	<PropertyPlotSelectors
            	propertyId={selectedPropertyId}
            	plotId={selectedPlotId}
            	properties={properties}
            	plots={plots}
            	loadingProperties={loadingProperties}
            	loadingPlots={loadingPlots}
            	onPropertyChange={setSelectedPropertyId}
            	onPlotChange={setSelectedPlotId}
          	/>
          	<AnalysisSelectors
            	selectedPlotId={selectedPlotId}
            	loadingPlotAnalyses={loadingPlotAnalyses}
            	physicalAnalysisId={physicalAnalysisId}
            	fertilityAnalysisId={fertilityAnalysisId}
            	saturationExtractAnalysisId={saturationExtractAnalysisId}
            	physicalAnalysisOptions={physicalAnalysisOptions}
            	fertilityAnalysisOptions={fertilityAnalysisOptions}
            	saturationExtractAnalysisOptions={saturationExtractAnalysisOptions}
            	physicalAnalysisPlaceholder={physicalAnalysisPlaceholder}
            	fertilityAnalysisPlaceholder={soilFertilityAnalysisPlaceholder}
            	saturationExtractAnalysisPlaceholder={saturationExtractAnalysisPlaceholder}
            	onPhysicalAnalysisChange={setPhysicalAnalysisId}
            	onFertilityAnalysisChange={setFertilityAnalysisId}
            	onSaturationExtractAnalysisChange={setSaturationExtractAnalysisId}
          	/>
          	<CropTableSelectors
            	selectedPlotId={selectedPlotId}
            	annualCropFolderId={annualCropFolderId}
            	cropId={cropId}
            	annualCropFolders={annualCropFolders}
            	crops={crops}
            	annualCropFolderPlaceholder={annualCropFolderPlaceholder}
            	cropPlaceholder={cropPlaceholder}
            	loadingAnnualCropFolders={loadingAnnualCropFolders}
            	loadingCrops={loadingCrops}
            	loadingTables={loadingTables}
            	cropFertilizationTableGroup={cropFertilizationTableGroup}
            	soilFertilityInterpretationTableGroup={soilFertilityInterpretationTableGroup}
            	cropFoliarAnalysisInterpretationTableGroup={cropFoliarAnalysisInterpretationTableGroup}
            	cropFertilizationTableId={cropFertilizationTableId}
            	soilFertilityInterpretationTableId={soilFertilityInterpretationTableId}
            	cropFoliarAnalysisInterpretationTableId={cropFoliarAnalysisInterpretationTableId}
            	cropFertilizationTables={filteredCropFertilizationTables}
            	soilFertilityTables={filteredSoilFertilityTables}
            	foliarInterpretationTables={filteredFoliarInterpretationTables}
            	onAnnualCropFolderChange={setAnnualCropFolderId}
            	onCropChange={setCropId}
            	onCropFertilizationTableGroupChange={setCropFertilizationTableGroup}
            	onSoilFertilityInterpretationTableGroupChange={setSoilFertilityInterpretationTableGroup}
            	onCropFoliarAnalysisInterpretationTableGroupChange={setCropFoliarAnalysisInterpretationTableGroup}
            	onCropFertilizationTableChange={setCropFertilizationTableId}
            	onSoilFertilityInterpretationTableChange={setSoilFertilityInterpretationTableId}
            	onCropFoliarAnalysisInterpretationTableChange={setCropFoliarAnalysisInterpretationTableId}
          	/>
          	<SpacingSection
            	rowDistance={cropSpacingForm.rowDistance}
            	plantSpacingMode={cropSpacingForm.plantSpacingMode}
            	plantSpacingValue={cropSpacingForm.plantSpacingValue}
            	plantsPerHole={cropSpacingForm.plantsPerHole}
            	disabled={!selectedCrop}
            	warning={selectedCropSpacingWarning}
            	onRowDistanceChange={(rowDistance) => setCropSpacingForm((current) => ({ ...current, rowDistance }))}
            	onPlantSpacingModeChange={(plantSpacingMode) => setCropSpacingForm((current) => ({ ...current, plantSpacingMode }))}
            	onPlantSpacingValueChange={(plantSpacingValue) => setCropSpacingForm((current) => ({ ...current, plantSpacingValue }))}
            	onPlantsPerHoleChange={(plantsPerHole) => setCropSpacingForm((current) => ({ ...current, plantsPerHole }))}
          	/>
          	<TextureClassificationSystemSelect
            	value={textureClassificationSystem}
            	onChange={setTextureClassificationSystem}
          	/>
          	<LimingPreviewFields
            	criterionLabel={limingCriterionPreview.criterionLabel}
            	limingNeed={limingCriterionPreview.limingNeed}
            	warning={limingCriterionPreview.warning}
            	formatLimingNeed={formatAdjustedLimingNeed}
          	/>
          	<Box>
            	<Text fontSize="sm" mb={1}>Adubação Corretiva do Solo:</Text>
            	<NativeSelect
              	value={correctiveSoilFertilization.adubacaoCorretivaSolo ? "true" : "false"}
              	onChange={(e) => {
                	const shouldUseCorrectiveFertilization = e.target.value === "true";
                	setCorrectiveSoilFertilization((current) => ({
                  	...defaultCorrectiveSoilFertilization,
                  	...(shouldUseCorrectiveFertilization ? current : {}),
                  	adubacaoCorretivaSolo: shouldUseCorrectiveFertilization,
                	}));
              	}}
              	aria-label="Adubação Corretiva do Solo"
            	>
              	<option value="false">Não</option>
              	<option value="true">Sim</option>
            	</NativeSelect>
          	</Box>
          	{correctiveSoilFertilization.adubacaoCorretivaSolo
            	? correctiveSoilFertilizationQuestions.map((question) => (
              	<Box key={question.field}>
                	<Text fontSize="sm" mb={1}>{question.label}</Text>
                	<NativeSelect
                  	value={correctiveSoilFertilization[question.field] ? "true" : "false"}
                  	onChange={(e) =>
                    	setCorrectiveSoilFertilization((current) => ({
                      	...current,
                      	[question.field]: e.target.value === "true",
                    	}))
                  	}
                  	aria-label={question.label}
                	>
                  	<option value="false">Não</option>
                  	<option value="true">Sim</option>
                	</NativeSelect>
              	</Box>
            	))
            	: null}
          	<Box>
                <Text fontSize="sm" mb={1}>Qual relação de adubos usar?</Text>
                <NativeSelect value={normalizeFertilizerSourceOption(fertilizerSourceOption)} onChange={(e) => setFertilizerSourceOption(e.target.value as FertilizerSourceOption)} aria-label="Quais adubos usar?">{fertilizerOriginOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</NativeSelect>
          	</Box>
          	<Box>
            	<Text fontSize="sm" mb={1}>Utilizar adubo orgânico?</Text>
            	<NativeSelect
              	value={useOrganicFertilizer ? "true" : "false"}
              	onChange={(e) => {
                	const shouldUseOrganicFertilizer = e.target.value === "true";
                	setUseOrganicFertilizer(shouldUseOrganicFertilizer);
                	if (!shouldUseOrganicFertilizer) {
                  	setOrganicFertilizerReferenceNutrient("");
                    setOrganicFertilizerId("");
                	}
              	}}
              	aria-label="Utilizar adubo orgânico?"
            	>
              	<option value="false">Não</option>
              	<option value="true">Sim</option>
            	</NativeSelect>
          	</Box>
            {useOrganicFertilizer ? (
              <Box>
                <Text fontSize="sm" mb={1}>Adubo orgânico:</Text>
                <NativeSelect
                  value={organicFertilizerId}
                  onChange={(e) => setOrganicFertilizerId(e.target.value)}
                  disabled={loadingOrganicFertilizers || !organicFertilizers.length}
                  aria-label="Adubo orgânico"
                >
                  <option value="">
                    {loadingOrganicFertilizers
                      ? "Carregando adubos orgânicos..."
                      : organicFertilizers.length
                        ? "Selecione o adubo orgânico"
                        : "Nenhum adubo orgânico disponível para a origem selecionada"}
                  </option>
                  {organicFertilizers.map((fertilizer) => (
                    <option key={fertilizer.id} value={fertilizer.id}>
                      {fertilizer.nome_adubo} — N {fertilizer.n ?? "-"}%, P₂O₅ {fertilizer.p2o5 ?? "-"}%, K₂O {fertilizer.k2o ?? "-"}%
                    </option>
                  ))}
                </NativeSelect>
              </Box>
            ) : null}
          	{useOrganicFertilizer ? (
            	<Box>
              	<Text fontSize="sm" mb={1}>Nutriente de referência do adubo orgânico:</Text>
              	<NativeSelect
                	value={organicFertilizerReferenceNutrient}
                	onChange={(e) =>
                  	setOrganicFertilizerReferenceNutrient(e.target.value as OrganicFertilizerReferenceNutrient | "")
                	}
                	aria-label="Nutriente de referência do adubo orgânico"
              	>
                	<option value="">Selecione o nutriente de referência:</option>
                	{organicFertilizerReferenceNutrientOptions.map((option) => (
                  	<option key={option.value} value={option.value}>
                    	{option.label}
                  	</option>
                	))}
              	</NativeSelect>
            	</Box>
          	) : null}
          	<Box>
            	<Text fontSize="sm" mb={1}>Utilizar fertilizante organomineral?</Text>
            	<NativeSelect
              	value={useOrganoMineralFertilizer ? "true" : "false"}
              	onChange={(e) => setUseOrganoMineralFertilizer(e.target.value === "true")}
              	aria-label="Utilizar fertilizante organomineral?"
            	>
              	<option value="false">Não</option>
              	<option value="true">Sim</option>
            	</NativeSelect>
          	</Box>
          	<Box>
            	<Text fontSize="sm" mb={1}>Utilizar biofertilizante?</Text>
            	<NativeSelect
              	value={useBioFertilizer ? "true" : "false"}
              	onChange={(e) => setUseBioFertilizer(e.target.value === "true")}
              	aria-label="Utilizar biofertilizante?"
            	>
              	<option value="false">Não</option>
              	<option value="true">Sim</option>
            	</NativeSelect>
          	</Box>
          	<Box>
            	<Text fontSize="sm" mb={1}>Utilizar adubação verde?</Text>
            	<NativeSelect
              	value={useGreenFertilizer ? "true" : "false"}
              	onChange={(e) => {
                	const shouldUseGreenFertilizer = e.target.value === "true";
                	setUseGreenFertilizer(shouldUseGreenFertilizer);
                	if (!shouldUseGreenFertilizer) {
                  	setGreenFertilizerId("");
                	}
              	}}
              	aria-label="Utilizar adubação verde?"
            	>
              	<option value="false">Não</option>
              	<option value="true">Sim</option>
            	</NativeSelect>
          	</Box>
          	{useGreenFertilizer ? (
            	<Box>
              	<Text fontSize="sm" mb={1}>Adubo verde:</Text>
              	<NativeSelect
                	value={greenFertilizerId}
                	onChange={(e) => setGreenFertilizerId(e.target.value)}
                	disabled={loadingGreenFertilizers || !greenFertilizers.length}
                	aria-label="Adubo verde"
              	>
                	<option value="">
                  	{loadingGreenFertilizers
                    	? "Carregando adubos verdes..."
                    	: greenFertilizers.length
                      	? "Selecione o adubo verde"
                      	: "Nenhum adubo verde disponível para a origem selecionada"}
                	</option>
                	{greenFertilizers.map((fertilizer) => (
                  	<option key={fertilizer.id} value={fertilizer.id}>
                    	{getGreenFertilizerLabel(fertilizer)}
                  	</option>
                	))}
              	</NativeSelect>
            	</Box>
          	) : null}
            <Box borderWidth="1px" borderRadius="md" p={4}>
              <Heading size="sm" mb={1}>Dados de identificação dos relatórios</Heading>
              <Text fontSize="xs" color="fg.muted" mb={3}>
                Cliente, propriedade, talhão, cultura, área, responsável técnico e emissão serão preenchidos automaticamente.
              </Text>
              <SimpleGrid columns={{ base: 1, md: 3 }} gap={3}>
                <Box>
                  <Text fontSize="sm" mb={1}>Município</Text>
                  <Input
                    value={reportMunicipality}
                    maxLength={120}
                    onChange={(event) => setReportMunicipality(event.target.value)}
                    aria-label="Município do relatório"
                  />
                </Box>
                <Box>
                  <Text fontSize="sm" mb={1}>UF</Text>
                  <Input
                    value={reportState}
                    maxLength={2}
                    textTransform="uppercase"
                    onChange={(event) => setReportState(event.target.value.replace(/[^A-Za-z]/g, "").toUpperCase())}
                    aria-label="UF do relatório"
                  />
                </Box>
                <Box>
                  <Text fontSize="sm" mb={1}>Registro profissional</Text>
                  <Input
                    value={reportProfessionalRegistration}
                    maxLength={120}
                    placeholder="Ex.: CREA/PB nº 12345"
                    onChange={(event) => setReportProfessionalRegistration(event.target.value)}
                    aria-label="Registro profissional do relatório"
                  />
                </Box>
              </SimpleGrid>
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
      	<RecommendationFolderDocuments
        	selectedRecommendation={selectedRecommendation}
        	selectedDocument={selectedDocument}
        	selectedDocumentKey={selectedDocumentKey}
        	recommendationDocuments={recommendationDocuments}
        	selectedDocumentError={selectedDocumentError}
        	summaryRecommendationDocument={summaryRecommendationDocument}
        	directRecommendationDocument={directRecommendationDocument}
        	shoppingListDocument={shoppingListDocument}
        	documentTechnicalWarnings={documentTechnicalWarnings}
        	loadingDocumentKey={loadingDocumentKey}
        	userCanPrint={userCanPrint}
        	printing={printing}
        	improvingNarrative={improvingNarrative}
        	isFullscreenOpen={isFullscreenOpen}
        	propertyLabel={selectedRecommendation?.nome_propriedade ?? selectedProperty?.nome ?? selectedRecommendation?.id_propriedade ?? "-"}
        	plotLabel={selectedRecommendation?.identificacao_talhao ?? selectedPlot?.identificacao ?? selectedRecommendation?.id_talhao ?? "-"}
        	folderName={selectedRecommendation ? getRecommendationFolderName(selectedRecommendation) : ""}
        	onSelectDocument={(document) => { void handleSelectDocument(document); }}
        	onCopyDocument={() => { void handleCopySelectedDocument(); }}
        	onImproveNarrative={handleImproveNarrative}
        	onPrintRecommendation={handlePrintRecommendation}
        	onFullscreenOpenChange={handleFullscreenOpenChange}
      	/>
    	</SimpleGrid>

      <FertAiPanel
        recommendations={recommendationsHistory}
        loadingRecommendations={loadingHistory}
        recommendationsError={historyErrorMessage}
      />

    	<RecommendationHistoryList
      	recommendations={recommendationsHistory}
      	loading={loadingHistory}
      	errorMessage={historyErrorMessage}
      	openingRecommendationId={openingRecommendationId}
      	deletingId={deletingId}
      	getFolderName={getRecommendationFolderName}
      	normalizeLimingCriteria={normalizeLimingCriteria}
      	onOpen={(item) => void handleOpenRecommendation(item)}
      	onDelete={(item) => void handleDeleteRecommendation(item)}
    	/>
  	</Box>

	</UserLayout>
  );
}
