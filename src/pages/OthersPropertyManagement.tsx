import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Separator,
  Flex,
  Heading,
  IconButton,
  Input,
  InputGroup,
  Spinner,
  Text,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import { FiPlus, FiSearch } from "react-icons/fi";
import { Navigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";

import UserLayout from "@/components/Layouts/UserLayout";
import FertName from "@/components/FertName/FertName";
import ConfigMenu from "@/components/ConfigMenu/ConfigMenu";

import { useUserStore } from "@/stores/user/user.store";
import { Cargo } from "@/interfaces/ServicePayload";
import { PropertyResponse } from "@/interfaces/ServiceResponse";
import { fetchMyProperties } from "@/services/propertyService";

import { toaster } from "@/components/ui/toaster";
import DialogContainer from "@/components/Property/DialogContainer";
import PropertyDetails from "@/components/Property/PropertyDetails";
import PropertyList from "@/components/Property/PropertyList";

import api from "@/services/axios";

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

const normalizeCargo = (cargo?: string) =>
  cargo
    ?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "")
    .toUpperCase();

const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

/**
 * Rotas reais (do seu listed_routes.txt):
 * - GET  /property/search
 * - POST /property-access/request
 */
const searchPropertiesByName = async (
  name: string
): Promise<PropertyResponse[]> => {
  const hasName = name.trim().length > 0;

  const { data } = await api.get<PropertyResponse[]>("/property/search", {
    // Se o backend aceitar, sem params tende a retornar "todas".
    // Se não aceitar, a mutation faz try/catch no fallback.
    params: hasName ? { nome: name, name } : undefined,
  });

  return data;
};

const requestAccessToProperty = async (propertyId: number) => {
  const { data } = await api.post("/property-access/request", {
    propertyId,
    property_id: propertyId,
  });
  return data;
};

