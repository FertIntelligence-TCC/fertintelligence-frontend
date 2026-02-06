import { Box, Text, HStack, IconButton, Badge, Flex } from "@chakra-ui/react";
import { FiEye, FiEdit, FiTrash } from "react-icons/fi";
import { ReactNode } from "react";

interface FertilizerCardBaseProps {
    title: string;
    badgeLabel: string;
    colorScheme?: string; // "green", "blue", "purple", "teal", "orange", etc.
    isSelected: boolean;
    onSelect: () => void;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
    children: ReactNode; // O conteúdo específico (nutrientes, fórmulas) vai aqui
}

export default function FertilizerCardBase({
    title,
    badgeLabel,
    colorScheme = "green",
    isSelected,
    onSelect,
    onView,
    onEdit,
    onDelete,
    children
}: FertilizerCardBaseProps) {
    return (
        <Box
            borderWidth="1px"
            borderRadius="md"
            boxShadow="md"
            bg={{ base: "white", _dark: "gray.700" }}
            p={4}
            cursor="pointer"
            transition="all 0.2s"
            _hover={{ borderColor: `${colorScheme}.400`, shadow: "lg" }}
            borderColor={isSelected ? `${colorScheme}.500` : "gray.200"}
            borderLeftWidth={isSelected ? "4px" : "1px"}
            onClick={onSelect}
            position="relative"
        >
            <Flex justify="space-between" align="start">
                <Text fontWeight="bold" fontSize="lg" color={`${colorScheme}.700`} _dark={{ color: `${colorScheme}.300` }} mb={1}>
                    {title}
                </Text>
                <Badge colorPalette={colorScheme} variant="surface">{badgeLabel}</Badge>
            </Flex>
            
            {/* Conteúdo Específico do Card Injetado Aqui */}
            <Box mb={2}>
                {children}
            </Box>

            {isSelected && (
                <HStack justify="flex-end" gap={2} mt={2} animation="fade-in 0.2s">
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