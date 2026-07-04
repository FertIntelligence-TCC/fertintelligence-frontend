import { useState, useMemo } from "react";
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
} from "@chakra-ui/react";
import { FiGlobe, FiPlus, FiX } from "react-icons/fi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import UserLayout from "@/components/Layouts/UserLayout";
import FertName from "@/components/FertName/FertName";
import ConfigMenu from "@/components/ConfigMenu/ConfigMenu";
import { toaster } from "@/components/ui/toaster";

import { 
    FormulatedMineralFertilizerResponseDto, 
    FormulatedFertilizerFormState, 
    DEFAULT_FORMULATED_FORM_STATE,
    FormulatedMineralFertilizerCreateRequestDto,
    FormulatedMineralFertilizerPostRequestDto,
    FormulateDto,
    getFertilizerPhotoIds,
    fertilizerCommercialPriceResponseToForm,
    fertilizerCommercialPriceFormToCreatePayload,
    fertilizerCommercialPriceFormToUpdatePayload
} from "@/interfaces/Fertilizer";

import { 
    fetchFormulatedFertilizers, 
    createFormulatedFertilizer, 
    updateFormulatedFertilizer, 
    deleteFormulatedFertilizer,
    fetchPublicFormulatedFertilizers 
} from "@/services/formulatedMineralFertilizerService";

import FormulatedMineralFertilizerFormFields from "@/components/Fertilizers/FormFields/FormulatedMineralFertilizerFormFields";
import FormulatedMineralFertilizerCard from "@/components/Fertilizers/Cards/FormulatedMineralFertilizerCard";
import { formatNpkRelation } from "@/utils/npkRelation";

// --- Mappers ---

const num = (val: string) => (val ? parseFloat(val) : 0.0);

type ApiErrorResponse = {
  response?: {
    status?: number;
    data?: {
      message?: string;
      error?: string;
      detail?: string;
    } | string;
  };
};

const NPK_SUM_ERROR_DESCRIPTION = "A soma de N, P₂O₅ e K₂O da fórmula deve ser de pelo menos 24 para adubos formulados sólidos.";

const getApiErrorMessage = (error: unknown) => {
  const data = (error as ApiErrorResponse).response?.data;

  if (typeof data === "string") return data;

  return data?.message ?? data?.error ?? data?.detail ?? "";
};

const isValidationError = (error: unknown) => {
  const status = (error as ApiErrorResponse).response?.status;
  return status === 400 || status === 422;
};

const hasNpkSumBelowMinimum = (formula?: FormulateDto) => {
  if (!formula) return false;

  return (formula.n ?? 0) + (formula.p ?? 0) + (formula.k ?? 0) < 24;
};

const getNpkSumErrorDescription = (error: unknown, formula?: FormulateDto) => {
  const message = getApiErrorMessage(error).toLowerCase();
  const backendMessageIndicatesNpkMinimum =
    message.includes("npk") &&
    message.includes("24");

  if (isValidationError(error) && (backendMessageIndicatesNpkMinimum || hasNpkSumBelowMinimum(formula))) {
    return NPK_SUM_ERROR_DESCRIPTION;
  }

  return undefined;
};

// Mapeia da Resposta (Backend) para o Formulário (Frontend)
const mapResponseToForm = (dto: FormulatedMineralFertilizerResponseDto): FormulatedFertilizerFormState => {
  const relation = formatNpkRelation(dto.relacao ?? { n: 0, p: 0, k: 0 });

  return {
    fotoIds: getFertilizerPhotoIds(dto),
  ...fertilizerCommercialPriceResponseToForm(dto),
    observacao: dto.observacao ?? "",
    fonte: dto.fonte ?? "",
    formulaN: String(dto.formula?.n ?? 0),   // CORRIGIDO: 'formula'
    formulaP: String(dto.formula?.p ?? 0),
    formulaK: String(dto.formula?.k ?? 0),

    relacaoN: relation.n,   // CORRIGIDO: 'relacao'
    relacaoP: relation.p,
    relacaoK: relation.k,

    n: String(dto.n ?? 0),
    p2o5: String(dto.p2o5 ?? 0),
    k2o: String(dto.k2o ?? 0),
    ca: String(dto.ca ?? 0),
    mg: String(dto.mg ?? 0),
    s: String(dto.s ?? 0),
    b: String(dto.b ?? 0),
    cu: String(dto.cu ?? 0),
    fe: String(dto.fe ?? 0),
    mn: String(dto.mn ?? 0),
    mo: String(dto.mo ?? 0),
    zn: String(dto.zn ?? 0),

    numeroFormulaIndicada: String(dto.numero_formula_indicada ?? 0), // CORRIGIDO
    publico: dto.publico ? "sim" : "nao",
  };
};

