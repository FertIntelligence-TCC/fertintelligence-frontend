import { Box, Button, VStack, Icon, HStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { FiSettings } from "react-icons/fi";
import { useUserStore } from "@/stores/user/user.store";
import { Avatar } from "../ui/avatar";
import { getImageFromMongoDB } from "@/services/imageService";
import { User } from "@/interfaces/Models";

export default function ConfigMenu() {
  const navigate = useNavigate();
  const setUser = useUserStore((state) => state.setUser);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileImageOpen, setIsProfileImageOpen] = useState(false);
  const menuRef = useRef(null);
  const user = useUserStore((s) => s.user) as User | null;
  const [userImage, setUserImage] = useState(sessionStorage.getItem("userImage") || "");
  const [loadingUser, setLoadingUser] = useState(true);

  // Função para lidar com o clique fora do menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !(menuRef.current as HTMLElement).contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  // Função de clique dos itens do menu
  const handleMenuItemClick = (path: string) => {
    setIsMenuOpen(false); // Fecha o menu
    navigate(path);
  };

  const handleLogout = () => {
    setIsMenuOpen(false);
    sessionStorage.removeItem("fertintelligenceToken");
    sessionStorage.removeItem("userImage"); // Limpa a imagem ao sair
    setUser(undefined);
    navigate("/fertintelligence/", { replace: true });
  };

  useEffect(() => {
    let isMounted = true;
  
    async function loadUserImage() {
      // Cláusula de guarda: bloqueia a requisição se não houver usuário ou id da foto
      if (!user || !user.idfoto) {
        if (isMounted) setLoadingUser(false);
        return;
      }
  
      try {
        const image = await getImageFromMongoDB(user.idfoto);
    
        if (isMounted && image) {
          setUserImage(image);
          sessionStorage.setItem("userImage", image);
        }
      } catch (error) {
        console.error("Erro ao buscar imagem no MongoDB:", error);
      } finally {
        if (isMounted) {
          setLoadingUser(false);
        }
      }
    }
  
    loadUserImage();
  
    return () => {
      isMounted = false;
    };
  }, [user]);

  return (
    <Box position="fixed" top={4} right={4} ref={menuRef} zIndex={1000}>
      <HStack>
        <Avatar
          size={"xs"}
          name={user?.nome || "User"}
          src={userImage}
          cursor="pointer"
          onClick={() => setIsProfileImageOpen(true)}
        />
        <Icon
          as={FiSettings}
          w={6}
          h={6}
          cursor="pointer"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        />
      </HStack>
      {isProfileImageOpen && (
        <Box
          position="fixed"
          inset={0}
          bg="blackAlpha.700"
          display="flex"
          alignItems="center"
          justifyContent="center"
          p={4}
          zIndex={3000}
          onClick={() => setIsProfileImageOpen(false)}
        >
          <Box onClick={(event) => event.stopPropagation()}>
            {userImage ? (
              <img
                src={userImage}
                alt={`Foto de perfil de ${user?.nome || "User"}`}
                style={{
                  maxWidth: "90vw",
                  maxHeight: "80vh",
                  width: "auto",
                  height: "auto",
                  objectFit: "contain",
                  borderRadius: "0.75rem",
                  boxShadow: "var(--chakra-shadows-2xl)",
                }}
              />
            ) : (
              <Avatar
                size="2xl"
                name={user?.nome || "User"}
                src={userImage}
              />
            )}
          </Box>
        </Box>
      )}
      {isMenuOpen && (
        <VStack
          position="absolute"
          top="100%"
          right={0}
          mt={2}
          spacing={0}
          bg={{ base: "white", _dark: "gray.700" }}
          _light={{ color: "black", _hover: { bg: "gray.100" } }}
          _dark={{ color: "white", _hover: { bg: "whiteAlpha.200" } }}
          borderWidth="1px"
          borderRadius="md"
          boxShadow="md"
          p={2}
          zIndex={1}
        >
          <Button
            variant="ghost"
            width="100%"
            justifyContent="flex-start"
            onClick={() => handleMenuItemClick("/fertintelligence/update-profile")}
          >
            Editar Perfil
          </Button>
          <Button
            variant="ghost"
            width="100%"
            justifyContent="flex-start"
            onClick={() => handleMenuItemClick("/fertintelligence/update-password")}
          >
            Mudar senha
          </Button>
          <Button
            variant="ghost"
            width="100%"
            justifyContent="flex-start"
            onClick={() => handleMenuItemClick("/fertintelligence/update-profile-photo")}
          >
            Mudar Foto
          </Button>
          <Button
            variant="ghost"
            width="100%"
            justifyContent="flex-start"
            onClick={() => handleMenuItemClick("/fertintelligence/delete-profile")}
            color="pink.500"
            _hover={{ bg: "red.500", color: "white" }}
          >
            Deletar Perfil
          </Button>
          <Button
            variant="ghost"
            width="100%"
            justifyContent="flex-start"
            onClick={handleLogout}
          >
            Sair
          </Button>
        </VStack>
      )}
    </Box>
  );
}