import { Box, Button, VStack, Icon } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { FiSettings } from "react-icons/fi";

export default function ConfigMenu() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Estado para controlar a abertura do menu
  const menuRef = useRef(null); // Referência para o menu

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

  return (
    <Box position="fixed" top={4} right={4} ref={menuRef}>
      <Icon
        as={FiSettings}
        w={6}
        h={6}
        cursor="pointer"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      />
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
            onClick={() => handleMenuItemClick("/mudar-senha")}
          >
            Mudar senha
          </Button>
          <Button
            variant="ghost"
            width="100%"
            justifyContent="flex-start"
            onClick={() => handleMenuItemClick("/fertintelligence/delete-profile")}
            color="pink.500" // Cor do texto rosa
            _hover={{ bg: "red.500", color: "white" }} // Cor vermelha no hover
          >
            Deletar Perfil
          </Button>
          <Button
            variant="ghost"
            width="100%"
            justifyContent="flex-start"
            onClick={() => handleMenuItemClick("/logout")}
          >
            Sair
          </Button>
        </VStack>
      )}
    </Box>
  );
}