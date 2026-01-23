import { useEffect, useState } from "react";
import {
    DialogRoot,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogBody,
    DialogFooter,
    DialogCloseTrigger,
} from "@/components/ui/dialog";
import {
    Button,
    VStack,
    Input,
    Text,
    HStack,
    Box,
    Separator,
    Flex,
    Badge,
    createListCollection,
    Grid} from "@chakra-ui/react";
import {
    SelectContent,
    SelectItem,
    SelectRoot,
    SelectTrigger,
    SelectValueText,
} from "@/components/ui/select";
import { toaster } from "@/components/ui/toaster";

// Services
import { soilAnalysisService } from "@/services/soilAnalysisService";
import { layerExtractService } from "@/services/layerExtractService";
import { rangeExtractService } from "@/services/rangeExtractService";
import { physicalAnalysisExtractService } from "@/services/physicalAnalysisExtractService";

// Interfaces
import { TipoExtrato } from "@/interfaces/SoilAnalysis";
import { Camada } from "@/interfaces/LayerExtract";
import { AnalysisMode, PhysicalExtractFormData } from "@/interfaces/PhysicalAnalysisFormTypes";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    plotId: number;
    initialData?: any; // Para edição futura
}

const camadaCollection = createListCollection({
    items: Object.values(Camada).map((c) => ({ label: c, value: c })),
});

