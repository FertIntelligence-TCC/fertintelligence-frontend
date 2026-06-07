import { Box, Text } from "@chakra-ui/react";

type FertNameProps = {
  subtitle?: string;
  label?: string;
  crumbs?: Array<{ label: string; to: string }>;
};

export default function FertName({ subtitle, label }: FertNameProps) {
  return (
    <Box position="fixed" top={4} left={4} zIndex={1}>
      <Text fontWeight="bold" fontSize="xl" color="white">
        FertIntelligence, sistema de recomendação para adubação.
        <br />
        {(label || subtitle) && (
          <Text as="span" fontSize="md" fontWeight="normal">
            {label || subtitle}
          </Text>
        )}
      </Text>
    </Box>
  );
}
