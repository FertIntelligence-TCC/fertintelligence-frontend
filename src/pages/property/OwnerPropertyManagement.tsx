import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Spinner,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";
import { LuArrowLeft } from "react-icons/lu";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import UserLayout from "@/components/Layouts/UserLayout";
import FertName from "@/components/FertName/FertName";
import ConfigMenu from "@/components/ConfigMenu/ConfigMenu";

import { useUserStore } from "@/stores/user/user.store";
import {
  PropertyCreatePayload,
  PropertyUpdatePayload,
  PropertyResponse,
} from "@/interfaces/Property";
import { Cargo } from "@/interfaces/User";
import { isSupremeUserCargo } from "@/interfaces/Authorization";

import {
  createProperty,
  deleteProperty,
  fetchMyProperties,
  updateProperty,
} from "@/services/propertyService";

import { toaster } from "@/components/ui/toaster";
import PropertyFormDialog from "@/components/Property/PropertyFormDialog";
import PropertyList from "@/components/Property/PropertyList";
import PropertyDetails from "@/components/Property/PropertyDetails";
import DeletePropertyDialog from "@/components/Property/DeletePropertyDialog";
import DialogContainer from "@/components/Property/DialogContainer";

import {
  DEFAULT_FORM_STATE,
  PropertyFormState,
  dmsToDecimal,
  propertyToFormState,
} from "@/components/Property/types";

/* ======================================================
   Helpers
====================================================== */

const getErrorMessage = (error: unknown): string => {
  if (typeof error === "string") return error;

  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    (error as any).response?.data
  ) {
    const data = (error as any).response.data as {
      message?: string;
      error?: string;
    };

    return data.message || data.error || "Erro desconhecido.";
  }

  if (error instanceof Error) return error.message;

  return "Erro ao conectar com o servidor.";
};

