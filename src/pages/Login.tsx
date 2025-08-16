import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useUserStore } from "../stores/user/user.store";
import { authenticateUser } from "@/services/userService";
import { SignInPayload } from "@/interfaces/ServicePayload";
import { User } from "../interfaces/Models";
import axiosInstace from "../services/axios";
import { ENDPOINT } from "../constants/Endpoint";
import { PasswordInput } from "@/components/ui/password-input";
import HomeLayout from "@/components/Layouts/Home";
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

import { FormControl, FormLabel } from "@chakra-ui/form-control";

export default function LoginPage() {
  const navigate = useNavigate();
  const setUser = useUserStore((state) => state.setUser);
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    if (user) return;
    const payload = sessionStorage.getItem("tcc_user_token");
    const getUserFromStorage = async (token: string) => {
      try {
        const { data } = await axiosInstace.get<User>(`/${ENDPOINT.ME}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(data);
      } catch (error) {
        console.log(error);
        sessionStorage.removeItem("tcc_user_token");
      }
    };
    if (payload) {
      getUserFromStorage(payload);
    }
  }, [navigate, setUser, user]);

  const [signInForm, setSignInForm] = useState<{ login?: string; senha?: string }>({});

  const handleSignInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignInForm({ ...signInForm, [e.target.name]: e.target.value });
  };

  function validateSignIn() {
    return signInForm.login && signInForm.senha;
  }

  const sendSignInForm = useMutation({
    mutationKey: ["authenticateUser"],
    mutationFn: authenticateUser,
    onSuccess: () => {
      navigate("/fertintelligence/home");
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const submitLogin = () => {
    if (validateSignIn()) {
      const payload: SignInPayload = {
        login: signInForm.login!,
        senha: signInForm.senha!,
      };
      sendSignInForm.mutate(payload);
    } else {
      console.log("Campos inválidos no login");
    }
  };

  return (
    <HomeLayout>
      <FertName subtitle="Acesse sua conta" /> {/* Adiciona a legenda no canto */}
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
            Login
          </Heading>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel textAlign="left">Username</FormLabel>
              <Input
                name="login"
                value={signInForm.login || ""}
                onChange={handleSignInChange}
                placeholder="Digite aqui seu nome de usuário"
                width="100%"
                _placeholder={{ color: "gray.800", _dark: { color: "gray.400" } }}
              />
            </FormControl>

            <FormControl>
              <FormLabel textAlign="left">Senha</FormLabel>
              <PasswordInput
                name="senha"
                value={signInForm.senha || ""}
                onChange={(e) =>
                  setSignInForm({ ...signInForm, senha: e.target.value })
                }
                placeholder="Digite aqui sua senha"
                width="100%"
                _placeholder={{ color: "gray.800", _dark: { color: "gray.400" } }}
              />
            </FormControl>

            <Button colorScheme="blue" width="full" onClick={submitLogin}>
              Entrar
            </Button>

            <Text
              fontSize="sm"
              color="blue.800"
              _dark={{ color: "blue.500" }}
              cursor="pointer"
              onClick={() => navigate("/fertintelligence/signup")}
              textAlign="center"
              userSelect="none"
              position="relative"
              zIndex={2}
            >
              Não tem uma conta? Cadastre-se!
            </Text>
          </VStack>
        </Box>
      </Flex>
    </HomeLayout>
  );
}