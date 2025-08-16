import { useState } from "react";
import {
  Button,
  Input,
  VStack,
  Heading,
  Box,
  Text,
  Flex,
  Icon // Importa Icon
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { FiUploadCloud } from "react-icons/fi"; // Importa um ícone de upload
import FertName from "@/components/FertName/FertName";
import UserLayout from "@/components/Layouts/UserLayout";

export default function UpdateProfile() {
  const navigate = useNavigate();
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    age: "",
    photo: null,
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
    console.log("Dados do perfil a serem atualizados:", profileForm);
    navigate("/fertintelligence/home");
  };

  return (
    <UserLayout>
      {/* Legenda no canto superior esquerdo */}
      <FertName subtitle="Atualize seus dados" />

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
            Editar Perfil
          </Heading>

          <VStack spacing={4} align="stretch">
            <Box>
              <Text textAlign="left" mb={1}>Nome</Text>
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
              {/* Input escondido */}
              <Input
                type="file"
                name="photo"
                id="photo-upload" // Adiciona um ID para vincular ao label
                onChange={handleFileChange}
                display="none" // Esconde o input de arquivo padrão
              />
              {/* Botão para acionar o Input de arquivo */}
              <Button
                as="label"
                htmlFor="photo-upload" // Ativa o input de arquivo ao clicar no botão
                width="100%"
                variant="outline"
                colorScheme="gray"
                cursor="pointer"
              >
                <Icon as={FiUploadCloud} mr={2} /> {/* Adiciona um ícone */}
                {profileForm.photo ? "Arquivo selecionado" : "Procurar..."}
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