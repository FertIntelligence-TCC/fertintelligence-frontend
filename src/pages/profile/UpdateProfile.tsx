// src/pages/UpdateProfile.tsx
import { useEffect, useState } from "react";
import {
  Button,
  Input,
  VStack,
  Heading,
  Box,
  Text,
  Flex,
  Icon,
  SimpleGrid,
  chakra,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { FiUploadCloud } from "react-icons/fi";
import FertName from "@/components/FertName/FertName";
import UserLayout from "@/components/Layouts/UserLayout";
import { useUserStore } from "../../stores/user/user.store";
import type { User } from "@/interfaces/Models";
import {
  DataNasc,
  Telefone,
  Genero,
  Formacao,
  Cargo,
} from "@/interfaces/ServicePayload";

const UPDATE_PROFILE_DATA_KEY = "fertintelligence_update_profile_data";

// -- Helpers de formatação
const formatDate = (d?: DataNasc): string => {
  if (!d) return "";
  return `${String(d.dia).padStart(2, "0")}/${String(d.mes).padStart(
    2,
    "0"
  )}/${d.ano}`;
};
const formatTel = (t?: Telefone): string => {
  if (!t) return "";
  return `${t.pais} ${t.ddd} ${t.numero}`;
};

// -- Parsers (iguais ao Signup)
const parseDataNasc = (s: string): DataNasc | null => {
  const parts = s.split("/");
  if (parts.length !== 3) return null;
  const [dia, mes, ano] = parts.map(Number);
  if (isNaN(dia) || isNaN(mes) || isNaN(ano)) return null;
  if (dia < 1 || dia > 31 || mes < 1 || mes > 12 || ano < 1900) return null;
  return { dia, mes, ano };
};
const parseTelefone = (s: string): Telefone | null => {
  const parts = s.split(" ");
  if (parts.length !== 3) return null;
  const [pais, ddd, numero] = parts;
  if (!pais.startsWith("+") || pais.length < 3) return null;
  if (ddd.length !== 2) return null;
  return { pais, ddd, numero };
};

const enumOptions = (obj: Record<string, unknown>) =>
  Object.values(obj).filter((v) => typeof v === "string") as string[];

// Select nativo estilizado (igual ao Signup)
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

export default function UpdateProfile() {
  const navigate = useNavigate();
  const user = useUserStore((s) => s.user) as User | null;

  const generoOptions = enumOptions(Genero);
  const formacaoOptions = enumOptions(Formacao);
  const cargoOptions = enumOptions(Cargo);

  // Estado com os MESMOS CAMPOS do cadastro (inclui `foto` como string)
  const [profileForm, setProfileForm] = useState({
    name: "",
    username: "",
    email: "",
    cpf: "",
    datanasc: "",     // dd/mm/aaaa
    telefone: "",     // +XX XX XXXXX-XXXX
    genero: "",
    formacao: "",
    profissao: "",
    cargo: "",
    foto: "",         // *** string (URL/base64/id) ***
  });
  const [error, setError] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Hidrata o formulário quando `user` estiver disponível
  useEffect(() => {
    // Enquanto Zustand persiste/hidrata
    if (!user) {
      setLoadingUser(false);
      return;
    }
    setProfileForm({
      name: (user as any)?.name ?? "",
      username: (user as any)?.login ?? "",
      email: user.email ?? "",
      cpf: (user as any)?.cpf ?? "",
      datanasc: formatDate((user as any)?.datanasc),
      telefone: formatTel((user as any)?.telefone),
      genero: (user as any)?.genero ?? "",
      formacao: (user as any)?.formacao ?? "",
      profissao: (user as any)?.profissao ?? "",
      cargo: (user as any)?.cargo ?? "",
      // aceita tanto user.foto (string) quanto id_foto legado
      foto: (user as any)?.foto ?? (user as any)?.id_foto ?? "",
    });
    setLoadingUser(false);
  }, [user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  // Opcional: permitir upload e converter para base64 para preencher `foto` (string)
  const handleFileToString = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      // reader.result é dataURL base64 (string)
      setProfileForm((prev) => ({ ...prev, foto: String(reader.result || "") }));
    };
    reader.readAsDataURL(f);
    setError(null);
  };

  const validate = (): boolean => {
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
      // foto pode ser opcional no update (mantenha se precisar exigir)
    } = profileForm;

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
      !cargo
    ) {
      setError("Por favor, preencha todos os campos obrigatórios.");
      return false;
    }

    if (cpf.length !== 11 || isNaN(Number(cpf))) {
      setError("O CPF deve conter 11 dígitos numéricos.");
      return false;
    }
    if (!parseDataNasc(datanasc)) {
      setError("Data de nascimento inválida. Use o formato dd/mm/aaaa.");
      return false;
    }
    if (!parseTelefone(telefone)) {
      setError(
        "Telefone inválido. Use o formato '+XX XX XXXXX-XXXX' (ex: +55 83 99121-4231)."
      );
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const parsedDataNasc = parseDataNasc(profileForm.datanasc)!;
    const parsedTelefone = parseTelefone(profileForm.telefone)!;

    // Payload UNIFICADO (mesma estrutura do Signup)
    const unifiedPayload = {
      name: profileForm.name,
      username: profileForm.username,
      email: profileForm.email,
      cpf: profileForm.cpf,
      datanasc: parsedDataNasc,
      telefone: parsedTelefone,
      genero: profileForm.genero as keyof typeof Genero,
      formacao: profileForm.formacao as keyof typeof Formacao,
      profissao: profileForm.profissao,
      cargo: profileForm.cargo as keyof typeof Cargo,
      foto: profileForm.foto, // *** string ***
    };

    // 1) Compat: mantém as chaves antigas (se UpdateVerification ainda ler 'novo_*')
    const legacy = {
      novo_name: unifiedPayload.name,
      novo_username: unifiedPayload.username,
      novo_email: unifiedPayload.email,
      novo_cpf: unifiedPayload.cpf,
      nova_datanasc: unifiedPayload.datanasc,
      novo_telefone: unifiedPayload.telefone,
      novo_genero: unifiedPayload.genero,
      nova_formacao: unifiedPayload.formacao,
      nova_profissao: unifiedPayload.profissao,
      novo_cargo: unifiedPayload.cargo,
      id_nova_foto: unifiedPayload.foto, // agora também string
    };

    // 2) Novo: grava também o payload unificado (igual ao cadastro)
    sessionStorage.setItem(
      UPDATE_PROFILE_DATA_KEY,
      JSON.stringify({
        ...legacy,
        payload: unifiedPayload,
      })
    );

    navigate("/fertintelligence/password-verification");
  };

  if (loadingUser) {
    return (
      <UserLayout>
        <Box p={8} textAlign="center">
          <Heading size="md">Carregando seu perfil…</Heading>
          <Text mt={2}>Por favor, aguarde.</Text>
        </Box>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <FertName subtitle="Atualize seus dados" />
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
            Editar Perfil
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
                  value={profileForm.name}
                  onChange={handleInputChange}
                  placeholder="Digite seu nome completo"
                />
              </Box>

              <Box>
                <Text mb={1}>Nome de Usuário (Login)</Text>
                <Input
                  name="username"
                  value={profileForm.username}
                  onChange={handleInputChange}
                  placeholder="Digite seu nome de usuário"
                />
              </Box>

              <Box>
                <Text mb={1}>Email</Text>
                <Input
                  type="email"
                  name="email"
                  value={profileForm.email}
                  onChange={handleInputChange}
                  placeholder="Digite seu email"
                />
              </Box>

              <Box>
                <Text mb={1}>CPF (somente números)</Text>
                <Input
                  name="cpf"
                  value={profileForm.cpf}
                  onChange={handleInputChange}
                  placeholder="12345678901"
                  maxLength={11}
                />
              </Box>

              <Box>
                <Text mb={1}>Data de Nascimento</Text>
                <Input
                  name="datanasc"
                  value={profileForm.datanasc}
                  onChange={handleInputChange}
                  placeholder="dd/mm/aaaa"
                />
              </Box>

              <Box>
                <Text mb={1}>Telefone</Text>
                <Input
                  name="telefone"
                  value={profileForm.telefone}
                  onChange={handleInputChange}
                  placeholder="+55 83 99121-4231"
                />
              </Box>

              <Box>
                <Text mb={1}>Gênero</Text>
                <NativeSelect
                  name="genero"
                  value={profileForm.genero}
                  onChange={handleInputChange}
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
                  value={profileForm.formacao}
                  onChange={handleInputChange}
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
                  value={profileForm.profissao}
                  onChange={handleInputChange}
                  placeholder="Ex: Engenheiro Agrônomo"
                />
              </Box>

              <Box>
                <Text mb={1}>Cargo</Text>
                <NativeSelect
                  name="cargo"
                  value={profileForm.cargo}
                  onChange={handleInputChange}
                >
                  <option value="">Selecione seu cargo</option>
                  {cargoOptions.map((c) => (
                    <option key={c} value={c}>
                      {String(c).replace(/_/g, " ")}
                    </option>
                  ))}
                </NativeSelect>
              </Box>

              {/* FOTO como STRING */}
              <Box gridColumn={{ md: "span 2" }}>
                <Text mb={1}>Foto (string: URL / Base64 / ID)</Text>
                <Input
                  name="foto"
                  value={profileForm.foto}
                  onChange={handleInputChange}
                  placeholder="Cole aqui a URL/base64/ID da foto"
                />
                <Box mt={2}>
                  <Input
                    type="file"
                    accept="image/*"
                    id="foto-upload"
                    display="none"
                    onChange={handleFileToString}
                  />
                  <Button as="label" htmlFor="foto-upload" variant="outline" w="full">
                    <Icon as={FiUploadCloud} mr={2} />
                    Ou selecione um arquivo para converter em base64
                  </Button>
                </Box>
              </Box>
            </SimpleGrid>

            <Button colorScheme="blue" width="full" onClick={handleSubmit} mt={4}>
              Concluir
            </Button>
          </VStack>
        </Box>
      </Flex>
    </UserLayout>
  );
}
