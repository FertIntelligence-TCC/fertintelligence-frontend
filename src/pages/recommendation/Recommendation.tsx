import { Badge, Box, Heading, SimpleGrid, Text, VStack, Separator, Button } from "@chakra-ui/react";

import UserLayout from "@/components/Layouts/UserLayout";
import FertName from "@/components/FertName/FertName";
import ConfigMenu from "@/components/ConfigMenu/ConfigMenu";

export default function Recommendation() {
  return (
    <UserLayout>
      <FertName subtitle="Módulo de recomendações" />
      <ConfigMenu />

      <Box px={4} py={8} maxW="1200px" mx="auto">
        <VStack align="start" gap={4} mb={8}>
          <Badge colorPalette="blue" variant="subtle">
            Em construção
          </Badge>
          <Heading size="xl">Gerar Recomendação</Heading>
          <Text color="fg.muted" fontSize="md">
            Gere recomendações técnicas preliminares para correção e adubação.
          </Text>
        </VStack>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
          <Box borderWidth="1px" borderRadius="lg" p={6} bg="bg.panel" boxShadow="sm">
            <Heading size="md" mb={3}>
              Formulário técnico
            </Heading>
            <Separator mb={3} />
            <Text color="fg.muted">
              O formulário de geração de recomendação será implementado no próximo incremento.
            </Text>
          </Box>

          <Box borderWidth="1px" borderRadius="lg" p={6} bg="bg.panel" boxShadow="sm">
            <Heading size="md" mb={3}>
              Visualização e impressão
            </Heading>
            <Separator mb={3} />
            <Text color="fg.muted" mb={4}>
              Recomendações geradas poderão ser visualizadas e impressas conforme permissões.
            </Text>
            <Button colorScheme="blue" disabled>
              Funcionalidades em breve
            </Button>
          </Box>
        </SimpleGrid>
      </Box>
    </UserLayout>
  );
}
