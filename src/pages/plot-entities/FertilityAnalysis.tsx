import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
    Box,
    Button,
    Flex,
    Heading,
    Spinner,
    Text,
    SimpleGrid,
    Badge,
    Stack,
    Separator,
    IconButton,
    Grid
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { LuTrash2, LuPencil } from "react-icons/lu"; 

// Layout Imports
import UserLayout from "@/components/Layouts/UserLayout";
import FertName from "@/components/FertName/FertName";
import ConfigMenu from "@/components/ConfigMenu/ConfigMenu";

// Componentes
import { FertilityAnalysisFormDialog } from "@/components/PlotAnalysis/FertilityAnalysisFormDialog";

// Services
import { soilAnalysisService } from "@/services/soilAnalysisService";
import { rangeExtractService } from "@/services/rangeExtractService";
import { layerExtractService } from "@/services/layerExtractService";
import { fertilityAnalysisExtractService } from "@/services/fertilityAnalysisExtractService";
import { getPlotById } from "@/services/plotService";

// Interfaces
import { TipoExtrato } from "@/interfaces/SoilAnalysis";
import { Camada } from "@/interfaces/LayerExtract";
import { FertilityExtractFormData } from "@/interfaces/FertilityAnalysisFormTypes";
import { FertilityAnalysisExtractResponse } from "@/interfaces/FertilityAnalysisExtract";

interface GroupedAnalysis {
    analysisId: number;
    year: number;
    lab: string;
    type: TipoExtrato;
    extracts: FertilityExtractFormData[]; 
}

