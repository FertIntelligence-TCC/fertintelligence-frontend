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
    OrganicFertilizerResponseDto,
    OrganicFertilizerFormState,
    DEFAULT_ORGANIC_FERTILIZER_FORM_STATE,
    OrganicFertilizerCreateRequestDto,
    OrganicFertilizerPostRequestDto,
    getFertilizerPhotoIds,
    fertilizerCommercialPriceResponseToForm,
    fertilizerCommercialPriceFormToCreatePayload,
    fertilizerCommercialPriceFormToUpdatePayload,
    getOrganicMatterContent,
    optionalFertilizerDecimal
} from "@/interfaces/Fertilizer";

import {
    fetchOrganicFertilizers,
    createOrganicFertilizer,
    updateOrganicFertilizer,
    deleteOrganicFertilizer,
    fetchPublicOrganicFertilizers
} from "@/services/organicFertilizerService";

import OrganicFertilizerFormFields from "@/components/Fertilizers/FormFields/OrganicFertilizerFormFields";
import OrganicFertilizerCard from "@/components/Fertilizers/Cards/OrganicFertilizerCard";

const optionalNum = (val: string) => optionalFertilizerDecimal(val);

export const mapOrganicResponseToForm = (dto: OrganicFertilizerResponseDto): OrganicFertilizerFormState => ({
  nome: dto.nome_adubo,
  c: dto.teor_carbono_organico_percentual == null ? "" : String(dto.teor_carbono_organico_percentual),
  fotoIds: getFertilizerPhotoIds(dto),
  ...fertilizerCommercialPriceResponseToForm(dto),
  observacao: dto.observacao ?? "",
  fonte: dto.fonte ?? "",
  teorUmidade: dto.teor_umidade == null ? "" : String(dto.teor_umidade),
  teorMateriaOrganica: getOrganicMatterContent(dto) == null ? "" : String(getOrganicMatterContent(dto)),
  taxaMineralizacaoAno1: dto.taxa_mineralizacao_primeiro_ano_percentual == null ? "" : String(dto.taxa_mineralizacao_primeiro_ano_percentual),
  taxaMineralizacaoAno2: dto.taxa_mineralizacao_segundo_ano_percentual == null ? "" : String(dto.taxa_mineralizacao_segundo_ano_percentual),
  taxaMineralizacaoAno3: dto.taxa_mineralizacao_terceiro_ano_percentual == null ? "" : String(dto.taxa_mineralizacao_terceiro_ano_percentual),
  taxaMineralizacaoAno4: dto.taxa_mineralizacao_quarto_ano_percentual == null ? "" : String(dto.taxa_mineralizacao_quarto_ano_percentual),
  valorFreteTonelada: dto.valor_frete_tonelada == null ? "" : String(dto.valor_frete_tonelada),
  arsenio: dto.arsenio_mg_kg == null ? "" : String(dto.arsenio_mg_kg),
  cadmio: dto.cadmio_mg_kg == null ? "" : String(dto.cadmio_mg_kg),
  cromio: dto.cromio_mg_kg == null ? "" : String(dto.cromio_mg_kg),
  chumbo: dto.chumbo_mg_kg == null ? "" : String(dto.chumbo_mg_kg),
  mercurio: dto.mercurio_mg_kg == null ? "" : String(dto.mercurio_mg_kg),
  niquel: dto.niquel_mg_kg == null ? "" : String(dto.niquel_mg_kg),
  selenio: dto.selenio_mg_kg == null ? "" : String(dto.selenio_mg_kg),
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
  publico: dto.publico ? "sim" : "nao",
});

