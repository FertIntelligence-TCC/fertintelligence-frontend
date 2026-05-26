import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import UserLayout from "@/components/Layouts/UserLayout";
import { useUserStore } from "@/stores/user/user.store";
import { getImageFromMongoDB, updateImageMongoDB, uploadImageMongoDB } from "@/services/imageService";
import { updateUser } from "@/services/userService";
import type { User } from "@/interfaces/Models";

export default function UpdateProfilePhoto() {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user) as User | null;
  const setUser = useUserStore((state) => state.setUser);

  const currentPhotoId = useMemo(
    () => (user as any)?.idfoto || (user as any)?.idFoto || "",
    [user]
  );

  const [currentImage, setCurrentImage] = useState<string>("");
  const [newImageBase64, setNewImageBase64] = useState<string>("");
  const [previewImage, setPreviewImage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    const loadCurrentImage = async () => {
      if (!currentPhotoId) {
        setCurrentImage("");
        return;
      }

      const image = await getImageFromMongoDB(currentPhotoId);
      if (active && image) {
        setCurrentImage(image);
      }
    };

    loadCurrentImage();
    return () => {
      active = false;
    };
  }, [currentPhotoId]);

  const handleSelectImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = String(reader.result || "");
      if (!base64.startsWith("data:image")) {
        setError("Selecione um arquivo de imagem válido.");
        return;
      }

      setError("");
      setSuccess("");
      setNewImageBase64(base64);
      setPreviewImage(base64);
    };

    reader.readAsDataURL(file);
  };

  const handleSavePhoto = async () => {
    if (!newImageBase64) {
      setError("Selecione uma imagem antes de salvar.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const imageResponse = currentPhotoId
        ? await updateImageMongoDB(newImageBase64, currentPhotoId)
        : await uploadImageMongoDB(newImageBase64);

      const newPhotoId = imageResponse?._id || currentPhotoId;

      if (!newPhotoId) {
        throw new Error("Não foi possível obter o ID da nova imagem.");
      }

      await updateUser({ novo_idfoto: newPhotoId });

      if (user) {
        setUser({
          ...user,
          idfoto: newPhotoId,
        });
      }

      sessionStorage.setItem("userImage", newImageBase64);
      setSuccess("Foto atualizada com sucesso!");
      navigate("/fertintelligence/home");
    } catch (err) {
      console.error("Erro ao atualizar foto de perfil:", err);
      setError("Não foi possível atualizar a foto. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserLayout>
      <Flex minH="80vh" justify="center" align="center" p={6}>
        <VStack w="full" maxW="500px" gap={4} align="stretch">
          <Heading size="lg" textAlign="center">Mudar foto de perfil</Heading>

          <Box borderWidth="1px" borderRadius="md" p={4}>
            <Text fontWeight="semibold" mb={3}>Foto atual</Text>
            {currentImage ? (
              <Image src={currentImage} alt="Foto atual" maxH="220px" w="full" objectFit="contain" borderRadius="md" />
            ) : (
              <Text color="gray.500">Você ainda não possui foto cadastrada.</Text>
            )}
          </Box>

          <Box borderWidth="1px" borderRadius="md" p={4}>
            <Text fontWeight="semibold" mb={3}>Nova foto</Text>
            <Input type="file" accept="image/*" onChange={handleSelectImage} />
            {previewImage && (
              <Image mt={4} src={previewImage} alt="Pré-visualização da nova foto" maxH="220px" w="full" objectFit="contain" borderRadius="md" />
            )}
          </Box>

          {error && <Alert.Root status="error" borderRadius="md"><Alert.Indicator /><Alert.Content><Alert.Title>{error}</Alert.Title></Alert.Content></Alert.Root>}
          {success && <Alert.Root status="success" borderRadius="md"><Alert.Indicator /><Alert.Content><Alert.Title>{success}</Alert.Title></Alert.Content></Alert.Root>}

          <Flex justify="flex-end" gap={3}>
            <Button variant="outline" onClick={() => navigate("/fertintelligence/home")}>Cancelar</Button>
            <Button colorScheme="green" onClick={handleSavePhoto} loading={loading}>Salvar foto</Button>
          </Flex>
        </VStack>
      </Flex>
    </UserLayout>
  );
}
