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
import { LuArrowLeft } from "react-icons/lu";
import { Navigate, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import UserLayout from "@/components/Layouts/UserLayout";
import FertName from "@/components/FertName/FertName";
import ConfigMenu from "@/components/ConfigMenu/ConfigMenu";
import PropertyList from "@/components/Property/PropertyList";
import DialogContainer from "@/components/Property/DialogContainer";
import PropertyDetails from "@/components/Property/PropertyDetails";
import PropertyFormDialog from "@/components/Property/PropertyFormDialog";

import { useUserStore } from "@/stores/user/user.store";
import { Cargo } from "@/interfaces/User";
import { PropertyResponse } from "@/interfaces/Property";
import { toaster } from "@/components/ui/toaster";
import { propertyAccessRequestService } from "@/services/propertyAccessRequestService";
import api from "@/services/axios";
import { getAuthorizationRoleMode, getPermissionDeniedMessage } from "@/interfaces/Authorization";

type Variant = "MANAGER" | "RESIDENT" | "CONSULTANT" | "SECRETARY" | "SUPERVISOR";

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Erro desconhecido";
};

export function RolePropertyManagement({ variant }: { variant: Variant }) {
  const { user } = useUserStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const propertyAccessDisclosure = useDisclosure();
  const viewDisclosure = useDisclosure();
  const editDisclosure = useDisclosure();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [activeProperty, setActiveProperty] = useState<PropertyResponse | null>(null);
  const [editingProperty, setEditingProperty] = useState<PropertyResponse | null>(null);
  const [searchName, setSearchName] = useState("");
  const [foundProperties, setFoundProperties] = useState<PropertyResponse[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const { data: approvedProperties = [], isLoading, error } = useQuery({
    queryKey: ["approvedProperties", variant],
    queryFn: propertyAccessRequestService.getMyApprovedProperties,
    enabled: !!user,
  });

  const filteredProperties = useMemo(
    () => approvedProperties.filter((p) => p.nome.toLowerCase().includes(searchTerm.toLowerCase())),
    [approvedProperties, searchTerm]
  );

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
    onError: (err) => {
      toaster.create({
        title: "Erro na busca",
        description: getErrorMessage(err),
        type: "error",
      });
    },
  });

  const requestPropertyAccessMutation = useMutation({
    mutationFn: async (propertyId: number) =>
      propertyAccessRequestService.createRequest({
        id_propriedade: propertyId,
      }),
    onSuccess: async () => {
      toaster.create({
        title: "Sucesso",
        description: "Solicitação enviada com sucesso!",
        type: "success",
      });
      await queryClient.invalidateQueries({ queryKey: ["approvedProperties", variant] });
      setSearchName("");
      setFoundProperties([]);
    },
    onError: (err) => {
      toaster.create({
        title: "Erro ao solicitar",
        description: getErrorMessage(err),
        type: "error",
      });
    },
  });

  const leaveMutation = useMutation({
    mutationFn: propertyAccessRequestService.leaveProperty,
    onSuccess: async () => {
      toaster.create({ title: "Você saiu da propriedade.", type: "success" });
      await queryClient.invalidateQueries({ queryKey: ["approvedProperties", variant] });
      viewDisclosure.onClose();
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

  const onEditProperty = (property: PropertyResponse) => {
    if (variant === "SUPERVISOR") {
      toaster.create({ title: getPermissionDeniedMessage(), type: "warning" });
      return;
    }
    setEditingProperty(property);
    editDisclosure.onOpen();
  };

  return (
    <UserLayout>
      <FertName subtitle="Gerenciamento de Propriedades" />
      <ConfigMenu />

      <Box p={8} mt={8}>
        <Flex justify="space-between" mb={6} gap={4} flexWrap="wrap">
          <Flex gap={3} align="center" wrap="wrap">
            <Button variant="outline" onClick={() => navigate("/fertintelligence/home")}>
              <LuArrowLeft /> Voltar para o painel
            </Button>
            <Heading size="lg">Propriedades vinculadas</Heading>
          </Flex>
        </Flex>

        <Box mb={6} bg="white" _dark={{ bg: "gray.800" }} p={4} borderRadius="md" boxShadow="sm">
          <Text mb={2} fontWeight="bold">Filtrar ou Solicitar Acesso:</Text>
          <Flex gap={4} direction={{ base: "column", md: "row" }} align="center">
            <Box position="relative" flex="1" w="full">
              <Input
                placeholder="Filtrar propriedades vinculadas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                pl={10}
              />
              <Box position="absolute" left={3} top="50%" transform="translateY(-50%)">
                <FiSearch />
              </Box>
            </Box>
            <Button
              colorPalette="green"
              onClick={() => {
                setSearchName("");
                setFoundProperties([]);
                propertyAccessDisclosure.onOpen();
              }}
              px={6}
              w={{ base: "full", md: "auto" }}
            >
              <FiPlus style={{ marginRight: 8 }} /> Solicitar entrada ao proprietário
            </Button>
          </Flex>
        </Box>

        <Box bg="white" _dark={{ bg: "gray.800" }} p={6} borderRadius="lg" boxShadow="md">
          {isLoading ? (
            <Flex justify="center" py={10}>
              <Spinner size="xl" />
            </Flex>
          ) : error ? (
            <Text color="red.500">Erro ao carregar propriedades: {getErrorMessage(error)}</Text>
          ) : (
            <PropertyList
              properties={filteredProperties}
              selectedPropertyId={selectedPropertyId}
              onSelect={(p) => setSelectedPropertyId(p.id)}
              onView={(p) => {
                setActiveProperty(p);
                viewDisclosure.onOpen();
              }}
              onEdit={onEditProperty}
              onLeave={(p) => leaveMutation.mutate(p.id)}
              leaveLabel="Se retirar"
            />
          )}
        </Box>
      </Box>

      <DialogContainer isOpen={propertyAccessDisclosure.open} onClose={propertyAccessDisclosure.onClose}>
        <VStack align="stretch" gap={4}>
          <Heading size="md">Solicitar Acesso à Propriedade</Heading>
          <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.400" }}>
            Busque pelo nome da propriedade para enviar uma solicitação ao proprietário.
          </Text>

          <Flex gap={2} align="center">
            <Input
              placeholder="Nome da propriedade..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
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
              <VStack align="stretch" gap={3}>
                {foundProperties.map((p) => (
                  <Box
                    key={p.id}
                    p={4}
                    borderWidth="1px"
                    borderRadius="md"
                    borderColor="gray.200"
                    boxShadow="sm"
                    _hover={{ borderColor: "green.400" }}
                  >
                    <Heading size="sm" mb={1}>{p.nome}</Heading>
                    <Badge colorPalette="green" mt={1}>Encontrada</Badge>
                    <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.200" }} mt={2}>
                      {p.endereco}
                    </Text>
                    <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.200" }}>
                      CNPJ: {p.cnpj}
                    </Text>

                    <Flex justify="flex-end" mt={4}>
                      <Button
                        colorPalette="blue"
                        onClick={() => requestPropertyAccessMutation.mutate(p.id)}
                        loading={
                          requestPropertyAccessMutation.isPending &&
                          (requestPropertyAccessMutation.variables as number | undefined) === p.id
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

          <Flex justify="flex-end">
            <Button variant="outline" onClick={propertyAccessDisclosure.onClose}>Fechar</Button>
          </Flex>
        </VStack>
      </DialogContainer>

      <DialogContainer isOpen={viewDisclosure.open} onClose={viewDisclosure.onClose}>
        <PropertyDetails property={activeProperty} />
      </DialogContainer>

      <PropertyFormDialog
        title="Editar Propriedade"
        isOpen={editDisclosure.open}
        onClose={editDisclosure.onClose}
        propertyId={editingProperty?.id ?? null}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["approvedProperties", variant] })}
      />
    </UserLayout>
  );
}

export default function OthersPropertyManagement() {
  const { user } = useUserStore();
  const mode = getAuthorizationRoleMode(user?.cargo);

  if (mode === "OWNER") {
    return <Navigate to="/fertintelligence/owner-property-management" replace />;
  }

  if (mode === "MANAGER") {
    return <Navigate to="/fertintelligence/manager-property-management" replace />;
  }

  if (mode === "RESIDENT") {
    return <Navigate to="/fertintelligence/resident-agronomist-property-management" replace />;
  }

  if (mode === "CONSULTANT") {
    return <Navigate to="/fertintelligence/consultant-agronomist-property-management" replace />;
  }

  if (mode === "SECRETARY") {
    return <Navigate to="/fertintelligence/secretary-property-management" replace />;
  }

  if (mode === "SUPERVISOR") {
    return <Navigate to="/fertintelligence/area-supervisor-property-management" replace />;
  }

  if (user?.cargo && user.cargo === Cargo.PROPRIETARIO) {
    return <Navigate to="/fertintelligence/owner-property-management" replace />;
  }

  return <Navigate to="/fertintelligence/home" replace />;
}