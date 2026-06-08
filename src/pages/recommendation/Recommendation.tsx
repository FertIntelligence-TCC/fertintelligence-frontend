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
import { Cargo } from "@/interfaces/User";
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
  type FertilizerSourceOption,
  type RecommendationResponse,
  type RecommendationType,
  getRecommendationReportText,
} from "@/interfaces/Recommendation";
import { getPlotsByProperty } from "@/services/plotService";
import { fetchManageableProperties, fetchMyProperties } from "@/services/propertyService";
import { propertyAccessRequestService } from "@/services/propertyAccessRequestService";
import { isSupremeUserCargo } from "@/interfaces/Authorization";
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
  getMyRecommendations,
  preparePrintRecommendation,
  improveRecommendationNarrative,
} from "@/services/recommendationService";
import { useUserStore } from "@/stores/user/user.store";
import { LuArrowLeft } from "react-icons/lu";
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

type AnalysisExtractOption = {
  id: number;
  label: string;
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
  public?: boolean;
};

const recommendationTypeOptions: { value: RecommendationType; label: string }[] = [
  { value: "ACIDITY_OR_SALINITY_CORRECTION", label: "Correção de acidez/salinidade" },
  { value: "FERTILIZATION", label: "Adubação" },
  { value: "BOTH", label: "Ambos" },
];

const fertilizerOriginOptions: { value: FertilizerSourceOption; label: string }[] = [
  { value: "PRIVATE", label: "Privados" },
  { value: "PUBLIC", label: "Públicos" },
  { value: "DEFAULT", label: "Padrão" },
  { value: "BOTH", label: "Ambos" },
];

const tableGroupOptions: { value: TableSource; label: string }[] = [
  { value: "PRIVATE", label: "Privadas" },
  { value: "PUBLIC", label: "Públicas" },
  { value: "DEFAULT", label: "Padrão" },
];

const limingCriteriaOptions: RecommendationLimingCriteria[] = [
  "SATURACAO_POR_BASES_TROCAVEIS",
  "NEUTRALIZACAO_POR_ALUMINIO_TROCAVEL",
  "ELEVACAO_DO_TEOR_DE_CALCIO_MAIS_MAGNESIO",
  "NEUTRALIZACAO_POR_ALUMINIO_TROCAVEL_MAIS_ELEVACAO_DO_TEOR_DE_CALCIO_MAIS_MAGNESIO",
];

const canPrintRecommendation = (cargo?: string) =>
  isSupremeUserCargo(cargo) || cargo === "AGRONOMO_RESIDENTE" || cargo === "AGRONOMO_CONSULTOR";

const normalizeLimingCriteria = (criteria?: string | null): RecommendationLimingCriteria | undefined => {
  if (!criteria) return undefined;
  if (criteria === "PORCENTAGEM_DE_SATURACAO_DAS_BASES") return "SATURACAO_POR_BASES_TROCAVEIS";
  return criteria as RecommendationLimingCriteria;
};

