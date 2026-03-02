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
import { Cargo } from "@/interfaces/User";
import { PropertyResponse } from "@/interfaces/Property";
// ALTERADO: Importando a função correta para buscar propriedades aprovadas
import { fetchApprovedProperties } from "@/services/propertyService"; 

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
    if (data.message) return data.message;
  }
  if (error instanceof Error) return error.message;
  return "Erro desconhecido";
};

export default function OthersPropertyManagement() {
  const { user } = useUserStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeProperty, setActiveProperty] = useState<PropertyResponse | null>(null);

  // Modais
  const addDisclosure = useDisclosure();
  const viewDisclosure = useDisclosure();

  // Estados para busca de nova propriedade (Modal Adicionar)
  const [searchName, setSearchName] = useState("");
  const [foundProperties, setFoundProperties] = useState<PropertyResponse[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // 1. Fetch das propriedades (AGORA BUSCA AS APROVADAS)
  const {
    data: approvedProperties, // Renomeado de myProperties para approvedProperties
    isLoading: isLoadingProps,
    error: errorProps,
  } = useQuery({
    queryKey: ["approvedProperties"], // Chave atualizada
    queryFn: fetchApprovedProperties, // Função atualizada
  });

  // Filtragem local baseada no input de busca da tela principal
  const filteredProperties = useMemo(() => {
    if (!approvedProperties) return [];
    return approvedProperties.filter((p) =>
      p.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, approvedProperties]);

  // Mutation para buscar propriedades por nome (no Modal de solicitação)
  const searchMutation = useMutation({
    mutationFn: async (nome: string) => {
      const response = await api.get<PropertyResponse[]>("/property/search", {
        params: { nome },
      });
      return response.data;
    },
    onMutate: () => setIsSearching(true),
    onSettled: () => setIsSearching(false),
    onSuccess: (data) => {
      setFoundProperties(data);
    },
    onError: (error) => {
      toaster.create({
        title: "Erro na busca",
        description: getErrorMessage(error),
        type: "error",
      });
    },
  });

  // Mutation para solicitar acesso
  const requestAccessMutation = useMutation({
    mutationFn: async (propertyId: number) => {
      const response = await api.post("/property-access/request", {
        id_propriedade: propertyId,
      });
      return response.data;
    },
    onSuccess: () => {
      toaster.create({
        title: "Sucesso",
        description: "Solicitação enviada com sucesso!",
        type: "success",
      });
      handleCloseAdd();
    },
    onError: (error) => {
      toaster.create({
        title: "Erro ao solicitar",
        description: getErrorMessage(error),
        type: "error",
      });
    },
  });

  // Handlers
  const handleSearchProperty = () => {
    if (searchName.trim().length < 3) {
      toaster.create({
        title: "Atenção",
        description: "Digite pelo menos 3 caracteres para buscar.",
        type: "warning",
      });
      return;
    }
    searchMutation.mutate(searchName);
  };

  const handleOpenAdd = () => {
    setSearchName("");
    setFoundProperties([]);
    addDisclosure.onOpen();
  };

  const handleCloseAdd = () => {
    addDisclosure.onClose();
  };

  const handleViewDetails = (property: PropertyResponse) => {
    setActiveProperty(property);
    viewDisclosure.onOpen();
  };

  const handleCloseView = () => {
    setActiveProperty(null);
    viewDisclosure.onClose();
  };

  // Verifica permissão (apenas não-proprietários deveriam estar aqui, mas segurança extra não faz mal)
  const normalizeCargo = (c?: string) =>
    c
      ?.normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "")
      .toUpperCase();

  if (user && normalizeCargo(user.cargo) === Cargo.PROPRIETARIO) {
    return <Navigate to="/fertintelligence/owner-property-management" replace />;
  }

  return (
    <UserLayout>
      <FertName subtitle="Gerenciamento de Propriedades (Acesso)" />
      <ConfigMenu />

      <Flex
        direction="column"
        align="center"
        justify="flex-start"
        mt={20}
        px={4}
        w="100%"
        maxW="1200px"
        mx="auto"
        gap={6}
      >
        {/* Cabeçalho e Barra de Busca */}
        <Flex w="100%" justify="space-between" align="center" wrap="wrap" gap={4}>
          <Heading size="md">Propriedades Vinculadas</Heading>
          
          <Flex gap={2} w={{ base: "100%", md: "auto" }}>
            <InputGroup flex="1" startElement={<FiSearch />}>
              <Input
                placeholder="Buscar propriedades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                bg={{ base: "white", _dark: "gray.700" }}
              />
            </InputGroup>
            
            <Button colorScheme="green" leftIcon={<FiPlus />} onClick={handleOpenAdd}>
              Solicitar Acesso
            </Button>
          </Flex>
        </Flex>

        <Separator w="100%" />

        {/* Lista de Propriedades */}
        {isLoadingProps ? (
          <Spinner size="xl" mt={10} />
        ) : errorProps ? (
          <Text color="red.500">Erro ao carregar propriedades: {getErrorMessage(errorProps)}</Text>
        ) : (
          <PropertyList 
            properties={filteredProperties || []} 
            onViewDetails={handleViewDetails} 
          />
        )}
      </Flex>

      {/* Modal: Solicitar Acesso (Buscar Propriedade) */}
      <DialogContainer isOpen={addDisclosure.open} onClose={handleCloseAdd}>
        <VStack align="stretch" spacing={4}>
          <Heading size="md">Solicitar Acesso a Propriedade</Heading>
          <Text fontSize="sm" color="gray.500">
            Busque pelo nome da propriedade para enviar uma solicitação ao proprietário.
          </Text>

          <Flex gap={2}>
            <Input
              placeholder="Nome da propriedade..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
            <IconButton
              aria-label="Buscar"
              icon={<FiSearch />}
              onClick={handleSearchProperty}
              isLoading={isSearching}
            />
          </Flex>

          <Box maxH="300px" overflowY="auto" mt={2}>
            {foundProperties.length === 0 && !isSearching && searchName.length > 2 && (
              <Text fontSize="sm" color="gray.500" textAlign="center">
                Nenhuma propriedade encontrada.
              </Text>
            )}

            {foundProperties.length > 0 && (
              <VStack align="stretch" spacing={2}>
                {foundProperties.map((p) => (
                  <Box
                    key={p.id}
                    p={3}
                    borderWidth="1px"
                    borderRadius="md"
                    _hover={{ bg: "gray.50", _dark: { bg: "gray.700" } }}
                  >
                    <Text fontWeight="bold">{p.nome}</Text>
                    <Text fontSize="xs" color="gray.500">
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

      {/* Modal de detalhes (reutiliza visualização padrão) */}
      <DialogContainer isOpen={viewDisclosure.open} onClose={handleCloseView}>
        <PropertyDetails property={activeProperty} />
        <Flex justify="flex-end" mt={6}>
          <Button onClick={handleCloseView}>Fechar</Button>
        </Flex>
      </DialogContainer>
    </UserLayout>
  );
}