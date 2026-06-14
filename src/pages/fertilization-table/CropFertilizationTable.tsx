import { useMemo, useState, Dispatch, SetStateAction } from "react";
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
} from "@chakra-ui/react";
import { FiPlus, FiX, FiEye, FiEdit, FiTrash } from "react-icons/fi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import UserLayout from "@/components/Layouts/UserLayout";
import FertName from "@/components/FertName/FertName";
import ConfigMenu from "@/components/ConfigMenu/ConfigMenu";
import FertilizationTableFormFields from "@/components/FertilizationTable/FertilizationTableFormFields";
import {
  DEFAULT_TABLE_STATE,
  FertilizationTableFormState,
  NutrientRangeRow,
  CropType,
  CropLabels,
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
import { createContentRange, fetchContentRangesByTable, deleteContentRange, ContentRangeResponseDto } from "@/services/contentRangeService";
import { createCoverage, fetchCoveragesByRange, deleteCoverage, CoverageResponseDto } from "@/services/coverageService";

import { CropFertilizationTableCreateRequestDto } from "@/interfaces/CropFertilizationTable";
import { toaster } from "@/components/ui/toaster";

// Interface local que reflete exatamente o que o Java envia (snake_case) para a tabela pai
interface CropFertilizationTableResponseDto {
  id: number;
  id_criador: number;
  nome_criador: string;
  regioes_cultura: string;
  nome_comum_cultura: string;
  nome_cientifico_cultura: string;
  cultivares: string;
  espacamentos_sugeridos: string;
  valor_inicial: number;
  valor_final: number;
  espacamento_usado: string;
  valor_espacamento_usado: number;
  produtividade_regional: number;
  produtividade_esperada: number;
  criterio_de_calagem: string;
  tipo_de_esterco: string;
  quantidade_de_esterco: number;
  sugestao_gessagem: number;
  sugestao_micronutrientes: number;
  sugestao_npk: number;
  observacoes: string;
  fontes: string;
  tabela_publica?: boolean;
}

// Estrutura interna combinada (Pai + Filhos)
interface HydratedTableData extends CropFertilizationTableResponseDto {
    rangesWithCoverages: (ContentRangeResponseDto & { coverages: CoverageResponseDto[] })[];
}

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
              label,
              operatorType,
              plantio: String(r.aplicacao_recomendada_plantio || ""),
              coberturas: r.coverages
                .sort((a, b) => a.ordem_cobertura - b.ordem_cobertura)
                .map(c => String(c.aplicacao_recomendada_cobertura))
          } as NutrientRangeRow;
      });
  };

  const faixasP = processRanges("FOSFORO");
  const faixasK = processRanges("POTASSIO");
  
  // Nitrogênio geralmente é 1 range, pegamos suas coberturas
  const nitroRange = data.rangesWithCoverages.find(r => r.nutriente === "NITROGENIO");
  const plantioN = nitroRange ? String(nitroRange.aplicacao_recomendada_plantio) : "";
  const coberturasN = nitroRange 
    ? nitroRange.coverages.sort((a, b) => a.ordem_cobertura - b.ordem_cobertura).map(c => String(c.aplicacao_recomendada_cobertura))
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

    espacamentoSugeridoTipo: data.espacamentos_sugeridos as any,
    espacamentoSugeridoMin: String(data.valor_inicial),
    espacamentoSugeridoMax: String(data.valor_final),

    espacamentoUsadoTipo: data.espacamento_usado as any,
    espacamentoUsadoValor: String(data.valor_espacamento_usado),

    produtividadeRegional: String(data.produtividade_regional),
    produtividadeEsperada: String(data.produtividade_esperada),

    criterioCalagem: data.criterio_de_calagem as any,

    sugestaoEstercoTipo: data.tipo_de_esterco as any,
    sugestaoEstercoQtd: String(data.quantidade_de_esterco),

    sugestaoGessagem: String(data.sugestao_gessagem),
    sugestaoMicronutrientes: String(data.sugestao_micronutrientes),

    sugestaoNPK: String(data.sugestao_npk || ""),

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

const normalizeLimingCriteriaForBackend = (value: unknown) => {
  if (value === "NEUTRALIZACAO_ALUMINIO_TROCAVEL") {
    return "NEUTRALIZACAO_POR_ALUMINIO_TROCAVEL";
  }
  if (value === "ELEVACAO__DO_TEOR_DE_CALCIO_MAIS_MAGNESIO") {
    return "ELEVACAO_DO_TEOR_DE_CALCIO_MAIS_MAGNESIO";
  }
  return value;
};