const normalizeTable = (table: RawTable, fallbackSource: TableOption["source"]): TableOption | null => {
  if (!table?.id) return null;
  const source =
    fallbackSource === "DEFAULT" || (table.tabela_publica !== true && table.public !== true)
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

const mapSaturationAnalysisOption = (
  extract: SaturationExtractAnalysisExtractResponse,
  analysis: SoilAnalysisResponse,
): AnalysisExtractOption => ({
  id: extract.id,
  label: `${getAnalysisLabelPrefix(analysis)}${formatExtractPosition(extract) ? ` • ${formatExtractPosition(extract)}` : ""}`,
});

const getFolderLabel = (folder: AnnualCropFolderResponseDto) =>
  folder.ano_culturas ? `Pasta anual ${folder.ano_culturas}` : `Pasta ${folder.id}`;

const getCropLabel = (crop: CropResponseDto) =>
  [crop.nome?.replace(/_/g, " "), crop.variedade, crop.tipo_cultivo].filter(Boolean).join(" • ") || `Cultura ${crop.id}`;

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
      body { font-family: Arial, sans-serif; padding: 32px; line-height: 1.6; color: #000; font-size: 14px; }
      h1 { margin: 0 0 24px; font-size: 26px; }
      h2 { margin: 20px 0 8px; font-size: 18px; }
      p { margin: 0; white-space: pre-wrap; }
      .spacing { height: 12px; }
      table { width: 100%; border-collapse: collapse; margin: 10px 0; }
      th, td { border: 1px solid #000; padding: 8px 10px; text-align: left; vertical-align: top; }
      th { font-weight: 700; background: #f2f2f2; }
      .footer { margin-top: 36px; }
    </style>
  </head>
  <body>
    <h1>Laudo Técnico de Recomendação Agrícola</h1>
    <div>${contentHtml}</div>
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
  const [limingCriteria, setLimingCriteria] = useState("");
  const [fertilizerSourceOption, setFertilizerSourceOption] = useState<FertilizerSourceOption>("BOTH");

  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [plots, setPlots] = useState<PlotResponse[]>([]);
  const [physicalAnalysisOptions, setPhysicalAnalysisOptions] = useState<AnalysisExtractOption[]>([]);
  const [soilFertilityAnalysisOptions, setSoilFertilityAnalysisOptions] = useState<AnalysisExtractOption[]>([]);
  const [saturationExtractAnalysisOptions, setSaturationExtractAnalysisOptions] = useState<AnalysisExtractOption[]>([]);
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
        const isSupreme = isSupremeUserCargo(user?.cargo) || user?.cargo === "USUARIO_SUPREMO";
        const data = isSupreme
          ? await fetchManageableProperties()
          : user?.cargo === Cargo.PROPRIETARIO
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

        const physicalOptions: AnalysisExtractOption[] = [];
        const fertilityOptions: AnalysisExtractOption[] = [];
        const saturationOptions: AnalysisExtractOption[] = [];

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
    if (!recommendationType || !selectedPropertyId || !selectedPlotId || !physicalAnalysisExtractId || !soilFertilityAnalysisId || !saturationExtractAnalysisExtractId || !annualCropFolderId || !cropId || !cropFertilizationTableId || !soilFertilityInterpretationTableId || !cropFoliarAnalysisInterpretationTableId || !limingCriteria || !fertilizerSourceOption) {
      toaster.create({ title: "Campos obrigatórios", description: "Preencha todos os campos necessários antes de gerar a recomendação.", type: "warning" });
      return;
    }

    setGenerating(true);
    try {
      const result = await generateRecommendation({
        tipo_recomendacao: recommendationType as RecommendationType,
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
        criterio_calagem: limingCriteria as RecommendationLimingCriteria,
        origem_adubos: fertilizerSourceOption,
      });
      setSelectedRecommendation(result);
      toaster.create({ title: "Recomendação gerada com sucesso.", type: "success" });
      await loadHistory();
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("Erro ao gerar recomendação:", axiosError.response?.data || error);
      toaster.create({ title: "Falha ao gerar recomendação.", type: "error" });
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
              <NativeSelect value={limingCriteria} onChange={(e) => setLimingCriteria(e.target.value)}><option value="">Critério de calagem</option>{limingCriteriaOptions.map((c) => <option key={c} value={c}>{c}</option>)}</NativeSelect>
              <Box>
                <Text fontSize="sm" mb={1}>Quais adubos usar?</Text>
                <NativeSelect value={fertilizerSourceOption} onChange={(e) => setFertilizerSourceOption(e.target.value as FertilizerSourceOption)} aria-label="Quais adubos usar?">{fertilizerOriginOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</NativeSelect>
              </Box>
              <Button colorPalette="blue" onClick={handleGenerate} loading={generating}>Gerar Recomendação</Button>
            </VStack>
          </Box>
          <Box borderWidth="1px" borderRadius="lg" p={6}><Flex justify="space-between" align="center" mb={3} gap={2}><Heading size="md">Resultado da Recomendação</Heading>{selectedRecommendation ? <Button size="xs" variant="ghost" onClick={() => setIsFullscreenOpen(true)}>Tela cheia</Button> : null}</Flex><Separator mb={4} />
            {selectedRecommendation ? (<VStack align="stretch" gap={4}><Flex justify="space-between" align={{ base: "start", md: "center" }} gap={3} wrap="wrap"><Badge colorPalette={userCanPrint ? "green" : "orange"}>{userCanPrint ? "Laudo imprimível" : "Simulação"}</Badge><HStack gap={2}><Button variant="outline" onClick={async () => { if (!reportText) { toaster.create({ title: "Nenhum laudo para copiar.", type: "warning" }); return; } try { await navigator.clipboard.writeText(reportText); toaster.create({ title: "Laudo copiado para a área de transferência.", type: "success" }); } catch (error) { console.error(error); toaster.create({ title: "Falha ao copiar laudo.", type: "error" }); } }}>Copiar Laudo</Button><Button variant="subtle" loading={improvingNarrative} onClick={handleImproveNarrative}>{improvingNarrative ? "Melhorando..." : "Melhorar Texto do Laudo"}</Button>{userCanPrint && selectedRecommendation.printable !== false ? <Button colorPalette="blue" loading={printing} onClick={handlePrintRecommendation}>Imprimir Laudo</Button> : null}</HStack></Flex><Flex gap={2} wrap="wrap"><Badge>ID {selectedRecommendation.id}</Badge><Badge>Propriedade {selectedRecommendation.nome_propriedade ?? selectedProperty?.nome ?? selectedRecommendation.id_propriedade ?? "-"}</Badge><Badge>Talhão {selectedRecommendation.identificacao_talhao ?? selectedPlot?.identificacao ?? selectedRecommendation.id_talhao ?? "-"}</Badge><Badge>Cultura {selectedRecommendation.cultura ?? "-"}</Badge><Badge>Ano {selectedRecommendation.ano_safra ?? "-"}</Badge><Badge>Tipo {selectedRecommendation.tipo_recomendacao ?? "-"}</Badge></Flex><Box fontSize="sm" borderWidth="1px" borderRadius="md" p={4} maxH="600px" overflowY="auto"><RecommendationReportViewer reportText={reportText} variant="compact" /></Box><Text fontSize="xs" color="fg.muted">A melhoria de texto não altera cálculos, doses ou recomendações técnicas.</Text>{!userCanPrint ? <Box borderWidth="1px" borderRadius="md" borderColor="orange.200" bg="orange.50" p={3} fontSize="sm">Esta recomendação foi gerada para fins de simulação. Apenas agrônomos residentes ou consultores podem emitir laudo formal para assinatura.</Box> : null}</VStack>) : <Text color="fg.muted">Nenhuma recomendação gerada ainda.</Text>}
          </Box>
        </SimpleGrid>

        <Box borderWidth="1px" borderRadius="lg" p={6} mt={4}><Heading size="md" mb={3}>Minhas Recomendações</Heading><Separator mb={4} />
          {loadingHistory ? <Spinner /> : historyErrorMessage ? <Text color="orange.600">{historyErrorMessage}</Text> : recommendationsHistory.length === 0 ? <Text color="fg.muted">Nenhuma recomendação encontrada.</Text> : <VStack align="stretch" gap={3}>{recommendationsHistory.map((item) => (<Flex key={item.id} borderWidth="1px" borderRadius="md" p={3} justify="space-between" wrap="wrap" gap={3}><VStack align="start" gap={1}><Text fontWeight="bold">Recomendação #{item.id}</Text><Text fontSize="sm">Propriedade: {item.nome_propriedade ?? item.id_propriedade ?? "-"} • Talhão: {item.identificacao_talhao ?? item.id_talhao ?? "-"}</Text><Text fontSize="sm">Cultura: {item.cultura ?? "-"} • Ano: {item.ano_safra ?? "-"} • Tipo: {item.tipo_recomendacao ?? "-"} • Calagem: {normalizeLimingCriteria(item.criterio_calagem ?? item.criterioCalagem) ?? "-"}</Text></VStack><Flex gap={2}><Button size="sm" onClick={() => setSelectedRecommendation(item)}>Abrir</Button><Button size="sm" colorPalette="red" loading={deletingId === item.id} onClick={async () => { if (!window.confirm("Deseja excluir esta recomendação?")) return; setDeletingId(item.id); try { await deleteRecommendation(item.id); if (selectedRecommendation?.id === item.id) setSelectedRecommendation(null); toaster.create({ title: "Recomendação excluída com sucesso.", type: "success" }); await loadHistory(); } catch (error) { console.error(error); toaster.create({ title: "Falha ao excluir recomendação.", type: "error" }); } finally { setDeletingId(null); } }}>Excluir</Button></Flex></Flex>))}</VStack>}
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
            <DialogTitle>Resultado da Recomendação</DialogTitle>
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
              <RecommendationReportViewer reportText={reportText} variant="modal" />
            </Box>
          </DialogBody>
          <DialogCloseTrigger />
        </DialogContent>
      </DialogRoot>
    </UserLayout>
  );
}
