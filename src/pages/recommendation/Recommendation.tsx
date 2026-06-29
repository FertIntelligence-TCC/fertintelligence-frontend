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
import { toaster } from "@/components/ui/toaster";
import type { PlotResponse } from "@/interfaces/Plot";
import type { PropertyResponse } from "@/interfaces/Property";
import type { AnnualCropFolderResponseDto } from "@/interfaces/AnnualCropFolder";
import type { PhysicalAnalysisExtractResponse } from "@/interfaces/PhysicalAnalysisExtract";
import type { FertilityAnalysisExtractResponse } from "@/interfaces/FertilityAnalysisExtract";
import type { SaturationExtractAnalysisExtractResponse } from "@/interfaces/SaturationExtractAnalysisExtract";
import { TipoExtrato, type SoilAnalysisResponse } from "@/interfaces/SoilAnalysis";
import {
  type RecommendationLimingCriteria,
  type FertilizerSourceOption,
  type DirectRecommendationResponse,
  type RecommendationResponse,
  type ShoppingListResponse,
  type SummaryRecommendationResponse,
  type RecommendationType,
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
  type RecommendationDocumentKey,
  type RecommendationDocumentView,
} from "@/components/Recommendation/RecommendationFolderDocuments";
import RecommendationHistoryList from "@/components/Recommendation/RecommendationHistoryList";
import { writePrintableReport } from "@/components/Recommendation/RecommendationPrintDocument";
import { hasStructuredRecommendationContent } from "@/components/Recommendation/RecommendationStructuredFertilizerTables";
import { hasMicronutrientFertilizerRows } from "@/components/Recommendation/MicronutrientFertilizerTable";
import TextureClassificationSystemSelect, {
  type TextureClassificationSystem,
} from "@/components/Recommendation/TextureClassificationSystemSelect";
import AnalysisSelectors from "@/components/Recommendation/AnalysisSelectors";
import CropTableSelectors from "@/components/Recommendation/CropTableSelectors";
import LimingPreviewFields from "@/components/Recommendation/LimingPreviewFields";
import PropertyPlotSelectors from "@/components/Recommendation/PropertyPlotSelectors";
import SpacingSection from "@/components/Recommendation/SpacingSection";
import {
  type AnalysisExtractOption,
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

const adjustedLimingNeedFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatAdjustedLimingNeed = (value: number): string =>
  adjustedLimingNeedFormatter.format(value);

const calculateBaseSaturationLiming = (fertilityExtract?: FertilityAnalysisExtractResponse | null): LimingCriterionPreview => {
  const ctcPh7 = toNullableNumber(fertilityExtract?.ctc_ph7);
  const baseSaturation = toNullableNumber(fertilityExtract?.saturacao_bases_v);

  if (ctcPh7 === null || baseSaturation === null) {
	return { criterionLabel: LIMING_UNDEFINED_LABEL, limingNeed: null };
  }

  return {
	criterionLabel: BASE_SATURATION_LABEL,
	limingNeed: Math.max(0, (ctcPh7 * (70 - baseSaturation)) / 1000),
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
  const aluminumNeed = Math.max(0, factor * aluminum * 0.1);
  const calciumMagnesiumNeed = Math.max(0, factor * (2 - (calcium + magnesium) * 0.1));

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

const loadTableOptionsByGroup = async (
  group: TableGroupValue,
  fetchers: TableFetchers,
): Promise<TableOption[]> => {
  if (!group) return [];
  return (await fetchers[group]())
	.map((table) => normalizeTable(table, group))
	.filter(Boolean) as TableOption[];
};

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

const getTextField = (value: unknown): string => {
  if (typeof value !== "string") return "";
  return value.trim();
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
  const [textureClassificationSystem, setTextureClassificationSystem] =
    useState<TextureClassificationSystem>("BRASILEIRO");
  const [recommendationFolderName, setRecommendationFolderName] = useState("");
  const [cropSpacingForm, setCropSpacingForm] = useState<CropSpacingFormState>(initialCropSpacingForm);

  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [plots, setPlots] = useState<PlotResponse[]>([]);
  const [physicalAnalysisOptions, setPhysicalAnalysisOptions] = useState<AnalysisExtractOption<PhysicalAnalysisExtractResponse>[]>([]);
  const [soilFertilityAnalysisOptions, setSoilFertilityAnalysisOptions] = useState<AnalysisExtractOption<FertilityAnalysisExtractResponse>[]>([]);
  const [saturationExtractAnalysisOptions, setSaturationExtractAnalysisOptions] = useState<AnalysisExtractOption<SaturationExtractAnalysisExtractResponse>[]>([]);
  const [annualCropFolders, setAnnualCropFolders] = useState<AnnualCropFolderResponseDto[]>([]);
  const [cropFertilizationTables, setCropFertilizationTables] = useState<TableOption[]>([]);
  const [soilFertilityTables, setSoilFertilityTables] = useState<TableOption[]>([]);
  const [foliarInterpretationTables, setFoliarInterpretationTables] = useState<TableOption[]>([]);
  const [selectedRecommendation, setSelectedRecommendation] = useState<RecommendationResponse | null>(null);
  const [recommendationsHistory, setRecommendationsHistory] = useState<RecommendationResponse[]>([]);

  const [loadingProperties, setLoadingProperties] = useState(false);
  const [loadingPlots, setLoadingPlots] = useState(false);
  const [loadingPlotAnalyses, setLoadingPlotAnalyses] = useState(false);
  const [loadingAnnualCropFolders, setLoadingAnnualCropFolders] = useState(false);
  const [loadingTables, setLoadingTables] = useState(false);
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
    	setCropFertilizationTables(await loadTableOptionsByGroup(cropFertilizationTableGroup, {
      	PRIVATE: fetchCropFertilizationTables,
      	PUBLIC: fetchPublicCropFertilizationTables,
      	DEFAULT: fetchDefaultCropFertilizationTables,
    	}));
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
    	setSoilFertilityTables(await loadTableOptionsByGroup(soilFertilityInterpretationTableGroup, {
      	PRIVATE: fetchSoilFertilityTables,
      	PUBLIC: fetchPublicSoilFertilityTables,
      	DEFAULT: fetchDefaultSoilFertilityTables,
    	}));
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
    	setFoliarInterpretationTables(await loadTableOptionsByGroup(cropFoliarAnalysisInterpretationTableGroup, {
      	PRIVATE: fetchFoliarTables,
      	PUBLIC: fetchPublicFoliarTables,
      	DEFAULT: fetchDefaultFoliarTables,
    	}));
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

  const handleGenerate = async () => {
	const validation = validateRecommendationGeneration({
  	recommendationType,
  	propertyId: selectedPropertyId,
  	plotId: selectedPlotId,
  	physicalAnalysisExtractId,
  	soilFertilityAnalysisId,
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
    	physicalAnalysisExtractId,
    	soilFertilityAnalysisId,
    	saturationExtractAnalysisExtractId,
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
    	texturalClassification: validation.texturalClassification,
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

  	writePrintableReport(printWindow, printableReportText, printableRecommendation);
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
    	summaryRecommendationDocument: document,
  	};
	}

	if (key === "direct") {
  	const document = await getDirectRecommendationByRecommendation(recommendationId);
  	return {
    	text: getRecommendationDocumentText(document, key),
    	directRecommendationDocument: document,
  	};
	}

	const document = await getShoppingListByRecommendation(recommendationId);
	return {
  	text: getRecommendationDocumentText(document, key),
  	shoppingListDocument: document,
	};
  };

  const reportText = getRecommendationReportText(selectedRecommendation);
  const structuredDocuments = useMemo<Partial<Record<RecommendationDocumentKey, boolean>>>(
	() => ({
  	summary: hasMicronutrientFertilizerRows(summaryRecommendationDocument),
  	direct: hasDirectFertilizationObservations(directRecommendationDocument),
  	shopping: hasStructuredRecommendationContent(shoppingListDocument),
	}),
	[directRecommendationDocument, shoppingListDocument, summaryRecommendationDocument],
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

	const hasShoppingStructuredContent = hasStructuredRecommendationContent(loadedDocument.shoppingListDocument);
  	const hasDirectFertilizationObservationContent = hasDirectFertilizationObservations(
    	loadedDocument.directRecommendationDocument,
  	);
  	const hasSummaryMicronutrients = hasMicronutrientFertilizerRows(
        loadedDocument.summaryRecommendationDocument,
  	);
	if (
      loadedDocument.text.trim() ||
      hasSummaryMicronutrients ||
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
            	physicalAnalysisExtractId={physicalAnalysisExtractId}
            	soilFertilityAnalysisId={soilFertilityAnalysisId}
            	saturationExtractAnalysisExtractId={saturationExtractAnalysisExtractId}
            	physicalAnalysisOptions={physicalAnalysisOptions}
            	soilFertilityAnalysisOptions={soilFertilityAnalysisOptions}
            	saturationExtractAnalysisOptions={saturationExtractAnalysisOptions}
            	physicalAnalysisPlaceholder={physicalAnalysisPlaceholder}
            	soilFertilityAnalysisPlaceholder={soilFertilityAnalysisPlaceholder}
            	saturationExtractAnalysisPlaceholder={saturationExtractAnalysisPlaceholder}
            	onPhysicalAnalysisChange={setPhysicalAnalysisExtractId}
            	onSoilFertilityAnalysisChange={setSoilFertilityAnalysisId}
            	onSaturationExtractAnalysisChange={setSaturationExtractAnalysisExtractId}
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
      	<RecommendationFolderDocuments
        	selectedRecommendation={selectedRecommendation}
        	selectedDocument={selectedDocument}
        	selectedDocumentKey={selectedDocumentKey}
        	recommendationDocuments={recommendationDocuments}
        	selectedDocumentError={selectedDocumentError}
        	summaryRecommendationDocument={summaryRecommendationDocument}
        	directRecommendationDocument={directRecommendationDocument}
        	shoppingListDocument={shoppingListDocument}
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
        	onFullscreenOpenChange={setIsFullscreenOpen}
      	/>
    	</SimpleGrid>

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
