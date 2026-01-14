import { useEffect } from "react";
import { Box, Grid, Input, Text, VStack, Flex } from "@chakra-ui/react";
import { FormulatedFertilizerFormState } from "@/interfaces/Fertilizer";

type Props = {
    form: FormulatedFertilizerFormState;
    onChange: (field: keyof FormulatedFertilizerFormState, value: string) => void;
    readOnly?: boolean;
    // Função para atualizar múltiplos campos de uma vez (para o cálculo automático)
    setFormState: React.Dispatch<React.SetStateAction<FormulatedFertilizerFormState>>;
};

const styles = {
    field: {
        bg: "white",
        borderColor: "gray.300",
        borderWidth: "1px",
        borderRadius: "md",
        _focus: { borderColor: "green.500", boxShadow: "0 0 0 1px var(--chakra-colors-green-500)" },
        _dark: { bg: "gray.800", borderColor: "gray.600", color: "white" },
        _disabled: { opacity: 1, bg: "gray.100", cursor: "not-allowed", _dark: { bg: "gray.700" } }
    },
    calcField: {
        bg: "gray.50",
        borderColor: "gray.200",
        color: "gray.600",
        _dark: { bg: "gray.700", borderColor: "gray.600", color: "gray.300" }
    }
};

const InputField = ({ label, value, onChange, readOnly, isCalc = false }: any) => (
    <Box>
        <Text fontSize="xs" fontWeight="semibold" mb={1} color="gray.600" _dark={{ color: "gray.400" }}>{label}</Text>
        <Input
            type="number"
            value={value}
            onChange={(e) => onChange && onChange(e.target.value)}
            readOnly={readOnly || isCalc}
            disabled={readOnly || isCalc}
            {...(isCalc ? styles.calcField : styles.field)}
        />
    </Box>
);

