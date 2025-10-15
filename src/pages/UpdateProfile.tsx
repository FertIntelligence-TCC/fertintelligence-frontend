// pages/UpdateProfile.tsx

import { useState } from "react";
import {
  Button,
  Input,
  VStack,
  Heading,
  Box,
  Text,
  Flex,
  Icon // Mantém Icon
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { FiUploadCloud } from "react-icons/fi";
import FertName from "@/components/FertName/FertName";
import UserLayout from "@/components/Layouts/UserLayout";
import { useUserStore } from "../stores/user/user.store";
import { User } from "../interfaces/Models";

// Chave para salvar os dados temporariamente
const UPDATE_PROFILE_DATA_KEY = "fertintelligence_update_profile_data";

export default function UpdateProfile() {
  const navigate = useNavigate();
  // REMOVIDO: const toast = useToast();
  
  // Assume que 'user' está disponível via PrivateRoute
  const user = useUserStore((state) => state.user) as User; 
  
  const [profileForm, setProfileForm] = useState({
    // Usa 'login' para nome de usuário (baseado na estrutura SignInResponse/User)
    name: user?.login || "", 
    // Usa 'email' (baseado na estrutura SignInResponse/User)
    email: user?.email || "",
    // Usa 'idade' (baseado na estrutura SignInResponse/User)
    age: user?.idade?.toString() || "", 
    photo: null as File | null,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm({ ...profileForm, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileForm({ ...profileForm, photo: e.target.files[0] });
    }
  };

  const handleSubmit = () => {
    // 1. Validação básica
    if (!profileForm.name || !profileForm.email || !profileForm.age) {
        alert("Erro de validação: Preencha todos os campos obrigatórios.");
        return;
    }

    // 2. Salva os novos dados na sessão
    sessionStorage.setItem(UPDATE_PROFILE_DATA_KEY, JSON.stringify({
        novo_login: profileForm.name,
        novo_email: profileForm.email,
        nova_age: parseInt(profileForm.age, 10),
        // Mantém o id_foto atual
        id_nova_foto: user?.id_foto || "", 
    }));
    
    // 3. Navega para a verificação de senha
    navigate("/fertintelligence/password-verification");
  };

  return (
    <UserLayout>
      <FertName subtitle="Atualize seus dados" />

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
            Editar Perfil
          </Heading>

          <VStack spacing={4} align="stretch">
            <Box>
              <Text textAlign="left" mb={1}>Nome de Usuário</Text>
              <Input
                name="name"
                value={profileForm.name}
                onChange={handleInputChange}
                placeholder="Seu nome"
                _placeholder={{ color: "gray.800", _dark: { color: "gray.400" } }}
              />
            </Box>

            <Box>
              <Text textAlign="left" mb={1}>Email</Text>
              <Input
                type="email"
                name="email"
                value={profileForm.email}
                onChange={handleInputChange}
                placeholder="Seu email"
                _placeholder={{ color: "gray.800", _dark: { color: "gray.400" } }}
              />
            </Box>

            <Box>
              <Text textAlign="left" mb={1}>Idade</Text>
              <Input
                type="number"
                name="age"
                value={profileForm.age}
                onChange={handleInputChange}
                placeholder="Sua idade"
                _placeholder={{ color: "gray.800", _dark: { color: "gray.400" } }}
              />
            </Box>

            {/* Campo de Foto de Perfil estilizado */}
            <Box>
              <Text textAlign="left" mb={1}>Foto de Perfil</Text>
              <Input
                type="file"
                name="photo"
                id="photo-upload"
                onChange={handleFileChange}
                display="none"
              />
              <Button
                as="label"
                htmlFor="photo-upload"
                width="100%"
                variant="outline"
                colorScheme="gray"
                cursor="pointer"
              >
                <Icon as={FiUploadCloud} mr={2} />
                {profileForm.photo ? profileForm.photo.name : "Procurar..."}
              </Button>
            </Box>

            <Button colorScheme="blue" width="full" onClick={handleSubmit}>
              Concluir
            </Button>
          </VStack>
        </Box>
      </Flex>
    </UserLayout>
  );
}