const mapFormToRequest = (
  form: FertilizationTableFormState
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

    espacamentos_sugeridos: form.espacamentoSugeridoTipo,
    valor_inicial: num(form.espacamentoSugeridoMin),
    valor_final: num(form.espacamentoSugeridoMax),

    espacamento_usado: form.espacamentoUsadoTipo,
    valor_espacamento_usado: num(form.espacamentoUsadoValor),

    produtividade_regional: num(form.produtividadeRegional),
    produtividade_esperada: num(form.produtividadeEsperada),

    criterio_de_calagem: normalizeLimingCriteriaForBackend(form.criterioCalagem),

    tipo_de_esterco: form.sugestaoEstercoTipo,
    quantidade_de_esterco: num(form.sugestaoEstercoQtd),

    sugestao_gessagem: num(form.sugestaoGessagem),
    sugestao_micronutrientes: num(form.sugestaoMicronutrientes),

    sugestao_npk: num(form.sugestaoNPK),

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

const saveContentRangesWithCoverages = async (
  tableId: number,
  form: FertilizationTableFormState
) => {
  const num = (v: any) => (typeof v === "number" ? v : parseFloat(v || "0"));

  const nitroRangePayload = {
    nutriente: "NITROGENIO",
    ordem_teor: 1,
    menor_teor: null,
    maior_teor: null,
    aplicacao_recomendada_plantio: num(form.plantioN),
  };
  const createdNitroRange = await createContentRange(tableId, nitroRangePayload);

  for (let i = 0; i < form.coberturasN.length; i++) {
    await createCoverage(createdNitroRange.id, {
      ordem_cobertura: i + 1,
      aplicacao_recomendada_cobertura: num(form.coberturasN[i]),
    });
  }

  let previousPLargest: number | null = null;

  for (let i = 0; i < form.faixasP.length; i++) {
    const row = form.faixasP[i];
    const { smallest, largest } = parseLabel(row.label);
    const isLastRange = i === form.faixasP.length - 1;
    const rangePayload = {
      nutriente: "FOSFORO",
      ordem_teor: i + 1,
      menor_teor: i === 0 ? smallest : previousPLargest,
      maior_teor: isLastRange ? null : largest,
      aplicacao_recomendada_plantio: num(row.plantio),
    };
    const createdRange = await createContentRange(tableId, rangePayload);
    for (let j = 0; j < row.coberturas.length; j++) {
      await createCoverage(createdRange.id, {
        ordem_cobertura: j + 1,
        aplicacao_recomendada_cobertura: num(row.coberturas[j]),
      });
    }

    previousPLargest = largest;
  }

  let previousKLargest: number | null = null;

  for (let i = 0; i < form.faixasK.length; i++) {
    const row = form.faixasK[i];
    const { smallest, largest } = parseLabel(row.label);
    const isLastRange = i === form.faixasK.length - 1;
    const rangePayload = {
      nutriente: "POTASSIO",
      ordem_teor: i + 1,
      menor_teor: i === 0 ? smallest : previousKLargest,
      maior_teor: isLastRange ? null : largest,
      aplicacao_recomendada_plantio: num(row.plantio),
    };
    const createdRange = await createContentRange(tableId, rangePayload);
    for (let j = 0; j < row.coberturas.length; j++) {
      await createCoverage(createdRange.id, {
        ordem_cobertura: j + 1,
        aplicacao_recomendada_cobertura: num(row.coberturas[j]),
      });
    }

    previousKLargest = largest;
  }
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

  const form = mode === "create" ? createForm : editForm;
  const setForm = mode === "create" ? setCreateForm : setEditForm;
  const isReadOnly = mode === "view"; 

  const modalTitle = useMemo(() => {
    if (mode === "create") return "Criar Tabela";
    if (mode === "edit") return "Editar Tabela";
    return "Visualizar Tabela";
  }, [mode]);

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

    const payloadTable = mapFormToRequest(form);

    if (mode === "edit") {
      if (!activeTable) return;
      setIsOrchestrating(true);
      try {
        await updateCropFertilizationTable({ id: activeTable.id, payload: payloadTable });

        const existingRanges = await fetchContentRangesByTable(activeTable.id);

        for (const range of existingRanges) {
          const coverages = await fetchCoveragesByRange(range.id);
          for (let i = coverages.length - 1; i >= 0; i--) {
            await deleteCoverage(coverages[i].id);
          }
        }

        for (let i = existingRanges.length - 1; i >= 0; i--) {
          await deleteContentRange(existingRanges[i].id);
        }

        await saveContentRangesWithCoverages(activeTable.id, form);

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
      await saveContentRangesWithCoverages(newTable.id, form);

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
      setter((prev) => ({ ...prev, [field]: value }));
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
              />
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
