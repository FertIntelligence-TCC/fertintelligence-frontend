import { useState } from "react";
import {
  Button,
  Input,
  VStack,
  Heading,
  Box,
  Text,
  Flex,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import FertName from "@/components/FertName/FertName";
import HomeLayout from "@/components/Layouts/Home";

export default function DeleteProfile() {
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState({
    password: "",
    repeatPassword: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords({ ...passwords, [name]: value });
  };

  const handleSubmit = () => {
    console.log("Senha para deleção:", passwords.password);
    console.log("Senha repetida:", passwords.repeatPassword);
    // Adicione a lógica de deleção de perfil aqui
    // Se a deleção for bem-sucedida, redirecione o usuário.
    // Por exemplo, para a página de login
    navigate("/fertintelligence/home");
  };

  return (
    <HomeLayout>
      {/* Legenda no canto superior esquerdo */}
      <FertName subtitle="Confirme a deleção do perfil" />

      {/* Container Flex que centraliza o cardbox vertical e horizontalmente */}
      <Flex
        justifyContent="center"
        alignItems="center"
        minH="100vh"
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
      >
        <Box
          bg="whiteAlpha.600"
          _dark={{ bg: "blackAlpha.600" }}
          p={8}
          borderRadius="md"
          boxShadow="lg"
          width={{ base: "90%", md: "400px" }}
          backdropFilter="blur(4px)"
          zIndex={1}
        >
          <Heading mb={6} textAlign="center" size="lg">
            Deletar Perfil
          </Heading>

          <VStack spacing={4} align="stretch">
            <Box>
              <Text textAlign="left" mb={1}>Senha</Text>
              <Input
                type="password"
                name="password"
                value={passwords.password}
                onChange={handleInputChange}
                placeholder="Digite sua senha"
                _placeholder={{ color: "gray.800", _dark: { color: "gray.400" } }}
              />
            </Box>

            <Box>
              <Text textAlign="left" mb={1}>Repita sua senha</Text>
              <Input
                type="password"
                name="repeatPassword"
                value={passwords.repeatPassword}
                onChange={handleInputChange}
                placeholder="Digite sua senha novamente"
                _placeholder={{ color: "gray.800", _dark: { color: "gray.400" } }}
              />
            </Box>

            <Button
              onClick={handleSubmit}
              width="full"
              color="pink.500"
              _hover={{ bg: "red.500", color: "white" }}
              variant="outline"
            >
              Confirmar
            </Button>
          </VStack>
        </Box>
      </Flex>
    </HomeLayout>
  );
}