import { useState } from "react";
import {
  Badge,
  Box,
  Button,
  Dialog,
  Flex,
  Heading,
  HStack,
  IconButton,
  SimpleGrid,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { FiArrowLeft, FiEye, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import UserLayout from "@/components/Layouts/UserLayout";
import FertName from "@/components/FertName/FertName";
import ConfigMenu from "@/components/ConfigMenu/ConfigMenu";
import FertilizationTableFormFields from "@/components/FertilizationTable/FertilizationTableFormFields";
import TemporaryLimingCriterionSection from "@/components/FertilizationTable/TemporaryLimingCriterionSection";
import {
  DEFAULT_TABLE_STATE,
  CropLabels,
  CropType,
  FertilizationTableFormState,
  NutrientRangeRow,
  SpacingType,
} from "@/components/FertilizationTable/types";
import { fetchPublicCropFertilizationTables } from "@/services/cropFertilizationTableService";
import { fetchContentRangesByTable } from "@/services/contentRangeService";
import { fetchCoveragesByRange } from "@/services/coverageService";
import type { CropFertilizationTableResponseDto, ContentRangeResponseDto, CoverageResponseDto } from "@/interfaces/CropFertilizationTable";
import { toaster } from "@/components/ui/toaster";
import { useUserStore } from "@/stores/user/user.store";


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

interface HydratedTableData extends CropFertilizationTableResponseDto {
  rangesWithCoverages: (ContentRangeResponseDto & { coverages: CoverageResponseDto[] })[];
}

const normalizeSpacingType = (value: unknown): SpacingType | "" => {
  if (value === "PLANTAS_PER_LINEAR_METER") return SpacingType.PLANTAS_POR_METRO_LINEAR;
  if (Object.values(SpacingType).includes(value as SpacingType)) return value as SpacingType;
  return "";
};

const getAlternativeSpacingMin = (data: Pick<CropFertilizationTableResponseDto, "valor_espacamento_usado" | "valor_inicial_espacamento_usado">) =>
  data.valor_inicial_espacamento_usado ?? data.valor_espacamento_usado ?? "";

const getAlternativeSpacingMax = (data: Pick<CropFertilizationTableResponseDto, "valor_espacamento_usado" | "valor_final_espacamento_usado">) =>
  data.valor_final_espacamento_usado ?? data.valor_espacamento_usado ?? "";

const canShowLinkedData = (data: CropFertilizationTableResponseDto) =>
  data.pode_visualizar_vinculos ?? data.canViewLinkedData ?? Boolean(data.nome_propriedade ?? data.propertyName ?? data.identificacao_talhao ?? data.plotIdentification ?? data.identificacao_analise_fisica ?? data.physicalAnalysisIdentification ?? data.identificacao_analise_fertilidade ?? data.fertilityAnalysisIdentification);

const formatAnalysisIdentification = (value: unknown) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  const analysis = value as { ano_analise?: number; laboratorio_responsavel?: string; id?: number };
  return [analysis.ano_analise, analysis.laboratorio_responsavel].filter(Boolean).join(" - ") || (analysis.id ? `Análise #${analysis.id}` : "");
};

const mapHydratedDataToForm = (data: HydratedTableData): FertilizationTableFormState => {
  const makeRowId = (fallback?: unknown) => String(fallback ?? Math.random());

  const processRanges = (nutrientKey: "FOSFORO" | "POTASSIO") => {
    const ranges = data.rangesWithCoverages.filter((r) => r.nutriente === nutrientKey);
    ranges.sort((a, b) => a.ordem_teor - b.ordem_teor);

    return ranges.map((r) => {
      let label = "";
      if (r.menor_teor === null && r.maior_teor !== null) label = `${nutrientKey === "FOSFORO" ? "P" : "K"} < ${r.maior_teor}`;
      else if (r.menor_teor !== null && r.maior_teor === null) label = `${nutrientKey === "FOSFORO" ? "P" : "K"} > ${r.menor_teor}`;
      else if (r.menor_teor !== null && r.maior_teor !== null) label = `${r.menor_teor} < ${nutrientKey === "FOSFORO" ? "P" : "K"} < ${r.maior_teor}`;

      return {
        id: makeRowId(r.id),
        contentRangeId: r.id,
        label,
        operatorType: "between",
        plantio: String(r.aplicacao_recomendada_plantio || ""),
        coberturas: r.coverages
          .sort((a, b) => a.ordem_cobertura - b.ordem_cobertura)
          .map((c) => ({
            coverageId: c.id,
            value: String(c.aplicacao_recomendada_cobertura)
          })),
      } as NutrientRangeRow;
    });
  };

  const faixasP = processRanges("FOSFORO");
  const faixasK = processRanges("POTASSIO");
  const nitroRange = data.rangesWithCoverages.find((r) => r.nutriente === "NITROGENIO");
  const plantioN = nitroRange ? String(nitroRange.aplicacao_recomendada_plantio) : "";
  const coberturasN = nitroRange ? nitroRange.coverages.sort((a, b) => a.ordem_cobertura - b.ordem_cobertura).map((c) => String(c.aplicacao_recomendada_cobertura)) : [""];

  const maxCoverages = Math.max(coberturasN.length, ...faixasP.map((f) => f.coberturas.length), ...faixasK.map((f) => f.coberturas.length));
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
    physicalAnalysisId: String(data.physicalAnalysisId ?? data.id_analise_fisica ?? ""),
    fertilityAnalysisId: String(data.fertilityAnalysisId ?? data.id_analise_fertilidade ?? ""),
    linkedPropertyIdentification: canShowLinkedData(data) ? String(data.nome_propriedade ?? data.propertyName ?? "") : "",
    linkedPlotIdentification: canShowLinkedData(data) ? String(data.identificacao_talhao ?? data.plotIdentification ?? "") : "",
    linkedPhysicalAnalysisIdentification: canShowLinkedData(data) ? formatAnalysisIdentification(data.identificacao_analise_fisica ?? data.physicalAnalysisIdentification) : "",
    linkedFertilityAnalysisIdentification: canShowLinkedData(data) ? formatAnalysisIdentification(data.identificacao_analise_fertilidade ?? data.fertilityAnalysisIdentification) : "",
    showLinkedData: canShowLinkedData(data),
    sugestaoEstercoTipo: data.tipo_de_esterco as any,
    sugestaoEstercoQtd: String(data.quantidade_de_esterco),
    sugestaoGessagem: String(data.sugestao_gessagem),
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

function PublicTableCard({
  table,
  isSelected,
  onSelect,
  onView,
}: {
  table: CropFertilizationTableResponseDto;
  isSelected: boolean;
  onSelect: () => void;
  onView: () => void;
}) {
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
    >
      <Flex justify="space-between" align="start">
        <Box>
          <Badge colorPalette="green" mb={1}>{table.regioes_cultura}</Badge>
          <Text fontWeight="bold" fontSize="lg" color="green.700" _dark={{ color: "green.300" }}>{cropLabel}</Text>
          <Text fontSize="xs" color="gray.500" fontStyle="italic" mb={2}>{table.nome_cientifico_cultura}</Text>
        </Box>
      </Flex>
      <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }} mt={1}><Text as="span" fontWeight="semibold">Cultivares:</Text> {table.cultivares || "Não informado"}</Text>
      <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }} mt={1}><Text as="span" fontWeight="semibold">Criador:</Text> {table.nome_criador || "-"}</Text>

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
        <HStack justify="flex-end" gap={2} mt={4}>
          <IconButton
            size="sm"
            aria-label="Visualizar Dados"
            borderRadius="full"
            variant="ghost"
            colorPalette="blue"
            onClick={(e) => {
              e.stopPropagation();
              onView();
            }}
          >
            <FiEye />
          </IconButton>
        </HStack>
      )}
    </Box>
  );
}

