import ImageThumb from "@/components/ImageThumb";
import { useState } from "react";
import { Box, SimpleGrid, Text, IconButton, HStack, Flex } from "@chakra-ui/react";
import { FiEdit, FiTrash, FiEye } from "react-icons/fi";
import { PlotResponse } from "@/interfaces/Plot";

type Props = {
    plots: PlotResponse[];
    mode: "edit" | "view";
    onView?: (plot: PlotResponse) => void;
    onEdit?: (plot: PlotResponse) => void;
    onDelete?: (plot: PlotResponse) => void;
};

export default function PlotList({ plots, mode, onView, onEdit, onDelete }: Props) {
    const [activePlotId, setActivePlotId] = useState<number | null>(null);

    const handlePlotClick = (id: number) => {
        setActivePlotId(prev => prev === id ? null : id);
    };

    if (plots.length === 0) {
        return <Text color="gray.500" fontStyle="italic" mt={2}>Nenhum talhão cadastrado.</Text>;
    }

    return (
        <SimpleGrid columns={{ base: 2, md: 3 }} gap={4} mt={2}>
            {plots.map(plot => (
                <Box
                    key={plot.id}
                    p={4}
                    bg="white"
                    _dark={{ bg: "gray.700" }}
                    borderWidth="1px"
                    borderColor={activePlotId === plot.id ? "green.500" : "gray.200"}
                    borderRadius="md"
                    cursor="pointer"
                    boxShadow="sm"
                    transition="all 0.2s"
                    _hover={{ borderColor: "green.400", boxShadow: "md" }}
                    onClick={() => handlePlotClick(plot.id)}
                    position="relative"
                    h="180px"
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                >
                    <ImageThumb imageId={plot.idfoto} alt={plot.identificacao} />
                    <Text fontWeight="bold" textAlign="center" noOfLines={2}>
                        {plot.identificacao}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                        {plot.area} ha
                    </Text>

                    {activePlotId === plot.id && (
                        <Flex 
                            position="absolute" 
                            inset={0} 
                            bg="blackAlpha.700" 
                            borderRadius="md" 
                            align="center" 
                            justify="center"
                            animation="fade-in 0.2s"
                            onClick={(e) => e.stopPropagation()} 
                        >
                            <HStack gap={2}>
                                {mode === "view" && onView && (
                                    <IconButton
                                        aria-label="Visualizar"
                                        size="sm"
                                        colorPalette="blue"
                                        rounded="full"
                                        onClick={(e) => { e.stopPropagation(); onView(plot); }}
                                    >
                                        <FiEye />
                                    </IconButton>
                                )}

                                {mode === "edit" && (
                                    <>
                                        {onEdit && (
                                            <IconButton
                                                aria-label="Editar"
                                                size="sm"
                                                colorPalette="yellow"
                                                rounded="full"
                                                onClick={(e) => { e.stopPropagation(); onEdit(plot); }}
                                            >
                                                <FiEdit />
                                            </IconButton>
                                        )}
                                        {onDelete && (
                                            <IconButton
                                                aria-label="Excluir"
                                                size="sm"
                                                colorPalette="red"
                                                rounded="full"
                                                onClick={(e) => { e.stopPropagation(); onDelete(plot); }}
                                            >
                                                <FiTrash />
                                            </IconButton>
                                        )}
                                    </>
                                )}
                            </HStack>
                        </Flex>
                    )}
                </Box>
            ))}
        </SimpleGrid>
    );
}