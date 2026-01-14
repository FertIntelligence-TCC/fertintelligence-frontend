import { Box, Text, HStack, IconButton, Badge, Flex } from "@chakra-ui/react";
import { FiEye, FiEdit, FiTrash } from "react-icons/fi";
import { FormulatedMineralFertilizerResponseDto } from "@/interfaces/Fertilizer";

type Props = {
    item: FormulatedMineralFertilizerResponseDto;
    isSelected: boolean;
    onSelect: () => void;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
};

export default function FormulatedMineralFertilizerCard({ item, isSelected, onSelect, onView, onEdit, onDelete }: Props) {
    // Tratamento defensivo: usa 'formula' e 'relacao' corretos
    const f = item.formula || { n: 0, p: 0, k: 0 };
    const r = item.relacao || { n: 0, p: 0, k: 0 };

    // Monta o nome visual da fórmula (Ex: 04-14-08)
    const formulaName = `NPK ${f.n}-${f.p}-${f.k}`;
    
    // Monta a string da relação (Ex: 1 : 3.5 : 2)
    const relationString = `${r.n} : ${r.p} : ${r.k}`;

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
                    {formulaName}
                </Text>
                <Badge colorPalette="purple" variant="surface">Formulado</Badge>
            </Flex>
            
            <Text fontSize="xs" color="gray.500" mt={1}>
                Relação NPK:
            </Text>
            <Text fontSize="sm" fontWeight="semibold" mb={2}>
                {relationString}
            </Text>

            <Text fontSize="xs" color="gray.400">
                Nº Ind.: {item.numero_formula_indicada ?? "-"}
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