import { Box, Text } from "@chakra-ui/react";

type FertNameProps = {
  subtitle?: string;
};

export default function FertName({ subtitle }: FertNameProps) {
  return (
    <Box position="fixed" top={4} left={4} zIndex={1}>
      <Text fontWeight="bold" fontSize="xl" color="white">
        FertIntelligence, sistema de recomendação para adubação.
        <br />
        {subtitle && (
          <Text as="span" fontSize="md" fontWeight="normal">
            {subtitle}
          </Text>
        )}
      </Text>
    </Box>
  );
}