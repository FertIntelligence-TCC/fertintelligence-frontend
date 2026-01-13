import { Box, Button, Flex, Heading, VStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import UserLayout from "@/components/Layouts/UserLayout";
import ConfigMenu from "@/components/ConfigMenu/ConfigMenu";
import FertName from "@/components/FertName/FertName";

export default function FertilizationTableManagement() {
  const navigate = useNavigate();

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

          <VStack spacing={4} align="stretch">
            <Button
              colorScheme="blue"
              onClick={() => navigate("/fertintelligence/fertilization-table-management/crop-fertilization-table")}
              h="auto" // Altura automática para suportar quebras de linha se necessário
              py={4}
              fontSize="md"
              whiteSpace="normal"
              textAlign="center"
            >
              Tabela de adubação de culturas
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