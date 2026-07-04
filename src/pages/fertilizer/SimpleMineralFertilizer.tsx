// src/pages/fertilizer/SimpleMineralFertilizer.tsx
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

// Interfaces reconciliadas
import { 
    SimpleMineralFertilizerResponseDto, 
    SimpleMineralFertilizerFormState, 
    DEFAULT_SIMPLE_MINERAL_FORM_STATE,
    SimpleMineralFertilizerCreateRequestDto,
    SimpleMineralFertilizerPostRequestDto,
    getFertilizerPhotoIds,
    fertilizerCommercialPriceResponseToForm,
    fertilizerCommercialPriceFormToCreatePayload,
    fertilizerCommercialPriceFormToUpdatePayload
} from "@/interfaces/Fertilizer";

import { 
    fetchSimpleMineralFertilizers, 
    createSimpleMineralFertilizer, 
    updateSimpleMineralFertilizer, 
    deleteSimpleMineralFertilizer, 
    fetchPublicSimpleMineralFertilizers 
} from "@/services/simpleMineralFertilizerService";

import SimpleMineralFertilizerFormFields from "@/components/Fertilizers/FormFields/SimpleMineralFertilizerFormFields";
import SimpleMineralFertilizerCard from "@/components/Fertilizers/Cards/SimpleMineralFertilizerCard";

// --- Mappers Corrigidos ---

// Backend (snake_case) -> Frontend Form (camelCase)
const mapResponseToForm = (dto: SimpleMineralFertilizerResponseDto): SimpleMineralFertilizerFormState => ({
  nome: dto.nome_adubo, // Conciliado com @JsonProperty("nome_adubo")
  fotoIds: getFertilizerPhotoIds(dto),
  ...fertilizerCommercialPriceResponseToForm(dto),
  observacao: dto.observacao ?? "",
  fonte: dto.fonte ?? "",
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
  indiceSalino: String(dto.indice_salino ?? 0), // Conciliado
  indiceAcidez: String(dto.indice_acidez ?? 0), // Conciliado
  publico: dto.publico ? "sim" : "nao",
});

// Helper para converter string numérica para number
const num = (v: string) => (v ? parseFloat(v) : 0.0);

// Frontend Form -> Backend CREATE Payload (SimpleMineralFertilizerCreateRequestDto)
const mapFormToCreatePayload = (form: SimpleMineralFertilizerFormState): SimpleMineralFertilizerCreateRequestDto => ({
    nome_adubo: form.nome,
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
    indice_salino: num(form.indiceSalino),
    indice_acidez: num(form.indiceAcidez),
    publico: form.publico === "sim"
});

// Frontend Form -> Backend UPDATE Payload (SimpleMineralFertilizerPostRequestDto)
// Conciliado com prefixos "novo_" definidos no Java
const mapFormToUpdatePayload = (form: SimpleMineralFertilizerFormState): SimpleMineralFertilizerPostRequestDto => ({
    novo_nome_adubo: form.nome,
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
    novo_indice_salino: num(form.indiceSalino),
    novo_indice_acidez: num(form.indiceAcidez),
    novo_publico: form.publico === "sim"
});

type Mode = "create" | "edit" | "view";

export default function SimpleMineralFertilizer() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("create");
  
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [activeItem, setActiveItem] = useState<SimpleMineralFertilizerResponseDto | null>(null);
  const [form, setForm] = useState<SimpleMineralFertilizerFormState>(DEFAULT_SIMPLE_MINERAL_FORM_STATE);

  const isReadOnly = mode === "view";
  
  const modalTitle = useMemo(() => {
      if (mode === "create") return "Novo Adubo Mineral Simples";
      if (mode === "edit") return "Editar Adubo";
      return "Visualizar Adubo";
  }, [mode]);

  // --- Queries & Mutations ---
  const { data: fertilizers = [], isLoading, isError } = useQuery({
    queryKey: ["simple-mineral-fertilizers"],
    queryFn: fetchSimpleMineralFertilizers,
  });

  const createMutation = useMutation({
    mutationFn: createSimpleMineralFertilizer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["simple-mineral-fertilizers"] });
      setIsModalOpen(false);
      setForm(DEFAULT_SIMPLE_MINERAL_FORM_STATE);
      toaster.create({ title: "Adubo criado com sucesso!", type: "success" });
    },
    onError: () => toaster.create({ title: "Erro ao criar adubo.", type: "error" })
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number, payload: SimpleMineralFertilizerPostRequestDto }) => 
        updateSimpleMineralFertilizer(data.id, data.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["simple-mineral-fertilizers"] });
      setIsModalOpen(false);
      toaster.create({ title: "Adubo atualizado com sucesso!", type: "success" });
    },
    onError: () => toaster.create({ title: "Erro ao atualizar adubo.", type: "error" })
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSimpleMineralFertilizer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["simple-mineral-fertilizers"] });
      setIsDeleteOpen(false);
      setSelectedId(null);
      toaster.create({ title: "Adubo removido.", type: "success" });
    },
    onError: () => toaster.create({ title: "Erro ao remover adubo.", type: "error" })
  });

  // --- Handlers ---
  const handleOpen = (newMode: Mode, item?: SimpleMineralFertilizerResponseDto) => {
    setMode(newMode);
    setActiveItem(item || null);
    setForm(item ? mapResponseToForm(item) : DEFAULT_SIMPLE_MINERAL_FORM_STATE);
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

  // Ajuste para o componente Card ler a propriedade correta (nome_adubo)
  const mappedFertilizers = fertilizers.map(f => ({
      ...f,
      nome: f.nome_adubo // Adapter para o componente visual SimpleMineralFertilizerCard
  }));

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleOpenPublicFertilizers = async () => {
    await queryClient.prefetchQuery({
      queryKey: ["simple-mineral-public-fertilizers"],
      queryFn: fetchPublicSimpleMineralFertilizers,
    });
    navigate("/fertintelligence/fertilizer-management/simple-mineral-fertilizer/publicos");
  };

  return (
    <UserLayout>
      <FertName subtitle="Adubos Minerais Simples" />
      <ConfigMenu />

      <Box pt={{ base: 16, md: 24 }} px={{ base: 4, md: 8 }} w="full">
        <Flex direction="column" gap={6}>
          <Heading as="h1" size="lg" color="white">Gerenciar Adubos Minerais Simples</Heading>
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
              <FiPlus /> Novo Adubo
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
            ) : mappedFertilizers.length === 0 ? (
              <Text color="white">Nenhum adubo cadastrado.</Text>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
                {mappedFertilizers.map((fertilizer) => (
                  <SimpleMineralFertilizerCard
                    key={fertilizer.id}
                    item={fertilizer} // Agora possui a propriedade 'nome' via adapter acima
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
              <SimpleMineralFertilizerFormFields 
                form={form} 
                onChange={(f, v) => setForm(prev => ({ ...prev, [f]: v }))} 
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
              <Text>Tem certeza que deseja excluir o adubo <Text as="span" fontWeight="bold">{activeItem?.nome_adubo}</Text>?</Text>
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
