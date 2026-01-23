import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
    HStack
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons"; // Ou use ícones do Lucide/Fa se preferir

// Componentes
import { PhysicalAnalysisFormDialog } from "@/components/PhysicalAnalysis/PhysicalAnalysisFormDialog";

// Services
import { soilAnalysisService } from "@/services/soilAnalysisService";
import { rangeExtractService } from "@/services/rangeExtractService";
import { layerExtractService } from "@/services/layerExtractService";
import { physicalAnalysisExtractService } from "@/services/physicalAnalysisExtractService";

// Interfaces
import { TipoExtrato } from "@/interfaces/SoilAnalysis";
import { Camada } from "@/interfaces/LayerExtract";
import { PhysicalExtractFormData } from "@/interfaces/PhysicalAnalysisFormTypes";
import { PhysicalAnalysisExtractResponse } from "@/interfaces/PhysicalAnalysisExtract";

// Interface local para a visualização agrupada (Card da Análise)
interface GroupedAnalysis {
    analysisId: number;
    year: number;
    lab: string;
    type: TipoExtrato;
    extracts: PhysicalExtractFormData[]; // Reutilizamos o tipo do formulário para facilitar a passagem de dados
}

export const PhysicalAnalysis = () => {
    const { plotId } = useParams();
    const navigate = useNavigate();
    
    // Estados
    const [isLoading, setIsLoading] = useState(false);
    const [groupedAnalyses, setGroupedAnalyses] = useState<GroupedAnalysis[]>([]);
    
    // Controle do Modal
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingData, setEditingData] = useState<GroupedAnalysis | undefined>(undefined);
    const [hoveredAnalysisId, setHoveredAnalysisId] = useState<number | null>(null);

    useEffect(() => {
        if (plotId) fetchData();
    }, [plotId]);

    const fetchData = async () => {
        if (!plotId) return;
        setIsLoading(true);
        try {
            // 1. Busca todas as análises de solo do talhão
            const analyses = await soilAnalysisService.getByPlotId(plotId);
            const groups: GroupedAnalysis[] = [];

            // 2. Para cada análise, busca seus extratos e dados físicos
            // Nota: Em produção, um endpoint "Eager Loading" no backend seria mais performático que esse loop N+1
            for (const analysis of analyses) {
                const group: GroupedAnalysis = {
                    analysisId: analysis.id,
                    year: analysis.ano_analise,
                    lab: analysis.laboratorio_responsavel,
                    type: analysis.tipo_extrato,
                    extracts: []
                };

                let hasPhysicalData = false;

                if (analysis.tipo_extrato === TipoExtrato.INTERVALOS) {
                    const ranges = await rangeExtractService.getByAnalysisId(analysis.id);
                    for (const range of ranges) {
                        const physicals = await physicalAnalysisExtractService.getByRangeExtractId(range.id);
                        if (physicals.length > 0) {
                            hasPhysicalData = true;
                            const p = physicals[0];
                            group.extracts.push(mapBackendToFormData(p, range.id, undefined, range.profundidade_inicial, range.profundidade_final));
                        }
                    }
                } else {
                    const layers = await layerExtractService.getByAnalysisId(analysis.id);
                    for (const layer of layers) {
                        const physicals = await physicalAnalysisExtractService.getByLayerExtractId(layer.id);
                        if (physicals.length > 0) {
                            hasPhysicalData = true;
                            const p = physicals[0];
                            group.extracts.push(mapBackendToFormData(p, undefined, layer.id, layer.profundidade_inicial, layer.profundidade_final, layer.camada, layer.subcamada));
                        }
                    }
                }

                // Apenas adiciona na lista se tiver dados físicos (ou se for uma análise vazia criada para esse fim)
                if (hasPhysicalData || group.extracts.length > 0) {
                    // Ordena extratos por profundidade para visualização correta
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

    // Função auxiliar para converter snake_case (Backend) -> camelCase (Frontend Form)
    const mapBackendToFormData = (
        p: PhysicalAnalysisExtractResponse, 
        rangeId?: number, 
        layerId?: number,
        initial?: number,
        final?: number,
        camada?: Camada,
        subcamada?: number
    ): PhysicalExtractFormData => {
        return {
            tempId: p.id.toString(), // Usamos o ID real como tempId para edição
            databaseId: rangeId || layerId, // Guardamos o ID do Extrato aqui para update do container
            
            // Container Data
            profundidadeInicial: initial || 0,
            profundidadeFinal: final || 0,
            camada: camada,
            subcamada: subcamada,

            // Physical Data
            teorAreia: p.teor_areia,
            teorSilte: p.teor_silte,
            teorArgila: p.teor_argila,
            densidadeAparente: p.densidade_aparente,
            densidadeReal: p.densidade_real,
            porosidadeTotal: p.porosidade_total,
            microporosidade: p.microporosidade,
            umidadeCapacidadeCampo: p.umidade_capacidade_campo,
            umidadePontoMurchaPermanente: p.umidade_ponto_murcha_permanente,
            aguaDisponivel: p.agua_disponivel,
            resistenciaPenetracao: p.resistencia_penetracao,
            
            // Agregados
            percAgregados6_0mm: p.perc_agregados_6_0mm,
            percAgregados4_1a6_0mm: p.perc_agregados_4_1_a_6_0mm,
            percAgregados2_1a4_0mm: p.perc_agregados_2_1_a_4_0mm,
            percAgregados1_0a2_0mm: p.perc_agregados_1_0_a_2_0mm || 0,
            percAgregados0_5a1_0mm: p.perc_agregados_0_5_a_1_0mm || 0,
            percAgregados0_25a0_5mm: p.perc_agregados_0_25_a_0_5mm || 0,
            percAgregadosMenor0_25mm: p.perc_agregados_menor_0_25mm || 0,
            dmAgregados: p.dm_agregados || 0
        };
    };

    const handleAddNew = () => {
        setEditingData(undefined);
        setIsFormOpen(true);
    };

    const handleEdit = (group: GroupedAnalysis) => {
        setEditingData(group);
        setIsFormOpen(true);
    };

    const handleDelete = async (analysisId: number) => {
        if (!confirm("Tem certeza? Isso apagará a análise de solo e todos os seus extratos físicos.")) return;
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
        <Box p={6} maxWidth="1200px" margin="0 auto">
            <Button onClick={() => navigate(-1)} mb={4} variant="outline" size="sm">
                Voltar
            </Button>
            
            <Flex justify="space-between" align="center" mb={8}>
                <Heading size="lg" color="green.700">Gerenciar Análises Físicas</Heading>
                <Button colorScheme="green" onClick={handleAddNew}>
                    + Adicionar Análise Física
                </Button>
            </Flex>

            {isLoading ? (
                <Flex justify="center" align="center" minH="200px">
                    <Spinner size="xl" color="green.500" />
                </Flex>
            ) : groupedAnalyses.length === 0 ? (
                <Flex direction="column" align="center" justify="center" p={10} borderWidth="1px" borderRadius="lg" bg="gray.50">
                    <Text color="gray.500" fontSize="lg" mb={2}>Nenhuma análise física encontrada.</Text>
                    <Text color="gray.400" fontSize="sm">Clique em "Adicionar" para cadastrar a primeira.</Text>
                </Flex>
            ) : (
                <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={6}>
                    {groupedAnalyses.map((group) => (
                        <Box
                            key={group.analysisId}
                            borderWidth="1px"
                            borderRadius="lg"
                            overflow="hidden"
                            bg="white"
                            shadow="md"
                            position="relative"
                            onMouseEnter={() => setHoveredAnalysisId(group.analysisId)}
                            onMouseLeave={() => setHoveredAnalysisId(null)}
                            _hover={{ shadow: "xl", borderColor: "green.400" }}
                            transition="all 0.2s"
                        >
                            {/* Header do Card */}
                            <Box bg="gray.100" p={4} borderBottomWidth="1px">
                                <Flex justify="space-between" align="center">
                                    <Badge colorScheme="green" fontSize="0.9em" borderRadius="full" px={2}>
                                        {group.year}
                                    </Badge>
                                    <Badge variant="outline" colorScheme={group.type === TipoExtrato.CAMADAS ? "purple" : "blue"}>
                                        {group.type}
                                    </Badge>
                                </Flex>
                                <Text fontWeight="bold" mt={2} noOfLines={1} title={group.lab}>
                                    {group.lab}
                                </Text>
                            </Box>

                            {/* Corpo do Card (Lista de Extratos) */}
                            <Box p={4}>
                                <Stack divider={<Separator />} spacing={3}>
                                    {group.extracts.map((ext, idx) => (
                                        <Box key={idx} fontSize="sm">
                                            <Flex justify="space-between" mb={1}>
                                                <Text fontWeight="bold" color="gray.700">
                                                    {group.type === TipoExtrato.CAMADAS 
                                                        ? `Camada ${ext.camada}${ext.subcamada ? ext.subcamada : ''}`
                                                        : `Prof. ${ext.profundidadeInicial} - ${ext.profundidadeFinal} cm`
                                                    }
                                                </Text>
                                            </Flex>
                                            <HStack color="gray.500" fontSize="xs" spacing={3}>
                                                <Text>Areia: <b>{ext.teorAreia}</b></Text>
                                                <Text>Silte: <b>{ext.teorSilte}</b></Text>
                                                <Text>Argila: <b>{ext.teorArgila}</b></Text>
                                            </HStack>
                                        </Box>
                                    ))}
                                    {group.extracts.length === 0 && (
                                        <Text fontStyle="italic" color="gray.400" fontSize="sm">Sem dados físicos cadastrados.</Text>
                                    )}
                                </Stack>
                            </Box>

                            {/* Overlay de Ações (Aparece no Hover) */}
                            {hoveredAnalysisId === group.analysisId && (
                                <Flex
                                    position="absolute"
                                    top={0} right={0} left={0} bottom={0}
                                    bg="blackAlpha.600"
                                    align="center"
                                    justify="center"
                                    gap={4}
                                    backdropFilter="blur(2px)"
                                >
                                    <IconButton
                                        aria-label="Editar"
                                        icon={<EditIcon />}
                                        colorScheme="yellow"
                                        isRound
                                        size="lg"
                                        onClick={() => handleEdit(group)}
                                    />
                                    <IconButton
                                        aria-label="Deletar"
                                        icon={<DeleteIcon />}
                                        colorScheme="red"
                                        isRound
                                        size="lg"
                                        onClick={() => handleDelete(group.analysisId)}
                                    />
                                </Flex>
                            )}
                        </Box>
                    ))}
                </SimpleGrid>
            )}

            {/* Modal de Criação/Edição */}
            {isFormOpen && plotId && (
                <PhysicalAnalysisFormDialog 
                    isOpen={isFormOpen} 
                    onClose={() => setIsFormOpen(false)} 
                    onSuccess={fetchData}
                    plotId={parseInt(plotId)}
                    initialData={editingData}
                />
            )}
        </Box>
    );
};