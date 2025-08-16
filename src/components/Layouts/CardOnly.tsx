import { ReactNode } from "react";
import { Presence, Flex, Image, Box } from "@chakra-ui/react";
import { ToggleTheme } from "@/components/ToggleTheme/ToggleTheme";
import agricultoresImg from '@/assets/agricultores.jpeg';

type CardOnlyProps = {
  children: ReactNode;
};

export default function CardOnly({ children }: CardOnlyProps) {
  return (
    <Presence present={true} animationName={{ _open: "fade-in" }} animationDuration="slow">
      <Flex
        height="100vh"
        bg="gray.900"
        _dark={{ bg: "gray.900" }}
        alignItems="center"
        justifyContent="center"
        position="relative"
      >
        <Image
          src={agricultoresImg}
          alt="Fundo agricultores"
          objectFit="cover"
          position="absolute"
          inset={0}
          opacity={0.15}
          zIndex={0}
          userSelect="none"
          width="100%"
          height="100%"
        />

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
          {children}
          
        </Box>

        <Box mt={8} textAlign="center">
            <ToggleTheme />
          </Box>

      </Flex>
    </Presence>
  );
}