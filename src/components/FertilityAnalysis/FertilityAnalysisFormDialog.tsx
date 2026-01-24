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
    items: Object.values(Camada).map((c) => ({ label: c, value: c })),
});

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    plotId: number;
    plotIdentification: string;
    initialData?: any;
}

export const FertilityAnalysisFormDialog = ({ isOpen, onClose, onSuccess, plotId, plotIdentification }: Props) => {
    const [analysisYear, setAnalysisYear] = useState<string>(new Date().getFullYear().toString());
    const [lab, setLab] = useState("");
    const [mode, setMode] = useState<AnalysisMode>('INITIAL');
    const [extracts, setExtracts] = useState<FertilityExtractFormData[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setAnalysisYear(new Date().getFullYear().toString());
            setLab("");
            setMode('INITIAL');
            setExtracts([]);
        }
    }, [isOpen]);

    const handleAddExtract = () => {
        const newExtract: FertilityExtractFormData = {
            tempId: Math.random().toString(36).substr(2, 9),
            profundidadeInicial: 0, 
            profundidadeFinal: 20, 
            camada: mode === 'LAYER' ? Camada.A : undefined, 
            subcamada: 1,
            
            // Acidez
            phAgua: 0, 
            phCacl2: 0, 
            aluminio: 0, 
            aluminioMaisHidrogenio: 0,
            
            // Bases
            calcio: 0, 
            magnesio: 0, 
            potassio: 0, 
            sodio: 0,
            
            // Complexo de Troca
            somaBases: 0, 
            ctcEfetiva: 0, 
            ctcPh7: 0, 
            saturacaoBasesV: 0, 
            saturacaoAluminioM: 0,
            
            // Macro Secundários e MO
            fosforoMehlich1: 0, 
            fosforoResina: 0, 
            enxofre: 0, 
            materiaOrganica: 0,
            
            // Micronutrientes
            boro: 0, 
            cobre: 0, 
            ferro: 0, 
            manganes: 0, 
            zinco: 0
        };
        const updated = [...extracts, newExtract];
        if (mode === 'LAYER') recalculateSubLayers(updated);
        else setExtracts(updated);
    };

    const handleRemoveExtract = (tempId: string) => {
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
        if (extracts.length > 0 && !confirm("Isso apagará os dados inseridos. Continuar?")) return;
        setMode('INITIAL');
        setExtracts([]);
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
            const analysisPayload = {
                ano_analise: parseInt(analysisYear),
                laboratorio_responsavel: lab,
                tipo_extrato: mode === 'LAYER' ? TipoExtrato.CAMADAS : TipoExtrato.INTERVALOS,
                id_talhao: plotId,
                identificacao_talhao: plotIdentification
            };

            const analysis = await soilAnalysisService.create(analysisPayload);

            for (const ext of extracts) {
                let extractId: number;
                if (mode === 'LAYER') {
                    const res = await layerExtractService.create(analysis.id, {
                        profundidade_inicial: ext.profundidadeInicial, 
                        profundidade_final: ext.profundidadeFinal,
                        camada: ext.camada!, 
                        subcamada: ext.subcamada || 1
                    });
                    extractId = res.id;
                } else {
                    const res = await rangeExtractService.create(analysis.id, {
                        profundidade_inicial: ext.profundidadeInicial, 
                        profundidade_final: ext.profundidadeFinal
                    });
                    extractId = res.id;
                }
                
                // Mapeamento completo conforme FertilityAnalysisExtractCreateRequestDto.java
                await fertilityAnalysisExtractService.create({
                    ph_agua: ext.phAgua, 
                    ph_cacl2: ext.phCacl2, 
                    
                    calcio: ext.calcio, 
                    magnesio: ext.magnesio, 
                    potassio: ext.potassio, 
                    sodio: ext.sodio,
                    
                    aluminio: ext.aluminio, 
                    aluminio_mais_hidrogenio: ext.aluminioMaisHidrogenio, 
                    
                    soma_bases: ext.somaBases, 
                    ctc_efetiva: ext.ctcEfetiva, 
                    ctc_ph7: ext.ctcPh7, 
                    saturacao_bases_v: ext.saturacaoBasesV, 
                    saturacao_aluminio_m: ext.saturacaoAluminioM, 
                    
                    fosforo_mehlich1: ext.fosforoMehlich1, 
                    fosforo_resina: ext.fosforoResina, 
                    enxofre: ext.enxofre, 
                    materia_organica: ext.materiaOrganica, 
                    
                    boro: ext.boro, 
                    cobre: ext.cobre, 
                    ferro: ext.ferro, 
                    manganes: ext.manganes, 
                    zinco: ext.zinco
                }, mode === 'RANGE' ? extractId : undefined, mode === 'LAYER' ? extractId : undefined);
            }
            
            toaster.create({ title: "Análise Química salva!", type: "success" });
            onSuccess(); 
            onClose();
        } catch (error) {
            console.error("Erro ao salvar análise:", error);
            toaster.create({ title: "Erro ao salvar", description: "Verifique os dados.", type: "error" });
        } finally { 
            setIsSubmitting(false); 
        }
    };

    return (
        <DialogRoot open={isOpen} onOpenChange={onClose} size="xl">
            <DialogContent bg="gray.50" _dark={{ bg: "gray.900", color: "gray.100" }}>
                <DialogHeader borderBottomWidth="1px" borderColor="gray.200" _dark={{ bg: "gray.800", borderColor: "gray.700" }} bg="white">
                    <DialogTitle color="gray.800" _dark={{ color: "white" }}>Nova Análise de Fertilidade</DialogTitle>
                </DialogHeader>
                <DialogBody py={6}>
                    <VStack gap={6} align="stretch">
                        
                        <Box bg="white" _dark={{ bg: "gray.800", borderColor: "gray.700" }} p={4} borderRadius="md" shadow="sm" borderWidth="1px" borderColor="gray.200">
                            <SectionHeader title="Dados da Análise" />
                            <Grid templateColumns="1fr 2fr" gap={4}>
                                <Field label="Ano" type="number" value={analysisYear} onChange={e => setAnalysisYear(e.target.value)} />
                                <Field label="Laboratório Responsável" value={lab} onChange={e => setLab(e.target.value)} />
                            </Grid>
                        </Box>

                        {mode === 'INITIAL' && (
                            <VStack gap={4} mt={4} bg="white" _dark={{ bg: "gray.800", borderColor: "gray.700" }} p={6} borderRadius="md" shadow="sm" borderWidth="1px" borderColor="gray.200">
                                <Text fontWeight="bold" color="gray.700" _dark={{ color: "gray.200" }}>Selecione o método de estratificação:</Text>
                                <HStack gap={4} w="full">
                                    <Button flex={1} variant="surface" colorPalette="blue" onClick={() => setMode('LAYER')}>Por Camadas (A, B...)</Button>
                                    <Button flex={1} variant="surface" colorPalette="teal" onClick={() => setMode('RANGE')}>Por Profundidade (0-20...)</Button>
                                </HStack>
                            </VStack>
                        )}

                        {mode !== 'INITIAL' && (
                            <Box>
                                <Flex justify="space-between" align="center" mb={4}>
                                    <Text fontWeight="bold" fontSize="lg" color="gray.700" _dark={{ color: "gray.200" }}>Extratos</Text>
                                    <HStack>
                                        <Button size="xs" variant="ghost" colorPalette="red" onClick={handleCancelMode}>Cancelar</Button>
                                        <Button size="sm" colorPalette="teal" onClick={handleAddExtract}><LuPlus /> Adicionar</Button>
                                    </HStack>
                                </Flex>

                                <VStack gap={4} align="stretch">
                                    {extracts.map((ext, idx) => (
                                        <Box key={ext.tempId} p={5} borderWidth="1px" borderColor="gray.300" _dark={{ bg: "gray.800", borderColor: "gray.600" }} borderRadius="lg" bg="white" shadow="sm">
                                            <Flex justify="space-between" mb={4} align="center">
                                                <Badge colorPalette="teal" size="lg" variant="subtle">
                                                    {mode === 'LAYER' ? `Camada ${ext.camada || '?'}${ext.subcamada}` : `Amostra ${idx + 1}`}
                                                </Badge>
                                                <Button size="sm" colorPalette="red" variant="ghost" onClick={() => handleRemoveExtract(ext.tempId)}>
                                                    <LuTrash2 /> Remover
                                                </Button>
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
                                                        >
                                                            <SelectTrigger bg="white" _dark={{ bg: "gray.800", borderColor: "gray.600", color: "white" }} borderColor="gray.300">
                                                                <SelectValueText placeholder="Selecione" />
                                                            </SelectTrigger>
                                                            <SelectContent zIndex={1500}>
                                                                {camadaCollection.items.map((item) => (
                                                                    <SelectItem item={item} key={item.value}>{item.label}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </SelectRoot>
                                                    </Box>
                                                )}
                                                <Box gridColumn="span 2"><Field label="Prof. Inicial (cm)" type="number" value={ext.profundidadeInicial} onChange={e => handleChangeExtract(ext.tempId, 'profundidadeInicial', parseFloat(e.target.value))} /></Box>
                                                <Box gridColumn="span 2"><Field label="Prof. Final (cm)" type="number" value={ext.profundidadeFinal} onChange={e => handleChangeExtract(ext.tempId, 'profundidadeFinal', parseFloat(e.target.value))} /></Box>
                                            </Grid>

                                            <SectionHeader title="Acidez & Alumínio" colorPalette="red" />
                                            <Grid templateColumns="repeat(4, 1fr)" gap={4} mb={4}>
                                                <Field label="pH H₂O" type="number" value={ext.phAgua} onChange={e => handleChangeExtract(ext.tempId, 'phAgua', parseFloat(e.target.value))} />
                                                <Field label="pH CaCl₂" type="number" value={ext.phCacl2} onChange={e => handleChangeExtract(ext.tempId, 'phCacl2', parseFloat(e.target.value))} />
                                                <Field label="Al (cmolc)" type="number" value={ext.aluminio} onChange={e => handleChangeExtract(ext.tempId, 'aluminio', parseFloat(e.target.value))} />
                                                <Field label="H+Al (cmolc)" type="number" value={ext.aluminioMaisHidrogenio} onChange={e => handleChangeExtract(ext.tempId, 'aluminioMaisHidrogenio', parseFloat(e.target.value))} />
                                            </Grid>

                                            <SectionHeader title="Bases Trocáveis (cmolc/dm³)" colorPalette="blue" />
                                            <Grid templateColumns="repeat(4, 1fr)" gap={4} mb={4}>
                                                <Field label="Ca" type="number" value={ext.calcio} onChange={e => handleChangeExtract(ext.tempId, 'calcio', parseFloat(e.target.value))} />
                                                <Field label="Mg" type="number" value={ext.magnesio} onChange={e => handleChangeExtract(ext.tempId, 'magnesio', parseFloat(e.target.value))} />
                                                <Field label="K" type="number" value={ext.potassio} onChange={e => handleChangeExtract(ext.tempId, 'potassio', parseFloat(e.target.value))} />
                                                <Field label="Na" type="number" value={ext.sodio} onChange={e => handleChangeExtract(ext.tempId, 'sodio', parseFloat(e.target.value))} />
                                            </Grid>

                                            <SectionHeader title="Complexo de Troca" colorPalette="purple" />
                                            <Grid templateColumns="repeat(5, 1fr)" gap={4} mb={4}>
                                                <Field label="SB" type="number" value={ext.somaBases} onChange={e => handleChangeExtract(ext.tempId, 'somaBases', parseFloat(e.target.value))} />
                                                <Field label="CTC(t)" type="number" value={ext.ctcEfetiva} onChange={e => handleChangeExtract(ext.tempId, 'ctcEfetiva', parseFloat(e.target.value))} />
                                                <Field label="CTC(T)" type="number" value={ext.ctcPh7} onChange={e => handleChangeExtract(ext.tempId, 'ctcPh7', parseFloat(e.target.value))} />
                                                <Field label="V (%)" type="number" value={ext.saturacaoBasesV} onChange={e => handleChangeExtract(ext.tempId, 'saturacaoBasesV', parseFloat(e.target.value))} />
                                                <Field label="m (%)" type="number" value={ext.saturacaoAluminioM} onChange={e => handleChangeExtract(ext.tempId, 'saturacaoAluminioM', parseFloat(e.target.value))} />
                                            </Grid>

                                            <SectionHeader title="P, S e Matéria Orgânica" colorPalette="green" />
                                            <Grid templateColumns="repeat(4, 1fr)" gap={4} mb={4}>
                                                <Field label="P (Mehlich)" type="number" value={ext.fosforoMehlich1} onChange={e => handleChangeExtract(ext.tempId, 'fosforoMehlich1', parseFloat(e.target.value))} />
                                                <Field label="P (Resina)" type="number" value={ext.fosforoResina} onChange={e => handleChangeExtract(ext.tempId, 'fosforoResina', parseFloat(e.target.value))} />
                                                <Field label="S" type="number" value={ext.enxofre} onChange={e => handleChangeExtract(ext.tempId, 'enxofre', parseFloat(e.target.value))} />
                                                <Field label="M.O." type="number" value={ext.materiaOrganica} onChange={e => handleChangeExtract(ext.tempId, 'materiaOrganica', parseFloat(e.target.value))} />
                                            </Grid>

                                            <SectionHeader title="Micronutrientes (mg/dm³)" colorPalette="orange" />
                                            <Grid templateColumns="repeat(5, 1fr)" gap={4}>
                                                <Field label="Boro (B)" type="number" value={ext.boro} onChange={e => handleChangeExtract(ext.tempId, 'boro', parseFloat(e.target.value))} />
                                                <Field label="Cobre (Cu)" type="number" value={ext.cobre} onChange={e => handleChangeExtract(ext.tempId, 'cobre', parseFloat(e.target.value))} />
                                                <Field label="Ferro (Fe)" type="number" value={ext.ferro} onChange={e => handleChangeExtract(ext.tempId, 'ferro', parseFloat(e.target.value))} />
                                                <Field label="Manganês" type="number" value={ext.manganes} onChange={e => handleChangeExtract(ext.tempId, 'manganes', parseFloat(e.target.value))} />
                                                <Field label="Zinco (Zn)" type="number" value={ext.zinco} onChange={e => handleChangeExtract(ext.tempId, 'zinco', parseFloat(e.target.value))} />
                                            </Grid>
                                        </Box>
                                    ))}
                                </VStack>
                            </Box>
                        )}
                    </VStack>
                </DialogBody>
                <DialogFooter bg="gray.100" _dark={{ bg: "gray.800", borderColor: "gray.700" }} borderTopWidth="1px" borderColor="gray.200">
                    <Button variant="ghost" colorPalette="gray" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSubmit} loading={isSubmitting} colorPalette="teal" disabled={mode === 'INITIAL'}>Salvar Análise</Button>
                </DialogFooter>
                <DialogCloseTrigger color="gray.500" />
            </DialogContent>
        </DialogRoot>
    );
};