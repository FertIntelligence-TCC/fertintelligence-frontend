import { useEffect, useState } from "react";
import { Box, Button, Grid, Text } from "@chakra-ui/react";

import { fetchManageableProperties, fetchMyProperties } from "@/services/propertyService";
import { propertyAccessRequestService } from "@/services/propertyAccessRequestService";
import { getPlotsByProperty } from "@/services/plotService";
import { soilAnalysisService } from "@/services/soilAnalysisService";
import { rangeExtractService } from "@/services/rangeExtractService";
import { layerExtractService } from "@/services/layerExtractService";
import { physicalAnalysisExtractService } from "@/services/physicalAnalysisExtractService";
import { fertilityAnalysisExtractService } from "@/services/fertilityAnalysisExtractService";
import { calculateTemporaryLimingCriterion } from "@/services/cropFertilizationTableService";
import { getAuthorizationRoleMode } from "@/interfaces/Authorization";
import type { PropertyResponse } from "@/interfaces/Property";
import type { PlotResponse } from "@/interfaces/Plot";
import { TipoExtrato, type SoilAnalysisResponse } from "@/interfaces/SoilAnalysis";
import type { PhysicalAnalysisExtractResponse } from "@/interfaces/PhysicalAnalysisExtract";
import type { FertilityAnalysisExtractResponse } from "@/interfaces/FertilityAnalysisExtract";
import { useUserStore } from "@/stores/user/user.store";
import { toaster } from "@/components/ui/toaster";
import { SelectElement, selectFieldStyles } from "./styles";

const LIMING_UNDEFINED_LABEL = "Não é possível definir um critério de calagem";

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

type Props = {
  tableId: number;
};

