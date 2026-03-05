import { Box, HStack, IconButton, SimpleGrid, Text, Button } from "@chakra-ui/react";
import { FiEdit, FiEye, FiTrash, FiLogOut } from "react-icons/fi";
import { PropertyResponse } from "@/interfaces/Property";

type PropertyListProps = {
  properties: PropertyResponse[];

  // opcional: se quiser “selecionar” um card
  selectedPropertyId?: number | null;
  onSelect?: (property: PropertyResponse) => void;

  // ações (se passar, aparece o botão)
  onView?: (property: PropertyResponse) => void;
  onEdit?: (property: PropertyResponse) => void;
  onDelete?: (property: PropertyResponse) => void;
  onLeave?: (property: PropertyResponse) => void;

  leaveLabel?: string;
};

export default function PropertyList({
  properties,
  selectedPropertyId = null,
  onSelect,
  onView,
  onEdit,
  onDelete,
  onLeave,
  leaveLabel = "Se retirar",
}: PropertyListProps) {
  if (!properties?.length) {
    return <Text color="gray.500">Nenhuma propriedade encontrada.</Text>;
  }

  return (
    <SimpleGrid columns={{ base: 1, md: 3 }} gap={6} alignItems="flex-start">
      {properties.map((property) => {
        const isSelected = selectedPropertyId === property.id;

        return (
          <Box
            key={property.id}
            borderWidth="1px"
            borderRadius="md"
            boxShadow="md"
            bg={{ base: "white", _dark: "gray.700" }}
            p={4}
          >
            {onSelect ? (
              <Button width="100%" justifyContent="flex-start" onClick={() => onSelect(property)}>
                {property.nome}
              </Button>
            ) : (
              <Text fontWeight="bold" mb={3}>
                {property.nome}
              </Text>
            )}

            {/* Se tem seleção, só mostra ações quando selecionado. Se não tem seleção, sempre mostra ações */}
            {(onSelect ? isSelected : true) && (
              <HStack justify="flex-end" gap={3} mt={4}>
                {onView && (
                  <IconButton
                    aria-label="Visualizar propriedade"
                    borderRadius="full"
                    onClick={() => onView(property)}
                  >
                    <FiEye />
                  </IconButton>
                )}

                {onEdit && (
                  <IconButton
                    aria-label="Editar propriedade"
                    borderRadius="full"
                    onClick={() => onEdit(property)}
                  >
                    <FiEdit />
                  </IconButton>
                )}

                {onLeave && (
                  <IconButton
                    aria-label={leaveLabel}
                    borderRadius="full"
                    colorScheme="red"
                    onClick={() => onLeave(property)}
                  >
                    <FiLogOut />
                  </IconButton>
                )}

                {onDelete && (
                  <IconButton
                    aria-label="Deletar propriedade"
                    borderRadius="full"
                    colorScheme="red"
                    onClick={() => onDelete(property)}
                  >
                    <FiTrash />
                  </IconButton>
                )}
              </HStack>
            )}
          </Box>
        );
      })}
    </SimpleGrid>
  );
}