const toNumber = (value: string) => {
  const parsed = parseFloat(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const isCnpjValid = (cnpj: string) => cnpj.replace(/\D/g, "").length === 14;

const isDmsValid = (degrees: string, minutes: string, seconds: string, maxDegrees: number) => {
  const parsedDegrees = parseFloat(degrees);
  const parsedMinutes = parseFloat(minutes);
  const parsedSeconds = parseFloat(seconds);

  return (
    !Number.isNaN(parsedDegrees) &&
    !Number.isNaN(parsedMinutes) &&
    !Number.isNaN(parsedSeconds) &&
    parsedDegrees >= 0 &&
    parsedDegrees <= maxDegrees &&
    parsedMinutes >= 0 &&
    parsedMinutes < 60 &&
    parsedSeconds >= 0 &&
    parsedSeconds < 60
  );
};

/* ======================================================
   Component
====================================================== */

export default function OwnerPropertyManagement() {
  const user = useUserStore((state) => state.user);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createDisclosure = useDisclosure();
  const editDisclosure = useDisclosure();
  const deleteDisclosure = useDisclosure();
  const viewDisclosure = useDisclosure();

  const [activeProperty, setActiveProperty] = useState<PropertyResponse | null>(
    null
  );
  const [editingPropertyId, setEditingPropertyId] = useState<number | null>(
    null
  );
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(
    null
  );

  const [createForm, setCreateForm] =
    useState<PropertyFormState>(DEFAULT_FORM_STATE);
  const [editForm, setEditForm] =
    useState<PropertyFormState>(DEFAULT_FORM_STATE);

  /* ======================================================
       Query
    ====================================================== */

  const {
    data: properties = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["my-properties"],
    queryFn: fetchMyProperties,
    enabled: !!user,
  });

  /* ======================================================
       Mutations
    ====================================================== */

  const invalidateProps = () =>
    queryClient.invalidateQueries({
      queryKey: ["my-properties"],
    });

  const createMutation = useMutation({
    mutationFn: createProperty,
    onSuccess: () => {
      invalidateProps();
      toaster.create({
        title: "Propriedade criada com sucesso!",
        type: "success",
      });
      createDisclosure.onClose();
      setCreateForm(DEFAULT_FORM_STATE);
    },
    onError: (err) =>
      toaster.create({
        title: "Erro ao criar propriedade.",
        description: getErrorMessage(err),
        type: "error",
      }),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: PropertyUpdatePayload;
    }) => updateProperty(id, payload),
    onSuccess: () => {
      invalidateProps();
      toaster.create({
        title: "Propriedade atualizada!",
        type: "success",
      });
      editDisclosure.onClose();
      setEditingPropertyId(null);
      setEditForm(DEFAULT_FORM_STATE);
    },
    onError: (err) =>
      toaster.create({
        title: "Erro ao atualizar propriedade.",
        description: getErrorMessage(err),
        type: "error",
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProperty,
    onSuccess: () => {
      invalidateProps();
      toaster.create({
        title: "Propriedade removida!",
        type: "success",
      });
      deleteDisclosure.onClose();
      setActiveProperty(null);
    },
    onError: (err) =>
      toaster.create({
        title: "Erro ao remover.",
        description: getErrorMessage(err),
        type: "error",
      }),
  });

  /* ======================================================
       Validation
    ====================================================== */

  const validateForm = (form: PropertyFormState) => {
    return (
      form.nome.trim().length > 0 &&
      form.endereco.trim().length > 0 &&
      isCnpjValid(form.cnpj) &&
      isDmsValid(form.latitudeDegrees, form.latitudeMinutes, form.latitudeSeconds, 90) &&
      isDmsValid(form.longitudeDegrees, form.longitudeMinutes, form.longitudeSeconds, 180)
    );
  };

  const createValid = useMemo(() => validateForm(createForm), [createForm]);
  const editValid = useMemo(() => validateForm(editForm), [editForm]);

  /* ======================================================
       Guard
    ====================================================== */

  if (!user || (user.cargo !== Cargo.PROPRIETARIO && !isSupremeUserCargo(user.cargo))) {
    return (
      <UserLayout>
        <Flex justify="center" align="center" h="50vh">
          <Text color="red.500">Acesso restrito.</Text>
        </Flex>
      </UserLayout>
    );
  }

  /* ======================================================
       Converters
    ====================================================== */

  const toCreatePayload = (form: PropertyFormState): PropertyCreatePayload => ({
    nome: form.nome.trim(),
    endereco: form.endereco.trim(),
    cnpj: form.cnpj.replace(/\D/g, ""),
    localizacao: {
      latitude: dmsToDecimal(form.latitudeDegrees, form.latitudeMinutes, form.latitudeSeconds),
      latitudeDirection: form.latitudeDirection,
      longitude: dmsToDecimal(form.longitudeDegrees, form.longitudeMinutes, form.longitudeSeconds),
      longitudeDirection: form.longitudeDirection,
      altitude: form.altitude ? toNumber(form.altitude) : 0,
    },
  });

  const toUpdatePayload = (form: PropertyFormState): PropertyUpdatePayload => ({
    novo_nome: form.nome.trim(),
    novo_endereco: form.endereco.trim(),
    novo_cnpj: form.cnpj.replace(/\D/g, ""),
    nova_localizacao: {
      latitude: dmsToDecimal(form.latitudeDegrees, form.latitudeMinutes, form.latitudeSeconds),
      latitudeDirection: form.latitudeDirection,
      longitude: dmsToDecimal(form.longitudeDegrees, form.longitudeMinutes, form.longitudeSeconds),
      longitudeDirection: form.longitudeDirection,
      altitude: form.altitude ? toNumber(form.altitude) : 0,
    },
  });

  /* ======================================================
       Render
    ====================================================== */

  return (
    <UserLayout>
      <FertName subtitle="Gerenciamento de Propriedades" />
      <ConfigMenu />

      <Box pt={32} px={8} maxW="1600px" mx="auto">
        <Flex justify="space-between" mb={8} gap={4} flexWrap="wrap">
          <Flex gap={3} align="center" wrap="wrap">
            <Button variant="outline" onClick={() => navigate("/fertintelligence/home")}>
              <LuArrowLeft /> Voltar para o painel
            </Button>
            <Heading size="lg">Minhas Propriedades</Heading>
          </Flex>

          <HStack gap={3} flexWrap="wrap">
            <Button
              colorScheme="green"
              onClick={() => {
                setCreateForm(DEFAULT_FORM_STATE);
                createDisclosure.onOpen();
              }}
            >
              <FiPlus />
              Nova Propriedade
            </Button>
          </HStack>
        </Flex>

        {isLoading ? (
          <Spinner size="xl" />
        ) : isError ? (
          <Text color="red.500">{getErrorMessage(error)}</Text>
        ) : (
          <PropertyList
            properties={properties}
            selectedPropertyId={selectedPropertyId}
            onSelect={(p) => {
              setSelectedPropertyId(p.id);
              setActiveProperty(p);
            }}
            onView={(p) => {
              setActiveProperty(p);
              viewDisclosure.onOpen();
            }}
            onEdit={(p) => {
              setEditingPropertyId(p.id);
              setEditForm(propertyToFormState(p));
              editDisclosure.onOpen();
            }}
            onDelete={(p) => {
              setActiveProperty(p);
              deleteDisclosure.onOpen();
            }}
          />
        )}
      </Box>

      {/* CREATE */}
      <PropertyFormDialog
        title="Criar Propriedade"
        isOpen={createDisclosure.open}
        onClose={createDisclosure.onClose}
        onSubmit={() => createMutation.mutate({ ...toCreatePayload(createForm) })}
        isSubmitting={createMutation.isPending}
        canSubmit={createValid}
        form={createForm}
        onFormChange={(f, v) =>
          setCreateForm((prev) => ({
            ...prev,
            [f]: v,
          }))
        }
      />

      {/* EDIT */}
      <PropertyFormDialog
        title="Editar Propriedade"
        isOpen={editDisclosure.open}
        onClose={editDisclosure.onClose}
        onSubmit={() => {
          if (!editingPropertyId) return;

          updateMutation.mutate({
            id: editingPropertyId,
            payload: toUpdatePayload(editForm),
          });
        }}
        isSubmitting={updateMutation.isPending}
        canSubmit={editValid}
        form={editForm}
        propertyId={editingPropertyId ?? undefined}
        onFormChange={(f, v) =>
          setEditForm((prev) => ({
            ...prev,
            [f]: v,
          }))
        }
      />

      {/* VIEW */}
      <DialogContainer
        isOpen={viewDisclosure.open}
        onClose={viewDisclosure.onClose}
        expandable
      >
        <PropertyDetails property={activeProperty} />
      </DialogContainer>

      {/* DELETE */}
      <DeletePropertyDialog
        isOpen={deleteDisclosure.open}
        onClose={deleteDisclosure.onClose}
        onConfirm={() => {
          if (activeProperty) {
            deleteMutation.mutate(activeProperty.id);
          }
        }}
        isDeleting={deleteMutation.isPending}
      />
    </UserLayout>
  );
}
