import { useEffect, useState } from "react";
import { 
    Button, Heading, Text, Box, SimpleGrid, Flex, IconButton, Spinner, Center 
} from "@chakra-ui/react";
import { FiEye, FiX } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";

import DialogContainer from "@/components/Property/DialogContainer";
import { soilAnalysisService } from "@/services/soilAnalysisService";
import { layerExtractService } from "@/services/layerExtractService";
import { rangeExtractService } from "@/services/rangeExtractService";
import { physicalAnalysisExtractService } from "@/services/physicalAnalysisExtractService";
import { fertilityAnalysisExtractService } from "@/services/fertilityAnalysisExtractService";
import { saturationExtractAnalysisExtractService } from "@/services/saturationExtractAnalysisExtractService";

import { SoilAnalysisResponse, TipoExtrato } from "@/interfaces/SoilAnalysis";

type AnalysisType = "PHYSICAL" | "CHEMICAL" | "SATURATION";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    plotId: number;
    analysisType: AnalysisType; // Novo prop obrigatório para filtragem
    onSelectAnalysis: (analysis: SoilAnalysisResponse) => void;
};

export default function AnalysisListDialog({ isOpen, onClose, title, plotId, analysisType, onSelectAnalysis }: Props) {
    const [activeCardId, setActiveCardId] = useState<number | null>(null);
    const [filteredAnalyses, setFilteredAnalyses] = useState<SoilAnalysisResponse[]>([]);
    const [isFiltering, setIsFiltering] = useState(false);

    // 1. Busca TODAS as análises do talhão (Backend genérico)
    const { data: allAnalyses = [], isLoading: isLoadingAll } = useQuery({
        queryKey: ["soil-analyses", plotId],
        queryFn: () => soilAnalysisService.getByPlotId(plotId),
        enabled: isOpen && !!plotId,
    });

    // 2. Filtra as análises verificando se elas possuem dados do tipo solicitado
    useEffect(() => {
        if (!isOpen || allAnalyses.length === 0) {
            setFilteredAnalyses([]);
            return;
        }

        const filterAnalyses = async () => {
            setIsFiltering(true);
            
            // Verifica cada análise em paralelo
            const results = await Promise.all(
                allAnalyses.map(async (analysis) => {
                    try {
                        const isLayer = analysis.tipo_extrato === TipoExtrato.CAMADAS;
                        
                        // Busca containers (Camadas ou Intervalos)
                        const containers = isLayer 
                            ? await layerExtractService.getByAnalysisId(analysis.id)
                            : await rangeExtractService.getByAnalysisId(analysis.id);

                        // Se não tem containers, não tem dados
                        if (!containers || containers.length === 0) return null;

                        // Verifica se o PRIMEIRO container tem dados do tipo solicitado
                        // (Assume-se consistência: se o primeiro tem, a análise é desse tipo)
                        const firstContainerId = containers[0].id;
                        let hasData = false;

                        if (analysisType === "PHYSICAL") {
                            const data = isLayer 
                                ? await physicalAnalysisExtractService.getByLayerExtractId(firstContainerId)
                                : await physicalAnalysisExtractService.getByRangeExtractId(firstContainerId);
                            hasData = data && data.length > 0;
                        } 
                        else if (analysisType === "CHEMICAL") {
                            const data = isLayer 
                                ? await fertilityAnalysisExtractService.getByLayerExtractId(firstContainerId)
                                : await fertilityAnalysisExtractService.getByRangeExtractId(firstContainerId);
                            hasData = data && data.length > 0;
                        } 
                        else if (analysisType === "SATURATION") {
                            const data = isLayer 
                                ? await saturationExtractAnalysisExtractService.getByLayerExtractId(firstContainerId)
                                : await saturationExtractAnalysisExtractService.getByRangeExtractId(firstContainerId);
                            hasData = data && data.length > 0;
                        }

                        // Retorna a análise apenas se tiver dados do tipo correto
                        return hasData ? analysis : null;
                    } catch (e) {
                        console.warn(`Erro ao verificar análise ${analysis.id}`, e);
                        return null;
                    }
                })
            );

            // Remove os nulos e atualiza a lista filtrada
            setFilteredAnalyses(results.filter((a): a is SoilAnalysisResponse => a !== null));
            setIsFiltering(false);
        };

        filterAnalyses();
    }, [allAnalyses, analysisType, isOpen]);

    const handleCardClick = (id: number) => {
        setActiveCardId(prev => prev === id ? null : id);
    };

    if (!isOpen) return null;

    const isLoading = isLoadingAll || isFiltering;

    return (
        <DialogContainer isOpen={isOpen} onClose={onClose} zIndex={1500}>
            <Flex justify="space-between" align="center" mb={6}>
                <Heading as="h3" size="md" color="green.600">
                    {title}
                </Heading>
                <IconButton 
                    aria-label="Fechar" 
                    size="sm" 
                    variant="ghost" 
                    onClick={onClose}
                >
                    <FiX />
                </IconButton>
            </Flex>

            <Box minH="300px" maxH="60vh" overflowY="auto" p={1}>
                {isLoading ? (
                    <Center h="200px" flexDirection="column" gap={2}>
                        <Spinner color="green.500" />
                        <Text fontSize="sm" color="gray.500">Filtrando registros...</Text>
                    </Center>
                ) : filteredAnalyses.length === 0 ? (
                    <Center h="200px">
                        <Text color="gray.500" fontStyle="italic">
                            Nenhum registro encontrado para este tipo.
                        </Text>
                    </Center>
                ) : (
                    <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4}>
                        {filteredAnalyses.map((analysis) => (
                            <Box
                                key={analysis.id}
                                p={4}
                                bg="white"
                                _dark={{ bg: "gray.700" }}
                                borderWidth="1px"
                                borderColor={activeCardId === analysis.id ? "green.500" : "gray.200"}
                                borderRadius="md"
                                boxShadow="sm"
                                cursor="pointer"
                                position="relative"
                                transition="all 0.2s"
                                _hover={{ borderColor: "green.400", boxShadow: "md" }}
                                onClick={() => handleCardClick(analysis.id)}
                                h="120px"
                                display="flex"
                                flexDirection="column"
                                justifyContent="center"
                                alignItems="center"
                            >
                                <Text fontWeight="bold" fontSize="xl" color="gray.700" _dark={{ color: "white" }}>
                                    {analysis.ano_analise}
                                </Text>
                                <Text fontSize="xs" color="gray.500" textAlign="center" lineClamp={1} mt={1}>
                                    {analysis.laboratorio_responsavel}
                                </Text>
                                <Text fontSize="xs" color="green.600" fontWeight="bold" mt={2} textTransform="uppercase">
                                    {analysis.tipo_extrato}
                                </Text>

                                {/* Overlay com botão de visualizar */}
                                {activeCardId === analysis.id && (
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
                                        <Button
                                            size="sm"
                                            colorScheme="green"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onSelectAnalysis(analysis);
                                            }}
                                        >
                                            <FiEye />
                                            Visualizar
                                        </Button>
                                    </Flex>
                                )}
                            </Box>
                        ))}
                    </SimpleGrid>
                )}
            </Box>

            <Flex justify="flex-end" mt={6}>
                <Button onClick={onClose} colorScheme="red" variant="outline">
                    Fechar
                </Button>
            </Flex>
        </DialogContainer>
    );
}
