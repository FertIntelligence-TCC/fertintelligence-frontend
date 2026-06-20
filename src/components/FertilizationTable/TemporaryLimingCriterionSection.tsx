import { useEffect, useState } from "react";
import { Box, Button, Grid, Text } from "@chakra-ui/react";

import { fetchManageableProperties, fetchMyProperties } from "@/services/propertyService";
import { propertyAccessRequestService } from "@/services/propertyAccessRequestService";
import { getPlotsByProperty } from "@/services/plotService";
import { soilAnalysisService } from "@/services/soilAnalysisService";
import { calculateTemporaryLimingCriterion } from "@/services/cropFertilizationTableService";
import { getAuthorizationRoleMode } from "@/interfaces/Authorization";
import type { PropertyResponse } from "@/interfaces/Property";
import type { PlotResponse } from "@/interfaces/Plot";
import type { SoilAnalysisResponse } from "@/interfaces/SoilAnalysis";
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

export default function TemporaryLimingCriterionSection({ tableId }: Props) {
  const user = useUserStore((s) => s.user);
  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [plots, setPlots] = useState<PlotResponse[]>([]);
  const [analyses, setAnalyses] = useState<SoilAnalysisResponse[]>([]);
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
    setAnalyses([]);

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
    setPhysicalAnalysisId("");
    setFertilityAnalysisId("");
    setCriterion("");
    setAnalyses([]);

    if (!plotId) return;

    setLoadingAnalyses(true);
    soilAnalysisService.getByPlotId(plotId)
      .then(setAnalyses)
      .catch((error) => {
        console.error(error);
        toaster.create({ title: "Falha ao carregar análises do talhão.", type: "error" });
      })
      .finally(() => setLoadingAnalyses(false));
  }, [plotId]);

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
      setCriterion(getLimingCriterionLabel(response.criterio_de_calagem_indicado ?? response.criterio_calagem_indicado ?? response.criterioCalagemIndicado ?? response.criterio_de_calagem));
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
          <SelectElement {...selectFieldStyles} value={physicalAnalysisId} onChange={(e: any) => { setPhysicalAnalysisId(e.target.value); setCriterion(""); }} disabled={!plotId || loadingAnalyses}>
            <option value="">{loadingAnalyses ? "Carregando análises físicas..." : "Selecione uma análise física"}</option>
            {analyses.map((analysis) => <option key={analysis.id} value={analysis.id}>{`${analysis.ano_analise} - ${analysis.laboratorio_responsavel}`}</option>)}
          </SelectElement>
        </Box>
        <Box>
          <Text fontWeight="semibold" fontSize="sm">Análise de fertilidade</Text>
          <SelectElement {...selectFieldStyles} value={fertilityAnalysisId} onChange={(e: any) => { setFertilityAnalysisId(e.target.value); setCriterion(""); }} disabled={!plotId || loadingAnalyses}>
            <option value="">{loadingAnalyses ? "Carregando análises de fertilidade..." : "Selecione uma análise de fertilidade"}</option>
            {analyses.map((analysis) => <option key={analysis.id} value={analysis.id}>{`${analysis.ano_analise} - ${analysis.laboratorio_responsavel}`}</option>)}
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
