import { useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Input,
  Spinner,
  Text,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import { FiPlus, FiSearch } from "react-icons/fi";
import { Navigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import UserLayout from "@/components/Layouts/UserLayout";
import FertName from "@/components/FertName/FertName";
import ConfigMenu from "@/components/ConfigMenu/ConfigMenu";

import { useUserStore } from "@/stores/user/user.store";
import { Cargo } from "@/interfaces/User";
import { PropertyResponse } from "@/interfaces/Property";

import { toaster } from "@/components/ui/toaster";
import DialogContainer from "@/components/Property/DialogContainer";
import PropertyDetails from "@/components/Property/PropertyDetails";
import PropertyList from "@/components/Property/PropertyList";

import api from "@/services/axios";
import { propertyAccessRequestService } from "@/services/propertyAccessRequestService";

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

const normalizeCargo = (c?: string) =>
  c
    ?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "")
    .toUpperCase();

export default function OthersPropertyManagement() {
  const { user } = useUserStore();
  const queryClient = useQueryClient();

  // Tela principal
  const [searchTerm, setSearchTerm] = useState("");
  const [activeProperty, setActiveProperty] = useState<PropertyResponse | null>(null);

  // Modais
  const addDisclosure = useDisclosure();
  const viewDisclosure = useDisclosure();

  // Modal "Solicitar Acesso"
  const [searchName, setSearchName] = useState("");
  const [foundProperties, setFoundProperties] = useState<PropertyResponse[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const {
    data: approvedProperties,
    isLoading: isLoadingProps,
    error: errorProps,
  } = useQuery({
    queryKey: ["approvedProperties"],
    queryFn: propertyAccessRequestService.getMyApprovedProperties,
    enabled: !!user,
  });

  const filteredProperties = useMemo(() => {
    if (!approvedProperties) return [];
    return approvedProperties.filter((p) =>
      p.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, approvedProperties]);

  const searchMutation = useMutation({
    mutationFn: async (nome: string) => {
      const response = await api.get<PropertyResponse[]>("/property/search", {
        params: { nome },
      });
      return response.data;
    },
    onMutate: () => setIsSearching(true),
    onSettled: () => setIsSearching(false),
    onSuccess: (data) => setFoundProperties(data),
    onError: (error) => {
      toaster.create({
        title: "Erro na busca",
        description: getErrorMessage(error),
        type: "error",
      });
    },
  });

  const requestAccessMutation = useMutation({
    mutationFn: async (propertyId: number) => {
      return propertyAccessRequestService.createRequest({ id_propriedade: propertyId });
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

  // “Se retirar”: procura a solicitação do usuário na propriedade e decide false.
  const leavePropertyMutation = useMutation({
    mutationFn: async (propertyId: number) => {
      await propertyAccessRequestService.leaveProperty(propertyId);
      return true;
    },
    onSuccess: async () => {
      toaster.create({
        title: "Você saiu da propriedade",
        description: "A propriedade foi removida da sua lista.",
        type: "success",
      });
      await queryClient.invalidateQueries({ queryKey: ["approvedProperties"] });
      handleCloseView();
    },
    onError: (error) => {
      toaster.create({
        title: "Erro ao sair da propriedade",
        description: getErrorMessage(error),
        type: "error",
      });
    },
  });

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
    setSearchName("");
    setFoundProperties([]);
  };

  const handleViewDetails = (property: PropertyResponse) => {
    setActiveProperty(property);
    viewDisclosure.onOpen();
  };

  const handleCloseView = () => {
    setActiveProperty(null);
    viewDisclosure.onClose();
  };

  const handleLeaveProperty = (property: PropertyResponse) => {
    leavePropertyMutation.mutate(property.id);
  };

  if (user && normalizeCargo(user.cargo) === Cargo.PROPRIETARIO) {
    return <Navigate to="/fertintelligence/owner-property-management" replace />;
  }

  return (
    <UserLayout>
      <FertName subtitle="Gerenciamento de Propriedades (Acesso)" />
      <ConfigMenu />

      <Box p={8} w="100%" mt={8}>
        <Heading mb={6}>Gestão de Propriedades</Heading>

        <Box
          mb={8}
          bg="white"
          _dark={{ bg: "gray.800" }}
          p={4}
          borderRadius="md"
          boxShadow="sm"
        >
          <Text mb={2} fontWeight="bold">
            Filtrar ou Solicitar Acesso:
          </Text>

          <Flex gap={4} direction={{ base: "column", md: "row" }} align="center">
            <Box position="relative" flex="1" w="full">
              <Input
                placeholder="Filtrar propriedades vinculadas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                pl={10}
                borderWidth="1px"
                borderColor="gray.200"
                _dark={{ borderColor: "gray.600", bg: "gray.700" }}
              />
              <Box position="absolute" left={3} top="50%" transform="translateY(-50%)">
                <FiSearch color="gray" />
              </Box>
            </Box>

            <Button
              colorPalette="green"
              onClick={handleOpenAdd}
              px={6}
              w={{ base: "full", md: "auto" }}
            >
              <FiPlus style={{ marginRight: 8 }} /> Solicitar Acesso
            </Button>
          </Flex>
        </Box>

        <Box bg="white" _dark={{ bg: "gray.800" }} p={6} borderRadius="lg" boxShadow="md">
          {isLoadingProps ? (
            <Flex justify="center" align="center" py={10}>
              <Spinner size="xl" />
            </Flex>
          ) : errorProps ? (
            <Text textAlign="center" color="red.500" mt={4}>
              Erro ao carregar propriedades: {getErrorMessage(errorProps)}
            </Text>
          ) : filteredProperties.length === 0 ? (
            <Text textAlign="center" color="gray.500" mt={4}>
              Nenhuma propriedade vinculada encontrada.
            </Text>
          ) : (
            <PropertyList
              properties={filteredProperties}
              onViewDetails={handleViewDetails}
              onLeave={handleLeaveProperty}
            />
          )}
        </Box>
      </Box>

      {/* Modal: Solicitar Acesso */}
      <DialogContainer isOpen={addDisclosure.open} onClose={handleCloseAdd}>
        <VStack align="stretch" spacing={4}>
          <Heading size="md">Solicitar Acesso a Propriedade</Heading>
          <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.400" }}>
            Busque pelo nome da propriedade para enviar uma solicitação ao proprietário.
          </Text>

          <Flex gap={2} align="center">
            <Input
              placeholder="Nome da propriedade..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              borderWidth="1px"
              borderColor="gray.200"
              _dark={{ borderColor: "gray.600", bg: "gray.700" }}
            />

            <IconButton
              aria-label="Buscar"
              variant="solid"
              colorPalette="green"
              color="white"
              onClick={handleSearchProperty}
              loading={isSearching}
              minW="40px"
              h="40px"
            >
              <FiSearch size={18} />
            </IconButton>
          </Flex>

          <Box maxH="300px" overflowY="auto" mt={2}>
            {foundProperties.length === 0 && !isSearching && searchName.length > 2 && (
              <Text fontSize="sm" color="gray.500" textAlign="center">
                Nenhuma propriedade encontrada.
              </Text>
            )}

            {foundProperties.length > 0 && (
              <VStack align="stretch" spacing={3}>
                {foundProperties.map((p) => (
                  <Box
                    key={p.id}
                    p={4}
                    borderWidth="1px"
                    borderRadius="md"
                    borderColor="gray.200"
                    boxShadow="sm"
                    _hover={{ borderColor: "green.400" }}
                    _dark={{ borderColor: "gray.600" }}
                  >
                    <Heading size="sm" mb={1}>
                      {p.nome}
                    </Heading>

                    <Badge colorPalette="green" mt={1}>
                      Encontrada
                    </Badge>

                    <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.200" }} mt={2}>
                      {p.endereco}
                    </Text>
                    <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.200" }}>
                      CNPJ: {p.cnpj}
                    </Text>

                    <Flex justify="flex-end" mt={4}>
                      <Button
                        colorPalette="blue"
                        onClick={() => requestAccessMutation.mutate(p.id)}
                        isLoading={
                          requestAccessMutation.isPending &&
                          (requestAccessMutation.variables as number | undefined) === p.id
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
            <Button onClick={handleCloseAdd} variant="outline">
              Fechar
            </Button>
          </Flex>
        </VStack>
      </DialogContainer>

      {/* Modal de detalhes + botão Se retirar */}
      <DialogContainer isOpen={viewDisclosure.open} onClose={handleCloseView}>
        <PropertyDetails property={activeProperty} />

        <Flex justify="space-between" mt={6} gap={3} flexWrap="wrap">
          <Button
            colorPalette="red"
            variant="outline"
            onClick={() => activeProperty && handleLeaveProperty(activeProperty)}
            isLoading={leavePropertyMutation.isPending}
            isDisabled={!activeProperty}
          >
            Se retirar
          </Button>

          <Button onClick={handleCloseView} colorPalette="gray">
            Fechar
          </Button>
        </Flex>
      </DialogContainer>
    </UserLayout>
  );
}