export const FertilityAnalysis = () => {
    const { plotId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [isLoading, setIsLoading] = useState(false);
    const [groupedAnalyses, setGroupedAnalyses] = useState<GroupedAnalysis[]>([]);
    
    // Estados de Controle do Talhão
    const [plotIdentification, setPlotIdentification] = useState(location.state?.plotIdentification || "");
    const [isLoadingPlot, setIsLoadingPlot] = useState(!location.state?.plotIdentification);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingData, setEditingData] = useState<GroupedAnalysis | undefined>(undefined);
    const [hoveredAnalysisId, setHoveredAnalysisId] = useState<number | null>(null);

    // Efeito para garantir nome do talhão
    useEffect(() => {
        if (location.state?.plotIdentification) {
            setPlotIdentification(location.state.plotIdentification);
            setIsLoadingPlot(false);
            return;
        }

        if (plotId) {
            setIsLoadingPlot(true);
            getPlotById(parseInt(plotId))
                .then(plot => {
                    if (plot && plot.identificacao) {
                        setPlotIdentification(plot.identificacao);
                    } else {
                        setPlotIdentification(`Talhão ${plotId}`);
                    }
                })
                .catch(err => {
                    console.error("Erro ao carregar talhão:", err);
                    setPlotIdentification(`Talhão ${plotId}`);
                    toaster.create({ title: "Erro ao carregar identificação do talhão", type: "warning" });
                })
                .finally(() => setIsLoadingPlot(false));
        }
    }, [plotId, location.state]);

    useEffect(() => {
        if (plotId) fetchData();
    }, [plotId]);

    const fetchData = async () => {
        if (!plotId) return;
        setIsLoading(true);
        try {
            const analyses = await soilAnalysisService.getByPlotId(plotId);
            const groups: GroupedAnalysis[] = [];

            for (const analysis of analyses) {
                const group: GroupedAnalysis = {
                    analysisId: analysis.id,
                    year: analysis.ano_analise,
                    lab: analysis.laboratorio_responsavel,
                    type: analysis.tipo_extrato,
                    extracts: []
                };

                let hasChemicalData = false;

                if (analysis.tipo_extrato === TipoExtrato.INTERVALOS) {
                    const ranges = await rangeExtractService.getByAnalysisId(analysis.id);
                    for (const range of ranges) {
                        const chemicals = await fertilityAnalysisExtractService.getByRangeExtractId(range.id);
                        if (chemicals.length > 0) {
                            hasChemicalData = true;
                            const c = chemicals[0];
                            group.extracts.push(mapBackendToFormData(c, range.id, undefined, range.profundidade_inicial, range.profundidade_final));
                        }
                    }
                } else {
                    const layers = await layerExtractService.getByAnalysisId(analysis.id);
                    for (const layer of layers) {
                        const chemicals = await fertilityAnalysisExtractService.getByLayerExtractId(layer.id);
                        if (chemicals.length > 0) {
                            hasChemicalData = true;
                            const c = chemicals[0];
                            group.extracts.push(mapBackendToFormData(c, undefined, layer.id, layer.profundidade_inicial, layer.profundidade_final, layer.camada, layer.subcamada));
                        }
                    }
                }

                if (hasChemicalData || group.extracts.length > 0) {
                    group.extracts.sort((a, b) => a.profundidadeInicial - b.profundidadeInicial);
                    groups.push(group);
                }
            }
            setGroupedAnalyses(groups);
        } catch (error) {
            console.error(error);
            toaster.create({ title: "Erro ao carregar dados", type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    const mapBackendToFormData = (
        c: FertilityAnalysisExtractResponse, 
        rangeId?: number, 
        layerId?: number,
        initial?: number,
        final?: number,
        camada?: Camada,
        subcamada?: number
    ): FertilityExtractFormData => {
        return {
            tempId: c.id.toString(),
            databaseId: c.id,
            containerId: rangeId || layerId,
            profundidadeInicial: initial || 0,
            profundidadeFinal: final || 0,
            camada: camada,
            subcamada: subcamada,
            phAgua: c.ph_agua,
            phCacl2: c.ph_cacl2,
            calcio: c.calcio,
            magnesio: c.magnesio,
            potassio: c.potassio,
            sodio: c.sodio,
            aluminio: c.aluminio,
            aluminioMaisHidrogenio: c.aluminio_mais_hidrogenio,
            somaBases: c.soma_bases,
            ctcEfetiva: c.ctc_efetiva,
            ctcPh7: c.ctc_ph7,
            saturacaoBasesV: c.saturacao_bases_v,
            saturacaoAluminioM: c.saturacao_aluminio_m,
            fosforoMehlich1: c.fosforo_mehlich1,
            fosforoResina: c.fosforo_resina,
            enxofre: c.enxofre,
            materiaOrganica: c.materia_organica,
            boro: c.boro,
            cobre: c.cobre,
            ferro: c.ferro,
            manganes: c.manganes,
            zinco: c.zinco
        };
    };

    const handleAddNew = () => {
        if (isLoadingPlot) {
            toaster.create({ title: "Aguarde o carregamento do talhão...", type: "info" });
            return;
        }
        setEditingData(undefined);
        setIsFormOpen(true);
    };

    const handleEdit = (group: GroupedAnalysis) => {
        setEditingData(group);
        setIsFormOpen(true);
    };

    const handleDelete = async (analysisId: number) => {
        if (!confirm("Tem certeza? Isso apagará a análise e todos os seus dados químicos.")) return;
        try {
            await soilAnalysisService.delete(analysisId);
            toaster.create({ title: "Análise excluída", type: "success" });
            fetchData();
        } catch (e) {
            console.error(e);
            toaster.create({ title: "Erro ao excluir", type: "error" });
        }
    };

    return (
        <UserLayout>
            <FertName subtitle="Gerenciar Análises de Fertilidade" />
            <ConfigMenu />

            <Box mt={{ base: 24, md: 32 }} p={6} maxWidth="1400px" marginX="auto">
                <Button 
                    onClick={() => navigate(-1)} 
                    mb={4} 
                    variant="outline" 
                    size="sm"
                    color={{ base: "gray.800", _dark: "white" }} 
                    borderColor={{ base: "gray.300", _dark: "gray.600" }}
                    _hover={{ bg: { base: "gray.100", _dark: "gray.700" } }}
                >
                    Voltar
                </Button>
                
                <Flex justify="space-between" align="center" mb={8} wrap="wrap" gap={4}>
                    <Heading size="lg" color="teal.700">
                        Análises de Fertilidade: {isLoadingPlot ? <Spinner size="xs" ml={2}/> : plotIdentification}
                    </Heading>
                    <Button colorPalette="teal" onClick={handleAddNew} disabled={isLoadingPlot}>
                        + Adicionar Análise Química
                    </Button>
                </Flex>

                {isLoading ? (
                    <Flex justify="center" align="center" minH="200px">
                        <Spinner size="xl" color="teal.500" />
                    </Flex>
                ) : groupedAnalyses.length === 0 ? (
                    <Flex direction="column" align="center" justify="center" p={10} borderWidth="1px" borderRadius="lg" bg="white" _dark={{ bg: "gray.800", borderColor: "gray.700" }}>
                        <Text color="gray.500" fontSize="lg" mb={2}>Nenhuma análise de fertilidade encontrada.</Text>
                        <Text color="gray.400" fontSize="sm">Clique em "Adicionar" para cadastrar a primeira.</Text>
                    </Flex>
                ) : (
                    <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={6}>
                        {groupedAnalyses.map((group) => (
                            <Box
                                key={group.analysisId}
                                borderWidth="1px"
                                borderRadius="lg"
                                overflow="hidden"
                                bg="white"
                                _dark={{ bg: "gray.700", borderColor: "gray.600" }}
                                shadow="md"
                                position="relative"
                                onMouseEnter={() => setHoveredAnalysisId(group.analysisId)}
                                onMouseLeave={() => setHoveredAnalysisId(null)}
                                _hover={{ shadow: "xl", borderColor: "teal.400" }}
                                transition="all 0.2s"
                            >
                                <Box bg="gray.100" _dark={{ bg: "gray.600" }} p={4} borderBottomWidth="1px">
                                    <Flex justify="space-between" align="center">
                                        <Badge colorPalette="teal" fontSize="0.9em" borderRadius="full" px={2}>
                                            {group.year}
                                        </Badge>
                                        <Badge variant="outline" colorPalette={group.type === TipoExtrato.CAMADAS ? "purple" : "blue"}>
                                            {group.type}
                                        </Badge>
                                    </Flex>
                                    <Text fontWeight="bold" mt={2} truncate title={group.lab}>
                                        {group.lab}
                                    </Text>
                                </Box>

                                <Box p={4}>
                                    <Stack separator={<Separator />} gap={3}>
                                        {group.extracts.map((ext, idx) => (
                                            <Box key={idx} fontSize="sm">
                                                <Flex justify="space-between" mb={1}>
                                                    <Text fontWeight="bold" color="gray.700" _dark={{ color: "gray.200" }}>
                                                        {group.type === TipoExtrato.CAMADAS 
                                                            ? `Camada ${ext.camada}${ext.subcamada ? ext.subcamada : ''}`
                                                            : `Prof. ${ext.profundidadeInicial} - ${ext.profundidadeFinal} cm`
                                                        }
                                                    </Text>
                                                </Flex>
                                                
                                                <Grid templateColumns="repeat(2, 1fr)" gapX={4} gapY={1} fontSize="xs" color="gray.600" _dark={{ color: "gray.400" }}>
                                                    <Text>pH (H₂O): <b>{ext.phAgua}</b></Text>
                                                    <Text>P (Meh): <b>{ext.fosforoMehlich1}</b></Text>
                                                    <Text>K: <b>{ext.potassio}</b></Text>
                                                    <Text>Ca: <b>{ext.calcio}</b></Text>
                                                    <Text>Mg: <b>{ext.magnesio}</b></Text>
                                                    <Text>V%: <b>{ext.saturacaoBasesV}</b></Text>
                                                </Grid>
                                            </Box>
                                        ))}
                                        {group.extracts.length === 0 && (
                                            <Text fontStyle="italic" color="gray.400" fontSize="sm">Sem dados químicos cadastrados.</Text>
                                        )}
                                    </Stack>
                                </Box>

                                {hoveredAnalysisId === group.analysisId && (
                                    <Flex
                                        position="absolute"
                                        top={0} right={0} left={0} bottom={0}
                                        bg="black/60"
                                        align="center"
                                        justify="center"
                                        gap={4}
                                        backdropFilter="blur(2px)"
                                    >
                                        <IconButton
                                            aria-label="Editar"
                                            colorPalette="yellow"
                                            rounded="full"
                                            size="lg"
                                            onClick={() => handleEdit(group)}
                                        >
                                            <LuPencil />
                                        </IconButton>
                                        <IconButton
                                            aria-label="Deletar"
                                            colorPalette="red"
                                            rounded="full"
                                            size="lg"
                                            onClick={() => handleDelete(group.analysisId)}
                                        >
                                            <LuTrash2 />
                                        </IconButton>
                                    </Flex>
                                )}
                            </Box>
                        ))}
                    </SimpleGrid>
                )}

                {isFormOpen && plotId && plotIdentification && (
                    <FertilityAnalysisFormDialog 
                        isOpen={isFormOpen} 
                        onClose={() => setIsFormOpen(false)} 
                        onSuccess={fetchData}
                        plotId={parseInt(plotId)}
                        plotIdentification={plotIdentification}
                        initialData={editingData}
                    />
                )}
            </Box>
        </UserLayout>
    );
};