type AnalysisExtractOption = {
  id: number;
  label: string;
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

export default function TemporaryLimingCriterionSection({ tableId }: Props) {
  const user = useUserStore((s) => s.user);
  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [plots, setPlots] = useState<PlotResponse[]>([]);
  const [physicalAnalysisOptions, setPhysicalAnalysisOptions] = useState<AnalysisExtractOption[]>([]);
  const [fertilityAnalysisOptions, setFertilityAnalysisOptions] = useState<AnalysisExtractOption[]>([]);
  const [propertyId, setPropertyId] = useState("");
  const [plotId, setPlotId] = useState("");
  const [physicalAnalysisId, setPhysicalAnalysisId] = useState("");
  const [fertilityAnalysisId, setFertilityAnalysisId] = useState("");
  const [criterion, setCriterion] = useState("");
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [loadingPlots, setLoadingPlots] = useState(false);
  const [loadingAnalyses, setLoadingAnalyses] = useState(false);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
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
        toaster.create({ title: "Falha ao carregar propriedades acessíveis.", type: "error" });
      })
      .finally(() => setLoadingProperties(false));
  }, [user?.cargo]);

  useEffect(() => {
    setPlotId("");
    setPhysicalAnalysisId("");
    setFertilityAnalysisId("");
    setCriterion("");
    setPlots([]);
    setPhysicalAnalysisOptions([]);
    setFertilityAnalysisOptions([]);

    if (!propertyId) return;

    setLoadingPlots(true);
    getPlotsByProperty(Number(propertyId))
      .then(setPlots)
      .catch((error) => {
        console.error(error);
        toaster.create({ title: "Falha ao carregar talhões acessíveis.", type: "error" });
      })
      .finally(() => setLoadingPlots(false));
  }, [propertyId]);

  useEffect(() => {
    let isCurrent = true;

    setPhysicalAnalysisId("");
    setFertilityAnalysisId("");
    setCriterion("");
    setPhysicalAnalysisOptions([]);
    setFertilityAnalysisOptions([]);

    if (!plotId) return () => { isCurrent = false; };

    setLoadingAnalyses(true);

    const loadAnalysisExtracts = async () => {
      try {
        const soilAnalyses = await soilAnalysisService.getByPlotId(plotId);

        if (!isCurrent) return;

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

        setPhysicalAnalysisOptions(physicalOptions);
        setFertilityAnalysisOptions(fertilityOptions);
      } catch (error) {
        console.error(error);
        if (isCurrent) {
          toaster.create({ title: "Falha ao carregar análises do talhão.", type: "error" });
        }
      } finally {
        if (isCurrent) setLoadingAnalyses(false);
      }
    };

    void loadAnalysisExtracts();

    return () => { isCurrent = false; };
  }, [plotId]);

  const physicalAnalysisPlaceholder = !plotId
    ? "Selecione um talhão para ver análises físicas"
    : physicalAnalysisOptions.length
      ? "Selecione uma análise física"
      : "Nenhuma análise física encontrada";
  const fertilityAnalysisPlaceholder = !plotId
    ? "Selecione um talhão para ver análises de fertilidade"
    : fertilityAnalysisOptions.length
      ? "Selecione uma análise de fertilidade"
      : "Nenhuma análise de fertilidade encontrada";

  const canCalculate = Boolean(propertyId && plotId && fertilityAnalysisId);

  const handleCalculate = async () => {
    if (!canCalculate) {
      setCriterion(LIMING_UNDEFINED_LABEL);
      return;
    }

    setCalculating(true);
    try {
      const response = await calculateTemporaryLimingCriterion({
        cropFertilizationTableId: tableId,
        propertyId: Number(propertyId),
        plotId: Number(plotId),
        physicalAnalysisId: physicalAnalysisId ? Number(physicalAnalysisId) : null,
        fertilityAnalysisId: Number(fertilityAnalysisId),
      });
      setCriterion(getLimingCriterionLabel(
        response.indicatedLimingCriterion ??
        response.criterio_de_calagem_indicado ??
        response.criterio_calagem_indicado ??
        response.criterioCalagemIndicado ??
        response.criterio_de_calagem
      ));
    } catch (error) {
      console.error(error);
      toaster.create({ title: "Falha ao calcular critério de calagem.", type: "error" });
    } finally {
      setCalculating(false);
    }
  };

  return (
    <Box borderWidth="1px" borderRadius="md" p={4} bg="green.50" _dark={{ bg: "green.900", borderColor: "green.700" }}>
      <Text fontWeight="bold" mb={3}>Ver critério de calagem para minha propriedade</Text>
      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
        <Box>
          <Text fontWeight="semibold" fontSize="sm">Propriedade</Text>
          <SelectElement {...selectFieldStyles} value={propertyId} onChange={(e: any) => setPropertyId(e.target.value)} disabled={loadingProperties}>
            <option value="">{loadingProperties ? "Carregando propriedades..." : "Selecione uma propriedade"}</option>
            {properties.map((property) => <option key={property.id} value={property.id}>{property.nome}</option>)}
          </SelectElement>
        </Box>
        <Box>
          <Text fontWeight="semibold" fontSize="sm">Talhão</Text>
          <SelectElement {...selectFieldStyles} value={plotId} onChange={(e: any) => setPlotId(e.target.value)} disabled={!propertyId || loadingPlots}>
            <option value="">{loadingPlots ? "Carregando talhões..." : "Selecione um talhão"}</option>
            {plots.map((plot) => <option key={plot.id} value={plot.id}>{plot.identificacao}</option>)}
          </SelectElement>
        </Box>
        <Box>
          <Text fontWeight="semibold" fontSize="sm">Análise física</Text>
          <SelectElement {...selectFieldStyles} value={physicalAnalysisId} onChange={(e: any) => { setPhysicalAnalysisId(e.target.value); setCriterion(""); }} disabled={!plotId || loadingAnalyses || physicalAnalysisOptions.length === 0}>
            <option value="">{loadingAnalyses ? "Carregando análises físicas..." : physicalAnalysisPlaceholder}</option>
            {physicalAnalysisOptions.map((analysis) => <option key={analysis.id} value={analysis.id}>{analysis.label}</option>)}
          </SelectElement>
        </Box>
        <Box>
          <Text fontWeight="semibold" fontSize="sm">Análise de fertilidade</Text>
          <SelectElement {...selectFieldStyles} value={fertilityAnalysisId} onChange={(e: any) => { setFertilityAnalysisId(e.target.value); setCriterion(""); }} disabled={!plotId || loadingAnalyses || fertilityAnalysisOptions.length === 0}>
            <option value="">{loadingAnalyses ? "Carregando análises de fertilidade..." : fertilityAnalysisPlaceholder}</option>
            {fertilityAnalysisOptions.map((analysis) => <option key={analysis.id} value={analysis.id}>{analysis.label}</option>)}
          </SelectElement>
        </Box>
      </Grid>
      <Button mt={4} colorPalette="green" onClick={handleCalculate} loading={calculating} disabled={!canCalculate}>
        Ver critério de fertilidade
      </Button>
      {(criterion || !fertilityAnalysisId) && (
        <Text mt={3} fontWeight="semibold">Critério indicado: {criterion || LIMING_UNDEFINED_LABEL}</Text>
      )}
    </Box>
  );
}
