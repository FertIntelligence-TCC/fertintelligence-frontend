import { Box, Button, HStack, IconButton, SimpleGrid } from "@chakra-ui/react";
import { FiEdit, FiEye, FiTrash } from "react-icons/fi";
import { PropertyResponse } from "@/interfaces/ServiceResponse";

type PropertyListProps = {
    properties: PropertyResponse[];
    selectedPropertyId: number | null;
    onSelect: (property: PropertyResponse) => void;
    onView: (property: PropertyResponse) => void;
    onEdit: (property: PropertyResponse) => void;
    onDelete: (property: PropertyResponse) => void;
};

const PropertyList = ({
    properties,
    selectedPropertyId,
    onSelect,
    onView,
    onEdit,
    onDelete,
}: PropertyListProps) => (
    <SimpleGrid columns={{ base: 3, md: 4 }} gap={6} alignItems="flex-start">
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

export default PropertyList;