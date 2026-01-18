import { Box, Text, HStack, IconButton, Badge, Flex } from "@chakra-ui/react";
import { FiEye, FiEdit, FiTrash } from "react-icons/fi";
import { ChelatedFertilizerResponseDto } from "@/interfaces/Fertilizer";

type Props = {
    item: ChelatedFertilizerResponseDto;
    isSelected: boolean;
    onSelect: () => void;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
};

export default function ChelatedFertilizerCard({ item, isSelected, onSelect, onView, onEdit, onDelete }: Props) {
    // Helper para formatar lista de micros presentes
    const getMicrosSummary = () => {
        const parts = [];
        if (item.fe > 0) parts.push(`Fe: ${item.fe}%`);
        if (item.mn > 0) parts.push(`Mn: ${item.mn}%`);
        if (item.zn > 0) parts.push(`Zn: ${item.zn}%`);
        if (item.cu > 0) parts.push(`Cu: ${item.cu}%`);
        if (item.b > 0) parts.push(`B: ${item.b}%`);
        return parts.length > 0 ? parts.join(" | ") : "Nenhum micro declarado";
    };

    return (
        <Box
            borderWidth="1px"
            borderRadius="md"
            boxShadow="md"
            bg={{ base: "white", _dark: "gray.700" }}
            p={4}
            cursor="pointer"
            transition="all 0.2s"
            _hover={{ borderColor: "purple.400", shadow: "lg" }}
            borderColor={isSelected ? "purple.500" : "gray.200"}
            borderLeftWidth={isSelected ? "4px" : "1px"}
            onClick={onSelect}
            position="relative"
        >
            <Flex justify="space-between" align="start">
                <Text fontWeight="bold" fontSize="lg" color="purple.700" _dark={{ color: "purple.300" }} mb={1}>
                    {item.nome_adubo}
                </Text>
                <Badge colorPalette="purple" variant="solid">Quelatado</Badge>
            </Flex>
            
            <Text fontSize="xs" color="gray.500" mt={1}>
                Micronutrientes Principais:
            </Text>
            <Text fontSize="sm" fontWeight="semibold" mb={2}>
                {getMicrosSummary()}
            </Text>
            
            {(item.n > 0 || item.p2o5 > 0 || item.k2o > 0) && (
                <Text fontSize="xs" color="gray.400">
                   Macros: N: {item.n}% | P: {item.p2o5}% | K: {item.k2o}%
                </Text>
            )}

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