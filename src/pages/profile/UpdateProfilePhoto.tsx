import { Box, Button, Heading, Text, VStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export default function UpdateProfilePhoto() {
  const navigate = useNavigate();

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" p={6}>
      <VStack gap={4} maxW="lg" textAlign="center">
        <Heading size="lg">Mudar Foto</Heading>
        <Text>
          Esta é a página dedicada para troca de foto de perfil.
        </Text>
        <Button onClick={() => navigate(-1)} colorScheme="green">
          Voltar
        </Button>
      </VStack>
    </Box>
  );
}
