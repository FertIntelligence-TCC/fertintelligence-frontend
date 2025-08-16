import { Box, Flex, Image } from "@chakra-ui/react";
import { ReactNode } from "react";
import { ToggleTheme } from "@/components/ToggleTheme/ToggleTheme";
import agricultoresImg from '@/assets/agricultores.jpeg';

type HomeLayoutProps = {
  children: ReactNode;
};

export default function HomeLayout({ children }: HomeLayoutProps) {
  return (
    <Flex
      direction="column"
      minH="100vh"
      position="relative"
      bg="gray.800"
      _dark={{ bg: "gray.800" }}>

      {/* Imagem de fundo */}
      <Image
        src={agricultoresImg}
        alt="Fundo de agricultores"
        objectFit="cover"
        position="absolute"
        inset={0}
        opacity={0.15} // Reduz a opacidade para que o conteúdo seja legível
        zIndex={0} // Garante que a imagem fique no fundo
        userSelect="none"
        width="100%"
        height="100%"
      />

      {/* Conteúdo principal da página */}
      <Box
        p={6}
        flex="1"
        zIndex = {1}
      >
        {children}
      </Box>

      {/* Canto inferior direito: alternador de tema */}
      <Box mt={8} textAlign="center" zIndex = {1}>
        <ToggleTheme />
      </Box>
    </Flex>
  );
}