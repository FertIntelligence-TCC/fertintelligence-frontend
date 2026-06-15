import { useEffect } from "react";
import { Box, Grid, VStack, Flex, Text } from "@chakra-ui/react";
import { FormulatedFertilizerFormState } from "@/interfaces/Fertilizer";
import { FertilizerInputField, FertilizerPhotosSection, FormSectionHeader, PublicVisibilitySelector } from "@/components/Fertilizers/Shared/FertilizerFormComponents";
import { calculateNpkRelation, formatNpkRelation } from "@/utils/npkRelation";

type Props = {
    form: FormulatedFertilizerFormState;
    onChange: (field: keyof FormulatedFertilizerFormState, value: FormulatedFertilizerFormState[keyof FormulatedFertilizerFormState]) => void;
    readOnly?: boolean;
    setFormState: React.Dispatch<React.SetStateAction<FormulatedFertilizerFormState>>;
};

export default function FormulatedMineralFertilizerFormFields({ form, onChange, readOnly, setFormState }: Props) {
    const color = "green";

    useEffect(() => {
        if (readOnly) return;
        const n = parseFloat(form.formulaN) || 0;
        const p = parseFloat(form.formulaP) || 0;
        const k = parseFloat(form.formulaK) || 0;
        const relation = formatNpkRelation(calculateNpkRelation({ n, p, k }));

        setFormState(prev => ({
            ...prev,
            relacaoN: relation.n,
            relacaoP: relation.p,
            relacaoK: relation.k,
            n: form.formulaN,
            p2o5: form.formulaP,
            k2o: form.formulaK
        }));
    }, [form.formulaN, form.formulaP, form.formulaK, readOnly, setFormState]);

    return (
        <VStack gap={5} align="stretch" py={2}>
            <Box>
                <FormSectionHeader title="Fórmula e Relação NPK" colorScheme={color} />
                <Flex gap={4} direction={{ base: "column", md: "row" }}>
                    <Box flex={1}>
                        <Text fontSize="xs" fontWeight="bold" mb={2}>Formulado (NPK)</Text>
                        <Grid templateColumns="repeat(3, 1fr)" gap={2}>
                            <FertilizerInputField label="N" value={form.formulaN} onChange={(v) => onChange("formulaN", v)} readOnly={readOnly} colorScheme={color} />
                            <FertilizerInputField label="P₂O₅" value={form.formulaP} onChange={(v) => onChange("formulaP", v)} readOnly={readOnly} colorScheme={color} />
                            <FertilizerInputField label="K₂O" value={form.formulaK} onChange={(v) => onChange("formulaK", v)} readOnly={readOnly} colorScheme={color} />
                        </Grid>
                    </Box>
                    <Box flex={1}>
                        <Text fontSize="xs" fontWeight="bold" mb={2}>Relação (Calculada)</Text>
                        <Grid templateColumns="repeat(3, 1fr)" gap={2}>
                            <FertilizerInputField label="N" value={form.relacaoN} isCalc={true} colorScheme={color} />
                            <FertilizerInputField label="P" value={form.relacaoP} isCalc={true} colorScheme={color} />
                            <FertilizerInputField label="K" value={form.relacaoK} isCalc={true} colorScheme={color} />
                        </Grid>
                    </Box>
                </Flex>
            </Box>

            <Box>
                <FormSectionHeader title="Garantias - Macronutrientes (%)" colorScheme={color} />
                <Grid templateColumns="repeat(3, 1fr)" gap={3}>
                    {/* Campos de nutrientes padrão, reutilizando input */}
                    <FertilizerInputField label="N" value={form.n} onChange={(v) => onChange("n", v)} readOnly={readOnly} colorScheme={color} />
                    <FertilizerInputField label="P₂O₅" value={form.p2o5} onChange={(v) => onChange("p2o5", v)} readOnly={readOnly} colorScheme={color} />
                    <FertilizerInputField label="K₂O" value={form.k2o} onChange={(v) => onChange("k2o", v)} readOnly={readOnly} colorScheme={color} />
                    <FertilizerInputField label="Ca" value={form.ca} onChange={(v) => onChange("ca", v)} readOnly={readOnly} colorScheme={color} />
                    <FertilizerInputField label="Mg" value={form.mg} onChange={(v) => onChange("mg", v)} readOnly={readOnly} colorScheme={color} />
                    <FertilizerInputField label="S" value={form.s} onChange={(v) => onChange("s", v)} readOnly={readOnly} colorScheme={color} />
                </Grid>
            </Box>

            {/* Repetir para Micronutrientes e Outros (numeroFormulaIndicada) seguindo o padrão acima */}
             <Box>
                <FormSectionHeader title="Garantias - Micronutrientes (%)" colorScheme={color} />
                <Grid templateColumns="repeat(3, 1fr)" gap={3}>
                    <FertilizerInputField label="B" value={form.b} onChange={(v) => onChange("b", v)} readOnly={readOnly} colorScheme={color} />
                    <FertilizerInputField label="Cu" value={form.cu} onChange={(v) => onChange("cu", v)} readOnly={readOnly} colorScheme={color} />
                    <FertilizerInputField label="Fe" value={form.fe} onChange={(v) => onChange("fe", v)} readOnly={readOnly} colorScheme={color} />
                    <FertilizerInputField label="Mn" value={form.mn} onChange={(v) => onChange("mn", v)} readOnly={readOnly} colorScheme={color} />
                    <FertilizerInputField label="Mo" value={form.mo} onChange={(v) => onChange("mo", v)} readOnly={readOnly} colorScheme={color} />
                    <FertilizerInputField label="Zn" value={form.zn} onChange={(v) => onChange("zn", v)} readOnly={readOnly} colorScheme={color} />
                </Grid>
            </Box>

             <Box>
                <FormSectionHeader title="Outros" colorScheme={color} />
                <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                     <FertilizerInputField label="Nº Fórmula Indicada" value={form.numeroFormulaIndicada} onChange={(v) => onChange("numeroFormulaIndicada", v)} readOnly={readOnly} colorScheme={color} />
                </Grid>
            </Box>

            <FertilizerPhotosSection
                photoIds={form.fotoIds}
                onChange={(fotoIds) => onChange("fotoIds", fotoIds)}
                readOnly={readOnly}
                colorScheme={color}
            />

            <Box>
                <FormSectionHeader title="Informações adicionais" colorScheme={color} />
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={3}>
                    <FertilizerInputField label="Observação" type="text" value={form.observacao} onChange={(v) => onChange("observacao", v)} readOnly={readOnly} colorScheme={color} />
                    <FertilizerInputField label="Fonte" type="text" value={form.fonte} onChange={(v) => onChange("fonte", v)} readOnly={readOnly} colorScheme={color} />
                </Grid>
            </Box>

            <Box>
                <FormSectionHeader title="Compartilhamento" colorScheme={color} />
                <PublicVisibilitySelector
                    value={form.publico ?? "nao"}
                    onChange={(v) => onChange("publico", v)}
                    readOnly={readOnly}
                    colorScheme={color}
                />
            </Box>
        </VStack>
    );
}
