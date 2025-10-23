import { type ReactNode, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  SimpleGrid,
  Spinner,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import UserLayout from "@/components/Layouts/UserLayout";
import FertName from "@/components/FertName/FertName";
import ConfigMenu from "@/components/ConfigMenu/ConfigMenu";
import { useUserStore } from "@/stores/user/user.store";
import { Cargo, LatitudeDirection, LongitudeDirection } from "@/interfaces/ServicePayload";
import { PropertyResponse } from "@/interfaces/ServiceResponse";
import { fetchMyProperties } from "@/services/propertyService";

const directionLabel = (direction?: LatitudeDirection | LongitudeDirection) => {
  if (!direction) return "-";
  switch (direction) {
    case LatitudeDirection.NORTE:
      return "Norte";
    case LatitudeDirection.SUL:
      return "Sul";
    case LongitudeDirection.LESTE:
      return "Leste";
    case LongitudeDirection.OESTE:
      return "Oeste";
    default:
      return direction;
  }
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

const normalizeCargo = (cargo?: string) =>
  cargo
    ?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "")
    .toUpperCase();

export default function OthersPropertyManagement() {
  const { user } = useUserStore();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["myProperties"],
    queryFn: fetchMyProperties,
    enabled: !!user,
  });

  const viewDisclosure = useDisclosure();
  const [property, setProperty] = useState<PropertyResponse | null>(null);

  const isOwner = normalizeCargo(user?.cargo) === Cargo.PROPRIETARIO;

  const handleCloseDialog = () => {
    setProperty(null);
    viewDisclosure.onClose();
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

  if (isOwner) {
    return <Navigate to="/fertintelligence/owner-property-management" replace />;
  }

  const properties = data ?? [];

  return (
    <UserLayout>
      <FertName subtitle="Gerenciar Propriedades" />
      <ConfigMenu />

      <Box pt={{ base: 24, md: 28 }} maxW="6xl" mx="auto" w="full">
        <VStack align="stretch" gap={10}>
          <Box>
            <Heading as="h2" size="md" mb={4}>
              Propriedades das quais você participa
            </Heading>
            <Text>
              Você pode visualizar as informações das propriedades às quais possui acesso.
              Para atualizações, entre em contato com o proprietário responsável.
            </Text>
          </Box>

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
              {properties.map((item) => (
                <Box
                  key={item.id}
                  borderWidth="1px"
                  borderRadius="md"
                  boxShadow="md"
                  bg={{ base: "white", _dark: "gray.700" }}
                  p={4}
                >
                  <Button
                    width="100%"
                    justifyContent="flex-start"
                    onClick={() => {
                      setProperty(item);
                      viewDisclosure.onOpen();
                    }}
                  >
                    {item.nome}
                  </Button>
                </Box>
              ))}
            </SimpleGrid>
          )}
        </VStack>
      </Box>

      <DialogContainer isOpen={viewDisclosure.open} onClose={handleCloseDialog}>
        <Heading as="h2" size="md" mb={4}>
          Detalhes da Propriedade
        </Heading>
        {property ? (
          <VStack align="start" gap={3}>
            <Text>
              <Text as="span" fontWeight="bold">
                Nome:
              </Text>{" "}
              {property.nome}
            </Text>
            <Text>
              <Text as="span" fontWeight="bold">
                Endereço:
              </Text>{" "}
              {property.endereco}
            </Text>
            <Text>
              <Text as="span" fontWeight="bold">
                CNPJ:
              </Text>{" "}
              {property.cnpj}
            </Text>
            <Text>
              <Text as="span" fontWeight="bold">
                Latitude:
              </Text>{" "}
              {property.localizacao?.latitude ?? "-"}° {directionLabel(property.localizacao?.latitudeDirection)}
            </Text>
            <Text>
              <Text as="span" fontWeight="bold">
                Longitude:
              </Text>{" "}
              {property.localizacao?.longitude ?? "-"}° {directionLabel(property.localizacao?.longitudeDirection)}
            </Text>
            <Text>
              <Text as="span" fontWeight="bold">
                Altitude:
              </Text>{" "}
              {property.localizacao?.altitude ?? "-"}
            </Text>
          </VStack>
        ) : (
          <Text>Selecione uma propriedade para visualizar.</Text>
        )}
        <Flex justify="flex-end" mt={6}>
          <Button onClick={handleCloseDialog}>Fechar</Button>
        </Flex>
      </DialogContainer>
    </UserLayout>
  );
}