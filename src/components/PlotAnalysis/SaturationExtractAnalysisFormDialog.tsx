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
import { saturationExtractAnalysisExtractService } from "@/services/saturationExtractAnalysisExtractService";
import { TipoExtrato } from "@/interfaces/SoilAnalysis";
import { Camada } from "@/interfaces/LayerExtract";
import { AnalysisMode, SaturationExtractFormData } from "@/interfaces/SaturationExtractAnalysisFormTypes";

// Interface para gerenciar a exclusão completa (Dado + Container)
interface ItemToDelete {
    saturationId: number;
    containerId: number;
}

// --- Componentes Auxiliares de Estilo ---
const SectionHeader = ({ title, colorPalette = "purple" }: { title: string, colorPalette?: string }) => (
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
            _focus={{ borderColor: "purple.500", ring: 1, ringColor: "purple.200", _dark: { borderColor: "purple.400", ringColor: "purple.900" } }} 
            {...props} 
        />
    </Box>
);

const camadaCollection = createListCollection({
    items: Object.values(Camada).map((c) => ({ label: c, value: c })),
});

const formatDecimalDisplay = (value?: number | null) => {
    const numericValue = Number(value ?? 0);
    return Number.isFinite(numericValue) ? numericValue.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0,00";
};

const parseDecimalInput = (value: string) => {
    const normalizedValue = value.replace(",", ".");
    const numericValue = parseFloat(normalizedValue);
    return Number.isFinite(numericValue) ? numericValue : 0;
};

const roundDecimalValue = (value: number) => Number(value.toFixed(2));

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    plotId: number;
    plotIdentification: string;
    initialData?: any; // Dados para edição
    isReadOnly?: boolean; // Novo prop para modo somente leitura
}

