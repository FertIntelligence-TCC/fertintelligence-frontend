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
import { FormControl, FormLabel } from "@chakra-ui/form-control";

export default function LoginPage() {
  const navigate = useNavigate();
  const setUser = useUserStore((state) => state.setUser);
  const user = useUserStore((state) => state.user);

  const [signInForm, setSignInForm] = useState<{
    login?: string;
    senha?: string;
  }>({});
  const [isServerHealthy, setIsServerHealthy] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    const checkServerHealth = async () => {
      try {
        const { data } = await axiosInstace.get("/health");
        if (data === "Ok") {
          setIsServerHealthy(true);
          setServerError(null);
        }
      } catch (error) {
        setIsServerHealthy(false);
        setServerError("Não foi possível conectar ao servidor.");
      }
    };
    
    checkServerHealth();

    if (user) return;
    const payload = sessionStorage.getItem("fertintelligence_user_token");
    const getUserFromStorage = async (token: string) => {
      try {
        const { data } = await axiosInstace.get<User>(`/${ENDPOINT.ME}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(data);
      } catch (error) {
        console.log(error);
        sessionStorage.removeItem("fertintelligence_user_token");
      }
    };
    if (payload) {
      getUserFromStorage(payload);
    }
  }, [navigate, setUser, user]);

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
        username: signInForm.login!,
        password: signInForm.senha!,
      };
      sendSignInForm.mutate(payload);
    } else {
      console.log("Campos inválidos no login");
    }
  };

  return (
    <UserLayout>
      <FertName subtitle="Acesse sua conta" />
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
          {serverError && (
            <Box
              bg="red.100"
              color="red.700"
              p={3}
              borderRadius="md"
              mb={4}
              textAlign="center"
              fontSize="sm"
            >
              <Text>{serverError}</Text>
            </Box>
          )}
          <VStack spacing={4} align="stretch">
            <FormControl isDisabled={!isServerHealthy}>
              <FormLabel textAlign="left">Username</FormLabel>
              <Input
                name="login"
                value={signInForm.login || ""}
                onChange={handleSignInChange}
                placeholder="Digite aqui seu nome de usuário"
                width="100%"
                _placeholder={{
                  color: "gray.800",
                  _dark: { color: "gray.400" },
                }}
              />
            </FormControl>
            <FormControl isDisabled={!isServerHealthy}>
              <FormLabel textAlign="left">Senha</FormLabel>
              <PasswordInput
                name="senha"
                value={signInForm.senha || ""}
                onChange={(e) =>
                  setSignInForm({ ...signInForm, senha: e.target.value })
                }
                placeholder="Digite aqui sua senha"
                width="100%"
                _placeholder={{
                  color: "gray.800",
                  _dark: { color: "gray.400" },
                }}
              />
            </FormControl>
            <Button
              colorScheme="blue"
              width="full"
              onClick={submitLogin}
              isDisabled={!isServerHealthy}
            >
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
    </UserLayout>
  );
}