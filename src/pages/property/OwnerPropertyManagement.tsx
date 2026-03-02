import { useMemo, useState } from "react";
import { Box, Button, Flex, Heading, Spinner, Text, useDisclosure } from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import UserLayout from "@/components/Layouts/UserLayout";
import FertName from "@/components/FertName/FertName";
import ConfigMenu from "@/components/ConfigMenu/ConfigMenu";

import { useUserStore } from "@/stores/user/user.store";
import { PropertyCreatePayload, PropertyUpdatePayload } from "@/interfaces/Property";
import { PropertyResponse } from "@/interfaces/Property";
import { Cargo } from "@/interfaces/User";
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
        const data = (error as any).response.data as { message?: string; error?: string };
        return data.message || data.error || "Ocorreu um erro desconhecido.";
    }
    return "Ocorreu um erro ao conectar com o servidor.";
};

export default function OwnerPropertyManagement() {
    const user = useUserStore((state) => state.user);
    const queryClient = useQueryClient();

    const createDisclosure = useDisclosure();
    const editDisclosure = useDisclosure();
    const deleteDisclosure = useDisclosure();
    const viewDisclosure = useDisclosure();

    const [activeProperty, setActiveProperty] = useState<PropertyResponse | null>(null);
    const [editingPropertyId, setEditingPropertyId] = useState<number | null>(null);
    const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);

    const [createForm, setCreateForm] = useState<PropertyFormState>(DEFAULT_FORM_STATE);
    const [editForm, setEditForm] = useState<PropertyFormState>(DEFAULT_FORM_STATE);

    // Queries
    const {
        data: properties = [],
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["my-properties", user?.id],
        queryFn: fetchMyProperties,
        enabled: !!user,
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: createProperty,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-properties"] });
            toaster.create({
                title: "Propriedade criada com sucesso!",
                type: "success",
                duration: 3000,
            });
            handleCloseCreate();
        },
        onError: (error) => {
            toaster.create({
                title: "Erro ao criar propriedade.",
                description: getErrorMessage(error),
                type: "error",
                duration: 5000,
                meta: { closable: true },
            });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: PropertyUpdatePayload }) =>
            updateProperty(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-properties"] });
            toaster.create({
                title: "Propriedade atualizada com sucesso!",
                type: "success",
                duration: 3000,
            });
            handleCloseEdit();
        },
        onError: (error) => {
            toaster.create({
                title: "Erro ao atualizar propriedade.",
                description: getErrorMessage(error),
                type: "error",
                duration: 5000,
                meta: { closable: true },
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteProperty,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-properties"] });
            toaster.create({
                title: "Propriedade removida com sucesso!",
                type: "success",
                duration: 3000,
            });
            handleCloseDelete();
        },
        onError: (error) => {
            toaster.create({
                title: "Erro ao remover propriedade.",
                description: getErrorMessage(error),
                type: "error",
                duration: 5000,
                meta: { closable: true },
            });
        },
    });

    // Handlers
    const handleSelectProperty = (property: PropertyResponse) => {
        if (selectedPropertyId === property.id) {
            setSelectedPropertyId(null);
            setActiveProperty(null);
        } else {
            setSelectedPropertyId(property.id);
            setActiveProperty(property);
        }
    };

    const handleOpenCreate = () => {
        setCreateForm(DEFAULT_FORM_STATE);
        createDisclosure.onOpen();
    };

    const handleCloseCreate = () => {
        createDisclosure.onClose();
        setCreateForm(DEFAULT_FORM_STATE);
    };

    const handleOpenView = (property: PropertyResponse) => {
        setActiveProperty(property);
        viewDisclosure.onOpen();
    };

    const handleCloseView = () => {
        viewDisclosure.onClose();
        setActiveProperty(null);
    };

    const handleOpenEdit = (property: PropertyResponse) => {
        setEditingPropertyId(property.id);
        setActiveProperty(property); // Importante para o contexto
        setEditForm(propertyToFormState(property));
        editDisclosure.onOpen();
    };

    const handleCloseEdit = () => {
        editDisclosure.onClose();
        setEditingPropertyId(null);
        setEditForm(DEFAULT_FORM_STATE);
    };

    const handleOpenDelete = (property: PropertyResponse) => {
        setActiveProperty(property);
        deleteDisclosure.onOpen();
    };

    const handleCloseDelete = () => {
        deleteDisclosure.onClose();
        setActiveProperty(null);
    };

    // Form Handlers
    const handleCreateFormChange = <Field extends keyof PropertyFormState>(
        field: Field,
        value: PropertyFormState[Field],
    ) => {
        setCreateForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleEditFormChange = <Field extends keyof PropertyFormState>(
        field: Field,
        value: PropertyFormState[Field],
    ) => {
        setEditForm((prev) => ({ ...prev, [field]: value }));
    };

    // Converters
    const formStateToCreatePayload = (form: PropertyFormState): PropertyCreatePayload => ({
        nome: form.nome,
        endereco: form.endereco,
        cnpj: form.cnpj,
        latitude: parseFloat(form.latitude),
        latitudeDirection: form.latitudeDirection,
        longitude: parseFloat(form.longitude),
        longitudeDirection: form.longitudeDirection,
        altitude: form.altitude ? parseFloat(form.altitude) : undefined,
    });

    const formStateToUpdatePayload = (form: PropertyFormState): PropertyUpdatePayload => ({
        novo_nome: form.nome,
        novo_endereco: form.endereco,
        novo_cnpj: form.cnpj,
        nova_latitude: parseFloat(form.latitude),
        nova_latitudeDirection: form.latitudeDirection,
        nova_longitude: parseFloat(form.longitude),
        nova_longitudeDirection: form.longitudeDirection,
        nova_altitude: form.altitude ? parseFloat(form.altitude) : undefined,
    });

    // Validations
    const validateForm = (form: PropertyFormState) => {
        const isNameValid = form.nome.trim().length > 0;
        const isAddressValid = form.endereco.trim().length > 0;
        const isCnpjValid = form.cnpj.trim().length === 14; // Validação simplificada
        const isLatValid = !isNaN(parseFloat(form.latitude));
        const isLngValid = !isNaN(parseFloat(form.longitude));

        return {
            isNameValid,
            isAddressValid,
            isCnpjValid,
            isLatValid,
            isLngValid,
            canSubmit: isNameValid && isAddressValid && isCnpjValid && isLatValid && isLngValid,
        };
    };

    const createFormValidations = useMemo(() => validateForm(createForm), [createForm]);
    const editFormValidations = useMemo(() => validateForm(editForm), [editForm]);

    if (!user || user.cargo !== Cargo.PROPRIETARIO) {
        return (
            <UserLayout>
                <Flex justify="center" align="center" h="50vh">
                    <Text color="red.500">Acesso restrito a proprietários.</Text>
                </Flex>
            </UserLayout>
        );
    }

    return (
        <UserLayout>
            <FertName subtitle="Gerenciamento de Propriedades" />
            <ConfigMenu />

            <Box pt={{ base: 24, md: 32 }} px={{ base: 4, md: 8 }} w="full" maxW="1600px" mx="auto">
                <Flex justify="space-between" align="center" mb={8}>
                    <Heading size="lg" color="gray.700" _dark={{ color: "gray.200" }}>
                        Minhas Propriedades
                    </Heading>
                    <Button colorScheme="green" onClick={handleOpenCreate} leftIcon={<FiPlus />}>
                        Nova Propriedade
                    </Button>
                </Flex>

                {isLoading ? (
                    <Flex justify="center" align="center" minH="200px">
                        <Spinner size="xl" color="green.500" />
                    </Flex>
                ) : isError ? (
                    <Flex justify="center" align="center" minH="200px" direction="column">
                        <Text color="red.500" mb={2}>Erro ao carregar propriedades.</Text>
                        <Text fontSize="sm" color="gray.500">{getErrorMessage(error)}</Text>
                    </Flex>
                ) : properties.length === 0 ? (
                    <Flex
                        justify="center"
                        align="center"
                        minH="200px"
                        borderWidth="2px"
                        borderStyle="dashed"
                        borderColor="gray.300"
                        borderRadius="lg"
                    >
                        <Text color="gray.500">Nenhuma propriedade cadastrada.</Text>
                    </Flex>
                ) : (
                    <PropertyList
                        properties={properties}
                        selectedPropertyId={selectedPropertyId}
                        onSelect={handleSelectProperty}
                        onView={handleOpenView}
                        onEdit={handleOpenEdit}
                        onDelete={handleOpenDelete}
                    />
                )}
            </Box>

            {/* Modal de Criação */}
            <PropertyFormDialog
                title="Criar Nova Propriedade"
                isOpen={createDisclosure.open}
                onClose={handleCloseCreate}
                onSubmit={() => createMutation.mutate(formStateToCreatePayload(createForm))}
                isSubmitting={createMutation.isPending}
                canSubmit={createFormValidations.canSubmit}
                form={createForm}
                onFormChange={handleCreateFormChange}
                submitLabel="Criar"
                // Na criação, não passamos propertyId, pois a propriedade ainda não existe.
                // Isso ocultará a seção de Talhões.
            />

            {/* Modal de Edição */}
            <PropertyFormDialog
                title="Editar Propriedade"
                isOpen={editDisclosure.open}
                onClose={handleCloseEdit}
                onSubmit={() => {
                    if (editingPropertyId === null) {
                        toaster.create({
                            title: "Não foi possível atualizar a propriedade.",
                            description: "Selecione uma propriedade válida e tente novamente.",
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
                // AQUI ESTÁ A MUDANÇA: Passamos o ID para habilitar a gestão de talhões
                propertyId={editingPropertyId ?? undefined}
            />

            {/* Modal de Visualização (Detalhes) */}
            <DialogContainer isOpen={viewDisclosure.open} onClose={handleCloseView}>
                {/* O componente PropertyDetails agora exibe a lista de talhões no modo leitura */}
                <PropertyDetails property={activeProperty} />
            </DialogContainer>

            {/* Modal de Exclusão */}
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