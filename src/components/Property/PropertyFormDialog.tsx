import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Flex,
  Heading,
  Text,
  VStack,
  useDisclosure,
  Box,
  Separator,
  HStack,
  Spinner,
} from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toaster } from "@/components/ui/toaster";

import DialogContainer from "./DialogContainer";
import PropertyFormFields from "./PropertyFormFields";
import PlotList from "@/components/Plot/PlotList";
import PlotFormDialog from "@/components/Plot/PlotFormDialog";

import { PropertyFormState } from "./types";
import {
  getPlotsByProperty,
  createPlot,
  updatePlot,
  deletePlot,
} from "@/services/plotService";
import { PlotResponse, PlotCreatePayload } from "@/interfaces/Plot";

import {
  createProperty,
  updateProperty,
  getPropertyById,
} from "@/services/propertyService";

// >>> ajuste aqui para bater com teu PropertyFormState real
const emptyForm: PropertyFormState = {
  nome: "",
  endereco: "",
  cnpj: "",
  localizacao: {
    latitude: null,
    latitudeDirection: undefined,
    longitude: null,
    longitudeDirection: undefined,
    altitude: null,
  },
};

type Props = {
  title: string;
  isOpen: boolean;
  onClose: () => void;

  // se vier, é edição; se não vier, é criação
  propertyId?: number | null;

  // callbacks opcionais
  onSuccess?: () => void;

  // labels opcionais
  submitLabel?: string;
  cancelLabel?: string;
};

