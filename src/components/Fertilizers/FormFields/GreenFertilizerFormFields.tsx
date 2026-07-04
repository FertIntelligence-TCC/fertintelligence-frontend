import { Box, Grid, Text, VStack } from "@chakra-ui/react";
import { GreenFertilizerFormState } from "@/interfaces/Fertilizer";
import { FertilizerCommercialPriceFields, FertilizerInputField, FertilizerPhotosSection, FormSectionHeader, ReadOnlyDisplay, PublicVisibilitySelector } from "@/components/Fertilizers/Shared/FertilizerFormComponents";

type Props = {
    form: GreenFertilizerFormState;
    onChange: (field: keyof GreenFertilizerFormState, value: GreenFertilizerFormState[keyof GreenFertilizerFormState]) => void;
    readOnly?: boolean;
};

export default function GreenFertilizerFormFields({ form, onChange, readOnly }: Props) {
    const color = "green";
    
    // Cálculo dinâmico da Relação C/N
    const cVal = parseFloat(form.c) || 0;
    const nVal = parseFloat(form.n) || 0;
    const cnRatio = nVal > 0 ? (cVal / nVal).toFixed(2) : "-";

    return (
        <VStack gap={5} align="stretch" py={2}>
            <Box>
                <FormSectionHeader title="Identificação e Relação C/N" colorScheme={color} />
                <Grid templateColumns={{ base: "1fr", md: "2fr 1fr 1fr 1fr" }} gap={3}>
                    <FertilizerInputField label="Nome do Adubo *" type="text" value={form.nome} onChange={(v) => onChange("nome", v)} readOnly={readOnly} colorScheme={color} />
                    <FertilizerInputField label="Carbono (%) *" value={form.c} onChange={(v) => onChange("c", v)} readOnly={readOnly} colorScheme={color} />
                    <FertilizerInputField label="Nitrogênio (%) *" value={form.n} onChange={(v) => onChange("n", v)} readOnly={readOnly} colorScheme={color} />
                    <Box>
                        <Text fontSize="xs" fontWeight="semibold" mb={1} color="gray.600" _dark={{ color: "gray.400" }}>Relação C/N</Text>
                        <ReadOnlyDisplay value={cnRatio} />
                    </Box>
                </Grid>
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={3} mt={3}>
                    <FertilizerInputField label="Produtividade Esperada (kg/ha)" value={form.produtividadeEsperada} onChange={(v) => onChange("produtividadeEsperada", v)} readOnly={readOnly} colorScheme={color} />
                </Grid>
            </Box>

            <Box>
                <FormSectionHeader title="Taxa de Mineralização (%)" colorScheme={color} />
                <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={3}>
                    <FertilizerInputField label="1° ano (%)" value={form.taxaMineralizacaoAno1} onChange={(v) => onChange("taxaMineralizacaoAno1", v)} readOnly={readOnly} colorScheme={color} />
                    <FertilizerInputField label="2° ano (%)" value={form.taxaMineralizacaoAno2} onChange={(v) => onChange("taxaMineralizacaoAno2", v)} readOnly={readOnly} colorScheme={color} />
                    <FertilizerInputField label="3° ano (%)" value={form.taxaMineralizacaoAno3} onChange={(v) => onChange("taxaMineralizacaoAno3", v)} readOnly={readOnly} colorScheme={color} />
                </Grid>
            </Box>

            <FertilizerPhotosSection
                photoIds={form.fotoIds}
                onChange={(fotoIds) => onChange("fotoIds", fotoIds)}
                readOnly={readOnly}
                colorScheme={color}
            />

            <Box>
                <FormSectionHeader title="Outros Macronutrientes (%)" colorScheme={color} />
                <Grid templateColumns="repeat(3, 1fr)" gap={3}>
                    <FertilizerInputField label="P₂O₅" value={form.p2o5} onChange={(v) => onChange("p2o5", v)} readOnly={readOnly} colorScheme={color} />
                    <FertilizerInputField label="K₂O" value={form.k2o} onChange={(v) => onChange("k2o", v)} readOnly={readOnly} colorScheme={color} />
                    <FertilizerInputField label="Ca" value={form.ca} onChange={(v) => onChange("ca", v)} readOnly={readOnly} colorScheme={color} />
                    <FertilizerInputField label="Mg" value={form.mg} onChange={(v) => onChange("mg", v)} readOnly={readOnly} colorScheme={color} />
                    <FertilizerInputField label="S" value={form.s} onChange={(v) => onChange("s", v)} readOnly={readOnly} colorScheme={color} />
                    <Box />
                </Grid>
            </Box>

            <Box>
                <FormSectionHeader title="Micronutrientes (%)" colorScheme={color} />
                <Grid templateColumns="repeat(3, 1fr)" gap={3}>
                    <FertilizerInputField label="B" value={form.b} onChange={(v) => onChange("b", v)} readOnly={readOnly} colorScheme={color} />
                    <FertilizerInputField label="Cu" value={form.cu} onChange={(v) => onChange("cu", v)} readOnly={readOnly} colorScheme={color} />
                    <FertilizerInputField label="Fe" value={form.fe} onChange={(v) => onChange("fe", v)} readOnly={readOnly} colorScheme={color} />
                    <FertilizerInputField label="Mn" value={form.mn} onChange={(v) => onChange("mn", v)} readOnly={readOnly} colorScheme={color} />
                    <FertilizerInputField label="Mo" value={form.mo} onChange={(v) => onChange("mo", v)} readOnly={readOnly} colorScheme={color} />
                    <FertilizerInputField label="Zn" value={form.zn} onChange={(v) => onChange("zn", v)} readOnly={readOnly} colorScheme={color} />
                </Grid>
            </Box>
            <FertilizerCommercialPriceFields form={form} onChange={(field, value) => onChange(field, value)} readOnly={readOnly} colorScheme={color} />


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