export const SaturationExtractAnalysisFormDialog = ({ 
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
    
    const [extracts, setExtracts] = useState<SaturationExtractFormData[]>([]);
    
    // Estado para rastrear itens removidos e limpar o banco corretamente (evita zumbis)
    const [itemsToDelete, setItemsToDelete] = useState<ItemToDelete[]>([]); 
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [numericDrafts, setNumericDrafts] = useState<Record<string, string>>({});

    // Efeito de Inicialização
    useEffect(() => {
        if (isOpen) {
            setItemsToDelete([]); // Limpa lista de exclusão
            setNumericDrafts({});

            if (initialData) {
                // --- MODO EDIÇÃO / VISUALIZAÇÃO ---
                setAnalysisYear(initialData.year.toString());
                setLab(initialData.lab);
                setMode(initialData.type === TipoExtrato.CAMADAS ? 'LAYER' : 'RANGE');
                // Clona para evitar mutação direta
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
        const newExtract: SaturationExtractFormData = {
            tempId: Math.random().toString(36).substr(2, 9),
            // databaseId e containerId são undefined para novos
            profundidadeInicial: 0, 
            profundidadeFinal: 20, 
            camada: mode === 'LAYER' ? Camada.A : undefined, 
            subcamada: 1,
            
            // Físico-Química e Resíduos
            ph: 0, ce: 0, residuosSuspensao: 0,

            // Cátions
            teorCa: 0, teorMg: 0, teorNa: 0, teorK: 0, 
            
            // Ânions
            teorCO3: 0, teorHCO3: 0, teorNO3: 0, teorH2PO4: 0, teorSO4: 0, teorCl: 0, 
            
            // Dureza e Indicadores
            durezaCaCO3: 0, durezaTotalCaCO3: 0, ras: 0
        };
        const updated = [...extracts, newExtract];
        if (mode === 'LAYER') recalculateSubLayers(updated);
        else setExtracts(updated);
    };

    const handleRemoveExtract = (tempId: string) => {
        const itemToRemove = extracts.find(e => e.tempId === tempId);
        
        // Se o item já existia no banco (tem databaseId) e tem container, marca para deleção completa
        if (itemToRemove && itemToRemove.databaseId && itemToRemove.containerId) {
            setItemsToDelete(prev => [...prev, {
                saturationId: itemToRemove.databaseId!,
                containerId: itemToRemove.containerId!
            }]);
        }

        const updated = extracts.filter(e => e.tempId !== tempId);
        if (mode === 'LAYER') recalculateSubLayers(updated);
        else setExtracts(updated);
    };

    const handleChangeExtract = (tempId: string, field: keyof SaturationExtractFormData, value: any) => {
        const updated = extracts.map(e => e.tempId === tempId ? { ...e, [field]: value } : e);
        if (mode === 'LAYER' && field === 'camada') {
            recalculateSubLayers(updated);
        } else {
            setExtracts(updated);
        }
    };

    const NumericField = ({ extract, field, label }: { extract: SaturationExtractFormData, field: keyof SaturationExtractFormData, label: string }) => {
        const draftKey = `${extract.tempId}:${String(field)}`;
        const rawValue = extract[field];
        const numericValue = typeof rawValue === "number" ? rawValue : parseDecimalInput(String(rawValue ?? 0));
        const displayValue = numericDrafts[draftKey] ?? formatDecimalDisplay(numericValue);

        return (
            <Field
                label={label}
                type="text"
                inputMode="decimal"
                value={displayValue}
                onChange={(e) => {
                    const value = e.target.value;
                    setNumericDrafts((prev) => ({ ...prev, [draftKey]: value }));
                    handleChangeExtract(extract.tempId, field, parseDecimalInput(value));
                }}
                onBlur={() => {
                    const roundedValue = roundDecimalValue(parseDecimalInput(numericDrafts[draftKey] ?? String(numericValue)));
                    handleChangeExtract(extract.tempId, field, roundedValue);
                    setNumericDrafts((prev) => {
                        const next = { ...prev };
                        delete next[draftKey];
                        return next;
                    });
                }}
                readOnly={isReadOnly}
            />
        );
    };

    const recalculateSubLayers = (list: SaturationExtractFormData[]) => {
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
                
                // Atualiza dados da análise pai
                await soilAnalysisService.update(analysisId, {
                    novo_ano_analise: year,
                    novo_laboratorio_responsavel: lab,
                    novo_tipo_extrato: mode === 'LAYER' ? TipoExtrato.CAMADAS : TipoExtrato.INTERVALOS
                });

                // --- DELEÇÃO DE EXTRATOS REMOVIDOS (LIMPEZA DE ZUMBIS) ---
                if (itemsToDelete.length > 0) {
                    for (const item of itemsToDelete) {
                        try {
                            // 1. Deleta o dado de saturação
                            await saturationExtractAnalysisExtractService.delete(item.saturationId);
                        } catch (e) {
                            console.warn(`Erro ao deletar dado de saturação ID ${item.saturationId}`, e);
                        }

                        try {
                            // 2. Deleta o container (Camada ou Intervalo)
                            if (mode === 'LAYER') {
                                await layerExtractService.delete(item.containerId);
                            } else {
                                await rangeExtractService.delete(item.containerId);
                            }
                        } catch (e) {
                            console.warn(`Erro ao deletar container ID ${item.containerId}`, e);
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
                
                // Mapeamento dos dados para DTO (snake_case)
                const payloadSaturacao = {
                    ph: ext.ph,
                    ce: ext.ce,
                    teor_co3: ext.teorCO3,
                    teor_hco3: ext.teorHCO3,
                    teor_no3: ext.teorNO3,
                    teor_h2po4: ext.teorH2PO4,
                    teor_so4: ext.teorSO4,
                    teor_cl: ext.teorCl ?? 0,
                    teor_na: ext.teorNa,
                    teor_k: ext.teorK,
                    teor_ca: ext.teorCa,
                    teor_mg: ext.teorMg,
                    residuos_suspensao: ext.residuosSuspensao,
                    dureza_total_caco3: ext.durezaTotalCaCO3,
                    ras: ext.ras
                };

                if (ext.databaseId) {
                    // --- UPDATE (Já existe no banco) ---
                    const updatePayload: any = {};
                    
                    Object.entries(payloadSaturacao).forEach(([key, val]) => {
                        // Lógica de prefixos baseada no gênero/número dos campos na API
                        let prefix = "novo_"; // Padrão

                        if (key === "residuos_suspensao") {
                            prefix = "novos_"; // Plural
                        } else if (["ce", "ras", "dureza_caco3", "dureza_total_caco3"].includes(key)) {
                            prefix = "nova_"; // Feminino
                        }

                        updatePayload[`${prefix}${key}`] = val;
                    });

                    await saturationExtractAnalysisExtractService.update(ext.databaseId, updatePayload);

                    // 2. Atualizar Container (Profundidades / Camadas)
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
                    
                    await saturationExtractAnalysisExtractService.create(
                        payloadSaturacao, 
                        mode === 'RANGE' ? extractId : undefined, 
                        mode === 'LAYER' ? extractId : undefined
                    );
                }
            }
            
            toaster.create({ title: "Dados salvos com sucesso!", type: "success" });
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
        <DialogRoot open={isOpen} onOpenChange={onClose} size="xl" scrollBehavior="inside" motionPreset="slide-in-bottom">
            <DialogContent bg="gray.50" _dark={{ bg: "gray.900", color: "gray.100" }}>
                <DialogHeader borderBottomWidth="1px" borderColor="gray.200" _dark={{ bg: "gray.800", borderColor: "gray.700" }} bg="white">
                    <DialogTitle color="gray.800" _dark={{ color: "white" }}>
                        {isReadOnly 
                            ? "Visualizar Análise de Saturação" 
                            : (initialData ? "Editar Análise de Saturação" : "Nova Análise de Saturação")}
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

                        {/* Seleção de Modo */}
                        {mode === 'INITIAL' && !initialData && !isReadOnly && (
                            <VStack gap={4} mt={4} bg="white" _dark={{ bg: "gray.800", borderColor: "gray.700" }} p={6} borderRadius="md" shadow="sm" borderWidth="1px" borderColor="gray.200">
                                <Text fontWeight="bold" color="gray.700" _dark={{ color: "gray.200" }}>Selecione o método de estratificação:</Text>
                                <HStack gap={4} w="full">
                                    <Button flex={1} variant="surface" colorPalette="blue" onClick={() => setMode('LAYER')}>Por Camadas (A, B...)</Button>
                                    <Button flex={1} variant="surface" colorPalette="purple" onClick={() => setMode('RANGE')}>Por Profundidade (0-20...)</Button>
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
                                            <Button size="sm" colorPalette="purple" onClick={handleAddExtract}><LuPlus /> Adicionar</Button>
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
                                                <Box gridColumn="span 2"><NumericField label="Prof. Inicial (cm)" extract={ext} field="profundidadeInicial" /></Box>
                                                <Box gridColumn="span 2"><NumericField label="Prof. Final (cm)" extract={ext} field="profundidadeFinal" /></Box>
                                            </Grid>

                                            <SectionHeader title="Físico-Química e Resíduos" colorPalette="blue" />
                                            <Grid templateColumns="repeat(3, 1fr)" gap={4} mb={4}>
                                                <NumericField label="pH" extract={ext} field="ph" />
                                                <NumericField label="CE (dS/m)" extract={ext} field="ce" />
                                                <NumericField label="Resíduos Susp. (mg/L)" extract={ext} field="residuosSuspensao" />
                                            </Grid>

                                            <SectionHeader title="Cátions Solúveis" colorPalette="orange" />
                                            <Grid templateColumns="repeat(4, 1fr)" gap={4} mb={4}>
                                                <NumericField label="Ca2+ (mg/L)" extract={ext} field="teorCa" />
                                                <NumericField label="Mg2+ (mg/L)" extract={ext} field="teorMg" />
                                                <NumericField label="Na+ (mg/L)" extract={ext} field="teorNa" />
                                                <NumericField label="K+ (mg/L)" extract={ext} field="teorK" />
                                            </Grid>

                                            <SectionHeader title="Ânions Solúveis" colorPalette="teal" />
                                            <Grid templateColumns="repeat(6, 1fr)" gap={4} mb={4}>
                                                <NumericField label="CO3 2- (mg/L)" extract={ext} field="teorCO3" />
                                                <NumericField label="HCO3 - (mg/L)" extract={ext} field="teorHCO3" />
                                                <NumericField label="NO3 - (mg/L)" extract={ext} field="teorNO3" />
                                                <NumericField label="H2PO4 - (mg/L)" extract={ext} field="teorH2PO4" />
                                                <NumericField label="SO4 2- (mg/L)" extract={ext} field="teorSO4" />
                                                <NumericField label="Cl - (mg/L)" extract={ext} field="teorCl" />
                                            </Grid>

                                            <SectionHeader title="Dureza e Indicadores" colorPalette="pink" />
                                            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                                                <NumericField label="Dureza Total (mg/L)" extract={ext} field="durezaTotalCaCO3" />
                                                <NumericField label="RAS ((mmolc)**0.5)" extract={ext} field="ras" />
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
                        <Button onClick={handleSubmit} loading={isSubmitting} colorPalette="purple" disabled={mode === 'INITIAL'}>
                            {initialData ? "Salvar Alterações" : "Salvar Análise"}
                        </Button>
                    )}
                </DialogFooter>
                <DialogCloseTrigger color="gray.500" />
            </DialogContent>
        </DialogRoot>
    );
};
