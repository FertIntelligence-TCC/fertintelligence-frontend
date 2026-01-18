import { Box, Text, HStack, IconButton, Badge, Flex } from "@chakra-ui/react";
import { FiEye, FiEdit, FiTrash } from "react-icons/fi";
import { GreenFertilizerResponseDto } from "@/interfaces/Fertilizer";

type Props = {
    item: GreenFertilizerResponseDto;
    isSelected: boolean;
    onSelect: () => void;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
};

export default function GreenFertilizerCard({ item, isSelected, onSelect, onView, onEdit, onDelete }: Props) {
    // Calculando C/N para exibição no card
    const cnRatio = item.n > 0 ? (item.c / item.n).toFixed(1) : "-";

    return (
        <Box
            borderWidth="1px"
            borderRadius="md"
            boxShadow="md"
            bg={{ base: "white", _dark: "gray.700" }}
            p={4}
            cursor="pointer"
            transition="all 0.2s"
            _hover={{ borderColor: "green.400", shadow: "lg" }}
            borderColor={isSelected ? "green.500" : "gray.200"}
            borderLeftWidth={isSelected ? "4px" : "1px"}
            onClick={onSelect}
            position="relative"
        >
            <Flex justify="space-between" align="start">
                <Text fontWeight="bold" fontSize="lg" color="green.700" _dark={{ color: "green.300" }} mb={1}>
                    {item.nome_adubo}
                </Text>
                <Badge colorPalette="green" variant="solid">Adubo Verde</Badge>
            </Flex>
            
            <Text fontSize="xs" color="gray.500" mt={1}>
                Parâmetros Principais:
            </Text>
            <Text fontSize="sm" fontWeight="semibold">
                N: {item.n}% | C: {item.c}%
            </Text>
            <Text fontSize="xs" color="gray.500" mt={1}>
                Relação C/N: <Text as="span" fontWeight="bold" color="green.600">{cnRatio}</Text>
            </Text>

            {isSelected && (
                <HStack justify="flex-end" gap={2} mt={4} animation="fade-in 0.2s">
                    <IconButton
                        size="sm"
                        aria-label="Visualizar"
                        borderRadius="full"
                        variant="ghost"
                        colorPalette="blue"
                        onClick={(e) => { e.stopPropagation(); onView(); }}
                    >
                        <FiEye />
                    </IconButton>
                    <IconButton
                        size="sm"
                        aria-label="Editar"
                        borderRadius="full"
                        variant="ghost"
                        onClick={(e) => { e.stopPropagation(); onEdit(); }}
                    >
                        <FiEdit />
                    </IconButton>
                    <IconButton
                        size="sm"
                        aria-label="Deletar"
                        borderRadius="full"
                        colorPalette="red"
                        variant="ghost"
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    >
                        <FiTrash />
                    </IconButton>
                </HStack>
            )}
        </Box>
    );
}