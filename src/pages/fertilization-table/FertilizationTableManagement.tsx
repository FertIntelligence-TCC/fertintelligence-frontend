import { Box, Button, Flex, Heading, VStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import UserLayout from "@/components/Layouts/UserLayout";
import ConfigMenu from "@/components/ConfigMenu/ConfigMenu";
import FertName from "@/components/FertName/FertName";
import { useUserStore } from "@/stores/user/user.store";

const normalizeUserFlag = (value?: unknown) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s_-]+/g, "")
    .toUpperCase();

const isSupremeUser = (user?: unknown) => {
  const data = (user ?? {}) as Record<string, unknown>;
  const directValues = [
    data.cargo,
    data.role,
    data.perfil,
    data.tipo_usuario,
    data.tipoUsuario,
  ];
  const authorities = Array.isArray(data.authorities) ? data.authorities : [];
  return [...directValues, ...authorities].some((value) =>
    normalizeUserFlag(value).includes("SUPREMO")
  );
};

export default function FertilizationTableManagement() {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const isSupreme = isSupremeUser(user);

  return (
    <UserLayout>
      {/* Canto esquerdo superior: Legendas */}
      <FertName subtitle="Consultar tabelas de adubação" />

      {/* Canto direito superior: Menu de configurações */}
      <ConfigMenu />

      {/* Conteúdo Centralizado */}
      <Flex
        direction="column"
        alignItems="center"
        justifyContent="center"
        mt={16}
        px={4}
        gap={6}
      >
        {/* Box Central: Tabelas */}
        <Box
          borderWidth="1px"
          borderRadius="md"
          boxShadow="md"
          p={8}
          w={{ base: "100%", md: "40%", lg: "35%" }} // Largura ajustada para um único box central
          bg={{ base: "white", _dark: "gray.700" }}
        >
          <Heading as="h2" size="md" mb={6} textAlign="center">
            Tabelas
          </Heading>

          <VStack gap={4} align="stretch">
            <Button
              colorScheme="blue"
              onClick={() => navigate("/fertintelligence/fertilization-table-management/crop-fertilization-table")}
              h="auto"
              py={4}
              fontSize="md"
              whiteSpace="normal"
              textAlign="center"
            >
              Minhas tabelas
            </Button>

            {!isSupreme && (
              <Button
                colorScheme="blue"
                onClick={() => navigate("/fertintelligence/fertilization-table-management/crop-fertilization-table/default")}
                h="auto"
                py={4}
                fontSize="md"
                whiteSpace="normal"
                textAlign="center"
              >
                Tabelas padrão
              </Button>
            )}

            <Button
              colorScheme="blue"
              onClick={() => navigate("/fertintelligence/fertilization-table-management/crop-fertilization-table/public")}
              h="auto"
              py={4}
              fontSize="md"
              whiteSpace="normal"
              textAlign="center"
            >
              Tabelas públicas
            </Button>
            
            <Button
              colorScheme="blue"
              onClick={() => navigate("/fertintelligence/fertilization-table-management/soil-fertility-interpretation-table")}
              h="auto"
              py={4}
              fontSize="md"
              whiteSpace="normal"
              textAlign="center"
            >
              Tabela com critérios de interpretação da fertilidade dos solos
            </Button>

            <Button
              colorScheme="blue"
              onClick={() => navigate("/fertintelligence/fertilization-table-management/foliar-analysis-interpretation-table")}
              h="auto"
              py={4}
              fontSize="md"
              whiteSpace="normal"
              textAlign="center"
            >
              Tabela de interpretação de análise foliar
            </Button>
          </VStack>
        </Box>

        {/* Botão Voltar para o painel principal */}
        <Box w={{ base: "100%", md: "40%", lg: "35%" }}>
            <Button
              colorScheme="black"
              variant="solid"
              bg="black"
              color="white"
              _hover={{ bg: "gray.800" }}
              _dark={{ bg: "transparent", border: "1px solid white" }}
              onClick={() => navigate("/home")}
              h="50px"
              fontSize="md"
              w="100%"
            >
              Voltar para o painel principal
            </Button>
        </Box>

      </Flex>
    </UserLayout>
  );
}
