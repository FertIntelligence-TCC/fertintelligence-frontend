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
    Grid,
    InputProps
} from "@chakra-ui/react";
import {
    SelectContent,
    SelectItem,
    SelectRoot,
    SelectTrigger,
    SelectValueText,
} from "@/components/ui/select";
import { toaster } from "@/components/ui/toaster";
import { LuTrash2, LuPlus } from "react-icons/lu";

// Services & Interfaces
import { soilAnalysisService } from "@/services/soilAnalysisService";
import { layerExtractService } from "@/services/layerExtractService";
import { rangeExtractService } from "@/services/rangeExtractService";
import { physicalAnalysisExtractService } from "@/services/physicalAnalysisExtractService";
import { TipoExtrato } from "@/interfaces/SoilAnalysis";
import { Camada } from "@/interfaces/LayerExtract";
import { AnalysisMode, PhysicalExtractFormData } from "@/interfaces/PhysicalAnalysisFormTypes";
import { PhysicalAnalysisExtractUpdatePayload } from "@/interfaces/PhysicalAnalysisExtract";

// Interface interna para gerenciar itens a serem deletados
interface ItemToDelete {
    physicalId: number;
    containerId: number;
}

// --- Componentes Auxiliares de Estilo ---
const SectionHeader = ({ title, colorPalette = "green" }: { title: string, colorPalette?: string }) => (
    <Flex align="center" w="full" mb={3} mt={1}>
        <Text 
            fontWeight="bold" 
            color={`${colorPalette}.700`} 
            _dark={{ color: `${colorPalette}.300` }}
            fontSize="sm" 
            textTransform="uppercase" 
            letterSpacing="wider"
        >
            {title}
        </Text>
        <Separator flex="1" ml={3} borderColor={`${colorPalette}.200`} _dark={{ borderColor: `${colorPalette}.800` }} />
    </Flex>
);

const Field = ({ label, ...props }: InputProps & { label: string }) => (
    <Box w="full">
        <Text fontSize="xs" fontWeight="bold" color="gray.600" _dark={{ color: "gray.400" }} mb={1}>{label}</Text>
        <Input 
            size="sm" 
            variant="outline" 
            bg="white" 
            _dark={{ bg: "gray.800", borderColor: "gray.600", color: "white" }}
            borderColor="gray.300"
            _focus={{ borderColor: "green.500", ring: 1, ringColor: "green.200", _dark: { borderColor: "green.400", ringColor: "green.900" } }} 
            {...props} 
        />
    </Box>
);

const roundToTwoDecimals = (value: number) => Math.round(value * 100) / 100;

const calculatePorosidadeTotal = (densidadeAparente: number, densidadeReal: number) => {
    if (!Number.isFinite(densidadeAparente) || !Number.isFinite(densidadeReal) || densidadeReal === 0) {
        return 0;
    }

    return roundToTwoDecimals(((densidadeReal - densidadeAparente) / densidadeReal) * 100);
};

const calculateAguaDisponivel = (umidadeCapacidadeCampo: number, umidadePontoMurchaPermanente: number) => {
    if (!Number.isFinite(umidadeCapacidadeCampo) || !Number.isFinite(umidadePontoMurchaPermanente)) {
        return 0;
    }

    return roundToTwoDecimals(umidadeCapacidadeCampo - umidadePontoMurchaPermanente);
};

const applyCalculatedPhysicalFields = (extract: PhysicalExtractFormData): PhysicalExtractFormData => ({
    ...extract,
    porosidadeTotal: calculatePorosidadeTotal(extract.densidadeAparente, extract.densidadeReal),
    aguaDisponivel: calculateAguaDisponivel(
        extract.umidadeCapacidadeCampo,
        extract.umidadePontoMurchaPermanente
    ),
});

const getApiErrorMessage = (error: unknown) => {
    if (typeof error !== "object" || error === null || !("response" in error)) {
        return "Erro ao salvar dados.";
    }

    const response = (error as { response?: { data?: { message?: string } } }).response;
    return response?.data?.message || "Erro ao salvar dados.";
};

