import { Box, Text, HStack, IconButton, Badge, Flex } from "@chakra-ui/react";
import { FiEye, FiEdit, FiTrash } from "react-icons/fi";
import { OrganoMineralFertilizerResponseDto } from "@/interfaces/Fertilizer";

type Props = {
    item: OrganoMineralFertilizerResponseDto;
    isSelected: boolean;
    onSelect: () => void;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
};

export default function OrganoMineralFertilizerCard({ item, isSelected, onSelect, onView, onEdit, onDelete }: Props) {
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
                <Badge colorPalette="orange" variant="surface">Organomineral</Badge>
            </Flex>
            
            <Text fontSize="xs" color="gray.500" mt={1}>
                Garantias Principais:
            </Text>
            <Text fontSize="sm" fontWeight="semibold">
                N: {item.n}% | P: {item.p2o5}% | K: {item.k2o}%
            </Text>
            <Text fontSize="xs" color="gray.500" mt={1}>
                Carbono Orgânico: <Text as="span" fontWeight="bold" color="orange.500">{item.c}%</Text>
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