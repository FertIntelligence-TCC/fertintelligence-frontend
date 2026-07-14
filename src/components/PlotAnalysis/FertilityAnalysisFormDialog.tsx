import { useEffect, useMemo, useRef, useState } from "react";
import type { Dispatch, KeyboardEvent, SetStateAction } from "react";
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

const KEYBOARD_NAV_SCOPE = "fertility-analysis";

const FERTILITY_FIELD_ORDER: Array<keyof FertilityExtractFormData> = [
    "profundidadeInicial",
    "profundidadeFinal",
    "phAgua",
    "phCacl2",
    "aluminio",
    "aluminioMaisHidrogenio",
    "calcio",
    "magnesio",
    "potassio",
    "sodio",
    "ctcPh7",
    "fosforoMehlich1",
    "fosforoResina",
    "enxofre",
    "materiaOrganica",
    "boro",
    "cobre",
    "ferro",
    "manganes",
    "zinco",
];

const MICRONUTRIENT_FIELDS = new Set<keyof FertilityExtractFormData>(["boro", "cobre", "ferro", "manganes", "zinco"]);

const getKeyboardNavInputs = (scope: string) => Array.from(
    document.querySelectorAll<HTMLInputElement>(
        `input[data-keyboard-nav-scope="${scope}"]:not([readonly]):not(:disabled)`
    )
).sort((a, b) => {
    const rowDiff = Number(a.dataset.keyboardNavRow) - Number(b.dataset.keyboardNavRow);
    if (rowDiff !== 0) return rowDiff;
    return Number(a.dataset.keyboardNavColumn) - Number(b.dataset.keyboardNavColumn);
});

const focusKeyboardNavInput = (input?: HTMLInputElement) => {
    if (!input) return;
    input.focus();
    input.select();
};

const shouldKeepHorizontalArrowInText = (event: KeyboardEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const selectionStart = input.selectionStart ?? 0;
    const selectionEnd = input.selectionEnd ?? selectionStart;

    if (selectionStart !== selectionEnd) return true;
    if (event.key === "ArrowLeft") return selectionStart > 0;
    if (event.key === "ArrowRight") return selectionEnd < input.value.length;
    return false;
};

const handleKeyboardNav = (event: KeyboardEvent<HTMLInputElement>, scope: string) => {
    const navigationKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter"];
    if (!navigationKeys.includes(event.key) || event.altKey || event.ctrlKey || event.metaKey) return;
    if ((event.key === "ArrowLeft" || event.key === "ArrowRight") && shouldKeepHorizontalArrowInText(event)) return;

    const inputs = getKeyboardNavInputs(scope);
    const currentIndex = inputs.indexOf(event.currentTarget);
    if (currentIndex < 0) return;

    const currentRow = Number(event.currentTarget.dataset.keyboardNavRow);
    const currentColumn = Number(event.currentTarget.dataset.keyboardNavColumn);
    let nextInput: HTMLInputElement | undefined;

    if (event.key === "ArrowUp") {
        nextInput = inputs.filter((input) => Number(input.dataset.keyboardNavColumn) === currentColumn && Number(input.dataset.keyboardNavRow) < currentRow).pop();
    } else if (event.key === "ArrowDown") {
        nextInput = inputs.find((input) => Number(input.dataset.keyboardNavColumn) === currentColumn && Number(input.dataset.keyboardNavRow) > currentRow);
    } else {
        const offset = event.key === "ArrowLeft" || (event.key === "Enter" && event.shiftKey) ? -1 : 1;
        nextInput = inputs[currentIndex + offset];
    }

    if (!nextInput) return;
    event.preventDefault();
    focusKeyboardNavInput(nextInput);
};

// Interface para gerenciar itens a serem deletados (Dado + Container)
interface ItemToDelete {
    fertilityId: number;
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

type RuntimeFertilityDerivedValues = Pick<
    FertilityExtractFormData,
    | "saturacaoPotassioCtc"
    | "saturacaoSodioCtc"
    | "saturacaoCalcioCtc"
    | "saturacaoMagnesioCtc"
    | "saturacaoHidrogenioCtc"
    | "saturacaoAluminioCtc"
    | "relacaoCalcioMagnesio"
    | "relacaoCalcioPotassio"
    | "relacaoMagnesioPotassio"
    | "relacaoCalcioMagnesioPotassio"
>;

const formatBackendCalculatedValue = (value?: number | null, suffix = "") => {
    if (value === undefined || value === null) return NOT_CALCULATED_LABEL;

    const numericValue = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(numericValue)) return NOT_CALCULATED_LABEL;

