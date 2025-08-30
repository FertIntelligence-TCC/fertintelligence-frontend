import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { createUser } from "@/services/userService";
import { SignUpPayload } from "@/interfaces/ServicePayload";
import { PasswordInput } from "@/components/ui/password-input";
import UserLayout from "@/components/Layouts/UserLayout";
import FertName from "@/components/FertName/FertName";

import {
  Button,
  Text,
  Input,
  VStack,
  Heading,
  Box,
  Flex,
} from "@chakra-ui/react";

export default function SignUpPage() {
  const navigate = useNavigate();
  const [signUpForm, setSignUpForm] = useState({
    name: "",
    email: "",
    age: "",
    password: "",
    repeatPassword: "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleSignUpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignUpForm({ ...signUpForm, [e.target.name]: e.target.value });
    setError(null);
  };

  const validateSignUp = () => {
    const { name, email, age, password, repeatPassword } = signUpForm;

    if (!name || !email || !age || !password || !repeatPassword) {
      setError("Por favor, preencha todos os campos.");
      return false;
    }

    if (password !== repeatPassword) {
      setError("As senhas não coincidem.");
      return false;
    }

    const ageNumber = parseInt(age, 10);
    if (isNaN(ageNumber) || ageNumber <= 0) {
      setError("A idade deve ser um número positivo.");
      return false;
    }

    return true;
  };

  const signUpMutation = useMutation({
    mutationKey: ["createUser"],
    mutationFn: (payload: SignUpPayload) => createUser(payload),
    onSuccess: () => {
      alert("Cadastro realizado com sucesso! Faça login para continuar.");
      navigate("/fertintelligence/login");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        "Erro ao criar o usuário. Verifique os dados e tente novamente.";
      setError(errorMessage);
    },
  });

  const submitSignUp = () => {
    if (!validateSignUp()) return;

    const payload: SignUpPayload = {
      name: signUpForm.name,
      email: signUpForm.email,
      age: parseInt(signUpForm.age, 10),
      password: signUpForm.password,
      id_foto: "",
    };

    signUpMutation.mutate(payload);
  };

  return (
    <UserLayout>
      <FertName subtitle="Crie sua conta" />

      <Flex
        justifyContent="center"
        alignItems="center"
        minH="100vh"
        position="absolute"
        inset={0}
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
            Cadastro
          </Heading>

          <VStack spacing={4} align="stretch">
            {error && (
              <Box
                bg="red.100"
                color="red.700"
                p={3}
                borderRadius="md"
                textAlign="center"
                fontSize="sm"
              >
                <Text>{error}</Text>
              </Box>
            )}

            <Box>
              <Text mb={1}>Nome de usuário</Text>
              <Input
                name="name"
                value={signUpForm.name}
                onChange={handleSignUpChange}
                placeholder="Digite seu nome de usuário"
                width="100%"
              />
            </Box>

            <Box>
              <Text mb={1}>Email</Text>
              <Input
                type="email"
                name="email"
                value={signUpForm.email}
                onChange={handleSignUpChange}
                placeholder="Digite seu email"
                width="100%"
              />
            </Box>

            <Box>
              <Text mb={1}>Idade</Text>
              <Input
                type="number"
                min={0}
                name="age"
                value={signUpForm.age}
                onChange={handleSignUpChange}
                placeholder="Informe sua idade"
                width="100%"
              />
            </Box>

            <Box>
              <Text mb={1}>Senha</Text>
              <PasswordInput
                name="password"
                value={signUpForm.password}
                onChange={handleSignUpChange}
                placeholder="Digite sua senha"
                width="100%"
              />
            </Box>

            <Box>
              <Text mb={1}>Repita a senha</Text>
              <PasswordInput
                name="repeatPassword"
                value={signUpForm.repeatPassword}
                onChange={handleSignUpChange}
                placeholder="Repita a senha"
                width="100%"
              />
            </Box>

            <Button
              colorScheme="blue"
              width="full"
              onClick={submitSignUp}
              isLoading={signUpMutation.isLoading}
            >
              Cadastrar
            </Button>

            <Text
              fontSize="sm"
              color="blue.800"
              _dark={{ color: "blue.500" }}
              cursor="pointer"
              onClick={() => navigate("/fertintelligence/login")}
              textAlign="center"
            >
              Já tem uma conta? Entre aqui!
            </Text>
          </VStack>
        </Box>
      </Flex>
    </UserLayout>
  );
}
