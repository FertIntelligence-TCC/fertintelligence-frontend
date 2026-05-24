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

const emptyForm: PropertyFormState = {
  nome: "",
  endereco: "",
  cnpj: "",
  latitude: "",
  latitudeDirection: undefined as any,
  longitude: "",
  longitudeDirection: undefined as any,
  altitude: "",
  idfoto: "",
};

type Props = {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  propertyId?: number | null;
  onSuccess?: () => void;
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

  // === Verificação de Permissões de Cargos ===
  const { user } = useUserStore();
  const roleMode = getAuthorizationRoleMode(user?.cargo);
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
    if (isOwner || isManager) return allPlots;

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
  }, [allPlots, approvedRequests, isOwner, isManager, isResident, isConsultant, isSecretary]);

  // Se for uma edição, garante o acesso caso o utilizador seja dono, gerente ou possua um pedido aprovado (mesmo sem talhões existentes).
  const hasApprovedAccess = isOwner || isManager || approvedRequests.length > 0;

  // === Controle de Formulário ===
  const [form, setForm] = useState<PropertyFormState>(emptyForm);

  useEffect(() => {
    if (!isOpen) return;
    if (!propertyId) {
      setForm(emptyForm);
      return;
    }
    if (propertyData) {
      setForm({
        nome: propertyData.nome ?? "",
        endereco: propertyData.endereco ?? "",
        cnpj: propertyData.cnpj ?? "",
        latitude: String(propertyData.localizacao?.latitude ?? ""),
        latitudeDirection: (propertyData.localizacao?.latitudeDirection as any) ?? "",
        longitude: String(propertyData.localizacao?.longitude ?? ""),
        longitudeDirection: (propertyData.localizacao?.longitudeDirection as any) ?? "",
        altitude: String(propertyData.localizacao?.altitude ?? ""),
        idfoto: propertyData.idfoto ?? "",
      });
    }
  }, [isOpen, propertyId, propertyData]);

  const canSubmit = useMemo(() => {
    if (!form.nome?.trim() || !form.endereco?.trim() || !form.cnpj?.trim()) return false;
    return true;
  }, [form]);

  const onFormChange = <Field extends keyof PropertyFormState>(
    field: Field,
    value: PropertyFormState[Field]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // === Mutações ===
  const createPropertyMutation = useMutation({
    mutationFn: () => createProperty({
      nome: form.nome, endereco: form.endereco, cnpj: form.cnpj, idfoto: form.idfoto,
      localizacao: { latitude: Number(form.latitude), latitudeDirection: form.latitudeDirection as any, longitude: Number(form.longitude), longitudeDirection: form.longitudeDirection as any, altitude: Number(form.altitude || 0) }
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
      nova_localizacao: { latitude: Number(form.latitude), latitudeDirection: form.latitudeDirection as any, longitude: Number(form.longitude), longitudeDirection: form.longitudeDirection as any, altitude: Number(form.altitude || 0) }
    }),
    onSuccess: async () => {
      toaster.create({ title: "Propriedade atualizada!", type: "success" });
      await queryClient.invalidateQueries({ queryKey: ["property", propertyId] });
      onSuccess?.();
      onClose();
    },
  });

  const handleSubmit = () => {
    if (!canSubmit) {
      toaster.create({ title: "Preencha todos os campos obrigatórios.", type: "warning" });
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
          nova_latitude_direction: payload.latitude_direction,
          nova_longitude: payload.longitude,
          nova_longitude_direction: payload.longitude_direction,
          nova_altitude: payload.altitude,
          novo_idfoto: payload.idfoto,
        },
      });
    }
    else createPlotMutation.mutate(payload);
  };

  const isSubmitting = createPropertyMutation.isPending || updatePropertyMutation.isPending;

  return (
    <>
      <DialogContainer isOpen={isOpen} onClose={onClose}>
        <Heading as="h2" size="md" mb={4}>
          {isOwner ? title : "Recursos da Propriedade"}
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
              isReadOnly={!isOwner} 
            />

            {!propertyId && isOwner && (
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
                  {(isOwner || isManager) && (
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
                  onDelete={isOwner || isManager ? ((p) => deletePlotMutation.mutate(p.id)) : undefined}
                />
              </Box>
            )}
          </VStack>
        )}

        <Flex justify="flex-end" gap={3} mt={6}>
          <Button onClick={onClose} colorScheme={isOwner ? "red" : "gray"} variant="outline">
            {isOwner ? cancelLabel : "Fechar"}
          </Button>

          {isOwner && (
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
