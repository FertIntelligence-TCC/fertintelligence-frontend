import { Box, Button, Flex, Heading, Text, VStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import UserLayout from "@/components/Layouts/UserLayout";
import ConfigMenu from "@/components/ConfigMenu/ConfigMenu";
import FertName from "@/components/FertName/FertName";

export default function FertilizerManagement() {
  const navigate = useNavigate();

  return (
    <UserLayout>
      {/* Canto esquerdo superior: Legendas */}
      {/* FertName provavelmente renderiza o "FertIntelligence" */}
      <FertName subtitle="Selecione o tipo de adubo que deseja consultar" />

      {/* Canto direito superior: Menu de configurações */}
      <ConfigMenu />

      {/* Conteúdo principal - dois cardboxes lado a lado */}
      <Flex
        justifyContent="center"
        alignItems="flex-start"
        gap={8}
        mt={16}
        px={4}
        flexWrap={{ base: "wrap", md: "nowrap" }}
      >
        {/* Box Esquerdo: Aplicação no solo */}
        <Box
          borderWidth="1px"
          borderRadius="md"
          boxShadow="md"
          p={8}
          w={{ base: "100%", md: "35%" }}
          bg={{ base: "white", _dark: "gray.700" }}
        >
          <Heading as="h2" size="md" mb={6}>
            Aplicação no solo
          </Heading>
          
          <VStack spacing={4} align="stretch">
            <Button
              colorScheme="blue"
              onClick={() => navigate("/fertintelligence/fertilizer-management/simple-mineral-fertilizer")}
              h="50px"
              fontSize="md"
            >
              Adubos minerais simples
            </Button>
            <Button
              colorScheme="blue"
              onClick={() => navigate("/fertintelligence/fertilizer-management/formulated-mineral-fertilizer")}
              h="50px"
              fontSize="md"
            >
              Adubos minerais em formulado
            </Button>
            <Button
              colorScheme="blue"
              onClick={() => navigate("/fertintelligence/fertilizer-management/organo-mineral-fertilizer")}
              h="50px"
              fontSize="md"
            >
              Adubos organo-minerais
            </Button>
            <Button
              colorScheme="blue"
              onClick={() => navigate("/fertintelligence/fertilizer-management/green-fertilizer")}
              h="50px"
              fontSize="md"
            >
              Adubos verdes
            </Button>
          </VStack>
        </Box>

        {/* Coluna Direita: Box Aplicação Foliar + Botão Voltar */}
        <Flex direction="column" w={{ base: "100%", md: "35%" }} gap={6}>
            
            {/* Box Direito: Aplicação Foliar */}
            <Box
            borderWidth="1px"
            borderRadius="md"
            boxShadow="md"
            p={8}
            w="100%"
            bg={{ base: "white", _dark: "gray.700" }}
            >
            <Heading as="h2" size="md" mb={6}>
                Aplicação Foliar
            </Heading>
            
            <VStack spacing={4} align="stretch">
                <Button
                colorScheme="green"
                onClick={() => navigate("/fertintelligence/fertilizer-management/foliar-mineral-fertilizer")}
                h="50px"
                fontSize="md"
                >
                Adubos minerais
                </Button>
                <Button
                colorScheme="green"
                onClick={() => navigate("/fertintelligence/fertilizer-management/chelated-fertilizer")}
                h="50px"
                fontSize="md"
                >
                Adubos quelatados
                </Button>
                <Button
                colorScheme="green"
                onClick={() => navigate("/fertintelligence/fertilizer-management/bio-fertilizer")}
                h="50px"
                fontSize="md"
                >
                Biofertilizantes
                </Button>
            </VStack>
            </Box>

            {/* Botão Voltar para o painel principal */}
            <Button
              colorScheme="black"
              variant="solid" // Mude de outline para solid (ou remova a linha, pois solid é padrão)
              bg="black"      // Força o fundo preto
              color="white"   // Força a letra branca
              _hover={{ bg: "gray.800" }} // Opcional: efeito ao passar o mouse
              _dark={{ bg: "transparent", border: "1px solid white" }} // Opcional: mantém outline no modo escuro se preferir
              onClick={() => navigate("/home")}
              h="50px"
              fontSize="md"
              w="100%"
            >
              Voltar para o painel principal
            </Button>
        </Flex>

      </Flex>
    </UserLayout>
  );
}