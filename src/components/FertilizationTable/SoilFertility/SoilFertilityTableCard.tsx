import { Box, Text, HStack, IconButton, Badge, Flex } from "@chakra-ui/react";
import { FiEye, FiEdit, FiTrash } from "react-icons/fi";
import { SoilFertilityTableResponseDto } from "@/interfaces/SoilFertilityInterpretationCriteriaTable";

type Props = {
    item: SoilFertilityTableResponseDto;
    isSelected: boolean;
    onSelect: () => void;
    onView: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
};

export default function SoilFertilityTableCard({ item, isSelected, onSelect, onView, onEdit, onDelete }: Props) {
    
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
                <Text fontWeight="bold" fontSize="md" color="green.700" _dark={{ color: "green.300" }} mb={1} lineClamp={2}>
                    {item.nome_criterios}
                </Text>
                <Badge colorPalette="green" variant="surface">Fertilidade</Badge>
            </Flex>
            
            <Text fontSize="xs" fontWeight="bold" color="gray.600" _dark={{ color: "gray.300" }} mt={2}>
                Região: {item.regiao.replace(/_/g, ' ')}
            </Text>
            
            {item.descricao_criterios && (
                <Text fontSize="xs" color="gray.500" mt={1} lineClamp={2}>
                    {item.descricao_criterios}
                </Text>
            )}

            {item.observacoes && (
                <Text fontSize="xs" color="gray.500" mt={1} lineClamp={2}>
                    <Text as="span" fontWeight="semibold">Observações:</Text> {item.observacoes}
                </Text>
            )}

            {item.fontes && (
                <Text fontSize="xs" color="gray.500" mt={1} lineClamp={2}>
                    <Text as="span" fontWeight="semibold">Fontes:</Text> {item.fontes}
                </Text>
            )}

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
                    {onEdit && (
                        <IconButton
                            size="sm"
                            aria-label="Editar"
                            borderRadius="full"
                            variant="ghost"
                            onClick={(e) => { e.stopPropagation(); onEdit(); }}
                        >
                            <FiEdit />
                        </IconButton>
                    )}
                    {onDelete && (
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
                    )}
                </HStack>
            )}
        </Box>
    );
}
