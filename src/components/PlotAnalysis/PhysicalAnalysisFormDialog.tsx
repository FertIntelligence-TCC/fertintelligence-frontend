import { useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
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

type AutoSaveStatus = "idle" | "saving" | "saved" | "error";

const getAutoSaveStatusLabel = (status: AutoSaveStatus) => {
    if (status === "saving") return "Salvando...";
    if (status === "saved") return "Salvo";
    if (status === "error") return "Erro ao salvar";
    return "";
};

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

const parseDecimalInputOrNull = (value: unknown): number | null => {
    if (value === undefined || value === null) return null;
    if (typeof value === "string" && value.trim() === "") return null;

    const normalizedValue = typeof value === "string" ? value.trim().replace(",", ".") : value;
    const numericValue = typeof normalizedValue === "number" ? normalizedValue : Number(normalizedValue);
    return Number.isFinite(numericValue) ? numericValue : null;
};

const numberForPayload = (value: unknown) => parseDecimalInputOrNull(value) ?? 0;

const formatEditableNumericValue = (value: unknown) => {
    if (typeof value === "string") return value;

    const numericValue = parseDecimalInputOrNull(value);
    return numericValue === null ? "" : String(numericValue);
};

const formatExtractNavigationLabel = (
    extract: Pick<PhysicalExtractFormData, "profundidadeInicial" | "profundidadeFinal" | "camada" | "subcamada">,
    index: number,
    mode: AnalysisMode
) => {
    const initialDepth = parseDecimalInputOrNull(extract.profundidadeInicial);
    const finalDepth = parseDecimalInputOrNull(extract.profundidadeFinal);

    if (initialDepth !== null && finalDepth !== null) {
        return `${initialDepth.toLocaleString("pt-BR")}-${finalDepth.toLocaleString("pt-BR")}`;
    }

    if (mode === "LAYER") {
        return `Camada ${extract.camada || "?"}${extract.subcamada ?? ""}`;
    }

    return `Amostra ${index + 1}`;
};

const calculatePorosidadeTotal = (densidadeAparenteValue: unknown, densidadeRealValue: unknown) => {
    const densidadeAparente = parseDecimalInputOrNull(densidadeAparenteValue);
    const densidadeReal = parseDecimalInputOrNull(densidadeRealValue);

    if (
        densidadeAparente === null ||
        densidadeReal === null ||
        !Number.isFinite(densidadeAparente) ||
        !Number.isFinite(densidadeReal) ||
        densidadeReal === 0
    ) {
        return 0;
    }

    return roundToTwoDecimals(((densidadeReal - densidadeAparente) / densidadeReal) * 100);
};

const calculateAguaDisponivel = (umidadeCapacidadeCampoValue: unknown, umidadePontoMurchaPermanenteValue: unknown) => {
    const umidadeCapacidadeCampo = parseDecimalInputOrNull(umidadeCapacidadeCampoValue);
    const umidadePontoMurchaPermanente = parseDecimalInputOrNull(umidadePontoMurchaPermanenteValue);

    if (
        umidadeCapacidadeCampo === null ||
        umidadePontoMurchaPermanente === null ||
        !Number.isFinite(umidadeCapacidadeCampo) ||
        !Number.isFinite(umidadePontoMurchaPermanente)
    ) {
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

type PhysicalNumericFieldProps = {
    extract: PhysicalExtractFormData;
    field: keyof PhysicalExtractFormData;
    label: string;
    numericDrafts: Record<string, string>;
    setNumericDrafts: Dispatch<SetStateAction<Record<string, string>>>;
    onChangeExtract: (tempId: string, field: keyof PhysicalExtractFormData, value: any) => void;
    isReadOnly: boolean;
    readOnly?: boolean;
};

const NumericField = ({
    extract,
    field,
    label,
    numericDrafts,
    setNumericDrafts,
    onChangeExtract,
    isReadOnly,
    readOnly,
}: PhysicalNumericFieldProps) => {
    const draftKey = `${extract.tempId}:${String(field)}`;
    const displayValue = numericDrafts[draftKey] ?? formatEditableNumericValue(extract[field]);

    return (
        <Field
            label={label}
            type="text"
            inputMode="decimal"
            value={displayValue}
            onChange={(e) => {
                const value = e.target.value;
                setNumericDrafts((prev) => ({ ...prev, [draftKey]: value }));
                onChangeExtract(extract.tempId, field, value);
            }}
            onBlur={() => {
                setNumericDrafts((prev) => {
                    const next = { ...prev };
                    delete next[draftKey];
                    return next;
                });
            }}
            readOnly={isReadOnly || readOnly}
        />
    );
};

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
    const [numericDrafts, setNumericDrafts] = useState<Record<string, string>>({});
    const [autoSaveStatus, setAutoSaveStatus] = useState<AutoSaveStatus>("idle");
    const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const autoSaveRequestIdRef = useRef(0);
    const lastAutoSaveSignatureRef = useRef("");
    const skipNextAutoSaveRef = useRef(false);
    const extractSectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

    // Efeito de Inicialização (Criação vs Edição vs Visualização)
    useEffect(() => {
        if (isOpen) {
            setItemsToDelete([]); // Limpa lista de exclusão ao abrir
            setNumericDrafts({});
            setAutoSaveStatus("idle");
            skipNextAutoSaveRef.current = true;

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

    const autoSaveSignature = JSON.stringify({
        analysisYear,
        lab,
        mode,
        extracts,
        itemsToDelete,
    });

    useEffect(() => {
        if (autoSaveTimerRef.current) {
            clearTimeout(autoSaveTimerRef.current);
            autoSaveTimerRef.current = null;
        }

        const canAutoSave =
            isOpen &&
            !isReadOnly &&
            Boolean(initialData?.analysisId) &&
            mode !== "INITIAL" &&
            extracts.length > 0 &&
            extracts.every((extract) => Boolean(extract.databaseId && extract.containerId));

        if (!canAutoSave) {
            lastAutoSaveSignatureRef.current = autoSaveSignature;
            return;
        }

        if (!lastAutoSaveSignatureRef.current) {
            lastAutoSaveSignatureRef.current = autoSaveSignature;
            return;
        }

        if (skipNextAutoSaveRef.current) {
            skipNextAutoSaveRef.current = false;
            lastAutoSaveSignatureRef.current = autoSaveSignature;
            return;
        }

        if (lastAutoSaveSignatureRef.current === autoSaveSignature) return;

        autoSaveTimerRef.current = setTimeout(() => {
            void handleSubmit({ autosave: true });
        }, 1000);

        return () => {
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current);
                autoSaveTimerRef.current = null;
            }
        };
    }, [autoSaveSignature, extracts, initialData?.analysisId, isOpen, isReadOnly, mode]);

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
        value: any
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

    const validate = (showFeedback = true) => {
        if (!lab.trim()) { if (showFeedback) toaster.create({ title: "Informe o Laboratório", type: "error" }); return false; }
        if (!analysisYear || isNaN(parseInt(analysisYear))) { if (showFeedback) toaster.create({ title: "Informe um Ano válido", type: "error" }); return false; }
        if (extracts.length === 0) { if (showFeedback) toaster.create({ title: "Adicione pelo menos um extrato", type: "error" }); return false; }
        const invalidNumericValue = extracts.some((extract) =>
            [
                extract.profundidadeInicial,
                extract.profundidadeFinal,
                extract.teorAreia,
                extract.teorSilte,
                extract.teorArgila,
                extract.densidadeAparente,
                extract.densidadeReal,
                extract.microporosidade,
                extract.umidadeCapacidadeCampo,
                extract.umidadePontoMurchaPermanente,
                extract.resistenciaPenetracao,
                extract.dmAgregados,
                extract.percAgregados6_0mm,
                extract.percAgregados4_1a6_0mm,
                extract.percAgregados2_1a4_0mm,
                extract.percAgregados1_0a2_0mm,
                extract.percAgregados0_5a1_0mm,
                extract.percAgregados0_25a0_5mm,
                extract.percAgregadosMenor0_25mm,
            ].some((value) => parseDecimalInputOrNull(value) === null)
        );
        if (invalidNumericValue) {
            if (showFeedback) toaster.create({ title: "Informe valores numéricos válidos", description: "Use vírgula ou ponto como separador decimal.", type: "error" });
            return false;
        }
        return true;
    };

    const handleSubmit = async (options?: { autosave?: boolean }) => {
        const isAutosave = Boolean(options?.autosave);
        const autosaveRequestId = isAutosave ? autoSaveRequestIdRef.current + 1 : null;

        if (isAutosave) {
            autoSaveRequestIdRef.current = autosaveRequestId!;
            if (!initialData?.analysisId || isReadOnly) return;
            if (extracts.some((extract) => !extract.databaseId || !extract.containerId)) return;
        }

        if (!validate(!isAutosave)) {
            if (isAutosave && autosaveRequestId === autoSaveRequestIdRef.current) setAutoSaveStatus("error");
            return;
        }

        if (isAutosave) {
            setAutoSaveStatus("saving");
        } else {
            setIsSubmitting(true);
        }
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
                    teor_areia: numberForPayload(ext.teorAreia), 
                    teor_silte: numberForPayload(ext.teorSilte), 
                    teor_argila: numberForPayload(ext.teorArgila),
                    densidade_aparente: numberForPayload(ext.densidadeAparente), 
                    densidade_real: numberForPayload(ext.densidadeReal),
                    porosidade_total: calculatePorosidadeTotal(ext.densidadeAparente, ext.densidadeReal), 
                    microporosidade: numberForPayload(ext.microporosidade),
                    umidade_capacidade_campo: numberForPayload(ext.umidadeCapacidadeCampo), 
                    umidade_ponto_murcha_permanente: numberForPayload(ext.umidadePontoMurchaPermanente),
                    agua_disponivel: calculateAguaDisponivel(
                        ext.umidadeCapacidadeCampo,
                        ext.umidadePontoMurchaPermanente
                    ), 
                    resistencia_penetracao: numberForPayload(ext.resistenciaPenetracao),
                    perc_agregados_6_0mm: numberForPayload(ext.percAgregados6_0mm), 
                    perc_agregados_4_1_a_6_0mm: numberForPayload(ext.percAgregados4_1a6_0mm),
                    perc_agregados_2_1_a_4_0mm: numberForPayload(ext.percAgregados2_1a4_0mm),
                    perc_agregados_1_0_a_2_0mm: numberForPayload(ext.percAgregados1_0a2_0mm),
                    perc_agregados_0_5_a_1_0mm: numberForPayload(ext.percAgregados0_5a1_0mm),
                    perc_agregados_0_25_a_0_5mm: numberForPayload(ext.percAgregados0_25a0_5mm),
                    perc_agregados_menor_0_25mm: numberForPayload(ext.percAgregadosMenor0_25mm),
                    dm_agregados: numberForPayload(ext.dmAgregados)
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
                                nova_profundidade_inicial: numberForPayload(ext.profundidadeInicial),
                                nova_profundidade_final: numberForPayload(ext.profundidadeFinal),
                                nova_camada: ext.camada,
                                nova_subcamada: ext.subcamada
                            });
                        } else {
                            await rangeExtractService.update(ext.containerId, {
                                nova_profundidade_inicial: numberForPayload(ext.profundidadeInicial),
                                nova_profundidade_final: numberForPayload(ext.profundidadeFinal)
                            });
                        }
                    }

                } else {
                    // --- CREATE ---
                    let extractId: number;
                    
                    if (mode === 'LAYER') {
                        const res = await layerExtractService.create(analysisId, {
                            profundidade_inicial: numberForPayload(ext.profundidadeInicial), 
                            profundidade_final: numberForPayload(ext.profundidadeFinal),
                            camada: ext.camada!, 
                            subcamada: ext.subcamada || 1
                        });
                        extractId = res.id;
                    } else {
                        const res = await rangeExtractService.create(analysisId, {
                            profundidade_inicial: numberForPayload(ext.profundidadeInicial), 
                            profundidade_final: numberForPayload(ext.profundidadeFinal)
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
            
            if (isAutosave) {
                setItemsToDelete([]);
                lastAutoSaveSignatureRef.current = autoSaveSignature;
                if (autosaveRequestId === autoSaveRequestIdRef.current) setAutoSaveStatus("saved");
            } else {
                toaster.create({ title: "Dados salvos com sucesso!", type: "success" });
                onSuccess(); 
                onClose();
            }

        } catch (error: unknown) {
            console.error("Erro ao salvar:", error);
            const msg = getApiErrorMessage(error);
            if (isAutosave) {
                if (autosaveRequestId === autoSaveRequestIdRef.current) setAutoSaveStatus("error");
            } else {
                toaster.create({ title: "Erro", description: msg, type: "error" });
            }
        } finally { 
            if (!isAutosave) setIsSubmitting(false); 
        }
    };

    const numericFieldSharedProps = {
        numericDrafts,
        setNumericDrafts,
        onChangeExtract: handleChangeExtract,
        isReadOnly,
    };

    const scrollToExtract = (tempId: string) => {
        extractSectionRefs.current[tempId]?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
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

                                <Flex align="flex-start" gap={4} direction={{ base: "column", md: "row" }}>
                                    {extracts.length > 1 && (
                                        <Box
                                            minW={{ base: "full", md: "92px" }}
                                            position={{ base: "static", md: "sticky" }}
                                            top={2}
                                        >
                                            <VStack align="stretch" gap={2}>
                                                {extracts.map((ext, idx) => (
                                                    <Button
                                                        key={ext.tempId}
                                                        size="xs"
                                                        variant="outline"
                                                        colorPalette="green"
                                                        justifyContent="flex-start"
                                                        onMouseDown={(event) => event.preventDefault()}
                                                        onClick={() => scrollToExtract(ext.tempId)}
                                                    >
                                                        {formatExtractNavigationLabel(ext, idx, mode)}
                                                    </Button>
                                                ))}
                                            </VStack>
                                        </Box>
                                    )}
                                    <VStack gap={4} align="stretch" flex={1} minW={0}>
                                    {extracts.map((ext, idx) => (
                                        <Box
                                            key={ext.tempId}
                                            ref={(node: HTMLDivElement | null) => { extractSectionRefs.current[ext.tempId] = node; }}
                                            scrollMarginTop="16px"
                                            p={5}
                                            borderWidth="1px"
                                            borderColor="gray.300"
                                            _dark={{ bg: "gray.800", borderColor: "gray.600" }}
                                            borderRadius="lg"
                                            bg="white"
                                            shadow="sm"
                                        >
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
                                                
                                                <Box gridColumn="span 2"><NumericField {...numericFieldSharedProps} label="Prof. Inicial (cm)" extract={ext} field="profundidadeInicial" /></Box>
                                                <Box gridColumn="span 2"><NumericField {...numericFieldSharedProps} label="Prof. Final (cm)" extract={ext} field="profundidadeFinal" /></Box>
                                            </Grid>

                                            <SectionHeader title="Granulometria (g/kg)" colorPalette="blue" />
                                            <Grid templateColumns="repeat(3, 1fr)" gap={4} mb={4}>
                                                <NumericField {...numericFieldSharedProps} label="Areia (g/kg)" extract={ext} field="teorAreia" />
                                                <NumericField {...numericFieldSharedProps} label="Silte (g/kg)" extract={ext} field="teorSilte" />
                                                <NumericField {...numericFieldSharedProps} label="Argila (g/kg)" extract={ext} field="teorArgila" />
                                            </Grid>

                                            <SectionHeader title="Física do Solo" colorPalette="orange" />
                                            <Grid templateColumns="repeat(4, 1fr)" gap={4} mb={4}>
                                                <NumericField {...numericFieldSharedProps} label="Dens. Aparente (g/dm³)" extract={ext} field="densidadeAparente" />
                                                <NumericField {...numericFieldSharedProps} label="Dens. Real (g/dm³)" extract={ext} field="densidadeReal" />
                                                <NumericField {...numericFieldSharedProps} label="Poros. Total (%)" extract={ext} field="porosidadeTotal" readOnly />
                                                <NumericField {...numericFieldSharedProps} label="Microporos. (%)" extract={ext} field="microporosidade" />
                                            </Grid>

                                            <SectionHeader title="Hídrico & Resistência" colorPalette="teal" />
                                            <Grid templateColumns="repeat(4, 1fr)" gap={4} mb={4}>
                                                <NumericField {...numericFieldSharedProps} label="Umidade CC (%)" extract={ext} field="umidadeCapacidadeCampo" />
                                                <NumericField {...numericFieldSharedProps} label="Umidade PMP (%)" extract={ext} field="umidadePontoMurchaPermanente" />
                                                <NumericField {...numericFieldSharedProps} label="Água Disp. (%)" extract={ext} field="aguaDisponivel" readOnly />
                                                <NumericField {...numericFieldSharedProps} label="Resist. Penetr. (MPa)" extract={ext} field="resistenciaPenetracao" />
                                            </Grid>

                                            <SectionHeader title="Agregados (%)" colorPalette="green" />
                                            <Grid templateColumns="repeat(4, 1fr)" gap={4}>
                                                <NumericField {...numericFieldSharedProps} label="DMP (mm)" extract={ext} field="dmAgregados" />
                                                <NumericField {...numericFieldSharedProps} label="> 6.0mm" extract={ext} field="percAgregados6_0mm" />
                                                <NumericField {...numericFieldSharedProps} label="4-6mm" extract={ext} field="percAgregados4_1a6_0mm" />
                                                <NumericField {...numericFieldSharedProps} label="2-4mm" extract={ext} field="percAgregados2_1a4_0mm" />
                                                <NumericField {...numericFieldSharedProps} label="1-2mm" extract={ext} field="percAgregados1_0a2_0mm" />
                                                <NumericField {...numericFieldSharedProps} label="0.5-1mm" extract={ext} field="percAgregados0_5a1_0mm" />
                                                <NumericField {...numericFieldSharedProps} label="0.25-0.5mm" extract={ext} field="percAgregados0_25a0_5mm" />
                                                <NumericField {...numericFieldSharedProps} label="< 0.25mm" extract={ext} field="percAgregadosMenor0_25mm" />
                                            </Grid>
                                        </Box>
                                    ))}
                                    </VStack>
                                </Flex>
                            </Box>
                        )}
                    </VStack>
                </DialogBody>
                <DialogFooter bg="gray.100" _dark={{ bg: "gray.800", borderColor: "gray.700" }} borderTopWidth="1px" borderColor="gray.200">
                    {!isReadOnly && initialData && (
                        <Text mr="auto" fontSize="sm" color={autoSaveStatus === "error" ? "red.500" : "gray.600"} _dark={{ color: autoSaveStatus === "error" ? "red.300" : "gray.300" }}>
                            {getAutoSaveStatusLabel(autoSaveStatus)}
                        </Text>
                    )}
                    <Button variant="ghost" colorPalette="gray" onClick={onClose}>
                        {isReadOnly ? "Fechar" : "Cancelar"}
                    </Button>
                    {!isReadOnly && (
                        <Button onClick={() => handleSubmit()} loading={isSubmitting} colorPalette="green" disabled={mode === 'INITIAL'}>
                            {initialData ? "Salvar Alterações" : "Salvar Análise"}
                        </Button>
                    )}
                </DialogFooter>
                <DialogCloseTrigger color="gray.500" />
            </DialogContent>
        </DialogRoot>
    );
};