// Mapeia do Formulário para o Payload de CRIAÇÃO
const mapFormToCreatePayload = (form: FormulatedFertilizerFormState): FormulatedMineralFertilizerCreateRequestDto => ({
    formula: { n: num(form.formulaN), p: num(form.formulaP), k: num(form.formulaK) }, // CORRIGIDO
    relacao: { n: num(form.relacaoN), p: num(form.relacaoP), k: num(form.relacaoK) }, // CORRIGIDO
    ids_fotos: form.fotoIds,
    observacao: form.observacao,
    fonte: form.fonte,
    ...fertilizerCommercialPriceFormToCreatePayload(form),
    n: num(form.n),
    p2o5: num(form.p2o5),
    k2o: num(form.k2o),
    ca: num(form.ca),
    mg: num(form.mg),
    s: num(form.s),
    b: num(form.b),
    cu: num(form.cu),
    fe: num(form.fe),
    mn: num(form.mn),
    mo: num(form.mo),
    zn: num(form.zn),
    numero_formula_indicada: num(form.numeroFormulaIndicada), // CORRIGIDO
    publico: form.publico === "sim"
});

// Mapeia do Formulário para o Payload de ATUALIZAÇÃO
const mapFormToUpdatePayload = (form: FormulatedFertilizerFormState): FormulatedMineralFertilizerPostRequestDto => ({
    nova_formula: { n: num(form.formulaN), p: num(form.formulaP), k: num(form.formulaK) }, // CORRIGIDO
    nova_relacao: { n: num(form.relacaoN), p: num(form.relacaoP), k: num(form.relacaoK) }, // CORRIGIDO
    novos_ids_fotos: form.fotoIds,
    novo_observacao: form.observacao,
    novo_fonte: form.fonte,
    ...fertilizerCommercialPriceFormToUpdatePayload(form),
    novo_n: num(form.n),
    novo_p2o5: num(form.p2o5),
    novo_k2o: num(form.k2o),
    novo_ca: num(form.ca),
    novo_mg: num(form.mg),
    novo_s: num(form.s),
    novo_b: num(form.b),
    novo_cu: num(form.cu),
    novo_fe: num(form.fe),
    novo_mn: num(form.mn),
    novo_mo: num(form.mo),
    novo_zn: num(form.zn),
    novo_numero_formula_indicada: num(form.numeroFormulaIndicada), // CORRIGIDO
    novo_publico: form.publico === "sim"
});

type Mode = "create" | "edit" | "view";

