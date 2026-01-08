import { useMemo, useState, Dispatch, SetStateAction } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Spinner,
  Text,
  Dialog, // Substitui Modal na v3
  useDisclosure,
  Portal,
  IconButton,
} from "@chakra-ui/react";
import { FiPlus, FiX } from "react-icons/fi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Imports locais - Mantenha os caminhos do seu projeto
import UserLayout from "@/components/Layouts/UserLayout";
import FertName from "@/components/FertName/FertName";
import ConfigMenu from "@/components/ConfigMenu/ConfigMenu";
import FertilizationTableFormFields from "@/components/FertilizationTable/FertilizationTableFormFields";
import {
  DEFAULT_TABLE_STATE,
  FertilizationTableFormState,
  NutrientRangeRow,
  CropType,
} from "@/components/FertilizationTable/types";
import {
  createCropFertilizationTable,
  deleteCropFertilizationTable,
  fetchCropFertilizationTables,
  updateCropFertilizationTable,
} from "@/services/cropFertilizationTableService";
import {
  CropFertilizationTableResponseDto,
  CropFertilizationTableCreateRequestDto,
} from "@/interfaces/CropFertilizationTable";

// Import do Toaster (Chakra v3)
import { toaster } from "@/components/ui/toaster";

/**
 * --- Mappers: Frontend State <-> Backend DTO ---
 */
const mapResponseToForm = (
  dto: CropFertilizationTableResponseDto
): FertilizationTableFormState => {
  const makeRowId = (fallback?: unknown) =>
    String(
      fallback ??
        (typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : Math.random())
    );

  const faixasP: NutrientRangeRow[] = (dto.contentRanges ?? [])
    .filter((r) => r.nutrient === "P2O5")
    .map((r) => ({
      id: makeRowId(r.id),
      label: r.operatorLabel,
      operatorType: "between",
      plantio: String(r.plantioValue),
      coberturas: (r.coverageValues ?? []).map(String),
    }));

  const faixasK: NutrientRangeRow[] = (dto.contentRanges ?? [])
    .filter((r) => r.nutrient === "K2O")
    .map((r) => ({
      id: makeRowId(r.id),
      label: r.operatorLabel,
      operatorType: "between",
      plantio: String(r.plantioValue),
      coberturas: (r.coverageValues ?? []).map(String),
    }));

  return {
    id: dto.id,
    nomeComum: dto.nomeComum as CropType,
    nomeCientifico: dto.nomeCientifico,
    cultivares: dto.cultivares || "",

    espacamentoSugeridoTipo: dto.espacamentoSugeridoTipo as any,
    espacamentoSugeridoMin: String(dto.espacamentoSugeridoMin),
    espacamentoSugeridoMax: String(dto.espacamentoSugeridoMax),

    espacamentoUsadoTipo: dto.espacamentoUsadoTipo as any,
    espacamentoUsadoValor: String(dto.espacamentoUsadoValor),

    produtividadeRegional: String(dto.produtividadeRegional),
    produtividadeEsperada: String(dto.produtividadeEsperada),

    criterioCalagem: dto.criterioCalagem as any,

    sugestaoEstercoTipo: dto.sugestaoEstercoTipo as any,
    sugestaoEstercoQtd: String(dto.sugestaoEstercoQtd),

    sugestaoGessagem: String(dto.sugestaoGessagem),
    sugestaoMicronutrientes: String(dto.sugestaoMicronutrientes),

    sugestaoN: String(dto.sugestaoN),
    sugestaoP: String(dto.sugestaoP),
    sugestaoK: String(dto.sugestaoK),

    coberturaLabels:
      dto.coverages && dto.coverages.length > 0
        ? dto.coverages.map((c) => c.label)
        : ["Cobertura/1ª cobertura"],

    plantioN: String(dto.plantioN || ""),
    coberturasN: dto.coberturasN ? dto.coberturasN.map(String) : [""],

    faixasP,
    faixasK,
    observacoes: dto.observacoes || "",
  };
};