export default function OthersPropertyManagement() {
  const { user } = useUserStore();

  const addDisclosure = useDisclosure(); // modal de busca (botão "Adicionar Propriedade")
  const viewDisclosure = useDisclosure(); // modal de detalhes da propriedade

  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(
    null
  );
  const [activeProperty, setActiveProperty] = useState<PropertyResponse | null>(
    null
  );

  // Busca
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<PropertyResponse[]>([]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["myProperties"],
    queryFn: fetchMyProperties,
    enabled: !!user,
  });

  const isOwner =
    normalizeCargo(user?.cargo) === normalizeCargo(Cargo.PROPRIETARIO);
  const properties = data ?? [];

  const handleCloseAdd = () => {
    setSearchTerm("");
    setSearchResults([]);
    addDisclosure.onClose();
  };

  const handleCloseView = () => {
    setActiveProperty(null);
    viewDisclosure.onClose();
  };

  const handlePropertySelection = (property: PropertyResponse) => {
    setSelectedPropertyId((prev) =>
      prev === property.id ? null : property.id
    );
  };

  const openViewModal = (property: PropertyResponse) => {
    setActiveProperty(property);
    viewDisclosure.onOpen();
  };

  // Mesma aparência do Owner (mostra os ícones), mas comportamento restrito
  const handleRestrictedAction = (_property: PropertyResponse) => {
    toaster.create({
      title: "Ação restrita",
      description:
        "Somente o proprietário pode editar ou remover propriedades.",
      type: "info",
      duration: 4000,
    });
  };

  const canSearch = useMemo(() => searchTerm.trim().length > 0, [searchTerm]);

  const searchMutation = useMutation({
    mutationFn: async (name: string) => {
      // 1) tenta buscar com o termo (pode ser exato no backend)
      const first = await searchPropertiesByName(name);

      // 2) se vier vazio, tenta fallback: buscar "todas" e filtrar no front
      if (first && first.length > 0) return first;

      try {
        const all = await searchPropertiesByName("");
        return all ?? [];
      } catch {
        // se o backend não aceitar search sem params, mantém vazio
        return first ?? [];
      }
    },
    onSuccess: (results, searchedName) => {
      const term = normalizeText(searchedName);

      const matches = (results ?? []).filter((p) =>
        normalizeText(p.nome ?? "").includes(term)
      );

      if (matches.length === 0) {
        alert("Propriedade não encontrada!");
        setSearchResults([]);
        return;
      }

      setSearchResults(matches);
    },
    onError: (error) => {
      toaster.create({
        title: "Erro ao buscar propriedade.",
        description: getErrorMessage(error),
        type: "error",
        duration: 4000,
      });
    },
  });

  const requestAccessMutation = useMutation({
    mutationFn: (propertyId: number) => requestAccessToProperty(propertyId),
    onSuccess: () => {
      toaster.create({
        title: "Solicitação enviada.",
        description: "O proprietário foi notificado para avaliar seu pedido.",
        type: "success",
        duration: 4000,
      });
    },
    onError: (error) => {
      toaster.create({
        title: "Erro ao solicitar entrada.",
        description: getErrorMessage(error),
        type: "error",
        duration: 4000,
      });
    },
  });

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

  // Proprietário continua indo para a página específica
  if (isOwner) {
    return (
      <Navigate to="/fertintelligence/owner-property-management" replace />
    );
  }

  return (
    <UserLayout>
      <FertName subtitle="Gerenciar Propriedades" />
      <ConfigMenu />

      {/* Layout idêntico ao OwnerPropertyManagement */}
      <Box pt={{ base: 16, md: 24 }} px={{ base: 4, md: 8 }} w="full">
        <Flex direction="column" gap={6}>
          <Heading as="h1" size="lg" color="white">
            Minhas Propriedades
          </Heading>

          {/* Mesmo botão e posição, mas abre a BUSCA */}
          <Button
            alignSelf="flex-start"
            colorScheme="green"
            onClick={() => {
              setSearchTerm("");
              setSearchResults([]);
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
                onEdit={handleRestrictedAction}
                onDelete={handleRestrictedAction}
              />
            )}
          </Box>
        </Flex>
      </Box>

      {/* Modal de busca (acionado pelo botão "Adicionar Propriedade") */}
      <DialogContainer isOpen={addDisclosure.open} onClose={handleCloseAdd}>
        <VStack align="stretch" gap={4}>
          <Heading as="h2" size="md">
            Buscar Propriedade
          </Heading>

          <InputGroup
            endElement={
              <IconButton
                aria-label="Buscar"
                borderRadius="full"
                size="sm"
                onClick={() => {
                  if (!canSearch) return;
                  searchMutation.mutate(searchTerm.trim());
                }}
                isLoading={searchMutation.isPending}
              >
                <FiSearch />
              </IconButton>
            }
          >
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Digite o nome da propriedade"
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  canSearch &&
                  !searchMutation.isPending
                ) {
                  searchMutation.mutate(searchTerm.trim());
                }
              }}
            />
          </InputGroup>

          <Box>
            <Heading as="h3" size="sm" mb={2}>
              Resultados encontrados
            </Heading>
            <Separator mb={4} />

            {searchMutation.isPending ? (
              <Flex justify="center" align="center" minH="120px">
                <Spinner size="md" />
              </Flex>
            ) : searchResults.length === 0 ? (
              <Text color="gray.500">
                Faça uma busca para ver os resultados.
              </Text>
            ) : (
              <VStack align="stretch" gap={4}>
                {searchResults.map((p) => (
                  <Box
                    key={p.id}
                    borderWidth="1px"
                    borderRadius="md"
                    boxShadow="md"
                    bg={{ base: "white", _dark: "gray.700" }}
                    p={4}
                  >
                    <Heading as="h4" size="sm" mb={2}>
                      {p.nome}
                    </Heading>

                    <Text
                      fontSize="sm"
                      color={{ base: "gray.600", _dark: "gray.200" }}
                    >
                      {p.endereco}
                    </Text>

                    <Text
                      fontSize="sm"
                      color={{ base: "gray.600", _dark: "gray.200" }}
                    >
                      CNPJ: {p.cnpj}
                    </Text>

                    <Flex justify="flex-end" mt={4}>
                      <Button
                        colorScheme="blue"
                        onClick={() => requestAccessMutation.mutate(p.id)}
                        isLoading={
                          requestAccessMutation.isPending &&
                          (requestAccessMutation.variables as
                            | number
                            | undefined) === p.id
                        }
                      >
                        Solicitar entrada ao proprietário
                      </Button>
                    </Flex>
                  </Box>
                ))}
              </VStack>
            )}
          </Box>

          <Flex justify="flex-end" mt={2}>
            <Button onClick={handleCloseAdd}>Fechar</Button>
          </Flex>
        </VStack>
      </DialogContainer>

      {/* Modal de detalhes (mesmo do Owner) */}
      <DialogContainer isOpen={viewDisclosure.open} onClose={handleCloseView}>
        <PropertyDetails property={activeProperty} />
        <Flex justify="flex-end" mt={6}>
          <Button onClick={handleCloseView}>Fechar</Button>
        </Flex>
      </DialogContainer>
    </UserLayout>
  );
}