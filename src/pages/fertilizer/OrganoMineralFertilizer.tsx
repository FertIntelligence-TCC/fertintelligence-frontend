import { useState, useMemo } from "react";
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
import { FiPlus, FiX } from "react-icons/fi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import UserLayout from "@/components/Layouts/UserLayout";
import FertName from "@/components/FertName/FertName";
import ConfigMenu from "@/components/ConfigMenu/ConfigMenu";
import { toaster } from "@/components/ui/toaster";

import { 
    OrganoMineralFertilizerResponseDto, 
    OrganoMineralFertilizerFormState, 
    DEFAULT_ORGANO_MINERAL_FORM_STATE,
    OrganoMineralFertilizerCreateRequestDto,
    OrganoMineralFertilizerPostRequestDto
} from "@/interfaces/Fertilizer";

import { 
    fetchOrganoMineralFertilizers, 
    createOrganoMineralFertilizer, 
    updateOrganoMineralFertilizer, 
    deleteOrganoMineralFertilizer 
} from "@/services/organoMineralFertilizerService";

import OrganoMineralFertilizerFormFields from "@/components/Fertilizers/OrganoMineralFertilizerFormFields";
import OrganoMineralFertilizerCard from "@/components/Fertilizers/OrganoMineralFertilizerCard";

// --- Mappers ---

const num = (val: string) => (val ? parseFloat(val) : 0.0);

const mapResponseToForm = (dto: OrganoMineralFertilizerResponseDto): OrganoMineralFertilizerFormState => ({
  nome: dto.nome_adubo,
  c: String(dto.c ?? 0),
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
  indiceSalino: String(dto.indice_salino ?? 0),
  indiceAcidez: String(dto.indice_acidez ?? 0),
});

const mapFormToCreatePayload = (form: OrganoMineralFertilizerFormState): OrganoMineralFertilizerCreateRequestDto => ({
    nome_adubo: form.nome,
    c: num(form.c),
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
    indice_acidez: num(form.indiceAcidez)
});

const mapFormToUpdatePayload = (form: OrganoMineralFertilizerFormState): OrganoMineralFertilizerPostRequestDto => ({
    novo_nome_adubo: form.nome,
    novo_c: num(form.c),
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
    novo_indice_acidez: num(form.indiceAcidez)
});

type Mode = "create" | "edit" | "view";

export default function OrganoMineralFertilizer() {
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("create");
  
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [activeItem, setActiveItem] = useState<OrganoMineralFertilizerResponseDto | null>(null);
  const [form, setForm] = useState<OrganoMineralFertilizerFormState>(DEFAULT_ORGANO_MINERAL_FORM_STATE);

  const isReadOnly = mode === "view";
  
  const modalTitle = useMemo(() => {
      if (mode === "create") return "Novo Adubo Organomineral";
      if (mode === "edit") return "Editar Adubo Organomineral";
      return "Visualizar Adubo";
  }, [mode]);

  const { data: fertilizers = [], isLoading, isError } = useQuery({
    queryKey: ["organo-mineral-fertilizers"],
    queryFn: fetchOrganoMineralFertilizers,
  });

  const createMutation = useMutation({
    mutationFn: createOrganoMineralFertilizer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organo-mineral-fertilizers"] });
      setIsModalOpen(false);
      setForm(DEFAULT_ORGANO_MINERAL_FORM_STATE);
      toaster.create({ title: "Adubo criado com sucesso!", type: "success" });
    },
    onError: () => toaster.create({ title: "Erro ao criar adubo.", type: "error" })
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number, payload: OrganoMineralFertilizerPostRequestDto }) => 
        updateOrganoMineralFertilizer(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organo-mineral-fertilizers"] });
      setIsModalOpen(false);
      toaster.create({ title: "Adubo atualizado com sucesso!", type: "success" });
    },
    onError: () => toaster.create({ title: "Erro ao atualizar adubo.", type: "error" })
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOrganoMineralFertilizer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organo-mineral-fertilizers"] });
      setIsDeleteOpen(false);
      setSelectedId(null);
      toaster.create({ title: "Adubo removido.", type: "success" });
    },
    onError: () => toaster.create({ title: "Erro ao remover adubo.", type: "error" })
  });

  const handleOpen = (newMode: Mode, item?: OrganoMineralFertilizerResponseDto) => {
    setMode(newMode);
    setActiveItem(item || null);
    setForm(item ? mapResponseToForm(item) : DEFAULT_ORGANO_MINERAL_FORM_STATE);
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

  return (
    <UserLayout>
      <FertName subtitle="Adubos Organominerais" />
      <ConfigMenu />

      <Box pt={{ base: 16, md: 24 }} px={{ base: 4, md: 8 }} w="full">
        <Flex direction="column" gap={6}>
          <Heading as="h1" size="lg" color="white">Gerenciar Adubos Organominerais</Heading>
          <Button
            alignSelf="flex-start"
            colorPalette="green"
            onClick={() => handleOpen("create")}
            display="inline-flex"
            alignItems="center"
            gap={2}
          >
            <FiPlus /> Novo Organomineral
          </Button>

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
                  <OrganoMineralFertilizerCard
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
      <Dialog.Root open={isModalOpen} onOpenChange={(e) => setIsModalOpen(e.open)} size="lg" scrollBehavior="inside">
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
              <OrganoMineralFertilizerFormFields 
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