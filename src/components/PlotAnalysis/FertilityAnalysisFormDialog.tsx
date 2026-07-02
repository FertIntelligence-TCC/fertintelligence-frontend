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
import { fertilityAnalysisExtractService } from "@/services/fertilityAnalysisExtractService";
import { TipoExtrato } from "@/interfaces/SoilAnalysis";
import { Camada } from "@/interfaces/LayerExtract";
import { AnalysisMode, FertilityExtractFormData } from "@/interfaces/FertilityAnalysisFormTypes";

// Interface para gerenciar itens a serem deletados (Dado + Container)
interface ItemToDelete {
    fertilityId: number;
    containerId: number;
}

// --- Componentes Auxiliares de Estilo ---
const SectionHeader = ({ title, colorPalette = "teal" }: { title: string, colorPalette?: string }) => (
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
            _focus={{ borderColor: "teal.500", ring: 1, ringColor: "teal.200", _dark: { borderColor: "teal.400", ringColor: "teal.900" } }} 
            {...props} 
        />
    </Box>
);

const camadaCollection = createListCollection({
    items: Object.values(Camada).map((c) => ({ label: c, value: c }))
});

const NOT_CALCULATED_LABEL = "Não calculado";

const formatBackendCalculatedValue = (value?: number | null, suffix = "") => {
    if (value === undefined || value === null) return NOT_CALCULATED_LABEL;

    const numericValue = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(numericValue)) return NOT_CALCULATED_LABEL;

    return `${numericValue.toLocaleString("pt-BR", {
        maximumFractionDigits: 2,
    })}${suffix}`;
};

const fieldsThatRefreshCalculatedPreview = new Set<keyof FertilityExtractFormData>([
    "potassio",
    "sodio",
    "calcio",
    "magnesio",
    "aluminio",
    "aluminioMaisHidrogenio",
    "ctcPh7",
]);

const toFiniteNumber = (value: unknown): number | null => {
    const numericValue = typeof value === "number" ? value : Number(value);
    return Number.isFinite(numericValue) ? numericValue : null;
};

const divideOrNull = (dividend: number | null, divisor: number | null) => {
    if (dividend === null || divisor === null || divisor === 0) return null;

    const result = dividend / divisor;
    return Number.isFinite(result) ? result : null;
};

const percentageOfCtcOrNull = (value: number | null, ctcPh7: number | null) => {
    const ratio = divideOrNull(value, ctcPh7);
    return ratio === null ? null : ratio * 100;
};

const recalculateCalculatedPreview = (extract: FertilityExtractFormData): FertilityExtractFormData => {
    const potassio = toFiniteNumber(extract.potassio);
    const sodio = toFiniteNumber(extract.sodio);
    const calcio = toFiniteNumber(extract.calcio);
    const magnesio = toFiniteNumber(extract.magnesio);
    const aluminio = toFiniteNumber(extract.aluminio);
    const aluminioMaisHidrogenio = toFiniteNumber(extract.aluminioMaisHidrogenio);
    const ctcPh7 = toFiniteNumber(extract.ctcPh7);
    const hidrogenio = aluminioMaisHidrogenio !== null && aluminio !== null
        ? aluminioMaisHidrogenio - aluminio
        : null;

    return {
        ...extract,
        saturacaoPotassioCtc: percentageOfCtcOrNull(potassio, ctcPh7),
        saturacaoSodioCtc: percentageOfCtcOrNull(sodio, ctcPh7),
        saturacaoCalcioCtc: percentageOfCtcOrNull(calcio, ctcPh7),
        saturacaoMagnesioCtc: percentageOfCtcOrNull(magnesio, ctcPh7),
        saturacaoHidrogenioCtc: percentageOfCtcOrNull(hidrogenio, ctcPh7),
        saturacaoAluminioCtc: percentageOfCtcOrNull(aluminio, ctcPh7),
        relacaoCalcioMagnesio: divideOrNull(calcio, magnesio),
        relacaoCalcioPotassio: divideOrNull(calcio, potassio),
        relacaoMagnesioPotassio: divideOrNull(magnesio, potassio),
        relacaoCalcioMagnesioPotassio: divideOrNull(
            calcio !== null && magnesio !== null ? calcio + magnesio : null,
            potassio
        ),
    };
};

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    plotId: number;
    plotIdentification: string;
    initialData?: any; // Dados para edição
    isReadOnly?: boolean; // Novo prop para modo somente leitura
}