    return `${numericValue.toLocaleString("pt-BR", {
        maximumFractionDigits: 2,
    })}${suffix}`;
};

export const parseDecimalInputOrNull = (value: unknown): number | null => {
    if (value === undefined || value === null) return null;
    if (typeof value === "string" && value.trim() === "") return null;

    const normalizedValue = typeof value === "string" ? value.trim().replace(",", ".") : value;
    const numericValue = typeof normalizedValue === "number" ? normalizedValue : Number(normalizedValue);
    return Number.isFinite(numericValue) ? numericValue : null;
};

const numberForPayload = (value: unknown) => parseDecimalInputOrNull(value) ?? 0;
export const micronutrientNumberForPayload = (value: unknown) => parseDecimalInputOrNull(value);

const divideOrNull = (dividend: number | null, divisor: number | null) => {
    if (dividend === null || divisor === null || divisor === 0) return null;

    const result = dividend / divisor;
    return Number.isFinite(result) ? result : null;
};

const percentageOfCtcOrNull = (value: number | null, ctcPh7: number | null) => {
    const ratio = divideOrNull(value, ctcPh7);
    return ratio === null ? null : ratio * 100;
};

const calculateRuntimeFertilityDerivedValues = (formState: FertilityExtractFormData): RuntimeFertilityDerivedValues => {
    const potassio = parseDecimalInputOrNull(formState.potassio);
    const sodio = parseDecimalInputOrNull(formState.sodio);
    const calcio = parseDecimalInputOrNull(formState.calcio);
    const magnesio = parseDecimalInputOrNull(formState.magnesio);
    const aluminio = parseDecimalInputOrNull(formState.aluminio);
    const aluminioMaisHidrogenio = parseDecimalInputOrNull(formState.aluminioMaisHidrogenio);
    const ctcPh7 = parseDecimalInputOrNull(formState.ctcPh7);
    const hidrogenio = aluminioMaisHidrogenio !== null && aluminio !== null
        ? aluminioMaisHidrogenio - aluminio
        : null;

    return {
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

const formatEditableNumericValue = (value: unknown) => {
    const numericValue = parseDecimalInputOrNull(value);
    return numericValue === null ? "" : String(value);
};

const formatExtractNavigationLabel = (
    extract: Pick<FertilityExtractFormData, "profundidadeInicial" | "profundidadeFinal" | "camada" | "subcamada">,
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

const formatCalculatedValueWithRuntimeFallback = (
    runtimeValue: number | null | undefined,
    backendValue: number | null | undefined,
    suffix = ""
) => formatBackendCalculatedValue(runtimeValue ?? backendValue, suffix);

type FertilityNumericFieldProps = {
    extract: FertilityExtractFormData;
    field: keyof FertilityExtractFormData;
    label: string;
    numericDrafts: Record<string, string>;
    setNumericDrafts: Dispatch<SetStateAction<Record<string, string>>>;
    onChangeExtract: (tempId: string, field: keyof FertilityExtractFormData, value: unknown) => void;
    isReadOnly: boolean;
    rowIndex: number;
};

const NumericField = ({
    extract,
    field,
    label,
    numericDrafts,
    setNumericDrafts,
    onChangeExtract,
    isReadOnly,
    rowIndex,
}: FertilityNumericFieldProps) => {
    const draftKey = `${extract.tempId}:${String(field)}`;
    const displayValue = numericDrafts[draftKey] ?? formatEditableNumericValue(extract[field]);
    const columnIndex = FERTILITY_FIELD_ORDER.indexOf(field);
    const keyboardNavProps = !isReadOnly && columnIndex >= 0 ? {
        "data-keyboard-nav-scope": KEYBOARD_NAV_SCOPE,
        "data-keyboard-nav-row": rowIndex,
        "data-keyboard-nav-column": columnIndex,
        onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => handleKeyboardNav(event, KEYBOARD_NAV_SCOPE),
    } : {};

    return (
        <Field
            label={label}
            placeholder={MICRONUTRIENT_FIELDS.has(field) ? "Não analisado" : undefined}
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
            readOnly={isReadOnly}
            {...keyboardNavProps}
        />
    );
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
    const [numericDrafts, setNumericDrafts] = useState<Record<string, string>>({});
    const [autoSaveStatus, setAutoSaveStatus] = useState<AutoSaveStatus>("idle");
    const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const autoSaveRequestIdRef = useRef(0);
    const lastAutoSaveSignatureRef = useRef("");
    const skipNextAutoSaveRef = useRef(false);
    const extractSectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const runtimeFertilityBaseSignature = extracts
        .map((extract) => [
            extract.tempId,
            extract.potassio,
            extract.sodio,
            extract.calcio,
            extract.magnesio,
            extract.aluminio,
            extract.aluminioMaisHidrogenio,
            extract.ctcPh7,
        ].join(":"))
        .join("|");

    const runtimeDerivedValuesByTempId = useMemo(() => {
        return new Map(
            extracts.map((extract) => [
                extract.tempId,
                calculateRuntimeFertilityDerivedValues(extract),
            ])
        );
    }, [runtimeFertilityBaseSignature]);

    // Efeito de Inicialização
    useEffect(() => {
        if (isOpen) {
            setItemsToDelete([]); // Limpa lista de exclusão
            setNumericDrafts({});
            setAutoSaveStatus("idle");
            skipNextAutoSaveRef.current = true;

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
            materiaOrganica: 0, boro: null, cobre: null, ferro: null, manganes: null, zinco: null
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
        const updated = extracts.map(e => e.tempId === tempId ? { ...e, [field]: value } : e);
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

    const validate = (showFeedback = true) => {
        if (!lab.trim()) { if (showFeedback) toaster.create({ title: "Informe o Laboratório", type: "error" }); return false; }
        if (!analysisYear || isNaN(parseInt(analysisYear))) { if (showFeedback) toaster.create({ title: "Informe um Ano válido", type: "error" }); return false; }
        if (extracts.length === 0) { if (showFeedback) toaster.create({ title: "Adicione pelo menos um extrato", type: "error" }); return false; }
        const invalidNumericValue = extracts.some((extract) =>
            [
                extract.profundidadeInicial,
                extract.profundidadeFinal,
                extract.phAgua,
                extract.phCacl2,
                extract.calcio,
                extract.magnesio,
                extract.potassio,
                extract.sodio,
                extract.aluminio,
                extract.aluminioMaisHidrogenio,
                extract.fosforoMehlich1,
                extract.fosforoResina,
                extract.enxofre,
                extract.materiaOrganica,
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
                    ph_agua: numberForPayload(ext.phAgua), 
                    ph_cacl2: numberForPayload(ext.phCacl2), 
                    calcio: numberForPayload(ext.calcio), 
                    magnesio: numberForPayload(ext.magnesio), 
                    potassio: numberForPayload(ext.potassio), 
                    sodio: numberForPayload(ext.sodio),
                    aluminio: numberForPayload(ext.aluminio), 
                    aluminio_mais_hidrogenio: numberForPayload(ext.aluminioMaisHidrogenio), 
                    fosforo_mehlich1: numberForPayload(ext.fosforoMehlich1), 
                    fosforo_resina: numberForPayload(ext.fosforoResina), 
                    enxofre: numberForPayload(ext.enxofre), 
                    materia_organica: numberForPayload(ext.materiaOrganica), 
                    boro: micronutrientNumberForPayload(ext.boro),
                    cobre: micronutrientNumberForPayload(ext.cobre),
                    ferro: micronutrientNumberForPayload(ext.ferro),
                    manganes: micronutrientNumberForPayload(ext.manganes),
                    zinco: micronutrientNumberForPayload(ext.zinco)
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
                    // --- CREATE (Novo extrato na lista) ---
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
                    
                    await fertilityAnalysisExtractService.create(
                        payloadQuimico, 
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
                toaster.create({ title: "Análise de Fertilidade salva!", type: "success" });
                onSuccess(); 
                onClose();
            }

        } catch (error: any) {
            console.error("Erro ao salvar:", error);
            const msg = error.response?.data?.message || "Erro ao salvar dados.";
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
                                                        colorPalette="teal"
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
                                    {extracts.map((ext, idx) => {
                                        const runtimeDerivedValues = runtimeDerivedValuesByTempId.get(ext.tempId);
                                        return (
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
                                                <Box gridColumn="span 2"><NumericField {...numericFieldSharedProps} rowIndex={idx} label="Prof. Inicial (cm)" extract={ext} field="profundidadeInicial" /></Box>
                                                <Box gridColumn="span 2"><NumericField {...numericFieldSharedProps} rowIndex={idx} label="Prof. Final (cm)" extract={ext} field="profundidadeFinal" /></Box>
                                            </Grid>

                                            <SectionHeader title="Acidez & Alumínio" colorPalette="red" />
                                            <Grid templateColumns="repeat(4, 1fr)" gap={4} mb={4}>
                                                <NumericField {...numericFieldSharedProps} rowIndex={idx} label="pH H₂O" extract={ext} field="phAgua" />
                                                <NumericField {...numericFieldSharedProps} rowIndex={idx} label="pH CaCl₂" extract={ext} field="phCacl2" />
                                                <NumericField {...numericFieldSharedProps} rowIndex={idx} label="Al3+ (mmolc/dm³)" extract={ext} field="aluminio" />
                                                <NumericField {...numericFieldSharedProps} rowIndex={idx} label="H+Al (mmolc/dm³)" extract={ext} field="aluminioMaisHidrogenio" />
                                            </Grid>

                                            <SectionHeader title="Bases Trocáveis" colorPalette="blue" />
                                            <Grid templateColumns="repeat(4, 1fr)" gap={4} mb={4}>
                                                <NumericField {...numericFieldSharedProps} rowIndex={idx} label="Ca2+ (mmolc/dm³)" extract={ext} field="calcio" />
                                                <NumericField {...numericFieldSharedProps} rowIndex={idx} label="Mg2+ (mmolc/dm³)" extract={ext} field="magnesio" />
                                                <NumericField {...numericFieldSharedProps} rowIndex={idx} label="K+ (mmolc/dm³)" extract={ext} field="potassio" />
                                                <NumericField {...numericFieldSharedProps} rowIndex={idx} label="Na+ (mmolc/dm³)" extract={ext} field="sodio" />
                                            </Grid>

                                            <SectionHeader title="Complexo de Troca" colorPalette="purple" />
                                            <Grid templateColumns="repeat(6, 1fr)" gap={4} mb={4}>
                                                <Field label="SB (mmolc/dm³)" value={formatBackendCalculatedValue(ext.somaBases)} readOnly />
                                                <Field label="CTC(t) (mmolc/dm³)" value={formatBackendCalculatedValue(ext.ctcEfetiva)} readOnly />
                                                <NumericField {...numericFieldSharedProps} rowIndex={idx} label="CTC(T) (mmolc/dm³)" extract={ext} field="ctcPh7" />
                                                <Field label="V%" value={formatBackendCalculatedValue(ext.saturacaoBasesV, "%")} readOnly />
                                                <Field label="m%" value={formatBackendCalculatedValue(ext.saturacaoAluminioM, "%")} readOnly />
                                                <Field label="PST (%)" value={formatBackendCalculatedValue(ext.pst, "%")} readOnly />
                                            </Grid>
                                            <SectionHeader title="Saturação do Complexo de Troca ou CTC(T)" colorPalette="orange" />
                                            <Grid templateColumns="repeat(6, 1fr)" gap={4} mb={4}>
                                                <Field label="%K (%)" value={formatCalculatedValueWithRuntimeFallback(runtimeDerivedValues?.saturacaoPotassioCtc, ext.saturacaoPotassioCtc, "%")} readOnly />
                                                <Field label="%Na (%)" value={formatCalculatedValueWithRuntimeFallback(runtimeDerivedValues?.saturacaoSodioCtc, ext.saturacaoSodioCtc, "%")} readOnly />
                                                <Field label="%Ca (%)" value={formatCalculatedValueWithRuntimeFallback(runtimeDerivedValues?.saturacaoCalcioCtc, ext.saturacaoCalcioCtc, "%")} readOnly />
                                                <Field label="%Mg (%)" value={formatCalculatedValueWithRuntimeFallback(runtimeDerivedValues?.saturacaoMagnesioCtc, ext.saturacaoMagnesioCtc, "%")} readOnly />
                                                <Field label="%H (%)" value={formatCalculatedValueWithRuntimeFallback(runtimeDerivedValues?.saturacaoHidrogenioCtc, ext.saturacaoHidrogenioCtc, "%")} readOnly />
                                                <Field label="%Al (%)" value={formatCalculatedValueWithRuntimeFallback(runtimeDerivedValues?.saturacaoAluminioCtc, ext.saturacaoAluminioCtc, "%")} readOnly />
                                            </Grid>

                                            <SectionHeader title="Relações entre Cátions Básicos" colorPalette="cyan" />
                                            <Grid templateColumns="repeat(4, 1fr)" gap={4} mb={4}>
                                                <Field label="Ca/Mg" value={formatCalculatedValueWithRuntimeFallback(runtimeDerivedValues?.relacaoCalcioMagnesio, ext.relacaoCalcioMagnesio)} readOnly />
                                                <Field label="Ca/K" value={formatCalculatedValueWithRuntimeFallback(runtimeDerivedValues?.relacaoCalcioPotassio, ext.relacaoCalcioPotassio)} readOnly />
                                                <Field label="Mg/K" value={formatCalculatedValueWithRuntimeFallback(runtimeDerivedValues?.relacaoMagnesioPotassio, ext.relacaoMagnesioPotassio)} readOnly />
                                                <Field label="(Ca + Mg)/K" value={formatCalculatedValueWithRuntimeFallback(runtimeDerivedValues?.relacaoCalcioMagnesioPotassio, ext.relacaoCalcioMagnesioPotassio)} readOnly />
                                            </Grid>

                                            <SectionHeader title="Micronutrientes e Outros" colorPalette="green" />
                                            <Grid templateColumns="repeat(4, 1fr)" gap={4} mb={4}>
                                                <NumericField {...numericFieldSharedProps} rowIndex={idx} label="P (Meh) (mg/dm³)" extract={ext} field="fosforoMehlich1" />
                                                <NumericField {...numericFieldSharedProps} rowIndex={idx} label="P (Res) (mg/dm³)" extract={ext} field="fosforoResina" />
                                                <NumericField {...numericFieldSharedProps} rowIndex={idx} label="S (mg/dm³)" extract={ext} field="enxofre" />
                                                <NumericField {...numericFieldSharedProps} rowIndex={idx} label="Matéria Orgânica (g/dm³)" extract={ext} field="materiaOrganica" />
                                            </Grid>
                                            <Grid templateColumns="repeat(5, 1fr)" gap={4}>
                                                <NumericField {...numericFieldSharedProps} rowIndex={idx} label="Boro (mg/dm³)" extract={ext} field="boro" />
                                                <NumericField {...numericFieldSharedProps} rowIndex={idx} label="Cobre (mg/dm³)" extract={ext} field="cobre" />
                                                <NumericField {...numericFieldSharedProps} rowIndex={idx} label="Ferro (mg/dm³)" extract={ext} field="ferro" />
                                                <NumericField {...numericFieldSharedProps} rowIndex={idx} label="Manganês (mg/dm³)" extract={ext} field="manganes" />
                                                <NumericField {...numericFieldSharedProps} rowIndex={idx} label="Zinco (mg/dm³)" extract={ext} field="zinco" />
                                            </Grid>
                                        </Box>
                                        );
                                    })}
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
                        <Button onClick={() => handleSubmit()} loading={isSubmitting} colorPalette="teal" disabled={mode === 'INITIAL'}>
                            {initialData ? "Salvar Alterações" : "Salvar Análise"}
                        </Button>
                    )}
                </DialogFooter>
                <DialogCloseTrigger color="gray.500" />
            </DialogContent>
        </DialogRoot>
    );
};
