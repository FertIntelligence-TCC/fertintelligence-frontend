import { Box, Button, Flex, Heading, VStack } from "@chakra-ui/react";
import { Navigate, useNavigate } from "react-router-dom";
import UserLayout from "@/components/Layouts/UserLayout";
import ConfigMenu from "@/components/ConfigMenu/ConfigMenu";
import FertName from "@/components/FertName/FertName";
import { isSupremeUserCargo } from "@/interfaces/Authorization";
import { useUserStore } from "@/stores/user/user.store";

export default function DefaultFertilizerManagement() {
  const navigate = useNavigate();
  const user = useUserStore((s) => s.user);

  if (isSupremeUserCargo(user?.cargo)) {
    return <Navigate to="/fertintelligence/fertilizer-management" replace />;
  }

  return (
    <UserLayout>
      <FertName subtitle="Selecione o tipo de adubo padrão que deseja consultar" />
      <ConfigMenu />

      <Flex
        justifyContent="center"
        alignItems="flex-start"
        gap={8}
        mt={16}
        px={4}
        flexWrap={{ base: "wrap", md: "nowrap" }}
      >
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

          <VStack gap={4} align="stretch">
            <Button colorScheme="blue" onClick={() => navigate("/fertintelligence/fertilizer-management/default/simple-mineral-fertilizer")} h="50px" fontSize="md">
              Adubos minerais simples
            </Button>
            <Button colorScheme="blue" onClick={() => navigate("/fertintelligence/fertilizer-management/default/formulated-mineral-fertilizer")} h="50px" fontSize="md">
              Adubos minerais em formulado
            </Button>
            <Button colorScheme="blue" onClick={() => navigate("/fertintelligence/fertilizer-management/default/organo-mineral-fertilizer")} h="50px" fontSize="md">
              Adubos organo-minerais
            </Button>
            <Button colorScheme="blue" onClick={() => navigate("/fertintelligence/fertilizer-management/default/green-fertilizer")} h="50px" fontSize="md">
              Adubos verdes
            </Button>
            <Button colorScheme="blue" onClick={() => navigate("/fertintelligence/fertilizer-management/default/organic-fertilizer")} h="50px" fontSize="md">
              Adubos orgânicos
            </Button>
          </VStack>
        </Box>

        <Flex direction="column" w={{ base: "100%", md: "35%" }} gap={6}>
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

            <VStack gap={4} align="stretch">
              <Button colorScheme="green" onClick={() => navigate("/fertintelligence/fertilizer-management/default/foliar-mineral-fertilizer")} h="50px" fontSize="md">
                Adubos minerais
              </Button>
              <Button colorScheme="green" onClick={() => navigate("/fertintelligence/fertilizer-management/default/chelated-fertilizer")} h="50px" fontSize="md">
                Adubos quelatados
              </Button>
              <Button colorScheme="green" onClick={() => navigate("/fertintelligence/fertilizer-management/default/bio-fertilizer")} h="50px" fontSize="md">
                Biofertilizantes
              </Button>
            </VStack>
          </Box>

          <Button
            colorScheme="black"
            variant="solid"
            bg="black"
            color="white"
            _hover={{ bg: "gray.800" }}
            _dark={{ bg: "transparent", border: "1px solid white" }}
            onClick={() => navigate("/fertintelligence/fertilizer-management")}
            h="50px"
            fontSize="md"
            w="100%"
          >
            Voltar para meus adubos
          </Button>
        </Flex>
      </Flex>
    </UserLayout>
  );
}