const camadaCollection = createListCollection({
    items: Object.values(Camada).map((c) => ({ label: c, value: c })),
});

interface PhysicalAnalysisDialogData {
    analysisId?: number;
    year: number | string;
    lab: string;
    type: TipoExtrato;
    extracts: PhysicalExtractFormData[];
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    plotId: number;
    plotIdentification: string;
    initialData?: PhysicalAnalysisDialogData; // Dados para edição ou visualização
    isReadOnly?: boolean; // Novo prop para modo somente leitura
}

export const PhysicalAnalysisFormDialog = ({ 
    isOpen, 
    onClose, 
    onSuccess, 
    plotId, 
    plotIdentification, 
    initialData,
    isReadOnly = false 
}: Props) => {
    const [analysisYear, setAnalysisYear] = useState<string>(new Date().getFullYear().toString());
    const [lab, setLab] = useState("");
    const [mode, setMode] = useState<AnalysisMode>('INITIAL');
    
    const [extracts, setExtracts] = useState<PhysicalExtractFormData[]>([]);
    
    // Estado para guardar tanto o ID físico quanto o ID do container (camada/intervalo)
    const [itemsToDelete, setItemsToDelete] = useState<ItemToDelete[]>([]);
    
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Efeito de Inicialização (Criação vs Edição vs Visualização)
    useEffect(() => {
        if (isOpen) {
            setItemsToDelete([]); // Limpa lista de exclusão ao abrir

            if (initialData) {
                // --- MODO EDIÇÃO / VISUALIZAÇÃO ---
                setAnalysisYear(initialData.year.toString());
                setLab(initialData.lab);
                setMode(initialData.type === TipoExtrato.CAMADAS ? 'LAYER' : 'RANGE');
                
                // Clona os extratos
                const clonedExtracts = JSON.parse(JSON.stringify(initialData.extracts)) as PhysicalExtractFormData[];
                setExtracts(clonedExtracts.map(applyCalculatedPhysicalFields));
            } else {
                // --- MODO CRIAÇÃO ---
                setAnalysisYear(new Date().getFullYear().toString());
                setLab("");
                setMode('INITIAL');
                setExtracts([]);
            }
        }
    }, [isOpen, initialData]);

    const handleAddExtract = () => {
        const newExtract: PhysicalExtractFormData = {
            tempId: Math.random().toString(36).substr(2, 9),
            // databaseId e containerId são undefined para novos
            profundidadeInicial: 0, 
            profundidadeFinal: 20, 
            camada: mode === 'LAYER' ? Camada.A : undefined, 
            subcamada: 1,
            teorAreia: 0, teorSilte: 0, teorArgila: 0,
            densidadeAparente: 0, densidadeReal: 0, porosidadeTotal: 0, microporosidade: 0,
            umidadeCapacidadeCampo: 0, umidadePontoMurchaPermanente: 0, aguaDisponivel: 0, resistenciaPenetracao: 0,
            percAgregados6_0mm: 0, percAgregados4_1a6_0mm: 0, percAgregados2_1a4_0mm: 0, percAgregados1_0a2_0mm: 0,
            percAgregados0_5a1_0mm: 0, percAgregados0_25a0_5mm: 0, percAgregadosMenor0_25mm: 0, dmAgregados: 0
        };
        const updated = [...extracts, newExtract];
        if (mode === 'LAYER') recalculateSubLayers(updated);
        else setExtracts(updated);
    };

    const handleRemoveExtract = (tempId: string) => {
        const itemToRemove = extracts.find(e => e.tempId === tempId);
        
        // Lógica de Deleção
        if (itemToRemove && itemToRemove.databaseId && itemToRemove.containerId) {
            setItemsToDelete(prev => [...prev, { 
                physicalId: itemToRemove.databaseId!, 
                containerId: itemToRemove.containerId! 
            }]);
        }

        const updated = extracts.filter(e => e.tempId !== tempId);
        if (mode === 'LAYER') recalculateSubLayers(updated);
        else setExtracts(updated);
    };

    const handleChangeExtract = (
        tempId: string,
        field: keyof PhysicalExtractFormData,
        value: PhysicalExtractFormData[keyof PhysicalExtractFormData]
    ) => {
        const updated = extracts.map(e => (
            e.tempId === tempId ? applyCalculatedPhysicalFields({ ...e, [field]: value }) : e
        ));
        if (mode === 'LAYER' && field === 'camada') {
            recalculateSubLayers(updated);
        } else {
            setExtracts(updated);
        }
    };

    const recalculateSubLayers = (list: PhysicalExtractFormData[]) => {
        const counts: Record<string, number> = {};
        const newList = list.map(item => {
            if (!item.camada) return item;
            const c = item.camada;
            counts[c] = (counts[c] || 0) + 1;
            return applyCalculatedPhysicalFields({ ...item, subcamada: counts[c] });
        });
        setExtracts(newList);
    };

    const handleCancelMode = () => {
        if (extracts.length > 0 && !confirm("Isso apagará os dados não salvos. Continuar?")) return;
        setMode('INITIAL');
        setExtracts([]);
        setItemsToDelete([]);
    };

    const validate = () => {
        if (!lab.trim()) { toaster.create({ title: "Informe o Laboratório", type: "error" }); return false; }
        if (!analysisYear || isNaN(parseInt(analysisYear))) { toaster.create({ title: "Informe um Ano válido", type: "error" }); return false; }
        if (extracts.length === 0) { toaster.create({ title: "Adicione pelo menos um extrato", type: "error" }); return false; }
        return true;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setIsSubmitting(true);
        try {
            const year = parseInt(analysisYear);
            let analysisId: number;

            // =========================================================
            // 1. GERENCIAMENTO DA ANÁLISE PAI (SOIL_ANALYSIS)
            // =========================================================
            if (initialData?.analysisId) {
                // --- MODO EDIÇÃO ---
                analysisId = initialData.analysisId;
                
                // Atualiza cabeçalho (PUT)
                await soilAnalysisService.update(analysisId, {
                    novo_ano_analise: year,
                    novo_laboratorio_responsavel: lab,
                    novo_tipo_extrato: mode === 'LAYER' ? TipoExtrato.CAMADAS : TipoExtrato.INTERVALOS
                });

                // --- DELEÇÃO DE EXTRATOS REMOVIDOS ---
                if (itemsToDelete.length > 0) {
                    for (const item of itemsToDelete) {
                        try {
                            await physicalAnalysisExtractService.delete(item.physicalId);
                        } catch (e) {
                            console.warn(`Aviso: Falha ao deletar dado físico ID ${item.physicalId}`, e);
                        }
                        try {
                            if (mode === 'LAYER') {
                                await layerExtractService.delete(item.containerId);
                            } else {
                                await rangeExtractService.delete(item.containerId);
                            }
                        } catch (e) {
                            console.warn(`Aviso: Falha ao deletar container ID ${item.containerId}`, e);
                        }
                    }
                }

            } else {
                // --- MODO CRIAÇÃO ---
                const safePlotIdentification = (plotIdentification && plotIdentification.trim() !== "") 
                    ? plotIdentification 
                    : `Talhão ${plotId}`;

                const newAnalysis = await soilAnalysisService.create({
                    ano_analise: year,
                    laboratorio_responsavel: lab,
                    tipo_extrato: mode === 'LAYER' ? TipoExtrato.CAMADAS : TipoExtrato.INTERVALOS,
                    id_talhao: plotId,
                    identificacao_talhao: safePlotIdentification
                });
                analysisId = newAnalysis.id;
            }

            // =========================================================
            // 2. GERENCIAMENTO DOS EXTRATOS (UPSERT)
            // =========================================================
            for (const ext of extracts) {
                
                const payloadFisico = {
                    teor_areia: ext.teorAreia, 
                    teor_silte: ext.teorSilte, 
                    teor_argila: ext.teorArgila,
                    densidade_aparente: ext.densidadeAparente, 
                    densidade_real: ext.densidadeReal,
                    porosidade_total: calculatePorosidadeTotal(ext.densidadeAparente, ext.densidadeReal), 
                    microporosidade: ext.microporosidade,
                    umidade_capacidade_campo: ext.umidadeCapacidadeCampo, 
                    umidade_ponto_murcha_permanente: ext.umidadePontoMurchaPermanente,
                    agua_disponivel: calculateAguaDisponivel(
                        ext.umidadeCapacidadeCampo,
                        ext.umidadePontoMurchaPermanente
                    ), 
                    resistencia_penetracao: ext.resistenciaPenetracao,
                    perc_agregados_6_0mm: ext.percAgregados6_0mm, 
                    perc_agregados_4_1_a_6_0mm: ext.percAgregados4_1a6_0mm,
                    perc_agregados_2_1_a_4_0mm: ext.percAgregados2_1a4_0mm,
                    perc_agregados_1_0_a_2_0mm: ext.percAgregados1_0a2_0mm,
                    perc_agregados_0_5_a_1_0mm: ext.percAgregados0_5a1_0mm,
                    perc_agregados_0_25_a_0_5mm: ext.percAgregados0_25a0_5mm,
                    perc_agregados_menor_0_25mm: ext.percAgregadosMenor0_25mm,
                    dm_agregados: ext.dmAgregados
                };

                if (ext.databaseId) {
                    // --- UPDATE ---
                    
                    // 1. Atualizar dados físicos (Conteúdo)
                    const updatePayload: PhysicalAnalysisExtractUpdatePayload = {};
                    Object.entries(payloadFisico).forEach(([key, val]) => {
            if (val === undefined || val === null) return;

            const feminineKeys = [
              "densidade_aparente",
              "densidade_real",
              "porosidade_total",
              "microporosidade",
              "umidade_capacidade_campo",
              "umidade_ponto_murcha_permanente",
              "agua_disponivel",
              "resistencia_penetracao",
            ];

            const prefix = feminineKeys.includes(key) ? "nova_" : "novo_";

            (updatePayload as Record<string, number>)[`${prefix}${key}`] = val;
          });

                    await physicalAnalysisExtractService.update(ext.databaseId, updatePayload);

                    // 2. Atualizar container (Profundidades / Camadas)
                    if (ext.containerId) {
                        if (mode === 'LAYER') {
                            await layerExtractService.update(ext.containerId, {
                                nova_profundidade_inicial: ext.profundidadeInicial,
                                nova_profundidade_final: ext.profundidadeFinal,
                                nova_camada: ext.camada,
                                nova_subcamada: ext.subcamada
                            });
                        } else {
                            await rangeExtractService.update(ext.containerId, {
                                nova_profundidade_inicial: ext.profundidadeInicial,
                                nova_profundidade_final: ext.profundidadeFinal
                            });
                        }
                    }

                } else {
                    // --- CREATE ---
                    let extractId: number;
                    
                    if (mode === 'LAYER') {
                        const res = await layerExtractService.create(analysisId, {
                            profundidade_inicial: ext.profundidadeInicial, 
                            profundidade_final: ext.profundidadeFinal,
                            camada: ext.camada!, 
                            subcamada: ext.subcamada || 1
                        });
                        extractId = res.id;
                    } else {
                        const res = await rangeExtractService.create(analysisId, {
                            profundidade_inicial: ext.profundidadeInicial, 
                            profundidade_final: ext.profundidadeFinal
                        });
                        extractId = res.id;
                    }
                    
                    await physicalAnalysisExtractService.create(
                        payloadFisico, 
                        mode === 'RANGE' ? extractId : undefined, 
                        mode === 'LAYER' ? extractId : undefined
                    );
                }
            }
            
            toaster.create({ title: "Dados salvos com sucesso!", type: "success" });
            onSuccess(); 
            onClose();

        } catch (error: unknown) {
            console.error("Erro ao salvar:", error);
            const msg = getApiErrorMessage(error);
            toaster.create({ title: "Erro", description: msg, type: "error" });
        } finally { 
            setIsSubmitting(false); 
        }
    };

    return (
        <DialogRoot open={isOpen} onOpenChange={onClose} size="xl">
            <DialogContent bg="gray.50" _dark={{ bg: "gray.900", color: "gray.100" }}>
                <DialogHeader borderBottomWidth="1px" borderColor="gray.200" _dark={{ bg: "gray.800", borderColor: "gray.700" }} bg="white">
                    <DialogTitle color="gray.800" _dark={{ color: "white" }}>
                        {isReadOnly 
                            ? "Visualizar Análise Física" 
                            : (initialData ? "Editar Análise Física" : "Nova Análise Física")}
                    </DialogTitle>
                </DialogHeader>
                <DialogBody py={6}>
                    <VStack gap={6} align="stretch">
                        
                        {/* Dados Gerais */}
                        <Box bg="white" _dark={{ bg: "gray.800", borderColor: "gray.700" }} p={4} borderRadius="md" shadow="sm" borderWidth="1px" borderColor="gray.200">
                            <SectionHeader title="Dados da Análise" />
                            <Grid templateColumns="1fr 2fr" gap={4}>
                                <Field 
                                    label="Ano" 
                                    type="number" 
                                    value={analysisYear} 
                                    onChange={e => setAnalysisYear(e.target.value)} 
                                    readOnly={isReadOnly}
                                />
                                <Field 
                                    label="Laboratório Responsável" 
                                    value={lab} 
                                    onChange={e => setLab(e.target.value)} 
                                    readOnly={isReadOnly}
                                />
                            </Grid>
                        </Box>

                        {/* Seleção de Modo - Desabilitada em visualização se já existir dados */}
                        {mode === 'INITIAL' && !initialData && !isReadOnly && (
                            <VStack gap={4} mt={4} bg="white" _dark={{ bg: "gray.800", borderColor: "gray.700" }} p={6} borderRadius="md" shadow="sm" borderWidth="1px" borderColor="gray.200">
                                <Text fontWeight="bold" color="gray.700" _dark={{ color: "gray.200" }}>Selecione o método de estratificação:</Text>
                                <HStack gap={4} w="full">
                                    <Button flex={1} variant="surface" colorPalette="blue" onClick={() => setMode('LAYER')}>Por Camadas (A, B...)</Button>
                                    <Button flex={1} variant="surface" colorPalette="green" onClick={() => setMode('RANGE')}>Por Profundidade (0-20...)</Button>
                                </HStack>
                            </VStack>
                        )}

                        {/* Formulário de Extratos */}
                        {mode !== 'INITIAL' && (
                            <Box>
                                <Flex justify="space-between" align="center" mb={4}>
                                    <Text fontWeight="bold" fontSize="lg" color="gray.700" _dark={{ color: "gray.200" }}>Amostras / Extratos</Text>
                                    {!isReadOnly && (
                                        <HStack>
                                            <Button size="xs" variant="ghost" colorPalette="red" onClick={handleCancelMode}>Cancelar/Limpar</Button>
                                            <Button size="sm" colorPalette="green" onClick={handleAddExtract}><LuPlus /> Adicionar</Button>
                                        </HStack>
                                    )}
                                </Flex>

                                <VStack gap={4} align="stretch">
                                    {extracts.map((ext, idx) => (
                                        <Box key={ext.tempId} p={5} borderWidth="1px" borderColor="gray.300" _dark={{ bg: "gray.800", borderColor: "gray.600" }} borderRadius="lg" bg="white" shadow="sm">
                                            <Flex justify="space-between" mb={4} align="center">
                                                <Badge colorPalette={mode === 'LAYER' ? "purple" : "cyan"} size="lg" variant="subtle">
                                                    {mode === 'LAYER' ? `Camada ${ext.camada || '?'}${ext.subcamada}` : `Amostra ${idx + 1}`}
                                                </Badge>
                                                {!isReadOnly && (
                                                    <Button size="sm" colorPalette="red" variant="ghost" onClick={() => handleRemoveExtract(ext.tempId)}>
                                                        <LuTrash2 /> Remover
                                                    </Button>
                                                )}
                                            </Flex>

                                            <Grid templateColumns="repeat(6, 1fr)" gap={4} mb={4}>
                                                {mode === 'LAYER' && (
                                                    <Box gridColumn="span 2">
                                                        <Text fontSize="xs" fontWeight="bold" color="gray.600" _dark={{ color: "gray.400" }} mb={1}>Camada</Text>
                                                        <SelectRoot 
                                                            size="sm" 
                                                            collection={camadaCollection}
                                                            value={ext.camada ? [ext.camada] : []}
                                                            onValueChange={(e) => handleChangeExtract(ext.tempId, 'camada', e.value[0])}
                                                            disabled={isReadOnly}
                                                        >
                                                            <SelectTrigger bg="white" _dark={{ bg: "gray.800", borderColor: "gray.600", color: "white" }} borderColor="gray.300">
                                                                <SelectValueText placeholder="Selecione" />
                                                            </SelectTrigger>
                                                            <SelectContent zIndex={1500}>
                                                                {camadaCollection.items.map((item) => (
                                                                    <SelectItem item={item} key={item.value}>
                                                                        {item.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </SelectRoot>
                                                    </Box>
                                                )}
                                                
                                                <Box gridColumn="span 2"><Field label="Prof. Inicial (cm)" type="number" value={ext.profundidadeInicial} onChange={e => handleChangeExtract(ext.tempId, 'profundidadeInicial', parseFloat(e.target.value))} readOnly={isReadOnly} /></Box>
                                                <Box gridColumn="span 2"><Field label="Prof. Final (cm)" type="number" value={ext.profundidadeFinal} onChange={e => handleChangeExtract(ext.tempId, 'profundidadeFinal', parseFloat(e.target.value))} readOnly={isReadOnly} /></Box>
                                            </Grid>

                                            <SectionHeader title="Granulometria (g/dm³)" colorPalette="blue" />
                                            <Grid templateColumns="repeat(3, 1fr)" gap={4} mb={4}>
                                                <Field label="Areia (g/dm³)" type="number" value={ext.teorAreia} onChange={e => handleChangeExtract(ext.tempId, 'teorAreia', parseFloat(e.target.value))} readOnly={isReadOnly} />
                                                <Field label="Silte (g/dm³)" type="number" value={ext.teorSilte} onChange={e => handleChangeExtract(ext.tempId, 'teorSilte', parseFloat(e.target.value))} readOnly={isReadOnly} />
                                                <Field label="Argila (g/dm³)" type="number" value={ext.teorArgila} onChange={e => handleChangeExtract(ext.tempId, 'teorArgila', parseFloat(e.target.value))} readOnly={isReadOnly} />
                                            </Grid>

                                            <SectionHeader title="Física do Solo" colorPalette="orange" />
                                            <Grid templateColumns="repeat(4, 1fr)" gap={4} mb={4}>
                                                <Field label="Dens. Aparente (g/dm³)" type="number" value={ext.densidadeAparente} onChange={e => handleChangeExtract(ext.tempId, 'densidadeAparente', parseFloat(e.target.value))} readOnly={isReadOnly} />
                                                <Field label="Dens. Real (g/dm³)" type="number" value={ext.densidadeReal} onChange={e => handleChangeExtract(ext.tempId, 'densidadeReal', parseFloat(e.target.value))} readOnly={isReadOnly} />
                                                <Field label="Poros. Total (%)" type="number" value={ext.porosidadeTotal} readOnly />
                                                <Field label="Microporos. (%)" type="number" value={ext.microporosidade} onChange={e => handleChangeExtract(ext.tempId, 'microporosidade', parseFloat(e.target.value))} readOnly={isReadOnly} />
                                            </Grid>

                                            <SectionHeader title="Hídrico & Resistência" colorPalette="teal" />
                                            <Grid templateColumns="repeat(4, 1fr)" gap={4} mb={4}>
                                                <Field label="Umidade CC (%)" type="number" value={ext.umidadeCapacidadeCampo} onChange={e => handleChangeExtract(ext.tempId, 'umidadeCapacidadeCampo', parseFloat(e.target.value))} readOnly={isReadOnly} />
                                                <Field label="Umidade PMP (%)" type="number" value={ext.umidadePontoMurchaPermanente} onChange={e => handleChangeExtract(ext.tempId, 'umidadePontoMurchaPermanente', parseFloat(e.target.value))} readOnly={isReadOnly} />
                                                <Field label="Água Disp. (%)" type="number" value={ext.aguaDisponivel} readOnly />
                                                <Field label="Resist. Penetr. (MPa)" type="number" value={ext.resistenciaPenetracao} onChange={e => handleChangeExtract(ext.tempId, 'resistenciaPenetracao', parseFloat(e.target.value))} readOnly={isReadOnly} />
                                            </Grid>

                                            <SectionHeader title="Agregados (%)" colorPalette="green" />
                                            <Grid templateColumns="repeat(4, 1fr)" gap={4}>
                                                <Field label="DMP (mm)" type="number" value={ext.dmAgregados} onChange={e => handleChangeExtract(ext.tempId, 'dmAgregados', parseFloat(e.target.value))} readOnly={isReadOnly} />
                                                <Field label="> 6.0mm" type="number" value={ext.percAgregados6_0mm} onChange={e => handleChangeExtract(ext.tempId, 'percAgregados6_0mm', parseFloat(e.target.value))} readOnly={isReadOnly} />
                                                <Field label="4-6mm" type="number" value={ext.percAgregados4_1a6_0mm} onChange={e => handleChangeExtract(ext.tempId, 'percAgregados4_1a6_0mm', parseFloat(e.target.value))} readOnly={isReadOnly} />
                                                <Field label="2-4mm" type="number" value={ext.percAgregados2_1a4_0mm} onChange={e => handleChangeExtract(ext.tempId, 'percAgregados2_1a4_0mm', parseFloat(e.target.value))} readOnly={isReadOnly} />
                                                <Field label="1-2mm" type="number" value={ext.percAgregados1_0a2_0mm} onChange={e => handleChangeExtract(ext.tempId, 'percAgregados1_0a2_0mm', parseFloat(e.target.value))} readOnly={isReadOnly} />
                                                <Field label="0.5-1mm" type="number" value={ext.percAgregados0_5a1_0mm} onChange={e => handleChangeExtract(ext.tempId, 'percAgregados0_5a1_0mm', parseFloat(e.target.value))} readOnly={isReadOnly} />
                                                <Field label="0.25-0.5mm" type="number" value={ext.percAgregados0_25a0_5mm} onChange={e => handleChangeExtract(ext.tempId, 'percAgregados0_25a0_5mm', parseFloat(e.target.value))} readOnly={isReadOnly} />
                                                <Field label="< 0.25mm" type="number" value={ext.percAgregadosMenor0_25mm} onChange={e => handleChangeExtract(ext.tempId, 'percAgregadosMenor0_25mm', parseFloat(e.target.value))} readOnly={isReadOnly} />
                                            </Grid>
                                        </Box>
                                    ))}
                                </VStack>
                            </Box>
                        )}
                    </VStack>
                </DialogBody>
                <DialogFooter bg="gray.100" _dark={{ bg: "gray.800", borderColor: "gray.700" }} borderTopWidth="1px" borderColor="gray.200">
                    <Button variant="ghost" colorPalette="gray" onClick={onClose}>
                        {isReadOnly ? "Fechar" : "Cancelar"}
                    </Button>
                    {!isReadOnly && (
                        <Button onClick={handleSubmit} loading={isSubmitting} colorPalette="green" disabled={mode === 'INITIAL'}>
                            {initialData ? "Salvar Alterações" : "Salvar Análise"}
                        </Button>
                    )}
                </DialogFooter>
                <DialogCloseTrigger color="gray.500" />
            </DialogContent>
        </DialogRoot>
    );
};