export const PhysicalAnalysisFormDialog = ({ isOpen, onClose, onSuccess, plotId }: Props) => {
    // --- ESTADOS ---
    const [analysisYear, setAnalysisYear] = useState<string>(new Date().getFullYear().toString());
    const [lab, setLab] = useState("");
    const [mode, setMode] = useState<AnalysisMode>('INITIAL');
    const [extracts, setExtracts] = useState<PhysicalExtractFormData[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset ao abrir
    useEffect(() => {
        if (isOpen) {
            setAnalysisYear(new Date().getFullYear().toString());
            setLab("");
            setMode('INITIAL');
            setExtracts([]);
        }
    }, [isOpen]);

    // --- LÓGICA DE LISTA ---

    const handleAddExtract = () => {
        const newExtract: PhysicalExtractFormData = {
            tempId: Math.random().toString(36).substr(2, 9),
            
            // Dados do Extrato
            profundidadeInicial: 0,
            profundidadeFinal: 20,
            camada: mode === 'LAYER' ? Camada.A : undefined,
            subcamada: 1,

            // Granulometria
            teorAreia: 0,
            teorSilte: 0,
            teorArgila: 0,

            // Densidade e Porosidade
            densidadeAparente: 0,
            densidadeReal: 0,
            porosidadeTotal: 0,
            microporosidade: 0,

            // Hídrico e Resistência
            umidadeCapacidadeCampo: 0,
            umidadePontoMurchaPermanente: 0,
            aguaDisponivel: 0,
            resistenciaPenetracao: 0,

            // Agregados
            percAgregados6_0mm: 0,
            percAgregados4_1a6_0mm: 0,
            percAgregados2_1a4_0mm: 0,
            percAgregados1_0a2_0mm: 0,
            percAgregados0_5a1_0mm: 0,
            percAgregados0_25a0_5mm: 0,
            percAgregadosMenor0_25mm: 0,
            dmAgregados: 0
        };

        const updatedList = [...extracts, newExtract];
        
        if (mode === 'LAYER') {
            recalculateSubLayers(updatedList);
        } else {
            setExtracts(updatedList);
        }
    };

    const handleRemoveExtract = (tempId: string) => {
        const updatedList = extracts.filter(e => e.tempId !== tempId);
        if (mode === 'LAYER') recalculateSubLayers(updatedList);
        else setExtracts(updatedList);
    };

    const handleChangeExtract = (tempId: string, field: keyof PhysicalExtractFormData, value: any) => {
        const updatedList = extracts.map(e => e.tempId === tempId ? { ...e, [field]: value } : e);
        
        if (mode === 'LAYER' && field === 'camada') {
            recalculateSubLayers(updatedList);
        } else {
            setExtracts(updatedList);
        }
    };

    const recalculateSubLayers = (list: PhysicalExtractFormData[]) => {
        const counts: Record<string, number> = {};
        const newList = list.map(item => {
            if (!item.camada) return item;
            const c = item.camada;
            counts[c] = (counts[c] || 0) + 1;
            return { ...item, subcamada: counts[c] };
        });
        setExtracts(newList);
    };

    const handleCancelMode = () => {
        if (extracts.length > 0 && !confirm("Isso apagará os extratos inseridos. Continuar?")) return;
        setMode('INITIAL');
        setExtracts([]);
    };

    // --- VALIDAÇÃO ---

    const validate = (): boolean => {
        if (!lab) {
            toaster.create({ title: "Informe o Laboratório", type: "error" });
            return false;
        }
        if (extracts.length === 0) {
            toaster.create({ title: "Adicione pelo menos um extrato", type: "error" });
            return false;
        }

        const sorted = [...extracts].sort((a, b) => a.profundidadeInicial - b.profundidadeInicial);
        
        for (let i = 0; i < sorted.length; i++) {
            const current = sorted[i];
            
            if (current.profundidadeInicial >= current.profundidadeFinal) {
                toaster.create({ title: `Erro na linha ${i+1}: Profundidade inicial deve ser menor que a final.`, type: "error" });
                return false;
            }

            if (i < sorted.length - 1) {
                const next = sorted[i+1];
                if (current.profundidadeFinal > next.profundidadeInicial) {
                    toaster.create({ 
                        title: "Sobreposição detectada", 
                        description: `O extrato ${current.profundidadeInicial}-${current.profundidadeFinal} sobrepõe o próximo.`, 
                        type: "error" 
                    });
                    return false;
                }
            }
        }
        return true;
    };

    // --- ORQUESTRADOR DE SALVAMENTO ---

    const handleSubmit = async () => {
        if (!validate()) return;
        setIsSubmitting(true);

        try {
            // 1. Criar Análise de Solo (Pai)
            const analysis = await soilAnalysisService.create({
                ano_analise: parseInt(analysisYear),
                laboratorio_responsavel: lab,
                tipo_extrato: mode === 'LAYER' ? TipoExtrato.CAMADAS : TipoExtrato.INTERVALOS,
                id_talhao: plotId,
                identificacao_talhao: ""
            });

            // 2. Criar Extratos e Dados Físicos em Loop
            for (const ext of extracts) {
                let extractId: number;

                // Cria o Extrato (Camada ou Intervalo)
                if (mode === 'LAYER') {
                    const layerRes = await layerExtractService.create(analysis.id, {
                        profundidade_inicial: ext.profundidadeInicial,
                        profundidade_final: ext.profundidadeFinal,
                        camada: ext.camada!,
                        subcamada: ext.subcamada || 1
                    });
                    extractId = layerRes.id;
                } else {
                    const rangeRes = await rangeExtractService.create(analysis.id, {
                        profundidade_inicial: ext.profundidadeInicial,
                        profundidade_final: ext.profundidadeFinal
                    });
                    extractId = rangeRes.id;
                }

                // Cria o Objeto de Dados Físicos
                await physicalAnalysisExtractService.create({
                    teor_areia: ext.teorAreia,
                    teor_silte: ext.teorSilte,
                    teor_argila: ext.teorArgila,
                    densidade_aparente: ext.densidadeAparente,
                    densidade_real: ext.densidadeReal,
                    porosidade_total: ext.porosidadeTotal,
                    microporosidade: ext.microporosidade,
                    umidade_capacidade_campo: ext.umidadeCapacidadeCampo,
                    umidade_ponto_murcha_permanente: ext.umidadePontoMurchaPermanente,
                    agua_disponivel: ext.aguaDisponivel,
                    resistencia_penetracao: ext.resistenciaPenetracao,
                    perc_agregados_6_0mm: ext.percAgregados6_0mm,
                    perc_agregados_4_1_a_6_0mm: ext.percAgregados4_1a6_0mm,
                    perc_agregados_2_1_a_4_0mm: ext.percAgregados2_1a4_0mm,
                    // Campos adicionais de agregados calculados ou opcionais (se necessário no payload)
                }, 
                mode === 'RANGE' ? extractId : undefined, // rangeExtractId
                mode === 'LAYER' ? extractId : undefined  // layerExtractId
                );
            }

            toaster.create({ title: "Análise salva com sucesso!", type: "success" });
            onSuccess();
            onClose();

        } catch (error) {
            console.error(error);
            toaster.create({ title: "Erro ao salvar", description: "Verifique os dados.", type: "error" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <DialogRoot open={isOpen} onOpenChange={onClose} size="xl">
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Criar Análise Física</DialogTitle>
                </DialogHeader>
                <DialogBody>
                    <VStack gap={5} align="stretch">
                        
                        {/* Box Cabeçalho */}
                        <Box p={4} borderWidth="1px" borderRadius="md" bg="gray.50">
                            <Text fontWeight="bold" mb={2}>Dados da Análise</Text>
                            <HStack gap={4}>
                                <Box flex={1}>
                                    <Text fontSize="xs" fontWeight="medium">Ano</Text>
                                    <Input value={analysisYear} onChange={e => setAnalysisYear(e.target.value)} type="number" bg="white"/>
                                </Box>
                                <Box flex={2}>
                                    <Text fontSize="xs" fontWeight="medium">Laboratório</Text>
                                    <Input value={lab} onChange={e => setLab(e.target.value)} placeholder="Nome do Lab" bg="white"/>
                                </Box>
                            </HStack>
                        </Box>

                        {/* Seleção de Modo */}
                        {mode === 'INITIAL' && (
                            <VStack gap={3} align="stretch" py={4}>
                                <Flex justify="space-between" align="center" p={4} borderWidth="1px" borderRadius="md" _hover={{bg: "gray.50"}}>
                                    <Text fontWeight="bold">Estratificar por camada?</Text>
                                    <Button colorPalette="blue" onClick={() => setMode('LAYER')}>Sim</Button>
                                </Flex>
                                <Button variant="outline" size="lg" onClick={() => setMode('RANGE')}>
                                    Estratificar por profundidade (Adicionar Intervalos)
                                </Button>
                            </VStack>
                        )}

                        {/* Formulário de Extratos */}
                        {mode !== 'INITIAL' && (
                            <Box>
                                <Flex justify="space-between" mb={4} align="center">
                                    <Button size="sm" onClick={handleAddExtract} colorPalette="green">
                                        {mode === 'LAYER' ? "+ Adicionar Extrato" : "+ Adicionar Intervalo"}
                                    </Button>
                                    <Button size="sm" variant="ghost" colorPalette="red" onClick={handleCancelMode}>Cancelar</Button>
                                </Flex>

                                <VStack gap={4} align="stretch">
                                    {extracts.map((ext, index) => (
                                        <Box key={ext.tempId} p={4} borderWidth="1px" borderRadius="md" position="relative" shadow="sm">
                                            <Flex justify="space-between" mb={3} borderBottomWidth="1px" pb={2}>
                                                <Badge colorPalette={mode === 'LAYER' ? "purple" : "cyan"} size="lg">
                                                    {mode === 'LAYER' ? `Camada ${ext.camada || '?'}${ext.subcamada || ''}` : `Intervalo ${index + 1}`}
                                                </Badge>
                                                <Button size="xs" colorPalette="red" variant="ghost" onClick={() => handleRemoveExtract(ext.tempId)}>
                                                    Remover (-)
                                                </Button>
                                            </Flex>

                                            {/* Linha 1: Identificação do Extrato */}
                                            <HStack gap={4} align="end" mb={4}>
                                                {mode === 'LAYER' && (
                                                    <Box width="100px">
                                                        <Text fontSize="xs" fontWeight="bold">Camada</Text>
                                                        <SelectRoot
                                                            collection={camadaCollection}
                                                            value={[ext.camada || ""]}
                                                            onValueChange={(e) => handleChangeExtract(ext.tempId, 'camada', e.value[0])}
                                                            size="sm"
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValueText placeholder="-" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {camadaCollection.items.map((item) => (
                                                                    <SelectItem item={item} key={item.value}>{item.label}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </SelectRoot>
                                                    </Box>
                                                )}
                                                <Box width="90px">
                                                    <Text fontSize="xs" fontWeight="bold">Prof. Inicial</Text>
                                                    <Input size="sm" type="number" value={ext.profundidadeInicial} onChange={e => handleChangeExtract(ext.tempId, 'profundidadeInicial', parseFloat(e.target.value))} />
                                                </Box>
                                                <Box width="90px">
                                                    <Text fontSize="xs" fontWeight="bold">Prof. Final</Text>
                                                    <Input size="sm" type="number" value={ext.profundidadeFinal} onChange={e => handleChangeExtract(ext.tempId, 'profundidadeFinal', parseFloat(e.target.value))} />
                                                </Box>
                                            </HStack>

                                            <Separator mb={4} />

                                            {/* Campos Físicos Agrupados */}
                                            <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                                                
                                                {/* Grupo 1: Granulometria */}
                                                <Box>
                                                    <Text fontSize="sm" fontWeight="bold" mb={2} color="blue.600">Granulometria (g/kg)</Text>
                                                    <Grid templateColumns="1fr 1fr 1fr" gap={2}>
                                                        <Box><Text fontSize="xs">Areia</Text><Input size="xs" type="number" value={ext.teorAreia} onChange={e => handleChangeExtract(ext.tempId, 'teorAreia', parseFloat(e.target.value))} /></Box>
                                                        <Box><Text fontSize="xs">Silte</Text><Input size="xs" type="number" value={ext.teorSilte} onChange={e => handleChangeExtract(ext.tempId, 'teorSilte', parseFloat(e.target.value))} /></Box>
                                                        <Box><Text fontSize="xs">Argila</Text><Input size="xs" type="number" value={ext.teorArgila} onChange={e => handleChangeExtract(ext.tempId, 'teorArgila', parseFloat(e.target.value))} /></Box>
                                                    </Grid>
                                                </Box>

                                                {/* Grupo 2: Densidade e Porosidade */}
                                                <Box>
                                                    <Text fontSize="sm" fontWeight="bold" mb={2} color="orange.600">Física do Solo</Text>
                                                    <Grid templateColumns="1fr 1fr" gap={2}>
                                                        <Box><Text fontSize="xs">Dens. Aparente</Text><Input size="xs" type="number" value={ext.densidadeAparente} onChange={e => handleChangeExtract(ext.tempId, 'densidadeAparente', parseFloat(e.target.value))} /></Box>
                                                        <Box><Text fontSize="xs">Dens. Real</Text><Input size="xs" type="number" value={ext.densidadeReal} onChange={e => handleChangeExtract(ext.tempId, 'densidadeReal', parseFloat(e.target.value))} /></Box>
                                                        <Box><Text fontSize="xs">Poros. Total</Text><Input size="xs" type="number" value={ext.porosidadeTotal} onChange={e => handleChangeExtract(ext.tempId, 'porosidadeTotal', parseFloat(e.target.value))} /></Box>
                                                        <Box><Text fontSize="xs">Microporos.</Text><Input size="xs" type="number" value={ext.microporosidade} onChange={e => handleChangeExtract(ext.tempId, 'microporosidade', parseFloat(e.target.value))} /></Box>
                                                    </Grid>
                                                </Box>

                                                {/* Grupo 3: Hídrico */}
                                                <Box>
                                                    <Text fontSize="sm" fontWeight="bold" mb={2} color="cyan.600">Hídrico e Resistência</Text>
                                                    <Grid templateColumns="1fr 1fr" gap={2}>
                                                        <Box><Text fontSize="xs">Umidade CC</Text><Input size="xs" type="number" value={ext.umidadeCapacidadeCampo} onChange={e => handleChangeExtract(ext.tempId, 'umidadeCapacidadeCampo', parseFloat(e.target.value))} /></Box>
                                                        <Box><Text fontSize="xs">Ponto Murcha</Text><Input size="xs" type="number" value={ext.umidadePontoMurchaPermanente} onChange={e => handleChangeExtract(ext.tempId, 'umidadePontoMurchaPermanente', parseFloat(e.target.value))} /></Box>
                                                        <Box><Text fontSize="xs">Água Disp.</Text><Input size="xs" type="number" value={ext.aguaDisponivel} onChange={e => handleChangeExtract(ext.tempId, 'aguaDisponivel', parseFloat(e.target.value))} /></Box>
                                                        <Box><Text fontSize="xs">Resist. Penetr.</Text><Input size="xs" type="number" value={ext.resistenciaPenetracao} onChange={e => handleChangeExtract(ext.tempId, 'resistenciaPenetracao', parseFloat(e.target.value))} /></Box>
                                                    </Grid>
                                                </Box>

                                                {/* Grupo 4: Agregados */}
                                                <Box>
                                                    <Text fontSize="sm" fontWeight="bold" mb={2} color="green.600">Estabilidade de Agregados</Text>
                                                    <Grid templateColumns="1fr 1fr 1fr" gap={2}>
                                                        <Box><Text fontSize="xs">DM Agreg.</Text><Input size="xs" type="number" value={ext.dmAgregados} onChange={e => handleChangeExtract(ext.tempId, 'dmAgregados', parseFloat(e.target.value))} /></Box>
                                                        <Box><Text fontSize="xs">&gt; 6mm</Text><Input size="xs" type="number" value={ext.percAgregados6_0mm} onChange={e => handleChangeExtract(ext.tempId, 'percAgregados6_0mm', parseFloat(e.target.value))} /></Box>
                                                        <Box><Text fontSize="xs">4-6mm</Text><Input size="xs" type="number" value={ext.percAgregados4_1a6_0mm} onChange={e => handleChangeExtract(ext.tempId, 'percAgregados4_1a6_0mm', parseFloat(e.target.value))} /></Box>
                                                    </Grid>
                                                </Box>
                                            </Grid>
                                        </Box>
                                    ))}
                                </VStack>
                            </Box>
                        )}

                    </VStack>
                </DialogBody>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSubmit} loading={isSubmitting} colorPalette="green" disabled={mode === 'INITIAL'}>
                        Salvar Análise
                    </Button>
                </DialogFooter>
                <DialogCloseTrigger />
            </DialogContent>
        </DialogRoot>
    );
};