export default function FormulatedMineralFertilizer() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("create");
  
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [activeItem, setActiveItem] = useState<FormulatedMineralFertilizerResponseDto | null>(null);
  const [form, setForm] = useState<FormulatedFertilizerFormState>(DEFAULT_FORMULATED_FORM_STATE);

  const isReadOnly = mode === "view";
  
  const modalTitle = useMemo(() => {
      if (mode === "create") return "Novo Adubo Formulado";
      if (mode === "edit") return "Editar Adubo Formulado";
      return "Visualizar Adubo";
  }, [mode]);

  const { data: fertilizers = [], isLoading, isError } = useQuery({
    queryKey: ["formulated-mineral-fertilizers"],
    queryFn: fetchFormulatedFertilizers,
  });

  const createMutation = useMutation({
    mutationFn: createFormulatedFertilizer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formulated-mineral-fertilizers"] });
      setIsModalOpen(false);
      setForm(DEFAULT_FORMULATED_FORM_STATE);
      toaster.create({ title: "Adubo criado com sucesso!", type: "success" });
    },
    onError: (error, payload) => toaster.create({
      title: "Erro ao criar adubo. Verifique os dados.",
      description: getNpkSumErrorDescription(error, payload.formula),
      type: "error"
    })
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number, payload: FormulatedMineralFertilizerPostRequestDto }) => 
        updateFormulatedFertilizer(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formulated-mineral-fertilizers"] });
      setIsModalOpen(false);
      toaster.create({ title: "Adubo atualizado com sucesso!", type: "success" });
    },
    onError: (error, variables) => toaster.create({
      title: "Erro ao atualizar adubo.",
      description: getNpkSumErrorDescription(error, variables.payload.nova_formula),
      type: "error"
    })
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFormulatedFertilizer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formulated-mineral-fertilizers"] });
      setIsDeleteOpen(false);
      setSelectedId(null);
      toaster.create({ title: "Adubo removido.", type: "success" });
    },
    onError: () => toaster.create({ title: "Erro ao remover adubo.", type: "error" })
  });

  const handleOpen = (newMode: Mode, item?: FormulatedMineralFertilizerResponseDto) => {
    setMode(newMode);
    setActiveItem(item || null);
    setForm(item ? mapResponseToForm(item) : DEFAULT_FORMULATED_FORM_STATE);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (isReadOnly) {
      setIsModalOpen(false);
      return;
    }

    if (mode === "create") {
      const payload = mapFormToCreatePayload(form);
      createMutation.mutate(payload);
    } else if (mode === "edit" && activeItem) {
      const payload = mapFormToUpdatePayload(form);
      updateMutation.mutate({ id: activeItem.id, payload });
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleOpenPublicFertilizers = async () => {
    await queryClient.prefetchQuery({
      queryKey: ["formulated-public-fertilizers"],
      queryFn: fetchPublicFormulatedFertilizers,
    });
    navigate("/fertintelligence/fertilizer-management/formulated-mineral-fertilizer/publicos");
  };


  return (
    <UserLayout>
      <FertName subtitle="Adubos Minerais Formulados (NPK)" />
      <ConfigMenu />

      <Box pt={{ base: 16, md: 24 }} px={{ base: 4, md: 8 }} w="full">
        <Flex direction="column" gap={6}>
          <Heading as="h1" size="lg" color="white">Gerenciar Formulados</Heading>
          <Button variant="outline" alignSelf="flex-start" onClick={() => navigate("/fertintelligence/fertilizer-management")}>
            Voltar para o painel
          </Button>
          <Flex gap={3} wrap="wrap">
            <Button
              alignSelf="flex-start"
              colorPalette="green"
              onClick={() => handleOpen("create")}
              display="inline-flex"
              alignItems="center"
              gap={2}
            >
              <FiPlus /> Novo Formulado
            </Button>
            <Button
              alignSelf="flex-start"
              variant="outline"
              colorPalette="blue"
              onClick={handleOpenPublicFertilizers}
              display="inline-flex"
              alignItems="center"
              gap={2}
            >
              <FiGlobe /> Consultar adubos públicos
            </Button>
          </Flex>

          <Box mt={2}>
            {isLoading ? (
              <Flex justify="center" minH="200px" align="center"><Spinner color="white" size="lg" /></Flex>
            ) : isError ? (
              <Text color="red.300">Erro ao carregar adubos.</Text>
            ) : fertilizers.length === 0 ? (
              <Text color="white">Nenhum adubo cadastrado.</Text>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
                {fertilizers.map((fertilizer) => (
                  <FormulatedMineralFertilizerCard
                    key={fertilizer.id}
                    item={fertilizer}
                    isSelected={selectedId === fertilizer.id}
                    onSelect={() => setSelectedId(selectedId === fertilizer.id ? null : fertilizer.id)}
                    onView={() => handleOpen("view", fertilizer)}
                    onEdit={() => handleOpen("edit", fertilizer)}
                    onDelete={() => { setActiveItem(fertilizer); setIsDeleteOpen(true); }}
                  />
                ))}
              </SimpleGrid>
            )}
          </Box>
        </Flex>
      </Box>

      {/* Dialog Principal */}
      <Dialog.Root open={isModalOpen} onOpenChange={(e) => setIsModalOpen(e.open)} size="xl" scrollBehavior="inside">
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

            <Dialog.Body>
              {/* Note: Certifique-se de importar o componente FormFields corretamente */}
              <FormulatedMineralFertilizerFormFields 
                form={form} 
                onChange={(f, v) => setForm(prev => ({ ...prev, [f]: v }))} 
                setFormState={setForm}
                readOnly={isReadOnly} 
              />
            </Dialog.Body>

            <Dialog.Footer borderTopWidth="1px" _dark={{ borderColor: "gray.700" }}>
              <Button 
                variant={isReadOnly ? "solid" : "ghost"} 
                colorPalette={isReadOnly ? "blue" : "red"}
                onClick={() => setIsModalOpen(false)}
              >
                {isReadOnly ? "Fechar" : "Cancelar"}
              </Button>
              {!isReadOnly && (
                <Button colorPalette="green" onClick={handleSave} loading={isSaving}>
                  Salvar
                </Button>
              )}
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>

      {/* Dialog Delete */}
      <Dialog.Root open={isDeleteOpen} onOpenChange={(e) => setIsDeleteOpen(e.open)}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content bg="white" _dark={{ bg: "gray.800" }}>
            <Dialog.Header><Dialog.Title>Excluir Adubo</Dialog.Title></Dialog.Header>
            <Dialog.Body>
              <Text>
                Tem certeza que deseja excluir o formulado 
                <Text as="span" fontWeight="bold">
                   {/* Optional Chaining para segurança no modal */}
                   NPK {activeItem?.formula?.n ?? 0}-{activeItem?.formula?.p ?? 0}-{activeItem?.formula?.k ?? 0}
                </Text>?
              </Text>
              <Text fontSize="sm" color="gray.500" mt={2}>Esta ação não pode ser desfeita.</Text>
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancelar</Button>
              <Button colorPalette="red" onClick={() => activeItem && deleteMutation.mutate(activeItem.id)} loading={deleteMutation.isPending}>Excluir</Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </UserLayout>
  );
}