export default function PublicCropFertilizationTable() {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [viewForm, setViewForm] = useState<FertilizationTableFormState>(DEFAULT_TABLE_STATE);
  const [activeTable, setActiveTable] = useState<CropFertilizationTableResponseDto | null>(null);
  const { data = [], isLoading } = useQuery({ queryKey: ["crop-fertilization-tables-public"], queryFn: fetchPublicCropFertilizationTables });

  const fetchAndHydrateTable = async (table: CropFertilizationTableResponseDto) => {
    setIsLoadingDetails(true);
    try {
      const ranges = await fetchContentRangesByTable(table.id);
      const rangesWithCoverages = await Promise.all(
        ranges.map(async (range) => {
          const coverages = await fetchCoveragesByRange(range.id);
          return { ...range, coverages };
        })
      );

      const formData = mapHydratedDataToForm({ ...table, rangesWithCoverages });
      setActiveTable(table);
      setViewForm(formData);
      setIsModalOpen(true);
    } catch (error) {
      console.error(error);
      toaster.create({ title: "Erro ao carregar detalhes da tabela pública.", type: "error" });
    } finally {
      setIsLoadingDetails(false);
    }
  };

  return (
    <UserLayout>
      <FertName subtitle="Tabelas de Adubação Públicas" />
      <ConfigMenu />
      <Box pt={{ base: 16, md: 24 }} px={{ base: 4, md: 8 }}>
        <Button mb={6} onClick={() => navigate("/fertintelligence/fertilization-table-management/crop-fertilization-table")}><FiArrowLeft /> Voltar para minhas tabelas</Button>
        <Heading size="lg" color="white" mb={4}>Tabelas públicas de adubação de culturas</Heading>

        {isLoadingDetails && (
          <Box position="fixed" inset={0} bg="blackAlpha.600" zIndex={2000} display="flex" justifyContent="center" alignItems="center">
            <Spinner size="xl" color="white" />
          </Box>
        )}

        {isLoading ? <Spinner color="white" /> : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
            {data.map((table: CropFertilizationTableResponseDto) => (
              <PublicTableCard
                key={table.id}
                table={table}
                isSelected={selectedId === table.id}
                onSelect={() => setSelectedId(selectedId === table.id ? null : table.id)}
                onView={() => fetchAndHydrateTable(table)}
              />
            ))}
          </SimpleGrid>
        )}
      </Box>

      <Dialog.Root open={isModalOpen} onOpenChange={(e) => { setIsModalOpen(e.open); if (!e.open) setActiveTable(null); }} size="xl" scrollBehavior="inside" motionPreset="slide-in-bottom">
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content bg="white" _dark={{ bg: "gray.800" }} maxW="4xl">
            <Dialog.Header>
              <Flex justify="space-between" align="center">
                <Dialog.Title>Visualizar Tabela Pública</Dialog.Title>
                <Dialog.CloseTrigger asChild>
                  <IconButton size="sm" variant="ghost" aria-label="Fechar" onClick={() => { setIsModalOpen(false); setActiveTable(null); }}>
                    <FiX />
                  </IconButton>
                </Dialog.CloseTrigger>
              </Flex>
            </Dialog.Header>
            <Dialog.Body py={6}>
              <FertilizationTableFormFields form={viewForm} onFormChange={() => undefined} readOnly />
              {activeTable && user?.id !== activeTable.id_criador && (
                <TemporaryLimingCriterionSection key={activeTable.id} tableId={activeTable.id} />
              )}
            </Dialog.Body>
            <Dialog.Footer borderTopWidth="1px" _dark={{ borderColor: "gray.700" }}>
              <Button colorPalette="blue" onClick={() => { setIsModalOpen(false); setActiveTable(null); }}>Fechar</Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </UserLayout>
  );
}