export default function PropertyFormDialog({
  title,
  isOpen,
  onClose,
  propertyId = null,
  onSuccess,
  submitLabel = "Concluir",
  cancelLabel = "Cancelar",
}: Props) {
  const queryClient = useQueryClient();
  const plotFormDisclosure = useDisclosure();
  const [editingPlot, setEditingPlot] = useState<PlotResponse | null>(null);

  const isEdit = !!propertyId;

  // carrega propriedade quando for edição
  const { data: propertyData, isLoading: isLoadingProperty } = useQuery({
    queryKey: ["property", propertyId],
    queryFn: () => (propertyId ? getPropertyById(propertyId) : Promise.resolve(null)),
    enabled: isOpen && !!propertyId,
  });

  const [form, setForm] = useState<PropertyFormState>(emptyForm);

  useEffect(() => {
    if (!isOpen) return;

    // criação: limpa
    if (!propertyId) {
      setForm(emptyForm);
      return;
    }

    // edição: popula quando chegar
    if (propertyData) {
      setForm({
        nome: propertyData.nome ?? "",
        endereco: propertyData.endereco ?? "",
        cnpj: propertyData.cnpj ?? "",
        localizacao: {
          latitude: propertyData.localizacao?.latitude ?? null,
          latitudeDirection: propertyData.localizacao?.latitudeDirection,
          longitude: propertyData.localizacao?.longitude ?? null,
          longitudeDirection: propertyData.localizacao?.longitudeDirection,
          altitude: propertyData.localizacao?.altitude ?? null,
        },
      });
    }
  }, [isOpen, propertyId, propertyData]);

  const canSubmit = useMemo(() => {
    // deixa simples: valida mínimo
    if (!form.nome?.trim()) return false;
    if (!form.endereco?.trim()) return false;
    if (!form.cnpj?.trim()) return false;
    return true;
  }, [form]);

  const onFormChange = <Field extends keyof PropertyFormState>(
    field: Field,
    value: PropertyFormState[Field]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // ======= salvar propriedade =======

  const createPropertyMutation = useMutation({
    mutationFn: () => createProperty(form as any),
    onSuccess: async () => {
      toaster.create({ title: "Propriedade criada!", type: "success" });
      onSuccess?.();
      onClose();
    },
    onError: () => toaster.create({ title: "Erro ao criar propriedade.", type: "error" }),
  });

  const updatePropertyMutation = useMutation({
    mutationFn: () => updateProperty({ id: propertyId!, payload: form as any }),
    onSuccess: async () => {
      toaster.create({ title: "Propriedade atualizada!", type: "success" });
      await queryClient.invalidateQueries({ queryKey: ["property", propertyId] });
      onSuccess?.();
      onClose();
    },
    onError: () => toaster.create({ title: "Erro ao atualizar propriedade.", type: "error" }),
  });

  const handleSubmit = () => {
    if (!canSubmit) {
      toaster.create({
        title: "Preencha todos os campos obrigatórios.",
        type: "warning",
      });
      return;
    }

    if (isEdit) updatePropertyMutation.mutate();
    else createPropertyMutation.mutate();
  };

  // ======= plots =======

  const { data: plots = [] } = useQuery({
    queryKey: ["plots", propertyId],
    queryFn: () => (propertyId ? getPlotsByProperty(propertyId) : Promise.resolve([])),
    enabled: !!propertyId && isOpen,
  });

  const createPlotMutation = useMutation({
    mutationFn: (payload: PlotCreatePayload) => createPlot(propertyId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plots", propertyId] });
      plotFormDisclosure.onClose();
      toaster.create({ title: "Talhão criado com sucesso!", type: "success" });
    },
    onError: () => toaster.create({ title: "Erro ao criar talhão.", type: "error" }),
  });

  const updatePlotMutation = useMutation({
    mutationFn: (payload: { id: number; data: PlotCreatePayload }) => updatePlot(payload.id, payload.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plots", propertyId] });
      plotFormDisclosure.onClose();
      toaster.create({ title: "Talhão atualizado com sucesso!", type: "success" });
    },
    onError: () => toaster.create({ title: "Erro ao atualizar talhão.", type: "error" }),
  });

  const deletePlotMutation = useMutation({
    mutationFn: (id: number) => deletePlot(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plots", propertyId] });
      toaster.create({ title: "Talhão removido com sucesso!", type: "success" });
    },
    onError: () => toaster.create({ title: "Erro ao remover talhão.", type: "error" }),
  });

  const handleAddPlot = () => {
    setEditingPlot(null);
    plotFormDisclosure.onOpen();
  };

  const handleEditPlot = (plot: PlotResponse) => {
    setEditingPlot(plot);
    plotFormDisclosure.onOpen();
  };

  const handleSavePlot = (payload: PlotCreatePayload) => {
    if (editingPlot) updatePlotMutation.mutate({ id: editingPlot.id, data: payload });
    else createPlotMutation.mutate(payload);
  };

  const isSubmitting = createPropertyMutation.isPending || updatePropertyMutation.isPending;

  return (
    <>
      <DialogContainer isOpen={isOpen} onClose={onClose}>
        <Heading as="h2" size="md" mb={4}>
          {title}
        </Heading>

        {isEdit && isLoadingProperty ? (
          <Flex justify="center" py={10}>
            <Spinner size="lg" />
          </Flex>
        ) : (
          <VStack align="stretch" gap={6}>
            <PropertyFormFields form={form} onFormChange={onFormChange} />

            {!propertyId && (
              <Box bg="blue.50" _dark={{ bg: "blue.900" }} p={3} borderRadius="md">
                <Text fontSize="sm" color="blue.600" _dark={{ color: "blue.200" }} textAlign="center">
                  Você poderá adicionar talhões após criar a propriedade.
                </Text>
              </Box>
            )}

            <Separator />

            {propertyId && (
              <Box>
                <Flex justify="space-between" align="center" mb={2}>
                  <Heading as="h4" size="sm" color="gray.600">
                    Talhões
                  </Heading>

                  <Button size="xs" colorScheme="blue" onClick={handleAddPlot}>
                    <HStack gap={1}>
                      <FiPlus />
                      <Text>Adicionar Talhão</Text>
                    </HStack>
                  </Button>
                </Flex>

                <PlotList
                  plots={plots}
                  mode="edit"
                  onEdit={handleEditPlot}
                  onDelete={(p) => deletePlotMutation.mutate(p.id)}
                />
              </Box>
            )}
          </VStack>
        )}

        <Flex justify="flex-end" gap={3} mt={6}>
          <Button onClick={onClose} colorScheme="red" variant="outline">
            {cancelLabel}
          </Button>

          <Button colorScheme="green" onClick={handleSubmit} loading={isSubmitting}>
            {submitLabel}
          </Button>
        </Flex>
      </DialogContainer>

      <PlotFormDialog
        isOpen={plotFormDisclosure.open}
        onClose={plotFormDisclosure.onClose}
        onSubmit={handleSavePlot}
        initialData={editingPlot}
        isSubmitting={createPlotMutation.isPending || updatePlotMutation.isPending}
      />
    </>
  );
}