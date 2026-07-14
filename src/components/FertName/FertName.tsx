import { Box, Text, HStack, Image } from "@chakra-ui/react";
import logo from "../../assets/fertintelligence-logo.svg";

type FertNameProps = {
  subtitle?: string;
};

export default function FertName({ subtitle }: FertNameProps) {
  return (
    <Box position="fixed" top={4} left={4} zIndex={1}>
      <HStack gap={3} align="center">
        <Image
          src={logo}
          alt="Logo FertIntelligence"
          boxSize="52px"
          objectFit="contain"
        />

        <Box>
          <Text fontWeight="bold" fontSize="xl" color="white">
            FertIntelligence, sistema de recomendação para adubação.
          </Text>

          {subtitle && (
            <Text fontSize="md" color="white">
              {subtitle}
            </Text>
          )}
        </Box>
      </HStack>
    </Box>
  );
}