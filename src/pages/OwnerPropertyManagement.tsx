import { useMemo, useState } from "react";
import { Box, Button, Flex, Heading, Spinner, Text, useDisclosure } from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import UserLayout from "@/components/Layouts/UserLayout";
import FertName from "@/components/FertName/FertName";
import ConfigMenu from "@/components/ConfigMenu/ConfigMenu";
import { useUserStore } from "@/stores/user/user.store";
import { Cargo, PropertyCreatePayload, PropertyUpdatePayload } from "@/interfaces/ServicePayload";
import { PropertyResponse } from "@/interfaces/ServiceResponse";
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
    propertyToFormState,
} from "@/components/Property/types";

const getErrorMessage = (error: unknown) => {
    if (typeof error === "string") return error;
    if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        (error as any).response?.data
    ) {
        const data = (error as any).response.data as { message?: string } | string;
        if (typeof data === "string") return data;
        if (data?.message) return data.message;
    }
    if (error instanceof Error) return error.message;
    return "Ocorreu um erro inesperado.";
};

const formStateToPayload = (form: PropertyFormState): PropertyCreatePayload => ({
    nome: form.nome,
    endereco: form.endereco,
    cnpj: form.cnpj,
    localizacao: {
        latitude: Number(form.latitude),
        latitudeDirection: form.latitudeDirection,
        longitude: Number(form.longitude),
        longitudeDirection: form.longitudeDirection,
        altitude: Number(form.altitude),
    },
});

const formStateToUpdatePayload = (form: PropertyFormState): PropertyUpdatePayload => ({
    novo_nome: form.nome || undefined,
    novo_endereco: form.endereco || undefined,
    novo_cnpj: form.cnpj || undefined,
    nova_localizacao: {
        latitude: Number(form.latitude),
        latitudeDirection: form.latitudeDirection,
        longitude: Number(form.longitude),
        longitudeDirection: form.longitudeDirection,
        altitude: Number(form.altitude),
    },
});

const normalizeCargo = (cargo?: string) =>
    cargo
        ?.normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "")
        .toUpperCase();

