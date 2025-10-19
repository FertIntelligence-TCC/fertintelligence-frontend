import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { createUser } from "@/services/userService";
import {
  SignUpPayload,
  DataNasc,
  Telefone,
  Genero,
  Formacao,
  Cargo,
} from "@/interfaces/ServicePayload";
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
  SimpleGrid,
  chakra,
} from "@chakra-ui/react";

export default function SignUpPage() {
  const navigate = useNavigate();

  // Gera apenas valores string de enums (evita números em enums numéricos)
  const enumOptions = (obj: Record<string, unknown>) =>
    Object.values(obj).filter((v) => typeof v === "string") as string[];

  const generoOptions = enumOptions(Genero);
  const formacaoOptions = enumOptions(Formacao);
  const cargoOptions = enumOptions(Cargo);

  const [signUpForm, setSignUpForm] = useState({
    name: "",
    username: "",
    email: "",
    cpf: "",
    datanasc: "",
    telefone: "",
    genero: "",
    formacao: "",
    profissao: "",
    cargo: "",
    password: "",
    repeatPassword: "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleSignUpChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setSignUpForm({ ...signUpForm, [e.target.name]: e.target.value });
    setError(null);
  };

  // Converte "dd/mm/aaaa" em DataNasc
  const parseDataNasc = (dateString: string): DataNasc | null => {
    const parts = dateString.split("/");
    if (parts.length !== 3) return null;
    const [dia, mes, ano] = parts.map(Number);
    if (isNaN(dia) || isNaN(mes) || isNaN(ano)) return null;
    if (dia < 1 || dia > 31 || mes < 1 || mes > 12 || ano < 1900) return null;
    return { dia, mes, ano };
  };

  // Converte "+55 83 99121-4231" em Telefone
  const parseTelefone = (telString: string): Telefone | null => {
    const parts = telString.split(" ");
    if (parts.length !== 3) return null;
    const [pais, ddd, numero] = parts;
    if (!pais.startsWith("+") || pais.length < 3) return null;
    if (ddd.length !== 2) return null;
    return { pais, ddd, numero };
  };

  const validateSignUp = () => {
    const {
      name,
      username,
      email,
      cpf,
      datanasc,
      telefone,
      genero,
      formacao,
      profissao,
      cargo,
      password,
      repeatPassword,
    } = signUpForm;

    if (
      !name ||
      !username ||
      !email ||
      !cpf ||
      !datanasc ||
      !telefone ||
      !genero ||
      !formacao ||
      !profissao ||
      !cargo ||
      !password ||
      !repeatPassword
    ) {
      setError("Por favor, preencha todos os campos.");
      return false;
    }

    if (password !== repeatPassword) {
      setError("As senhas não coincidem.");
      return false;
    }

    if (cpf.length !== 11 || isNaN(Number(cpf))) {
      setError("O CPF deve conter 11 dígitos numéricos.");
      return false;
    }

    const parsedDate = parseDataNasc(datanasc);
    if (!parsedDate) {
      setError("Data de nascimento inválida. Use o formato dd/mm/aaaa.");
      return false;
    }

    const parsedTel = parseTelefone(telefone);
    if (!parsedTel) {
      setError(
        "Telefone inválido. Use o formato '+XX XX XXXXX-XXXX' (ex: +55 83 99121-4231)."
      );
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

    const parsedDataNasc = parseDataNasc(signUpForm.datanasc)!;
    const parsedTelefone = parseTelefone(signUpForm.telefone)!;

    const payload: SignUpPayload = {
      name: signUpForm.name,
      login: signUpForm.username,
      email: signUpForm.email,
      cpf: signUpForm.cpf,
      datanasc: parsedDataNasc,
      telefone: parsedTelefone,
      genero: signUpForm.genero as Genero,
      formacao: signUpForm.formacao as Formacao,
      profissao: signUpForm.profissao,
      cargo: signUpForm.cargo as Cargo,
      password: signUpForm.password,
    };

    signUpMutation.mutate(payload);
  };

  // Select nativo estilizado com Chakra
  const NativeSelect = chakra("select", {
    baseStyle: {
      height: "40px",
      px: 3,
      borderWidth: "1px",
      borderRadius: "md",
      bg: "white",
      _dark: { bg: "gray.800" },
      _focusVisible: { outline: "2px solid", outlineColor: "blue.400" },
    },
  });

  return (
    <UserLayout>
      <FertName subtitle="Crie sua conta" />

      <Flex
        justifyContent="center"
        alignItems="center"
        minH="100vh"
        position="absolute"
        inset={0}
        py={8}
      >
        <Box
          bg="whiteAlpha.600"
          _dark={{ bg: "blackAlpha.600" }}
          p={8}
          borderRadius="md"
          boxShadow="lg"
          width={{ base: "90%", md: "800px" }}
          backdropFilter="blur(4px)"
          zIndex={1}
          my={{ base: 10, md: 20 }}
        >
          <Heading mb={6} textAlign="center" size="lg">
            Cadastro
          </Heading>

          <VStack spacing={6} align="stretch">
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

            <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
              <Box>
                <Text mb={1}>Nome Completo</Text>
                <Input
                  name="name"
                  value={signUpForm.name}
                  onChange={handleSignUpChange}
                  placeholder="Digite seu nome completo"
                />
              </Box>

              <Box>
                <Text mb={1}>Nome de Usuário (Login)</Text>
                <Input
                  name="username"
                  value={signUpForm.username}
                  onChange={handleSignUpChange}
                  placeholder="Digite seu nome de usuário"
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
                />
              </Box>

              <Box>
                <Text mb={1}>CPF (somente números)</Text>
                <Input
                  name="cpf"
                  value={signUpForm.cpf}
                  onChange={handleSignUpChange}
                  placeholder="12345678901"
                  maxLength={11}
                />
              </Box>

              <Box>
                <Text mb={1}>Data de Nascimento</Text>
                <Input
                  name="datanasc"
                  value={signUpForm.datanasc}
                  onChange={handleSignUpChange}
                  placeholder="dd/mm/aaaa"
                />
              </Box>

              <Box>
                <Text mb={1}>Telefone</Text>
                <Input
                  name="telefone"
                  value={signUpForm.telefone}
                  onChange={handleSignUpChange}
                  placeholder="+55 83 99121-4231"
                />
              </Box>

              <Box>
                <Text mb={1}>Gênero</Text>
                <NativeSelect
                  name="genero"
                  value={signUpForm.genero}
                  onChange={handleSignUpChange}
                >
                  <option value="">Selecione seu gênero</option>
                  {generoOptions.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </NativeSelect>
              </Box>

              <Box>
                <Text mb={1}>Formação</Text>
                <NativeSelect
                  name="formacao"
                  value={signUpForm.formacao}
                  onChange={handleSignUpChange}
                >
                  <option value="">Selecione sua formação</option>
                  {formacaoOptions.map((f) => (
                    <option key={f} value={f}>
                      {String(f).replace(/_/g, " ")}
                    </option>
                  ))}
                </NativeSelect>
              </Box>

              <Box>
                <Text mb={1}>Profissão</Text>
                <Input
                  name="profissao"
                  value={signUpForm.profissao}
                  onChange={handleSignUpChange}
                  placeholder="Ex: Engenheiro Agrônomo"
                />
              </Box>

              <Box>
                <Text mb={1}>Cargo</Text>
                <NativeSelect
                  name="cargo"
                  value={signUpForm.cargo}
                  onChange={handleSignUpChange}
                >
                  <option value="">Selecione seu cargo</option>
                  {cargoOptions.map((c) => (
                    <option key={c} value={c}>
                      {String(c).replace(/_/g, " ")}
                    </option>
                  ))}
                </NativeSelect>
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
            </SimpleGrid>

            <Button
              colorScheme="blue"
              width="full"
              onClick={submitSignUp}
              isLoading={signUpMutation.isLoading}
              mt={4}
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

// 166.389.534-19
