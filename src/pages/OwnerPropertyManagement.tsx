import { type ChangeEvent, type ReactNode, useMemo, useState } from "react";
import {
    Box,
    Button,
    Flex,
    Heading,
    HStack,
    IconButton,
    Input,
    SimpleGrid,
    Spinner,
    Text,
    chakra,
    useDisclosure,
    VStack,
} from "@chakra-ui/react";
import { FiEdit, FiEye, FiPlus, FiTrash } from "react-icons/fi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import UserLayout from "@/components/Layouts/UserLayout";
import FertName from "@/components/FertName/FertName";
import ConfigMenu from "@/components/ConfigMenu/ConfigMenu";
import { useUserStore } from "@/stores/user/user.store";
import {
    Cargo,
    LatitudeDirection,
    LongitudeDirection,
    PropertyCreatePayload,
    PropertyUpdatePayload,
} from "@/interfaces/ServicePayload";
import { PropertyResponse } from "@/interfaces/ServiceResponse";
import {
    createProperty,
    deleteProperty,
    fetchMyProperties,
    updateProperty,
} from "@/services/propertyService";
import { toaster } from "@/components/ui/toaster";

const DIRECTION_LABEL: Record<LatitudeDirection | LongitudeDirection, string> = {
    [LatitudeDirection.NORTE]: "Norte",
    [LatitudeDirection.SUL]: "Sul",
    [LongitudeDirection.LESTE]: "Leste",
    [LongitudeDirection.OESTE]: "Oeste",
};

type PropertyFormState = {
    nome: string;
    endereco: string;
    cnpj: string;
    latitude: string;
    latitudeDirection: LatitudeDirection;
    longitude: string;
    longitudeDirection: LongitudeDirection;
    altitude: string;
};

const DEFAULT_FORM_STATE: PropertyFormState = {
    nome: "",
    endereco: "",
    cnpj: "",
    latitude: "",
    latitudeDirection: LatitudeDirection.NORTE,
    longitude: "",
    longitudeDirection: LongitudeDirection.LESTE,
    altitude: "",
};

type DialogContainerProps = {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
};

const DialogContainer = ({ isOpen, onClose, children }: DialogContainerProps) => {
    if (!isOpen) {
        return null;
    }

    return (
        <Flex
            position="fixed"
            inset={0}
            bg="blackAlpha.600"
            zIndex={1000}
            justify="center"
            align="center"
            p={4}
            onClick={onClose}
        >
            <Box
                w="full"
                maxW="lg"
                bg={{ base: "white", _dark: "gray.800" }}
                borderRadius="lg"
                boxShadow="2xl"
                p={6}
                onClick={(event) => event.stopPropagation()}
            >
                {children}
            </Box>
        </Flex>
    );
};

type FieldProps = {
    label: string;
    isRequired?: boolean;
    children: ReactNode;
};

const Field = ({ label, isRequired, children }: FieldProps) => (
    <Box>
        <Text fontWeight="semibold" mb={1}>
            {label}
            {isRequired && (
                <Text as="span" color="red.500" ml={1}>
                    *
                </Text>
            )}
        </Text>
        {children}
    </Box>
);

const SelectElement = chakra("select");

const formatCoordinate = (
    value?: number | null,
    direction?: LatitudeDirection | LongitudeDirection,
) => {
    if (value === undefined || value === null || direction === undefined) {
        return "-";
    }

    const directionLabel = DIRECTION_LABEL[direction] ?? direction;
    return `${value}° ${directionLabel}`;
};

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

