import { Box, Text, HStack, IconButton, Badge, Flex } from "@chakra-ui/react";
import { ReactNode } from "react";
import { FiEye } from "react-icons/fi";
import ImageThumb from "@/components/ImageThumb";

interface PublicFertilizerCardProps {
  fertilizerName: string;
  creatorName: string;
  typeLabel: string;
  photoIds?: string[];
  isSelected: boolean;
  onSelect: () => void;
  onView: () => void;
  children?: ReactNode;
}

export default function PublicFertilizerCard({
  fertilizerName,
  creatorName,
  typeLabel,
  photoIds = [],
  isSelected,
  onSelect,
  onView,
  children,
}: PublicFertilizerCardProps) {
  return (
    <Box
      borderWidth="1px"
      borderRadius="md"
      boxShadow="md"
      bg={{ base: "white", _dark: "gray.700" }}
      p={4}
      cursor="pointer"
      transition="all 0.2s"
      _hover={{ borderColor: "blue.400", shadow: "lg" }}
      borderColor={isSelected ? "blue.500" : "gray.200"}
      borderLeftWidth={isSelected ? "4px" : "1px"}
      onClick={onSelect}
    >
      <Flex justify="space-between" align="start" mb={2}>
        <Text fontWeight="bold" fontSize="md" color="blue.700" _dark={{ color: "blue.300" }}>
          {fertilizerName}
        </Text>
        <Badge colorPalette="blue" variant="surface">
          {typeLabel}
        </Badge>
      </Flex>

      <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }}>
        Criado por: <Text as="span" fontWeight="semibold">{creatorName}</Text>
      </Text>

      {photoIds.length > 0 && (
        <Box mt={3}>
          <ImageThumb imageId={photoIds[0]} alt={`Foto de referência do adubo ${fertilizerName}`} />
        </Box>
      )}

      {children}

      {isSelected && (
        <HStack justify="flex-end" mt={3}>
          <IconButton
            size="sm"
            aria-label="Visualizar"
            borderRadius="full"
            variant="ghost"
            colorPalette="blue"
            onClick={(e) => {
              e.stopPropagation();
              onView();
            }}
          >
            <FiEye />
          </IconButton>
        </HStack>
      )}
    </Box>
  );
}
