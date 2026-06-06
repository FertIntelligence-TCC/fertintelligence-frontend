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

import {
  DEFAULT_FORM_STATE,
  PropertyFormState,
  dmsToDecimal,
  propertyToFormState,
} from "./types";
import {
  getPlotsByProperty,
  createPlot,
  updatePlot,
  deletePlot,
} from "@/services/plotService";
import { PlotResponse, PlotCreatePayload, PlotUpdatePayload } from "@/interfaces/Plot";

import {
  createProperty,
  updateProperty,
  getPropertyById,
} from "@/services/propertyService";

// Importações para permissões
import { useUserStore } from "@/stores/user/user.store";
import { getAuthorizationRoleMode } from "@/interfaces/Authorization";
import { getPlotAccessRequests } from "@/services/plotAccessRequestService";

type Props = {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  propertyId?: number | null;
  onSuccess?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  form?: PropertyFormState;
  onFormChange?: <Field extends keyof PropertyFormState>(
    field: Field,
    value: PropertyFormState[Field]
  ) => void;
  onSubmit?: () => void;
  canSubmit?: boolean;
  isSubmitting?: boolean;
};

export default function PropertyFormDialog({
  title,
  isOpen,
  onClose,
  propertyId = null,
  onSuccess,
  submitLabel = "Concluir",
  cancelLabel = "Cancelar",
  form: controlledForm,
  onFormChange: controlledOnFormChange,
  onSubmit,
  canSubmit: controlledCanSubmit,
  isSubmitting: controlledIsSubmitting,
}: Props) {
  const queryClient = useQueryClient();
  const plotFormDisclosure = useDisclosure();
  const [editingPlot, setEditingPlot] = useState<PlotResponse | null>(null);

  // === Verificação de Permissões de Cargos ===
  const { user } = useUserStore();
  const roleMode = getAuthorizationRoleMode(user?.cargo);
  const isSupreme = roleMode === "SUPREME";
  const isOwner = roleMode === "OWNER";
  const isManager = roleMode === "MANAGER";
  const isResident = roleMode === "RESIDENT";
  const isConsultant = roleMode === "CONSULTANT";
  const isSecretary = roleMode === "SECRETARY";

  const isEdit = !!propertyId;

  // === Queries de Dados ===

  const { data: propertyData, isLoading: isLoadingProperty } = useQuery({
    queryKey: ["property", propertyId],
    queryFn: () => (propertyId ? getPropertyById(propertyId) : Promise.resolve(null)),
    enabled: isOpen && !!propertyId,
  });

  const { data: allPlots = [] } = useQuery({
    queryKey: ["plots", propertyId],
    queryFn: () => (propertyId ? getPlotsByProperty(propertyId) : Promise.resolve([])),
    enabled: !!propertyId && isOpen,
  });

  // Busca os pedidos de acesso APROVADOS deste utilizador (se ele for de um cargo restrito)
  const { data: approvedRequests = [], isLoading: isLoadingRequests } = useQuery({
    queryKey: ["approvedPlotRequests", propertyId],
    queryFn: () =>
      propertyId
        ? getPlotAccessRequests({ propertyId, status: "APPROVED" as any })
        : Promise.resolve([]),
    enabled: !!propertyId && isOpen && (isResident || isConsultant || isSecretary),
  });

  // === Lógica de Filtragem de Talhões ===
  const permittedPlots = useMemo(() => {
    // Dono e Gerente enxergam tudo
    if (isSupreme || isOwner || isManager) return allPlots;

    // Residente edita todos os talhões, DESDE QUE tenha um pedido aprovado
    if (isResident) {
      return approvedRequests.length > 0 ? allPlots : [];
    }

    // Consultor e Secretário só enxergam os talhões para os quais pediram e receberam permissão
    if (isConsultant || isSecretary) {
      const allowedPlotIds = approvedRequests.map((r: any) => r.plotId ?? r.id_talhao);
      return allPlots.filter((p) => allowedPlotIds.includes(p.id));
    }

    return [];
  }, [allPlots, approvedRequests, isSupreme, isOwner, isManager, isResident, isConsultant, isSecretary]);

  // Se for uma edição, garante o acesso caso o utilizador seja dono, gerente ou possua um pedido aprovado (mesmo sem talhões existentes).
  const hasApprovedAccess = isSupreme || isOwner || isManager || approvedRequests.length > 0;

  // === Controle de Formulário ===
  const [internalForm, setInternalForm] = useState<PropertyFormState>(DEFAULT_FORM_STATE);
  const form = controlledForm ?? internalForm;

  useEffect(() => {
    if (!isOpen) return;
    if (!propertyId) {
      if (!controlledForm) setInternalForm(DEFAULT_FORM_STATE);
      return;
    }
    if (propertyData && !controlledForm) {
      setInternalForm(propertyToFormState(propertyData));
    }
  }, [isOpen, propertyId, propertyData, controlledForm]);

  const internalCanSubmit = useMemo(() => {
    if (!form.nome?.trim() || !form.endereco?.trim() || !form.cnpj?.trim()) return false;
    if (
      Number.isNaN(parseFloat(form.latitudeDegrees)) ||
      Number.isNaN(parseFloat(form.latitudeMinutes)) ||
      Number.isNaN(parseFloat(form.latitudeSeconds)) ||
      Number.isNaN(parseFloat(form.longitudeDegrees)) ||
      Number.isNaN(parseFloat(form.longitudeMinutes)) ||
      Number.isNaN(parseFloat(form.longitudeSeconds))
    ) return false;
    return true;
  }, [form]);

  const canSubmitForm = controlledCanSubmit ?? internalCanSubmit;

  const onFormChange = <Field extends keyof PropertyFormState>(
    field: Field,
    value: PropertyFormState[Field]
  ) => {
    if (controlledOnFormChange) {
      controlledOnFormChange(field, value);
      return;
    }

    setInternalForm((prev) => ({ ...prev, [field]: value }));
  };

  // === Mutações ===
  const createPropertyMutation = useMutation({
    mutationFn: () => createProperty({
      nome: form.nome, endereco: form.endereco, cnpj: form.cnpj, idfoto: form.idfoto,
      localizacao: {
        latitude: dmsToDecimal(form.latitudeDegrees, form.latitudeMinutes, form.latitudeSeconds),
        latitudeDirection: form.latitudeDirection as any,
        longitude: dmsToDecimal(form.longitudeDegrees, form.longitudeMinutes, form.longitudeSeconds),
        longitudeDirection: form.longitudeDirection as any,
        altitude: Number(form.altitude || 0),
      }
    }),
    onSuccess: async () => {
      toaster.create({ title: "Propriedade criada!", type: "success" });
      onSuccess?.();
      onClose();
    },
  });

  const updatePropertyMutation = useMutation({
    mutationFn: () => updateProperty(propertyId!, {
      novo_nome: form.nome, novo_endereco: form.endereco, novo_cnpj: form.cnpj, novo_idfoto: form.idfoto,
      nova_localizacao: {
        latitude: dmsToDecimal(form.latitudeDegrees, form.latitudeMinutes, form.latitudeSeconds),
        latitudeDirection: form.latitudeDirection as any,
        longitude: dmsToDecimal(form.longitudeDegrees, form.longitudeMinutes, form.longitudeSeconds),
        longitudeDirection: form.longitudeDirection as any,
        altitude: Number(form.altitude || 0),
      }
    }),
    onSuccess: async () => {
      toaster.create({ title: "Propriedade atualizada!", type: "success" });
      await queryClient.invalidateQueries({ queryKey: ["property", propertyId] });
      onSuccess?.();
      onClose();
    },
  });

  const handleSubmit = () => {
    if (!canSubmitForm) {
      toaster.create({ title: "Preencha todos os campos obrigatórios.", type: "warning" });
      return;
    }
    if (onSubmit) {
      onSubmit();
      return;
    }
    if (isEdit) updatePropertyMutation.mutate();
    else createPropertyMutation.mutate();
  };

  const createPlotMutation = useMutation({
    mutationFn: (payload: PlotCreatePayload) => createPlot(propertyId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plots", propertyId] });
      plotFormDisclosure.onClose();
      toaster.create({ title: "Talhão criado com sucesso!", type: "success" });
    },
  });

  const updatePlotMutation = useMutation({
    mutationFn: (payload: { id: number; data: PlotUpdatePayload }) => updatePlot(payload.id, payload.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plots", propertyId] });
      plotFormDisclosure.onClose();
      toaster.create({ title: "Talhão atualizado com sucesso!", type: "success" });
    },
  });

  const deletePlotMutation = useMutation({
    mutationFn: (id: number) => deletePlot(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plots", propertyId] });
      toaster.create({ title: "Talhão removido com sucesso!", type: "success" });
    },
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
    if (editingPlot) {
      updatePlotMutation.mutate({
        id: editingPlot.id,
        data: {
          nova_identificacao: payload.identificacao,
          nova_area: payload.area,
          nova_classe_solo: payload.classe_solo,
          nova_textura_solo: payload.textura_solo,
          novo_ano_incorporacao_safra: payload.ano_incorporacao_safra,
          nova_area_irrigada: payload.area_irrigada,
          nova_declividade: payload.declividade,
          nova_pluviosidade_mensal: payload.pluviosidade_mensal,
          nova_pluviosidade_anual: payload.pluviosidade_anual,
          nova_latitude: payload.latitude,
          nova_latitudeDirection: payload.latitudeDirection,
          nova_longitude: payload.longitude,
          nova_longitudeDirection: payload.longitudeDirection,
          nova_altitude: payload.altitude,
          novo_idfoto: payload.idfoto,
        },
      });
    }
    else createPlotMutation.mutate(payload);
  };

  const isSubmitting = controlledIsSubmitting ?? (createPropertyMutation.isPending || updatePropertyMutation.isPending);

  return (
    <>
      <DialogContainer isOpen={isOpen} onClose={onClose} expandable={isEdit}>
        <Heading as="h2" size="md" mb={4}>
          {isSupreme || isOwner ? title : "Recursos da Propriedade"}
        </Heading>

        {/* Verifica se está a carregar dados da API */}
        {(isEdit && isLoadingProperty) || isLoadingRequests ? (
          <Flex justify="center" py={10}>
            <Spinner size="lg" />
          </Flex>
        ) : !hasApprovedAccess && isEdit ? (
          // Se não for dono/gerente e não tiver nenhuma permissão, mostra aviso
          <VStack py={8} gap={4}>
             <Text textAlign="center" color="red.500" fontWeight="bold">
               Acesso aos recursos negado.
             </Text>
             <Text textAlign="center" color="gray.600">
               Ainda não possui permissões aprovadas para editar os talhões desta propriedade. Aceda à secção de "Fazer solicitação" no painel principal ou aguarde a aprovação do gerente.
             </Text>
          </VStack>
        ) : (
          <VStack align="stretch" gap={6}>
            <PropertyFormFields 
              form={form} 
              onFormChange={onFormChange} 
              isReadOnly={!(isSupreme || isOwner)}
            />

            {!propertyId && (isSupreme || isOwner) && (
              <Box bg="blue.50" _dark={{ bg: "blue.900" }} p={3} borderRadius="md">
                <Text fontSize="sm" color="blue.600" _dark={{ color: "blue.200" }} textAlign="center">
                  Poderá adicionar talhões após criar a propriedade.
                </Text>
              </Box>
            )}

            <Separator />

            {propertyId && (
              <Box>
                <Flex justify="space-between" align="center" mb={2}>
                  <Heading as="h4" size="sm" color="gray.600">
                    Talhões Permitidos
                  </Heading>

                  {/* Somente proprietários e gerentes criam talhões novos */}
                  {(isSupreme || isOwner || isManager) && (
                    <Button size="xs" colorScheme="blue" onClick={handleAddPlot}>
                      <HStack gap={1}>
                        <FiPlus />
                        <Text>Adicionar Talhão</Text>
                      </HStack>
                    </Button>
                  )}
                </Flex>

                <PlotList
                  plots={permittedPlots}
                  mode="edit"
                  onEdit={handleEditPlot}
                  // Apenas donos e gerentes apagam talhões
                  onDelete={isSupreme || isOwner || isManager ? ((p) => deletePlotMutation.mutate(p.id)) : undefined}
                />
              </Box>
            )}
          </VStack>
        )}

        <Flex justify="flex-end" gap={3} mt={6}>
          <Button onClick={onClose} colorScheme={isSupreme || isOwner ? "red" : "gray"} variant="outline">
            {isSupreme || isOwner ? cancelLabel : "Fechar"}
          </Button>

          {(isSupreme || isOwner) && (
            <Button colorScheme="green" onClick={handleSubmit} loading={isSubmitting}>
              {submitLabel}
            </Button>
          )}
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