export default function FormulatedMineralFertilizerFormFields({ form, onChange, readOnly, setFormState }: Props) {

    // Efeito para calcular Relação NPK e espelhar valores de garantia
    useEffect(() => {
        if (readOnly) return;

        const n = parseFloat(form.formulaN) || 0;
        const p = parseFloat(form.formulaP) || 0;
        const k = parseFloat(form.formulaK) || 0;

        // 1. Espelhar para as garantias (Geralmente a fórmula É a garantia)
        // Só espelha se o usuário não tiver alterado manualmente (opcional, aqui forçamos o espelho)
        // Para evitar loops infinitos ou overrides indesejados, fazemos isso apenas na lógica de display ou submit, 
        // mas aqui vamos atualizar o state para o usuário ver.
        
        // 2. Calcular Relação (ex: 4-14-8 -> divide pelo menor valor não zero -> 1 : 3.5 : 2)
        const values = [n, p, k].filter(v => v > 0);
        const minVal = values.length > 0 ? Math.min(...values) : 1;

        const relN = n > 0 ? (n / minVal) : 0;
        const relP = p > 0 ? (p / minVal) : 0;
        const relK = k > 0 ? (k / minVal) : 0;

        setFormState(prev => ({
            ...prev,
            relacaoN: parseFloat(relN.toFixed(2)).toString(),
            relacaoP: parseFloat(relP.toFixed(2)).toString(),
            relacaoK: parseFloat(relK.toFixed(2)).toString(),
            // Auto-preencher garantias baseadas na fórmula
            n: form.formulaN,
            p2o5: form.formulaP,
            k2o: form.formulaK
        }));

    }, [form.formulaN, form.formulaP, form.formulaK, readOnly, setFormState]);

    return (
        <VStack gap={5} align="stretch" py={2}>
            
            {/* 1. Fórmula e Relação */}
            <Box>
                <Text fontWeight="bold" mb={2} color="green.600" _dark={{ color: "green.300" }} borderBottomWidth="1px" pb={1}>
                    Fórmula e Relação NPK
                </Text>
                <Flex gap={4} direction={{ base: "column", md: "row" }}>
                    <Box flex={1}>
                        <Text fontSize="xs" fontWeight="bold" mb={2}>Formulado (NPK)</Text>
                        <Grid templateColumns="repeat(3, 1fr)" gap={2}>
                            <InputField label="N" value={form.formulaN} onChange={(v: string) => onChange("formulaN", v)} readOnly={readOnly} />
                            <InputField label="P₂O₅" value={form.formulaP} onChange={(v: string) => onChange("formulaP", v)} readOnly={readOnly} />
                            <InputField label="K₂O" value={form.formulaK} onChange={(v: string) => onChange("formulaK", v)} readOnly={readOnly} />
                        </Grid>
                    </Box>
                    <Box flex={1}>
                        <Text fontSize="xs" fontWeight="bold" mb={2}>Relação (Calculada)</Text>
                        <Grid templateColumns="repeat(3, 1fr)" gap={2}>
                            <InputField label="N" value={form.relacaoN} isCalc={true} />
                            <InputField label="P" value={form.relacaoP} isCalc={true} />
                            <InputField label="K" value={form.relacaoK} isCalc={true} />
                        </Grid>
                    </Box>
                </Flex>
            </Box>

            {/* 2. Macronutrientes (Garantias) */}
            <Box>
                <Text fontWeight="bold" mb={2} color="green.600" _dark={{ color: "green.300" }} borderBottomWidth="1px" pb={1}>
                    Garantias - Macronutrientes (%)
                </Text>
                <Grid templateColumns="repeat(3, 1fr)" gap={3}>
                    {/* Estes campos são atualizados automaticamente pela fórmula, mas podem ser editados se necessário */}
                    <InputField label="N" value={form.n} onChange={(v: string) => onChange("n", v)} readOnly={readOnly} />
                    <InputField label="P₂O₅" value={form.p2o5} onChange={(v: string) => onChange("p2o5", v)} readOnly={readOnly} />
                    <InputField label="K₂O" value={form.k2o} onChange={(v: string) => onChange("k2o", v)} readOnly={readOnly} />
                    
                    <InputField label="Ca" value={form.ca} onChange={(v: string) => onChange("ca", v)} readOnly={readOnly} />
                    <InputField label="Mg" value={form.mg} onChange={(v: string) => onChange("mg", v)} readOnly={readOnly} />
                    <InputField label="S" value={form.s} onChange={(v: string) => onChange("s", v)} readOnly={readOnly} />
                </Grid>
            </Box>

            {/* 3. Micronutrientes */}
            <Box>
                <Text fontWeight="bold" mb={2} color="green.600" _dark={{ color: "green.300" }} borderBottomWidth="1px" pb={1}>
                    Garantias - Micronutrientes (%)
                </Text>
                <Grid templateColumns="repeat(3, 1fr)" gap={3}>
                    <InputField label="B" value={form.b} onChange={(v: string) => onChange("b", v)} readOnly={readOnly} />
                    <InputField label="Cu" value={form.cu} onChange={(v: string) => onChange("cu", v)} readOnly={readOnly} />
                    <InputField label="Fe" value={form.fe} onChange={(v: string) => onChange("fe", v)} readOnly={readOnly} />
                    <InputField label="Mn" value={form.mn} onChange={(v: string) => onChange("mn", v)} readOnly={readOnly} />
                    <InputField label="Mo" value={form.mo} onChange={(v: string) => onChange("mo", v)} readOnly={readOnly} />
                    <InputField label="Zn" value={form.zn} onChange={(v: string) => onChange("zn", v)} readOnly={readOnly} />
                </Grid>
            </Box>

            {/* 4. Identificação Extra */}
            <Box>
                <Text fontWeight="bold" mb={2} color="green.600" _dark={{ color: "green.300" }} borderBottomWidth="1px" pb={1}>
                    Outros
                </Text>
                <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                    <InputField label="Nº Fórmula Indicada" value={form.numeroFormulaIndicada} onChange={(v: string) => onChange("numeroFormulaIndicada", v)} readOnly={readOnly} />
                </Grid>
            </Box>
        </VStack>
    );
}