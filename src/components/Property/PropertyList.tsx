import { Box, Button, HStack, IconButton, SimpleGrid, Text } from "@chakra-ui/react";
import { FiEdit, FiEye, FiTrash, FiLogOut } from "react-icons/fi";
import { PropertyResponse } from "@/interfaces/Property";

type OwnerCrudProps = {
  properties: PropertyResponse[];
  selectedPropertyId: number | null;
  onSelect: (property: PropertyResponse) => void;
  onView: (property: PropertyResponse) => void;
  onEdit: (property: PropertyResponse) => void;
  onDelete: (property: PropertyResponse) => void;
};

type ViewOnlyProps = {
  properties: PropertyResponse[];
  onViewDetails: (property: PropertyResponse) => void;
  onLeave?: (property: PropertyResponse) => void;
  leaveLabel?: string;
};

type PropertyListProps = OwnerCrudProps | ViewOnlyProps;

const isOwnerCrudProps = (props: PropertyListProps): props is OwnerCrudProps =>
  "onSelect" in props;

const PropertyList = (props: PropertyListProps) => {
  const properties = props.properties ?? [];

  if (properties.length === 0) {
    return <Text color="gray.500">Nenhuma propriedade encontrada.</Text>;
  }

  // =========================
  // Proprietário (CRUD)
  // =========================
  if (isOwnerCrudProps(props)) {
    const { selectedPropertyId, onSelect, onView, onEdit, onDelete } = props;

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
              <Button
                width="100%"
                justifyContent="flex-start"
                onClick={() => onSelect(property)}
              >
                {property.nome}
              </Button>

              {isSelected && (
                <HStack justify="flex-end" gap={3} mt={4}>
                  <IconButton
                    aria-label="Visualizar propriedade"
                    borderRadius="full"
                    onClick={() => onView(property)}
                  >
                    <FiEye />
                  </IconButton>

                  <IconButton
                    aria-label="Editar propriedade"
                    borderRadius="full"
                    onClick={() => onEdit(property)}
                  >
                    <FiEdit />
                  </IconButton>

                  <IconButton
                    aria-label="Deletar propriedade"
                    borderRadius="full"
                    colorScheme="red"
                    onClick={() => onDelete(property)}
                  >
                    <FiTrash />
                  </IconButton>
                </HStack>
              )}
            </Box>
          );
        })}
      </SimpleGrid>
    );
  }

  // =========================
  // Visitante (visualização + retirar)
  // =========================
  const { onViewDetails, onLeave, leaveLabel = "Se retirar" } = props;

  return (
    <SimpleGrid columns={{ base: 1, md: 3 }} gap={6} alignItems="flex-start">
      {properties.map((property) => (
        <Box
          key={property.id}
          borderWidth="1px"
          borderRadius="md"
          boxShadow="md"
          bg={{ base: "white", _dark: "gray.700" }}
          p={4}
        >
          <Text fontWeight="bold" mb={3}>
            {property.nome}
          </Text>

          <HStack justify="flex-end" gap={3}>
            <IconButton
              aria-label="Visualizar propriedade"
              borderRadius="full"
              onClick={() => onViewDetails(property)}
            >
              <FiEye />
            </IconButton>

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
          </HStack>
        </Box>
      ))}
    </SimpleGrid>
  );
};

export default PropertyList;