export default function OwnerPropertyManagement() {
    const { user } = useUserStore();
    const queryClient = useQueryClient();

    const addDisclosure = useDisclosure();
    const viewDisclosure = useDisclosure();
    const editDisclosure = useDisclosure();
    const deleteDisclosure = useDisclosure();

    const handleCloseAdd = () => {
        setCreateForm(DEFAULT_FORM_STATE);
        addDisclosure.onClose();
    };

    const handleCloseView = () => {
        setActiveProperty(null);
        viewDisclosure.onClose();
    };

    const handleCloseEdit = () => {
        setActiveProperty(null);
        setEditingPropertyId(null);
        editDisclosure.onClose();
    };

    const handleCloseDelete = () => {
        setActiveProperty(null);
        deleteDisclosure.onClose();
    };

    const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
    const [activeProperty, setActiveProperty] = useState<PropertyResponse | null>(null);
    const [editingPropertyId, setEditingPropertyId] = useState<number | null>(null);
    const [createForm, setCreateForm] = useState<PropertyFormState>(DEFAULT_FORM_STATE);
    const [editForm, setEditForm] = useState<PropertyFormState>(DEFAULT_FORM_STATE);

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["myProperties"],
        queryFn: fetchMyProperties,
        enabled: !!user,
    });

    const createMutation = useMutation({
        mutationFn: createProperty,
        onSuccess: () => {
            toaster.create({
                title: "Propriedade criada com sucesso.",
                type: "success",
                duration: 4000,
            });
            handleCloseAdd();
            queryClient.invalidateQueries({ queryKey: ["myProperties"] });
        },
        onError: (error) => {
            toaster.create({
                title: "Erro ao criar propriedade.",
                description: getErrorMessage(error),
                type: "error",
                duration: 4000,
            });
        },
    });

    const updateMutation = useMutation({
        mutationFn: (variables: { id: number; payload: PropertyUpdatePayload }) =>
            updateProperty(variables.id, variables.payload),
        onSuccess: () => {
            toaster.create({
                title: "Propriedade atualizada com sucesso.",
                type: "success",
                duration: 4000,
            });
            handleCloseEdit();
            queryClient.invalidateQueries({ queryKey: ["myProperties"] });
        },
        onError: (error) => {
            toaster.create({
                title: "Erro ao atualizar propriedade.",
                description: getErrorMessage(error),
                type: "error",
                duration: 4000,
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteProperty,
        onSuccess: () => {
            toaster.create({
                title: "Propriedade deletada com sucesso.",
                type: "success",
                duration: 4000,
            });
            handleCloseDelete();
            queryClient.invalidateQueries({ queryKey: ["myProperties"] });
        },
        onError: (error) => {
            toaster.create({
                title: "Erro ao deletar propriedade.",
                description: getErrorMessage(error),
                type: "error",
                duration: 4000,
            });
        },
    });

    const properties = data ?? [];
    const isOwner = normalizeCargo(user?.cargo) === normalizeCargo(Cargo.PROPRIETARIO);

    const createFormValidations = useMemo(() => {
        const isLatitudeValid = !!createForm.latitude && !isNaN(Number(createForm.latitude));
        const isLongitudeValid = !!createForm.longitude && !isNaN(Number(createForm.longitude));

        return {
            canSubmit:
                !!createForm.nome &&
                !!createForm.endereco &&
                !!createForm.cnpj &&
                isLatitudeValid &&
                isLongitudeValid,
        };
    }, [createForm]);

    const editFormValidations = useMemo(() => {
        const isLatitudeValid = !!editForm.latitude && !isNaN(Number(editForm.latitude));
        const isLongitudeValid = !!editForm.longitude && !isNaN(Number(editForm.longitude));

        return {
            canSubmit:
                !!editForm.nome &&
                !!editForm.endereco &&
                !!editForm.cnpj &&
                isLatitudeValid &&
                isLongitudeValid,
        };
    }, [editForm]);

    const handlePropertySelection = (property: PropertyResponse) => {
        setSelectedPropertyId((prev) => (prev === property.id ? null : property.id));
    };

    const openViewModal = (property: PropertyResponse) => {
        setActiveProperty(property);
        viewDisclosure.onOpen();
    };

    const openEditModal = (property: PropertyResponse) => {
        const numericId =
            typeof property.id === "number" ? property.id : Number(property.id);

        if (Number.isNaN(numericId)) {
            toaster.create({
                title: "Não foi possível abrir a edição.",
                description: "Identificador da propriedade inválido.",
                type: "error",
                duration: 5000,
                meta: { closable: true },
            });
            return;
        }

        setActiveProperty(property);
        setEditingPropertyId(numericId);
        setEditForm(propertyToFormState(property));
        editDisclosure.onOpen();
    };

    const openDeleteModal = (property: PropertyResponse) => {
        setActiveProperty(property);
        deleteDisclosure.onOpen();
    };

    const handleCreateFormChange = <Field extends keyof PropertyFormState>(
        field: Field,
        value: PropertyFormState[Field],
    ) => {
        setCreateForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleEditFormChange = <Field extends keyof PropertyFormState>(
        field: Field,
        value: PropertyFormState[Field],
    ) => {
        setEditForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    if (!user) {
        return (
            <UserLayout>
                <FertName subtitle="Gerenciar Propriedades" />
                <ConfigMenu />
                <Flex justify="center" align="center" minH="calc(100vh - 200px)">
                    <Spinner size="xl" />
                </Flex>
            </UserLayout>
        );
    }

    if (!isOwner) {
        return (
            <UserLayout>
                <FertName subtitle="Gerenciar Propriedades" />
                <ConfigMenu />
                <Flex justify="center" align="center" minH="calc(100vh - 200px)">
                    <Box
                        p={8}
                        borderWidth="1px"
                        borderRadius="md"
                        boxShadow="md"
                        w={{ base: "100%", md: "60%", lg: "40%" }}
                        bg={{ base: "white", _dark: "gray.700" }}
                    >
                        <Heading as="h2" size="md" mb={4}>
                            Acesso restrito
                        </Heading>
                        <Text>
                            Apenas usuários com o cargo de Proprietário podem gerenciar propriedades.
                        </Text>
                    </Box>
                </Flex>
            </UserLayout>
        );
    }

    return (
        <UserLayout>
            <FertName subtitle="Gerenciar Propriedades" />
            <ConfigMenu />

            <Box pt={{ base: 16, md: 24 }} px={{ base: 4, md: 8 }} w="full">
                <Flex direction="column" gap={6}>
                    <Heading as="h1" size="lg" color="white">
                        Minhas Propriedades
                    </Heading>

                    <Button
                        alignSelf="flex-start"
                        colorScheme="green"
                        onClick={() => {
                            setCreateForm(DEFAULT_FORM_STATE);
                            addDisclosure.onOpen();
                        }}
                        display="inline-flex"
                        alignItems="center"
                        gap={2}
                    >
                        <FiPlus />
                        Adicionar Propriedade
                    </Button>

                    <Box mt={2}>
                        {isLoading ? (
                            <Flex justify="center" align="center" minH="200px">
                                <Spinner size="lg" />
                            </Flex>
                        ) : isError ? (
                            <Flex direction="column" align="center" gap={4} minH="200px">
                                <Text>Não foi possível carregar as propriedades.</Text>
                                <Button onClick={() => refetch()} colorScheme="blue">
                                    Tentar novamente
                                </Button>
                            </Flex>
                        ) : properties.length === 0 ? (
                            <Text mt={4}>Nenhuma propriedade encontrada.</Text>
                        ) : (
                            <PropertyList
                                properties={properties}
                                selectedPropertyId={selectedPropertyId}
                                onSelect={handlePropertySelection}
                                onView={openViewModal}
                                onEdit={openEditModal}
                                onDelete={openDeleteModal}
                            />
                        )}
                    </Box>
                </Flex>
            </Box>

            <PropertyFormDialog
                title="Adicionar Propriedade"
                isOpen={addDisclosure.open}
                onClose={handleCloseAdd}
                onSubmit={() => createMutation.mutate(formStateToPayload(createForm))}
                isSubmitting={createMutation.isPending}
                canSubmit={createFormValidations.canSubmit}
                form={createForm}
                onFormChange={handleCreateFormChange}
            />

            <DialogContainer isOpen={viewDisclosure.open} onClose={handleCloseView}>
                <PropertyDetails property={activeProperty} />
                <Flex justify="flex-end" mt={6}>
                    <Button onClick={handleCloseView}>Fechar</Button>
                </Flex>
            </DialogContainer>

            <PropertyFormDialog
                title="Editar Propriedade"
                isOpen={editDisclosure.open}
                onClose={handleCloseEdit}
                onSubmit={() => {
                    if (editingPropertyId === null) {
                        toaster.create({
                            title: "Não foi possível atualizar a propriedade.",
                            description:
                                "Selecione uma propriedade válida e tente novamente.",
                            type: "error",
                            duration: 5000,
                            meta: { closable: true },
                        });
                        return;
                    }

                    updateMutation.mutate({
                        id: editingPropertyId,
                        payload: formStateToUpdatePayload(editForm),
                    });
                }}
                isSubmitting={updateMutation.isPending}
                canSubmit={editFormValidations.canSubmit}
                form={editForm}
                onFormChange={handleEditFormChange}
            />

            <DeletePropertyDialog
                isOpen={deleteDisclosure.open}
                onClose={handleCloseDelete}
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
