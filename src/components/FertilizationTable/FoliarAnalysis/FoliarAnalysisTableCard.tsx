import { Box, Text, HStack, IconButton, Badge, Flex } from "@chakra-ui/react";
import { FiEye, FiEdit, FiTrash } from "react-icons/fi";
import { FoliarTableResponseDto } from "@/interfaces/FoliarAnalysisInterpretationTable";

type Props = {
    item: FoliarTableResponseDto;
    isSelected: boolean;
    onSelect: () => void;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
};

export default function FoliarAnalysisTableCard({ item, isSelected, onSelect, onView, onEdit, onDelete }: Props) {
    
    // Simplificado: Usa o nome salvo ou um texto padrão
    const title = item.nome_tabela || "Tabela de Interpretação";

    return (
        <Box
            borderWidth="1px"
            borderRadius="md"
            boxShadow="md"
            bg={{ base: "white", _dark: "gray.700" }}
            p={4}
            cursor="pointer"
            transition="all 0.2s"
            _hover={{ borderColor: "orange.400", shadow: "lg" }}
            borderColor={isSelected ? "orange.500" : "gray.200"}
            borderLeftWidth={isSelected ? "4px" : "1px"}
            onClick={onSelect}
            position="relative"
        >
            <Flex justify="space-between" align="start">
                <Text fontWeight="bold" fontSize="md" color="orange.700" _dark={{ color: "orange.300" }} mb={1} noOfLines={2}>
                    {title}
                </Text>
                <Badge colorPalette="orange" variant="surface">Análise Foliar</Badge>
            </Flex>
            
            {item.region && (
                <Text fontSize="xs" fontWeight="bold" color="gray.600" mt={2}>
                    Região: {item.region.replace(/_/g, ' ')}
                </Text>
            )}
            
            {/* Legenda de contagem de culturas removida aqui */}

            {isSelected && (
                <HStack justify="flex-end" gap={2} mt={3} animation="fade-in 0.2s">
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