const formStateToPayload = (
    form: PropertyFormState,
): PropertyCreatePayload => ({
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

const formStateToUpdatePayload = (
    form: PropertyFormState,
): PropertyUpdatePayload => ({
    nome: form.nome || undefined,
    endereco: form.endereco || undefined,
    cnpj: form.cnpj || undefined,
    localizacao: {
        latitude: Number(form.latitude),
        latitudeDirection: form.latitudeDirection,
        longitude: Number(form.longitude),
        longitudeDirection: form.longitudeDirection,
        altitude: Number(form.altitude),
    },
});

const propertyToFormState = (property: PropertyResponse): PropertyFormState => ({
    nome: property.nome ?? "",
    endereco: property.endereco ?? "",
    cnpj: property.cnpj ?? "",
    latitude:
        property.localizacao?.latitude !== undefined
            ? String(property.localizacao.latitude)
            : "",
    latitudeDirection:
        property.localizacao?.latitudeDirection ?? LatitudeDirection.NORTE,
    longitude:
        property.localizacao?.longitude !== undefined
            ? String(property.localizacao.longitude)
            : "",
    longitudeDirection:
        property.localizacao?.longitudeDirection ?? LongitudeDirection.LESTE,
    altitude:
        property.localizacao?.altitude !== undefined &&
            property.localizacao?.altitude !== null
            ? String(property.localizacao.altitude)
            : "",
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

    const commonFieldStyles = {
        bg: "white",
        borderColor: "gray.300",
        borderWidth: "1px",
        borderRadius: "md",
        _hover: { borderColor: "gray.400" },
        _focus: {
            borderColor: "green.500",
            boxShadow: "0 0 0 1px var(--chakra-colors-green-500)",
        },
        _dark: {
            bg: "gray.900",
            borderColor: "gray.600",
            _hover: { borderColor: "gray.500" },
            _focus: {
                borderColor: "green.300",
                boxShadow: "0 0 0 1px var(--chakra-colors-green-300)",
            },
        },
    } as const;
    const selectFieldStyles = {
        ...commonFieldStyles,
        px: 3,
        py: 2,
        cursor: "pointer",
    } as const;

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
        editDisclosure.onClose();
    };

    const handleCloseDelete = () => {
        setActiveProperty(null);
        deleteDisclosure.onClose();
    };

    const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(
        null,
    );
    const [activeProperty, setActiveProperty] = useState<PropertyResponse | null>(
        null,
    );
    const [createForm, setCreateForm] = useState<PropertyFormState>(
        DEFAULT_FORM_STATE,
    );
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
                duration: 5000,
                meta: { closable: true },
            });
        },
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
                duration: 5000,
                meta: { closable: true },
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteProperty,
        onSuccess: () => {
            toaster.create({
                title: "Propriedade deletada.",
                type: "success",
                duration: 4000,
            });
            handleCloseDelete();
            setSelectedPropertyId(null);
            queryClient.invalidateQueries({ queryKey: ["myProperties"] });
        },
        onError: (error) => {
            toaster.create({
                title: "Erro ao deletar propriedade.",
                description: getErrorMessage(error),
                type: "error",
                duration: 5000,
                meta: { closable: true },
            });
        },
    });

    const properties = data ?? [];

    const isOwner = normalizeCargo(user?.cargo) === Cargo.PROPRIETARIO;

    const createFormValidations = useMemo(() => {
        const latitudeValue = Number(createForm.latitude);
        const longitudeValue = Number(createForm.longitude);
        const isLatitudeValid =
            createForm.latitude !== "" &&
            !Number.isNaN(latitudeValue) &&
            latitudeValue >= 0 &&
            latitudeValue <= 90;
        const isLongitudeValid =
            createForm.longitude !== "" &&
            !Number.isNaN(longitudeValue) &&
            longitudeValue >= 0 &&
            longitudeValue <= 180;

        return {
            isLatitudeValid,
            isLongitudeValid,
            canSubmit:
                !!createForm.nome &&
                !!createForm.endereco &&
                !!createForm.cnpj &&
                isLatitudeValid &&
                isLongitudeValid,
        };
    }, [createForm]);

    const editFormValidations = useMemo(() => {
        const latitudeValue = Number(editForm.latitude);
        const longitudeValue = Number(editForm.longitude);
        const isLatitudeValid =
            editForm.latitude !== "" &&
            !Number.isNaN(latitudeValue) &&
            latitudeValue >= 0 &&
            latitudeValue <= 90;
        const isLongitudeValid =
            editForm.longitude !== "" &&
            !Number.isNaN(longitudeValue) &&
            longitudeValue >= 0 &&
            longitudeValue <= 180;

        return {
            isLatitudeValid,
            isLongitudeValid,
            canSubmit:
                !!editForm.nome &&
                !!editForm.endereco &&
                !!editForm.cnpj &&
                isLatitudeValid &&
                isLongitudeValid,
        };
    }, [editForm]);

    const handlePropertySelection = (property: PropertyResponse) => {
        setSelectedPropertyId((prev) =>
            prev === property.id ? null : property.id,
        );
    };

    const openViewModal = (property: PropertyResponse) => {
        setActiveProperty(property);
        viewDisclosure.onOpen();
    };

    const openEditModal = (property: PropertyResponse) => {
        setActiveProperty(property);
        setEditForm(propertyToFormState(property));
        editDisclosure.onOpen();
    };

    const openDeleteModal = (property: PropertyResponse) => {
        setActiveProperty(property);
        deleteDisclosure.onOpen();
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

            <Box
                pt={{ base: 24, md: 28 }}
                maxW="6xl"
                mx="auto"
                w="full"
            >
                <Flex direction="column" gap={10}>
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
                        <Text>Nenhuma propriedade encontrada.</Text>
                    ) : (
                        <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
                            {properties.map((property) => {
                                const isSelected = selectedPropertyId === property.id;
                                return (
                                    <Box
                                        key={property.id}
                                        borderWidth="1px"
                                        borderRadius="md"
                                        boxShadow="md"
                                        bg={{ base: "white", _dark: "gray.700" }}
                                        p={4}
                                    >
                                        <Button
                                            width="100%"
                                            justifyContent="flex-start"
                                            onClick={() => handlePropertySelection(property)}
                                        >
                                            {property.nome}
                                        </Button>

                                        {isSelected && (
                                            <HStack justify="flex-end" gap={3} mt={4}>
                                                <IconButton
                                                    aria-label="Visualizar propriedade"
                                                    borderRadius="full"
                                                    onClick={() => openViewModal(property)}
                                                >
                                                    <FiEye />
                                                </IconButton>
                                                <IconButton
                                                    aria-label="Editar propriedade"
                                                    borderRadius="full"
                                                    onClick={() => openEditModal(property)}
                                                >
                                                    <FiEdit />
                                                </IconButton>
                                                <IconButton
                                                    aria-label="Deletar propriedade"
                                                    borderRadius="full"
                                                    colorScheme="red"
                                                    onClick={() => openDeleteModal(property)}
                                                >
                                                    <FiTrash />
                                                </IconButton>
                                            </HStack>
                                        )}
                                    </Box>
                                );
                            })}
                        </SimpleGrid>
                    )}
                </Flex>
            </Box>

            {/* Diálogos */}
            <DialogContainer isOpen={addDisclosure.open} onClose={handleCloseAdd}>
                <Heading as="h2" size="md" mb={4}>
                    Adicionar Propriedade
                </Heading>
                <VStack gap={4} align="stretch">
                    <Field label="Nome da Propriedade" isRequired>
                        <Input
                            variant="outline"
                            {...commonFieldStyles}
                            value={createForm.nome}
                            onChange={(event) =>
                                setCreateForm((prev) => ({
                                    ...prev,
                                    nome: event.target.value,
                                }))
                            }
                        />
                    </Field>
                    <Field label="Endereço" isRequired>
                        <Input
                            variant="outline"
                            {...commonFieldStyles}
                            placeholder="ex: Rodovia PB 031, KM 25, Município Sapé, CEP: XXXXX-XXX"
                            value={createForm.endereco}
                            onChange={(event) =>
                                setCreateForm((prev) => ({
                                    ...prev,
                                    endereco: event.target.value,
                                }))
                            }
                        />
                    </Field>
                    <Field label="CNPJ" isRequired>
                        <Input
                            variant="outline"
                            {...commonFieldStyles}
                            placeholder="XX.XXX.XXX/0001-XX"
                            value={createForm.cnpj}
                            onChange={(event) =>
                                setCreateForm((prev) => ({
                                    ...prev,
                                    cnpj: event.target.value,
                                }))
                            }
                        />
                    </Field>
                    <Heading as="h3" size="sm">
                        Localização geográfica da sede
                    </Heading>
                    <HStack align="start" gap={4}>
                        <Field label="Latitude" isRequired>
                            <Input
                                type="number"
                                min={0}
                                max={90}
                                variant="outline"
                                {...commonFieldStyles}
                                value={createForm.latitude}
                                onChange={(event) =>
                                    setCreateForm((prev) => ({
                                        ...prev,
                                        latitude: event.target.value,
                                    }))
                                }
                            />
                        </Field>
                        <Field label="Direção" isRequired>
                            <SelectElement
                                value={createForm.latitudeDirection}
                                onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                                    setCreateForm((prev) => ({
                                        ...prev,
                                        latitudeDirection:
                                            event.target.value as LatitudeDirection,
                                    }))
                                }
                                {...selectFieldStyles}
                            >
                                <option value={LatitudeDirection.NORTE}>Norte</option>
                                <option value={LatitudeDirection.SUL}>Sul</option>
                            </SelectElement>
                        </Field>
                    </HStack>
                    <HStack align="start" gap={4}>
                        <Field label="Longitude" isRequired>
                            <Input
                                type="number"
                                min={0}
                                max={180}
                                variant="outline"
                                {...commonFieldStyles}
                                value={createForm.longitude}
                                onChange={(event) =>
                                    setCreateForm((prev) => ({
                                        ...prev,
                                        longitude: event.target.value,
                                    }))
                                }
                            />
                        </Field>
                        <Field label="Direção" isRequired>
                            <SelectElement
                                value={createForm.longitudeDirection}
                                onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                                    setCreateForm((prev) => ({
                                        ...prev,
                                        longitudeDirection:
                                            event.target.value as LongitudeDirection,
                                    }))
                                }
                                {...selectFieldStyles}
                            >
                                <option value={LongitudeDirection.LESTE}>Leste</option>
                                <option value={LongitudeDirection.OESTE}>Oeste</option>
                            </SelectElement>
                        </Field>
                    </HStack>
                    <Field label="Altitude">
                        <Input
                            type="number"
                            variant="outline"
                            {...commonFieldStyles}
                            value={createForm.altitude}
                            onChange={(event) =>
                                setCreateForm((prev) => ({
                                    ...prev,
                                    altitude: event.target.value,
                                }))
                            }
                        />
                    </Field>
                </VStack>
                <Flex justify="flex-end" gap={3} mt={6}>
                    <Button onClick={handleCloseAdd} colorScheme="red" variant="outline">
                        Cancelar
                    </Button>
                    <Button
                        colorScheme="green"
                        onClick={() => createMutation.mutate(formStateToPayload(createForm))}
                        loading={createMutation.isPending}
                        disabled={!createFormValidations.canSubmit}
                    >
                        Concluir
                    </Button>
                </Flex>
            </DialogContainer>

            <DialogContainer isOpen={viewDisclosure.open} onClose={handleCloseView}>
                <Heading as="h2" size="md" mb={4}>
                    Detalhes da Propriedade
                </Heading>
                {activeProperty ? (
                    <VStack align="start" gap={3}>
                        <Text>
                            <Text as="span" fontWeight="bold">
                                Nome:
                            </Text>{" "}
                            {activeProperty.nome}
                        </Text>
                        <Text>
                            <Text as="span" fontWeight="bold">
                                Endereço:
                            </Text>{" "}
                            {activeProperty.endereco}
                        </Text>
                        <Text>
                            <Text as="span" fontWeight="bold">
                                CNPJ:
                            </Text>{" "}
                            {activeProperty.cnpj}
                        </Text>
                        <Text>
                            <Text as="span" fontWeight="bold">
                                Latitude:
                            </Text>{" "}
                            {formatCoordinate(
                                activeProperty.localizacao?.latitude,
                                activeProperty.localizacao?.latitudeDirection,
                            )}
                        </Text>
                        <Text>
                            <Text as="span" fontWeight="bold">
                                Longitude:
                            </Text>{" "}
                            {formatCoordinate(
                                activeProperty.localizacao?.longitude,
                                activeProperty.localizacao?.longitudeDirection,
                            )}
                        </Text>
                        <Text>
                            <Text as="span" fontWeight="bold">
                                Altitude:
                            </Text>{" "}
                            {activeProperty.localizacao?.altitude ?? "-"}
                        </Text>
                    </VStack>
                ) : (
                    <Text>Selecione uma propriedade para visualizar.</Text>
                )}
                <Flex justify="flex-end" mt={6}>
                    <Button onClick={handleCloseView}>Fechar</Button>
                </Flex>
            </DialogContainer>

            <DialogContainer isOpen={editDisclosure.open} onClose={handleCloseEdit}>
                <Heading as="h2" size="md" mb={4}>
                    Editar Propriedade
                </Heading>
                <VStack gap={4} align="stretch">
                    <Field label="Nome da Propriedade" isRequired>
                        <Input
                            variant="outline"
                            {...commonFieldStyles}
                            value={editForm.nome}
                            onChange={(event) =>
                                setEditForm((prev) => ({
                                    ...prev,
                                    nome: event.target.value,
                                }))
                            }
                        />
                    </Field>
                    <Field label="Endereço" isRequired>
                        <Input
                            variant="outline"
                            {...commonFieldStyles}
                            placeholder="ex: Rodovia PB 031, KM 25, Minicípio Sapé, CEP: XXXXX-XXX"
                            value={editForm.endereco}
                            onChange={(event) =>
                                setEditForm((prev) => ({
                                    ...prev,
                                    endereco: event.target.value,
                                }))
                            }
                        />
                    </Field>
                    <Field label="CNPJ" isRequired>
                        <Input
                            variant="outline"
                            {...commonFieldStyles}
                            placeholder="XX.XXX.XXX/0001-XX"
                            value={editForm.cnpj}
                            onChange={(event) =>
                                setEditForm((prev) => ({
                                    ...prev,
                                    cnpj: event.target.value,
                                }))
                            }
                        />
                    </Field>
                    <Heading as="h3" size="sm">
                        Localização geográfica da sede
                    </Heading>
                    <HStack align="start" gap={4}>
                        <Field label="Latitude" isRequired>
                            <Input
                                type="number"
                                min={0}
                                max={90}
                                variant="outline"
                                {...commonFieldStyles}
                                value={editForm.latitude}
                                onChange={(event) =>
                                    setEditForm((prev) => ({
                                        ...prev,
                                        latitude: event.target.value,
                                    }))
                                }
                            />
                        </Field>
                        <Field label="Direção" isRequired>
                            <SelectElement
                                value={editForm.latitudeDirection}
                                onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                                    setEditForm((prev) => ({
                                        ...prev,
                                        latitudeDirection:
                                            event.target.value as LatitudeDirection,
                                    }))
                                }
                                {...selectFieldStyles}
                            >
                                <option value={LatitudeDirection.NORTE}>Norte</option>
                                <option value={LatitudeDirection.SUL}>Sul</option>
                            </SelectElement>
                        </Field>
                    </HStack>
                    <HStack align="start" gap={4}>
                        <Field label="Longitude" isRequired>
                            <Input
                                type="number"
                                min={0}
                                max={180}
                                variant="outline"
                                {...commonFieldStyles}
                                value={editForm.longitude}
                                onChange={(event) =>
                                    setEditForm((prev) => ({
                                        ...prev,
                                        longitude: event.target.value,
                                    }))
                                }
                            />
                        </Field>
                        <Field label="Direção" isRequired>
                            <SelectElement
                                value={editForm.longitudeDirection}
                                onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                                    setEditForm((prev) => ({
                                        ...prev,
                                        longitudeDirection:
                                            event.target.value as LongitudeDirection,
                                    }))
                                }
                                {...selectFieldStyles}
                            >
                                <option value={LongitudeDirection.LESTE}>Leste</option>
                                <option value={LongitudeDirection.OESTE}>Oeste</option>
                            </SelectElement>
                        </Field>
                    </HStack>
                    <Field label="Altitude">
                        <Input
                            type="number"
                            variant="outline"
                            {...commonFieldStyles}
                            value={editForm.altitude}
                            onChange={(event) =>
                                setEditForm((prev) => ({
                                    ...prev,
                                    altitude: event.target.value,
                                }))
                            }
                        />
                    </Field>
                </VStack>
                <Flex justify="flex-end" gap={3} mt={6}>
                    <Button onClick={handleCloseEdit} colorScheme="red" variant="outline">
                        Cancelar
                    </Button>
                    <Button
                        colorScheme="green"
                        onClick={() => {
                            if (activeProperty) {
                                updateMutation.mutate({
                                    id: activeProperty.id,
                                    payload: formStateToUpdatePayload(editForm),
                                });
                            }
                        }}
                        loading={updateMutation.isPending}
                        disabled={!editFormValidations.canSubmit}
                    >
                        Concluir
                    </Button>
                </Flex>
            </DialogContainer>

            <DialogContainer isOpen={deleteDisclosure.open} onClose={handleCloseDelete}>
                <Heading as="h2" size="md" mb={4}>
                    Quer deletar essa propriedade?
                </Heading>
                <Text>
                    Essa ação não poderá ser desfeita. Deseja continuar?
                </Text>
                <Flex justify="flex-end" gap={3} mt={6}>
                    <Button onClick={handleCloseDelete} colorScheme="green" variant="outline">
                        Não
                    </Button>
                    <Button
                        colorScheme="red"
                        onClick={() => {
                            if (activeProperty) {
                                deleteMutation.mutate(activeProperty.id);
                            }
                        }}
                        loading={deleteMutation.isPending}
                    >
                        Sim
                    </Button>
                </Flex>
            </DialogContainer>
        </UserLayout>
    );
}