const mapFormToRequest = (
  form: FertilizationTableFormState
): CropFertilizationTableCreateRequestDto => {
  const num = (v: unknown) => {
    const n = typeof v === "number" ? v : parseFloat(String(v));
    return Number.isFinite(n) ? n : 0;
  };

  const rangesP = (form.faixasP ?? []).map((row) => ({
    nutrient: "P2O5",
    operatorLabel: row.label,
    plantioValue: num(row.plantio),
    coverageValues: (row.coberturas ?? []).map(num),
  }));

  const rangesK = (form.faixasK ?? []).map((row) => ({
    nutrient: "K2O",
    operatorLabel: row.label,
    plantioValue: num(row.plantio),
    coverageValues: (row.coberturas ?? []).map(num),
  }));

  return {
    nomeComum: form.nomeComum,
    nomeCientifico: form.nomeCientifico,
    cultivares: form.cultivares,

    espacamentoSugeridoTipo: form.espacamentoSugeridoTipo,
    espacamentoSugeridoMin: num(form.espacamentoSugeridoMin),
    espacamentoSugeridoMax: num(form.espacamentoSugeridoMax),

    espacamentoUsadoTipo: form.espacamentoUsadoTipo,
    espacamentoUsadoValor: num(form.espacamentoUsadoValor),

    produtividadeRegional: num(form.produtividadeRegional),
    produtividadeEsperada: num(form.produtividadeEsperada),

    criterioCalagem: form.criterioCalagem,

    sugestaoEstercoTipo: form.sugestaoEstercoTipo,
    sugestaoEstercoQtd: num(form.sugestaoEstercoQtd),

    sugestaoGessagem: num(form.sugestaoGessagem),
    sugestaoMicronutrientes: num(form.sugestaoMicronutrientes),

    sugestaoN: num(form.sugestaoN),
    sugestaoP: num(form.sugestaoP),
    sugestaoK: num(form.sugestaoK),

    plantioN: num(form.plantioN),
    coberturasN: (form.coberturasN ?? []).map(num),

    coverages: (form.coberturaLabels ?? []).map((label, index) => ({
      label,
      orderIndex: index,
    })),

    contentRanges: [...rangesP, ...rangesK],
    observacoes: form.observacoes,
  } as any;
};

type Mode = "create" | "edit";

