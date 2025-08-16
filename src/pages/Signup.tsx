import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { createUser, authenticateUser } from "@/services/userService";
import { SignUpPayload } from "@/interfaces/ServicePayload";
import { PasswordInput } from "@/components/ui/password-input";
import CardOnly from "@/components/Layouts/CardOnly";

import {
  Button,
  Text,
  Input,
  VStack,
  Heading,
} from "@chakra-ui/react";

import { FormControl, FormLabel } from "@chakra-ui/form-control";

export default function SignUpPage() {
  const navigate = useNavigate();

  const [signUpForm, setSignUpForm] = useState<{
    login?: string;
    email?: string;
    idade?: string;
    senha?: string;
    senhaRepetida?: string;
  }>({});

  const handleSignUpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignUpForm({ ...signUpForm, [e.target.name]: e.target.value });
  };

  function validateSignUp() {
    return (
      signUpForm.login &&
      signUpForm.email &&
      signUpForm.idade &&
      signUpForm.senha &&
      signUpForm.senha === signUpForm.senhaRepetida
    );
  }

  const sendSignUpForm = useMutation({
    mutationKey: ["createUser"],
    mutationFn: createUser,
    onSuccess: () => {
      authenticateUser({
        login: signUpForm.login!,
        senha: signUpForm.senha!,
      });
      navigate("/grimoire/home");
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const submitSignUp = () => {
    if (validateSignUp()) {
      const payload: SignUpPayload = {
        login: signUpForm.login!,
        email: signUpForm.email!,
        idade: parseInt(signUpForm.idade!, 10),
        senha: signUpForm.senha!,
      };
      sendSignUpForm.mutate(payload);
    } else {
      console.log("Campos inválidos no cadastro ou senhas não coincidem");
    }
  };

  return (
    <CardOnly>
      <Heading mb={6} textAlign="center" size="lg">
        Cadastro
      </Heading>

      <VStack spacing={4} align="stretch">
        <FormControl>
          <FormLabel textAlign="left">Username</FormLabel>
          <Input
            name="login"
            value={signUpForm.login || ""}
            onChange={handleSignUpChange}
            placeholder="Username"
            width="100%"
            _placeholder={{ color: "gray.800", _dark: { color: "gray.400" } }}
          />
        </FormControl>

        <FormControl>
          <FormLabel textAlign="left">Email</FormLabel>
          <Input
            type="email"
            name="email"
            value={signUpForm.email || ""}
            onChange={handleSignUpChange}
            placeholder="Email"
            width="100%"
            _placeholder={{ color: "gray.800", _dark: { color: "gray.400" } }}
          />
        </FormControl>

        <FormControl>
          <FormLabel textAlign="left">Idade</FormLabel>
          <Input
            type="number"
            min={0}
            name="idade"
            value={signUpForm.idade || ""}
            onChange={handleSignUpChange}
            placeholder="Idade"
            width="100%"
            _placeholder={{ color: "gray.800", _dark: { color: "gray.400" } }}
          />
        </FormControl>

        <FormControl>
          <FormLabel textAlign="left">Senha</FormLabel>
          <PasswordInput
            name="senha"
            value={signUpForm.senha || ""}
            onChange={(e) =>
              setSignUpForm({ ...signUpForm, senha: e.target.value })
            }
            placeholder="Senha"
            width="100%"
            _placeholder={{ color: "gray.800", _dark: { color: "gray.400" } }}
          />
        </FormControl>

        <FormControl>
          <FormLabel textAlign="left">Repita a senha</FormLabel>
          <PasswordInput
            name="senhaRepetida"
            value={signUpForm.senhaRepetida || ""}
            onChange={(e) =>
              setSignUpForm({ ...signUpForm, senhaRepetida: e.target.value })
            }
            placeholder="Repita a senha"
            width="100%"
            _placeholder={{ color: "gray.800", _dark: { color: "gray.400" } }}
          />
        </FormControl>

        <Button colorScheme="blue" width="full" onClick={submitSignUp}>
          Cadastrar
        </Button>

        <Text
          fontSize="sm"
          color="blue.800"
          _dark={{ color: "blue.500" }}
          cursor="pointer"
          onClick={() => navigate("/login")}
          textAlign="center"
          userSelect="none"
          position="relative"
          zIndex={2}
        >
          Já tem uma conta? Entre aqui!
        </Text>
      </VStack>
    </CardOnly>
  );
}