export const mapOrganicFormToCreatePayload = (form: OrganicFertilizerFormState): OrganicFertilizerCreateRequestDto => ({
    nome_adubo: form.nome,
    ids_fotos: form.fotoIds,
    observacao: form.observacao,
    fonte: form.fonte,
    ...fertilizerCommercialPriceFormToCreatePayload(form),
    teor_umidade: optionalNum(form.teorUmidade),
    teor_materia_organica_percentual: optionalNum(form.teorMateriaOrganica),
    taxa_mineralizacao_primeiro_ano_percentual: optionalNum(form.taxaMineralizacaoAno1),
    taxa_mineralizacao_segundo_ano_percentual: optionalNum(form.taxaMineralizacaoAno2),
    taxa_mineralizacao_terceiro_ano_percentual: optionalNum(form.taxaMineralizacaoAno3),
    taxa_mineralizacao_quarto_ano_percentual: optionalFertilizerDecimal(form.taxaMineralizacaoAno4),
    valor_frete_tonelada: optionalFertilizerDecimal(form.valorFreteTonelada),
    arsenio_mg_kg: optionalFertilizerDecimal(form.arsenio),
    cadmio_mg_kg: optionalFertilizerDecimal(form.cadmio),
    cromio_mg_kg: optionalFertilizerDecimal(form.cromio),
    chumbo_mg_kg: optionalFertilizerDecimal(form.chumbo),
    mercurio_mg_kg: optionalFertilizerDecimal(form.mercurio),
    niquel_mg_kg: optionalFertilizerDecimal(form.niquel),
    selenio_mg_kg: optionalFertilizerDecimal(form.selenio),
    n: optionalNum(form.n) as number,
    p2o5: optionalNum(form.p2o5) as number,
    k2o: optionalNum(form.k2o) as number,
    ca: optionalNum(form.ca) as number,
    mg: optionalNum(form.mg) as number,
    s: optionalNum(form.s) as number,
    b: optionalNum(form.b) as number,
    cu: optionalNum(form.cu) as number,
    fe: optionalNum(form.fe) as number,
    mn: optionalNum(form.mn) as number,
    mo: optionalNum(form.mo) as number,
    zn: optionalNum(form.zn) as number,
    publico: form.publico === "sim"
});

export const mapOrganicFormToUpdatePayload = (form: OrganicFertilizerFormState): OrganicFertilizerPostRequestDto => ({
    novo_nome_adubo: form.nome,
    novos_ids_fotos: form.fotoIds,
    novo_observacao: form.observacao,
    novo_fonte: form.fonte,
    ...fertilizerCommercialPriceFormToUpdatePayload(form),
    novo_teor_umidade: optionalNum(form.teorUmidade),
    novo_teor_materia_organica_percentual: optionalNum(form.teorMateriaOrganica),
    novo_taxa_mineralizacao_primeiro_ano_percentual: optionalNum(form.taxaMineralizacaoAno1),
    novo_taxa_mineralizacao_segundo_ano_percentual: optionalNum(form.taxaMineralizacaoAno2),
    novo_taxa_mineralizacao_terceiro_ano_percentual: optionalNum(form.taxaMineralizacaoAno3),
    novo_taxa_mineralizacao_quarto_ano_percentual: optionalFertilizerDecimal(form.taxaMineralizacaoAno4),
    novo_valor_frete_tonelada: optionalFertilizerDecimal(form.valorFreteTonelada),
    novo_arsenio_mg_kg: optionalFertilizerDecimal(form.arsenio),
    novo_cadmio_mg_kg: optionalFertilizerDecimal(form.cadmio),
    novo_cromio_mg_kg: optionalFertilizerDecimal(form.cromio),
    novo_chumbo_mg_kg: optionalFertilizerDecimal(form.chumbo),
    novo_mercurio_mg_kg: optionalFertilizerDecimal(form.mercurio),
    novo_niquel_mg_kg: optionalFertilizerDecimal(form.niquel),
    novo_selenio_mg_kg: optionalFertilizerDecimal(form.selenio),
    novo_n: optionalNum(form.n) as number,
    novo_p2o5: optionalNum(form.p2o5) as number,
    novo_k2o: optionalNum(form.k2o) as number,
    novo_ca: optionalNum(form.ca) as number,
    novo_mg: optionalNum(form.mg) as number,
    novo_s: optionalNum(form.s) as number,
    novo_b: optionalNum(form.b) as number,
    novo_cu: optionalNum(form.cu) as number,
    novo_fe: optionalNum(form.fe) as number,
    novo_mn: optionalNum(form.mn) as number,
    novo_mo: optionalNum(form.mo) as number,
    novo_zn: optionalNum(form.zn) as number,
    novo_publico: form.publico === "sim"
});

