import { Box, Button, Flex, Heading, VStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import UserLayout from "@/components/Layouts/UserLayout";
import ConfigMenu from "@/components/ConfigMenu/ConfigMenu";
import FertName from "@/components/FertName/FertName";
import { isSupremeUser } from "@/interfaces/Authorization";
import { useUserStore } from "@/stores/user/user.store";

type FertilizerManagementProps = {
  subtitle?: string;
  soilHeading?: string;
  foliarHeading?: string;
  backLabel?: string;
  onBack?: () => void;
  getPath?: (path: string) => string;
  getNavigationState?: () => unknown;
  showStandardFertilizers?: boolean;
};

const FERTILIZER_PATHS = {
  SIMPLE_MINERAL: "/fertintelligence/fertilizer-management/simple-mineral-fertilizer",
  FORMULATED_MINERAL: "/fertintelligence/fertilizer-management/formulated-mineral-fertilizer",
  ORGANO_MINERAL: "/fertintelligence/fertilizer-management/organo-mineral-fertilizer",
  GREEN: "/fertintelligence/fertilizer-management/green-fertilizer",
  FOLIAR_MINERAL: "/fertintelligence/fertilizer-management/foliar-mineral-fertilizer",
  CHELATED: "/fertintelligence/fertilizer-management/chelated-fertilizer",
  BIO: "/fertintelligence/fertilizer-management/bio-fertilizer",
} as const;

export default function FertilizerManagement({
  subtitle = "Selecione o tipo de adubo que deseja consultar",
  soilHeading = "Aplicação no solo",
  foliarHeading = "Aplicação Foliar",
  backLabel = "Voltar para o painel principal",
  onBack,
  getPath = (path) => path,
  getNavigationState,
  showStandardFertilizers = true,
}: FertilizerManagementProps) {
  const navigate = useNavigate();
  const user = useUserStore((s) => s.user);
  const shouldShowStandardFertilizers = showStandardFertilizers && !isSupremeUser(user);
  const handleBack = onBack ?? (() => navigate("/fertintelligence/home"));
  const goToFertilizer = (path: string) => navigate(getPath(path), { state: getNavigationState?.() });

  return (
    <UserLayout>
      {/* Canto esquerdo superior: Legendas */}
      {/* FertName provavelmente renderiza o "FertIntelligence" */}
      <FertName subtitle={subtitle} />

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
            {soilHeading}
          </Heading>
          
          <VStack gap={4} align="stretch">
            <Button
              colorScheme="blue"
              onClick={() => goToFertilizer(FERTILIZER_PATHS.SIMPLE_MINERAL)}
              h="50px"
              fontSize="md"
            >
              Adubos minerais simples
            </Button>
            <Button
              colorScheme="blue"
              onClick={() => goToFertilizer(FERTILIZER_PATHS.FORMULATED_MINERAL)}
              h="50px"
              fontSize="md"
            >
              Adubos minerais em formulado
            </Button>
            <Button
              colorScheme="blue"
              onClick={() => goToFertilizer(FERTILIZER_PATHS.ORGANO_MINERAL)}
              h="50px"
              fontSize="md"
            >
              Adubos organo-minerais
            </Button>
            <Button
              colorScheme="blue"
              onClick={() => goToFertilizer(FERTILIZER_PATHS.GREEN)}
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
                {foliarHeading}
            </Heading>
            
            <VStack gap={4} align="stretch">
                <Button
                colorScheme="green"
                onClick={() => goToFertilizer(FERTILIZER_PATHS.FOLIAR_MINERAL)}
                h="50px"
                fontSize="md"
                >
                Adubos minerais
                </Button>
                <Button
                colorScheme="green"
                onClick={() => goToFertilizer(FERTILIZER_PATHS.CHELATED)}
                h="50px"
                fontSize="md"
                >
                Adubos quelatados
                </Button>
                <Button
                colorScheme="green"
                onClick={() => goToFertilizer(FERTILIZER_PATHS.BIO)}
                h="50px"
                fontSize="md"
                >
                Biofertilizantes
                </Button>
            </VStack>
            </Box>

            {shouldShowStandardFertilizers && (
              <Button
                colorScheme="blue"
                variant="outline"
                onClick={() => navigate("/fertintelligence/fertilizer-management/adubos-padrao")}
                h="50px"
                fontSize="md"
                w="100%"
              >
                Adubos padrão
              </Button>
            )}

            {/* Botão Voltar para o painel principal */}
            <Button
              colorScheme="black"
              variant="solid" // Mude de outline para solid (ou remova a linha, pois solid é padrão)
              bg="black"      // Força o fundo preto
              color="white"   // Força a letra branca
              _hover={{ bg: "gray.800" }} // Opcional: efeito ao passar o mouse
              _dark={{ bg: "transparent", border: "1px solid white" }} // Opcional: mantém outline no modo escuro se preferir
              onClick={handleBack}
              h="50px"
              fontSize="md"
              w="100%"
            >
              {backLabel}
            </Button>
        </Flex>

      </Flex>
    </UserLayout>
  );
}