export const FertilityAnalysisFormDialog = ({ 
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
    
    const [extracts, setExtracts] = useState<FertilityExtractFormData[]>([]);
    
    // Estado para deletar o par (Dado Químico + Container)
    const [itemsToDelete, setItemsToDelete] = useState<ItemToDelete[]>([]);
    
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Efeito de Inicialização
    useEffect(() => {
        if (isOpen) {
            setItemsToDelete([]); // Limpa lista de exclusão

            if (initialData) {
                // --- MODO EDIÇÃO / VISUALIZAÇÃO ---
                setAnalysisYear(initialData.year.toString());
                setLab(initialData.lab);
                setMode(initialData.type === TipoExtrato.CAMADAS ? 'LAYER' : 'RANGE');
                
                // Clona os dados para edição
                setExtracts(JSON.parse(JSON.stringify(initialData.extracts)));
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
        const newExtract: FertilityExtractFormData = {
            tempId: Math.random().toString(36).substr(2, 9),
            // databaseId e containerId undefined para novos
            profundidadeInicial: 0, 
            profundidadeFinal: 20, 
            camada: mode === 'LAYER' ? Camada.A : undefined, 
            subcamada: 1,
            
            // Campos de Fertilidade
            phAgua: 0, phCacl2: 0, calcio: 0, magnesio: 0, potassio: 0, enxofre: 0, sodio: 0, 
            aluminio: 0, aluminioMaisHidrogenio: 0, somaBases: null, ctcEfetiva: null, ctcPh7: null, 
            saturacaoBasesV: null, saturacaoAluminioM: null, pst: null, fosforoMehlich1: 0, fosforoResina: 0, 
            materiaOrganica: 0, boro: 0, cobre: 0, ferro: 0, manganes: 0, zinco: 0
        };
        const updated = [...extracts, newExtract];
        if (mode === 'LAYER') recalculateSubLayers(updated);
        else setExtracts(updated);
    };

    const handleRemoveExtract = (tempId: string) => {
        const itemToRemove = extracts.find(e => e.tempId === tempId);
        
        // Marca para deletar se já existir no banco (tem databaseId) e tiver containerId
        if (itemToRemove && itemToRemove.databaseId && itemToRemove.containerId) {
            setItemsToDelete(prev => [...prev, {
                fertilityId: itemToRemove.databaseId!,
                containerId: itemToRemove.containerId!
            }]);
        }

        const updated = extracts.filter(e => e.tempId !== tempId);
        if (mode === 'LAYER') recalculateSubLayers(updated);
        else setExtracts(updated);
    };

    const handleChangeExtract = (tempId: string, field: keyof FertilityExtractFormData, value: any) => {
        const updated = extracts.map(e => {
            if (e.tempId !== tempId) return e;

            const changedExtract = { ...e, [field]: value };
            return fieldsThatRefreshCalculatedPreview.has(field)
                ? recalculateCalculatedPreview(changedExtract)
                : changedExtract;
        });
        if (mode === 'LAYER' && field === 'camada') {
            recalculateSubLayers(updated);
        } else {
            setExtracts(updated);
        }
    };

    const recalculateSubLayers = (list: FertilityExtractFormData[]) => {
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
            // 1. GERENCIAMENTO DA ANÁLISE PAI
            // =========================================================
            if (initialData?.analysisId) {
                // --- MODO EDIÇÃO ---
                analysisId = initialData.analysisId;

                // Atualiza análise pai
                await soilAnalysisService.update(analysisId, {
                    novo_ano_analise: year,
                    novo_laboratorio_responsavel: lab,
                    novo_tipo_extrato: mode === 'LAYER' ? TipoExtrato.CAMADAS : TipoExtrato.INTERVALOS
                });

                // --- DELEÇÃO DE EXTRATOS REMOVIDOS ---
                if (itemsToDelete.length > 0) {
                    for (const item of itemsToDelete) {
                        try {
                            // 1. Deleta dado químico
                            await fertilityAnalysisExtractService.delete(item.fertilityId);
                        } catch (e) {
                            console.warn(`Aviso: Falha ao deletar dado químico ID ${item.fertilityId}`, e);
                        }

                        try {
                            // 2. Deleta container (limpeza de zumbis)
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
                // Sempre cria nova análise para evitar conflito de tipos.
                
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
                // Mapeamento dos campos para DTO
                const payloadQuimico = {
                    ph_agua: ext.phAgua, 
                    ph_cacl2: ext.phCacl2, 
                    calcio: ext.calcio, 
                    magnesio: ext.magnesio, 
                    potassio: ext.potassio, 
                    sodio: ext.sodio,
                    aluminio: ext.aluminio, 
                    aluminio_mais_hidrogenio: ext.aluminioMaisHidrogenio, 
                    fosforo_mehlich1: ext.fosforoMehlich1, 
                    fosforo_resina: ext.fosforoResina, 
                    enxofre: ext.enxofre, 
                    materia_organica: ext.materiaOrganica, 
                    boro: ext.boro, 
                    cobre: ext.cobre, 
                    ferro: ext.ferro, 
                    manganes: ext.manganes, 
                    zinco: ext.zinco
                };

                if (ext.databaseId) {
                    // --- UPDATE (Já existe no banco) ---
                    const updatePayload: any = {};
                    
                    Object.entries(payloadQuimico).forEach(([key, val]) => {
                        let prefix = "novo_";
                        if (["soma_bases", "ctc_efetiva", "ctc_ph7", "saturacao_bases_v", "saturacao_aluminio_m", "materia_organica"].includes(key)) {
                            prefix = "nova_";
                        }
                        updatePayload[`${prefix}${key}`] = val;
                    });

                    await fertilityAnalysisExtractService.update(ext.databaseId, updatePayload);

                    // 2. Atualizar container (Profundidades)
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
                    // --- CREATE (Novo extrato na lista) ---
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
                    
                    await fertilityAnalysisExtractService.create(
                        payloadQuimico, 
                        mode === 'RANGE' ? extractId : undefined, 
                        mode === 'LAYER' ? extractId : undefined
                    );
                }
            }
            
            toaster.create({ title: "Análise de Fertilidade salva!", type: "success" });
            onSuccess(); 
            onClose();

        } catch (error: any) {
            console.error("Erro ao salvar:", error);
            const msg = error.response?.data?.message || "Erro ao salvar dados.";
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
                            ? "Visualizar Análise de Fertilidade" 
                            : (initialData ? "Editar Análise de Fertilidade" : "Nova Análise de Fertilidade")}
                    </DialogTitle>
                </DialogHeader>
                <DialogBody py={6}>
                    <VStack gap={6} align="stretch">
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
                                    label="Laboratório" 
                                    value={lab} 
                                    onChange={e => setLab(e.target.value)} 
                                    readOnly={isReadOnly}
                                />
                            </Grid>
                        </Box>

                        {/* Seleção de Modo - Desabilitada em ReadOnly se já tiver dados */}
                        {mode === 'INITIAL' && !initialData && !isReadOnly && (
                            <VStack gap={4} mt={4} bg="white" _dark={{ bg: "gray.800", borderColor: "gray.700" }} p={6} borderRadius="md" shadow="sm" borderWidth="1px" borderColor="gray.200">
                                <Text fontWeight="bold" color="gray.700" _dark={{ color: "gray.200" }}>Selecione o método de estratificação:</Text>
                                <HStack gap={4} w="full">
                                    <Button flex={1} variant="surface" colorPalette="blue" onClick={() => setMode('LAYER')}>Por Camadas</Button>
                                    <Button flex={1} variant="surface" colorPalette="teal" onClick={() => setMode('RANGE')}>Por Profundidade</Button>
                                </HStack>
                            </VStack>
                        )}

                        {/* Formulário de Extratos */}
                        {mode !== 'INITIAL' && (
                            <Box>
                                <Flex justify="space-between" align="center" mb={4}>
                                    <Text fontWeight="bold" fontSize="lg" color="gray.700" _dark={{ color: "gray.200" }}>Extratos</Text>
                                    {!isReadOnly && (
                                        <HStack>
                                            <Button size="xs" variant="ghost" colorPalette="red" onClick={handleCancelMode}>Cancelar/Limpar</Button>
                                            <Button size="sm" colorPalette="teal" onClick={handleAddExtract}><LuPlus /> Adicionar</Button>
                                        </HStack>
                                    )}
                                </Flex>
                                <VStack gap={4} align="stretch">
                                    {extracts.map((ext, idx) => {
                                        return (
                                        <Box key={ext.tempId} p={5} borderWidth="1px" borderColor="gray.300" _dark={{ bg: "gray.800", borderColor: "gray.600" }} borderRadius="lg" bg="white" shadow="sm">
                                            <Flex justify="space-between" mb={4} align="center">
                                                <Badge colorPalette="teal" size="lg" variant="subtle">{mode === 'LAYER' ? `Camada ${ext.camada}${ext.subcamada}` : `Amostra ${idx + 1}`}</Badge>
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

                                            <SectionHeader title="Acidez & Alumínio" colorPalette="red" />
                                            <Grid templateColumns="repeat(4, 1fr)" gap={4} mb={4}>
                                                <Field label="pH H₂O" type="number" value={ext.phAgua} onChange={e => handleChangeExtract(ext.tempId, 'phAgua', parseFloat(e.target.value))} readOnly={isReadOnly} />
                                                <Field label="pH CaCl₂" type="number" value={ext.phCacl2} onChange={e => handleChangeExtract(ext.tempId, 'phCacl2', parseFloat(e.target.value))} readOnly={isReadOnly} />
                                                <Field label="Al3+ (mmolc/dm³)" type="number" value={ext.aluminio} onChange={e => handleChangeExtract(ext.tempId, 'aluminio', parseFloat(e.target.value))} readOnly={isReadOnly} />
                                                <Field label="H+Al (mmolc/dm³)" type="number" value={ext.aluminioMaisHidrogenio} onChange={e => handleChangeExtract(ext.tempId, 'aluminioMaisHidrogenio', parseFloat(e.target.value))} readOnly={isReadOnly} />
                                            </Grid>

                                            <SectionHeader title="Bases Trocáveis" colorPalette="blue" />
                                            <Grid templateColumns="repeat(4, 1fr)" gap={4} mb={4}>
                                                <Field label="Ca2+ (mmolc/dm³)" type="number" value={ext.calcio} onChange={e => handleChangeExtract(ext.tempId, 'calcio', parseFloat(e.target.value))} readOnly={isReadOnly} />
                                                <Field label="Mg2+ (mmolc/dm³)" type="number" value={ext.magnesio} onChange={e => handleChangeExtract(ext.tempId, 'magnesio', parseFloat(e.target.value))} readOnly={isReadOnly} />
                                                <Field label="K+ (mmolc/dm³)" type="number" value={ext.potassio} onChange={e => handleChangeExtract(ext.tempId, 'potassio', parseFloat(e.target.value))} readOnly={isReadOnly} />
                                                <Field label="Na+ (mmolc/dm³)" type="number" value={ext.sodio} onChange={e => handleChangeExtract(ext.tempId, 'sodio', parseFloat(e.target.value))} readOnly={isReadOnly} />
                                            </Grid>

                                            <SectionHeader title="Complexo de Troca" colorPalette="purple" />
                                            <Grid templateColumns="repeat(6, 1fr)" gap={4} mb={4}>
                                                <Field label="SB (mmolc/dm³)" value={formatBackendCalculatedValue(ext.somaBases)} readOnly />
                                                <Field label="CTC(t) (mmolc/dm³)" value={formatBackendCalculatedValue(ext.ctcEfetiva)} readOnly />
                                                <Field label="CTC(T) (mmolc/dm³)" value={formatBackendCalculatedValue(ext.ctcPh7)} readOnly />
                                                <Field label="V%" value={formatBackendCalculatedValue(ext.saturacaoBasesV, "%")} readOnly />
                                                <Field label="m%" value={formatBackendCalculatedValue(ext.saturacaoAluminioM, "%")} readOnly />
                                                <Field label="PST (%)" value={formatBackendCalculatedValue(ext.pst, "%")} readOnly />
                                            </Grid>
                                            {!isReadOnly && (
                                                <Text color="orange.600" fontSize="xs" mb={4}>
                                                    Aviso técnico: complexo de troca, saturações e PST são calculados pelo backend após salvar.
                                                </Text>
                                            )}

                                            <SectionHeader title="Saturação do Complexo de Troca ou CTC(T)" colorPalette="orange" />
                                            <Grid templateColumns="repeat(6, 1fr)" gap={4} mb={4}>
                                                <Field label="%K (%)" value={formatBackendCalculatedValue(ext.saturacaoPotassioCtc, "%")} readOnly />
                                                <Field label="%Na (%)" value={formatBackendCalculatedValue(ext.saturacaoSodioCtc, "%")} readOnly />
                                                <Field label="%Ca (%)" value={formatBackendCalculatedValue(ext.saturacaoCalcioCtc, "%")} readOnly />
                                                <Field label="%Mg (%)" value={formatBackendCalculatedValue(ext.saturacaoMagnesioCtc, "%")} readOnly />
                                                <Field label="%H (%)" value={formatBackendCalculatedValue(ext.saturacaoHidrogenioCtc, "%")} readOnly />
                                                <Field label="%Al (%)" value={formatBackendCalculatedValue(ext.saturacaoAluminioCtc, "%")} readOnly />
                                            </Grid>

                                            <SectionHeader title="Relações entre Cátions Básicos" colorPalette="cyan" />
                                            <Grid templateColumns="repeat(4, 1fr)" gap={4} mb={4}>
                                                <Field label="Ca/Mg" value={formatBackendCalculatedValue(ext.relacaoCalcioMagnesio)} readOnly />
                                                <Field label="Ca/K" value={formatBackendCalculatedValue(ext.relacaoCalcioPotassio)} readOnly />
                                                <Field label="Mg/K" value={formatBackendCalculatedValue(ext.relacaoMagnesioPotassio)} readOnly />
                                                <Field label="(Ca + Mg)/K" value={formatBackendCalculatedValue(ext.relacaoCalcioMagnesioPotassio)} readOnly />
                                            </Grid>

                                            <SectionHeader title="Micronutrientes e Outros" colorPalette="green" />
                                            <Grid templateColumns="repeat(4, 1fr)" gap={4} mb={4}>
                                                <Field label="P (Meh) (mg/dm³)" type="number" value={ext.fosforoMehlich1} onChange={e => handleChangeExtract(ext.tempId, 'fosforoMehlich1', parseFloat(e.target.value))} readOnly={isReadOnly} />
                                                <Field label="P (Res) (mg/dm³)" type="number" value={ext.fosforoResina} onChange={e => handleChangeExtract(ext.tempId, 'fosforoResina', parseFloat(e.target.value))} readOnly={isReadOnly} />
                                                <Field label="S (mg/dm³)" type="number" value={ext.enxofre} onChange={e => handleChangeExtract(ext.tempId, 'enxofre', parseFloat(e.target.value))} readOnly={isReadOnly} />
                                                <Field label="Matéria Orgânica (g/dm³)" type="number" value={ext.materiaOrganica} onChange={e => handleChangeExtract(ext.tempId, 'materiaOrganica', parseFloat(e.target.value))} readOnly={isReadOnly} />
                                            </Grid>
                                            <Grid templateColumns="repeat(5, 1fr)" gap={4}>
                                                <Field label="Boro (mg/dm³)" type="number" value={ext.boro} onChange={e => handleChangeExtract(ext.tempId, 'boro', parseFloat(e.target.value))} readOnly={isReadOnly} />
                                                <Field label="Cobre (mg/dm³)" type="number" value={ext.cobre} onChange={e => handleChangeExtract(ext.tempId, 'cobre', parseFloat(e.target.value))} readOnly={isReadOnly} />
                                                <Field label="Ferro (mg/dm³)" type="number" value={ext.ferro} onChange={e => handleChangeExtract(ext.tempId, 'ferro', parseFloat(e.target.value))} readOnly={isReadOnly} />
                                                <Field label="Manganês (mg/dm³)" type="number" value={ext.manganes} onChange={e => handleChangeExtract(ext.tempId, 'manganes', parseFloat(e.target.value))} readOnly={isReadOnly} />
                                                <Field label="Zinco (mg/dm³)" type="number" value={ext.zinco} onChange={e => handleChangeExtract(ext.tempId, 'zinco', parseFloat(e.target.value))} readOnly={isReadOnly} />
                                            </Grid>
                                        </Box>
                                        );
                                    })}
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
                        <Button onClick={handleSubmit} loading={isSubmitting} colorPalette="teal" disabled={mode === 'INITIAL'}>
                            {initialData ? "Salvar Alterações" : "Salvar Análise"}
                        </Button>
                    )}
                </DialogFooter>
                <DialogCloseTrigger color="gray.500" />
            </DialogContent>
        </DialogRoot>
    );
};