function TableCard(props: {
  table: CropFertilizationTableResponseDto;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { table, onEdit, onDelete } = props;

  return (
    <Box
      p={4}
      bg="white"
      _dark={{ bg: "gray.700" }}
      borderRadius="md"
      shadow="md"
      minW="280px"
      borderLeftWidth="4px"
      borderLeftColor="green.500"
      position="relative"
    >
      <Text fontWeight="bold" fontSize="lg" mb={1}>
        {table.nomeComum}
      </Text>
      <Text fontSize="sm" color="gray.500" fontStyle="italic" mb={3}>
        {table.nomeCientifico}
      </Text>

      <Flex gap={2} mt="auto">
        <Button size="xs" variant="outline" onClick={onEdit}>
          Editar
        </Button>
        <Button size="xs" colorPalette="red" variant="ghost" onClick={onDelete}>
          Excluir
        </Button>
      </Flex>
    </Box>
  );
}

export default function CropFertilizationTable() {
  const queryClient = useQueryClient();

  // Estados de Controle dos Modais (Dialogs)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Estado dos Dados
  const [mode, setMode] = useState<Mode>("create");
  const [activeTable, setActiveTable] =
    useState<CropFertilizationTableResponseDto | null>(null);

  const [createForm, setCreateForm] = useState<FertilizationTableFormState>(
    DEFAULT_TABLE_STATE
  );
  const [editForm, setEditForm] = useState<FertilizationTableFormState>(
    DEFAULT_TABLE_STATE
  );

  const isCreate = mode === "create";
  const form = isCreate ? createForm : editForm;
  const setForm = isCreate ? setCreateForm : setEditForm;

  const modalTitle = useMemo(
    () => (isCreate ? "Criar Tabela" : "Editar Tabela"),
    [isCreate]
  );

  const {
    data: tables = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["crop-fertilization-tables"],
    queryFn: fetchCropFertilizationTables,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createCropFertilizationTable,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["crop-fertilization-tables"],
      });
      setIsModalOpen(false);
      setCreateForm(DEFAULT_TABLE_STATE);
      toaster.create({
        title: "Tabela criada com sucesso.",
        type: "success",
      });
    },
    onError: () =>
      toaster.create({ title: "Erro ao criar tabela.", type: "error" }),
  });

  const updateMutation = useMutation({
    mutationFn: updateCropFertilizationTable,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["crop-fertilization-tables"],
      });
      setIsModalOpen(false);
      toaster.create({
        title: "Tabela atualizada com sucesso.",
        type: "success",
      });
    },
    onError: () =>
      toaster.create({ title: "Erro ao atualizar tabela.", type: "error" }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCropFertilizationTable,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["crop-fertilization-tables"],
      });
      setIsDeleteOpen(false);
      toaster.create({ title: "Tabela removida.", type: "success" });
    },
    onError: () =>
      toaster.create({ title: "Erro ao remover tabela.", type: "error" }),
  });

  // Actions
  const openCreate = () => {
    setMode("create");
    setActiveTable(null);
    setCreateForm(DEFAULT_TABLE_STATE);
    setIsModalOpen(true);
  };

  const openEdit = (table: CropFertilizationTableResponseDto) => {
    setMode("edit");
    setActiveTable(table);
    setEditForm(mapResponseToForm(table));
    setIsModalOpen(true);
  };

  const requestDelete = (table: CropFertilizationTableResponseDto) => {
    setActiveTable(table);
    setIsDeleteOpen(true);
  };

  const handleSave = () => {
    const payload = mapFormToRequest(form);

    if (isCreate) {
      createMutation.mutate(payload);
      return;
    }

    if (!activeTable) return;

    updateMutation.mutate({
      id: activeTable.id,
      payload,
    });
  };

  const handleConfirmDelete = () => {
    if (!activeTable) return;
    deleteMutation.mutate(activeTable.id);
  };

  const isSaving = isCreate
    ? createMutation.isPending
    : updateMutation.isPending;

  const handleFormChange =
    (setter: Dispatch<SetStateAction<FertilizationTableFormState>>) =>
    (field: keyof FertilizationTableFormState, value: any) => {
      setter((prev) => ({ ...prev, [field]: value }));
    };

  return (
    <UserLayout>
      <FertName subtitle="Tabelas de Adubação" />
      <ConfigMenu />

      <Box pt={{ base: 16, md: 24 }} px={{ base: 4, md: 8 }} w="full">
        <Flex direction="column" gap={6}>
          <Heading as="h1" size="lg" color="white">
            Gerenciar Tabelas de Cultura
          </Heading>

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

          <Box mt={2}>
            {isLoading ? (
              <Flex justify="center">
                <Spinner color="white" />
              </Flex>
            ) : isError ? (
              <Text color="red.300">Erro ao carregar tabelas.</Text>
            ) : tables.length === 0 ? (
              <Text color="white">Nenhuma tabela cadastrada.</Text>
            ) : (
              <Flex wrap="wrap" gap={4}>
                {tables.map((table) => (
                  <TableCard
                    key={table.id}
                    table={table}
                    onEdit={() => openEdit(table)}
                    onDelete={() => requestDelete(table)}
                  />
                ))}
              </Flex>
            )}
          </Box>
        </Flex>
      </Box>

      {/* --- Dialog Principal (Criar/Editar) --- */}
      {/* Na v3, usamos Dialog.Root e Dialog.Trigger/Content */}
      <Dialog.Root
        open={isModalOpen}
        onOpenChange={(e) => setIsModalOpen(e.open)}
        size="xl"
        scrollBehavior="inside"
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content bg="white" _dark={{ bg: "gray.800" }}>
            <Dialog.Header>
              <Flex justify="space-between" align="center">
                <Dialog.Title>{modalTitle}</Dialog.Title>
                <Dialog.CloseTrigger asChild>
                  <IconButton
                    size="sm"
                    variant="ghost"
                    aria-label="Fechar"
                    onClick={() => setIsModalOpen(false)}
                  >
                    <FiX />
                  </IconButton>
                </Dialog.CloseTrigger>
              </Flex>
            </Dialog.Header>

            <Dialog.Body py={6}>
              {/* O conteúdo do formulário */}
              <FertilizationTableFormFields
                form={form}
                onFormChange={handleFormChange(setForm)}
              />
            </Dialog.Body>

            <Dialog.Footer borderTopWidth="1px" _dark={{ borderColor: "gray.700" }}>
              <Flex gap={3}>
                <Button
                  onClick={() => setIsModalOpen(false)}
                  colorPalette="red"
                  variant="ghost"
                >
                  Cancelar
                </Button>
                <Button
                  colorPalette="green"
                  onClick={handleSave}
                  loading={isSaving}
                >
                  Salvar
                </Button>
              </Flex>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>

      {/* --- Dialog de Exclusão --- */}
      <Dialog.Root
        open={isDeleteOpen}
        onOpenChange={(e) => setIsDeleteOpen(e.open)}
        role="alertdialog"
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content bg="white" _dark={{ bg: "gray.800" }}>
            <Dialog.Header>
              <Dialog.Title>Excluir Tabela</Dialog.Title>
            </Dialog.Header>

            <Dialog.Body>
              <Text>
                Tem certeza que deseja excluir a tabela de adubação "
                <Text as="span" fontWeight="bold">
                  {activeTable?.nomeComum}
                </Text>
                "?
              </Text>
              <Text fontSize="sm" color="gray.500" mt={2}>
                Esta ação não pode ser desfeita.
              </Text>
            </Dialog.Body>

            <Dialog.Footer>
              <Button
                variant="outline"
                onClick={() => setIsDeleteOpen(false)}
                disabled={deleteMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                colorPalette="red"
                onClick={handleConfirmDelete}
                loading={deleteMutation.isPending}
                ml={3}
              >
                Excluir
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </UserLayout>
  );
}