type Mode = "create" | "edit" | "view";

export default function OrganicFertilizer() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("create");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [activeItem, setActiveItem] = useState<OrganicFertilizerResponseDto | null>(null);
  const [form, setForm] = useState<OrganicFertilizerFormState>(DEFAULT_ORGANIC_FERTILIZER_FORM_STATE);

  const isReadOnly = mode === "view";

  const modalTitle = useMemo(() => {
      if (mode === "create") return "Novo Adubo Orgânico";
      if (mode === "edit") return "Editar Adubo Orgânico";
      return "Visualizar Adubo";
  }, [mode]);

  const { data: fertilizers = [], isLoading, isError } = useQuery({
    queryKey: ["organic-fertilizers"],
    queryFn: fetchOrganicFertilizers,
  });

  const createMutation = useMutation({
    mutationFn: createOrganicFertilizer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organic-fertilizers"] });
      setIsModalOpen(false);
      setForm(DEFAULT_ORGANIC_FERTILIZER_FORM_STATE);
      toaster.create({ title: "Adubo criado com sucesso!", type: "success" });
    },
    onError: () => toaster.create({ title: "Erro ao criar adubo.", type: "error" })
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number, payload: OrganicFertilizerPostRequestDto }) =>
        updateOrganicFertilizer(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organic-fertilizers"] });
      setIsModalOpen(false);
      toaster.create({ title: "Adubo atualizado com sucesso!", type: "success" });
    },
    onError: () => toaster.create({ title: "Erro ao atualizar adubo.", type: "error" })
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOrganicFertilizer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organic-fertilizers"] });
      setIsDeleteOpen(false);
      setSelectedId(null);
      toaster.create({ title: "Adubo removido.", type: "success" });
    },
    onError: () => toaster.create({ title: "Erro ao remover adubo.", type: "error" })
  });

  const handleOpen = (newMode: Mode, item?: OrganicFertilizerResponseDto) => {
    setMode(newMode);
    setActiveItem(item || null);
    setForm(item ? mapOrganicResponseToForm(item) : DEFAULT_ORGANIC_FERTILIZER_FORM_STATE);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (isReadOnly) {
      setIsModalOpen(false);
      return;
    }

    if (mode === "create") {
      createMutation.mutate(mapOrganicFormToCreatePayload(form));
    } else if (mode === "edit" && activeItem) {
      updateMutation.mutate({ id: activeItem.id, payload: mapOrganicFormToUpdatePayload(form) });
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleOpenPublicFertilizers = async () => {
    await queryClient.prefetchQuery({
      queryKey: ["organic-public-fertilizers"],
      queryFn: fetchPublicOrganicFertilizers,
    });
    navigate("/fertintelligence/fertilizer-management/organic-fertilizer/publicos");
  };

  return (
    <UserLayout>
      <FertName subtitle="Adubos Orgânicos" />
      <ConfigMenu />

      <Box pt={{ base: 16, md: 24 }} px={{ base: 4, md: 8 }} w="full">
        <Flex direction="column" gap={6}>
          <Heading as="h1" size="lg" color="white">Gerenciar Adubos Orgânicos</Heading>
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
            ) : fertilizers.length === 0 ? (
              <Text color="white">Nenhum adubo cadastrado.</Text>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
                {fertilizers.map((fertilizer) => (
                  <OrganicFertilizerCard
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
              <OrganicFertilizerFormFields
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
