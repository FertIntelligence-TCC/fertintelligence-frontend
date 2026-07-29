import { Box, Grid, Text, VStack } from "@chakra-ui/react";
import { formatOrganicCarbon, OrganicFertilizerFormState } from "@/interfaces/Fertilizer";
import { FertilizerCommercialPriceFields, FertilizerInputField, FertilizerPhotosSection, FormSectionHeader, PublicVisibilitySelector, ReadOnlyDisplay } from "@/components/Fertilizers/Shared/FertilizerFormComponents";

type Props = {
    form: OrganicFertilizerFormState;
    onChange: (field: keyof OrganicFertilizerFormState, value: OrganicFertilizerFormState[keyof OrganicFertilizerFormState]) => void;
    readOnly?: boolean;
};

export default function OrganicFertilizerFormFields({ form, onChange, readOnly }: Props) {
    const color = "green";
    const organicCarbon = formatOrganicCarbon(form.teorMateriaOrganica);
    const carbonValue = organicCarbon === "-" ? null : Number(organicCarbon.replace(",", "."));
    const nitrogenValue = Number(form.n.replace(",", "."));
    const cnRatio = carbonValue != null && nitrogenValue > 0
        ? (carbonValue / nitrogenValue).toFixed(2).replace(".", ",")
        : "-";

    return (
        <VStack gap={5} align="stretch" py={2}>
            <Box>
                <FormSectionHeader title="Identificação" colorScheme={color} />
                <Grid templateColumns="1fr" gap={3}>
                    <FertilizerInputField label="Nome do Adubo *" type="text" value={form.nome} onChange={(v) => onChange("nome", v)} readOnly={readOnly} colorScheme={color} />
                </Grid>
            </Box>

            <Box>
                <FormSectionHeader title="Composição Física" colorScheme={color} />
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={3}>
                    <FertilizerInputField label="Umidade (%)" value={form.teorUmidade} onChange={(v) => onChange("teorUmidade", v)} readOnly={readOnly} colorScheme={color} />
                    <FertilizerInputField label="Matéria Orgânica (%)" value={form.teorMateriaOrganica} onChange={(v) => onChange("teorMateriaOrganica", v)} readOnly={readOnly} colorScheme={color} />
                    <FertilizerInputField label="Carbono orgânico (%)" value={organicCarbon} readOnly colorScheme={color} isCalc />
                    <FertilizerInputField label="N (%)" value={form.n} onChange={(v) => onChange("n", v)} readOnly={readOnly} colorScheme={color} />
                    <Box>
                        <Text fontSize="xs" fontWeight="semibold" mb={1} color="gray.600" _dark={{ color: "gray.400" }}>Relação C/N</Text>
                        <ReadOnlyDisplay value={cnRatio} />
                    </Box>
                </Grid>
            </Box>

            <Box>
                <FormSectionHeader title="Taxa de Mineralização" colorScheme={color} />
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={3}>
                    <FertilizerInputField label="1° ano (%)" value={form.taxaMineralizacaoAno1} onChange={(v) => onChange("taxaMineralizacaoAno1", v)} readOnly={readOnly} colorScheme={color} />
                    <FertilizerInputField label="2° ano (%)" value={form.taxaMineralizacaoAno2} onChange={(v) => onChange("taxaMineralizacaoAno2", v)} readOnly={readOnly} colorScheme={color} />
                    <FertilizerInputField label="3° ano (%)" value={form.taxaMineralizacaoAno3} onChange={(v) => onChange("taxaMineralizacaoAno3", v)} readOnly={readOnly} colorScheme={color} />
                    <FertilizerInputField label="4° ano (%)" value={form.taxaMineralizacaoAno4} onChange={(v) => onChange("taxaMineralizacaoAno4", v)} readOnly={readOnly} colorScheme={color} />
                </Grid>
            </Box>

            <FertilizerPhotosSection
                photoIds={form.fotoIds}
                onChange={(fotoIds) => onChange("fotoIds", fotoIds)}
                readOnly={readOnly}
                colorScheme={color}
            />

            <Box>
                <FormSectionHeader title="Macronutrientes (%)" colorScheme={color} />
                <Grid templateColumns="repeat(3, 1fr)" gap={3}>
                    <FertilizerInputField label="P₂O₅" value={form.p2o5} onChange={(v) => onChange("p2o5", v)} readOnly={readOnly} colorScheme={color} />
                    <FertilizerInputField label="K₂O" value={form.k2o} onChange={(v) => onChange("k2o", v)} readOnly={readOnly} colorScheme={color} />
                    <FertilizerInputField label="Ca" value={form.ca} onChange={(v) => onChange("ca", v)} readOnly={readOnly} colorScheme={color} />
                    <FertilizerInputField label="Mg" value={form.mg} onChange={(v) => onChange("mg", v)} readOnly={readOnly} colorScheme={color} />
                    <FertilizerInputField label="S" value={form.s} onChange={(v) => onChange("s", v)} readOnly={readOnly} colorScheme={color} />
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
            <Box>
                <FormSectionHeader title="Metais Pesados (mg/kg)" colorScheme={color} />
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={3}>
                    <FertilizerInputField label="Arsênio" value={form.arsenio} onChange={(v) => onChange("arsenio", v)} readOnly={readOnly} colorScheme={color} />
                    <FertilizerInputField label="Cádmio" value={form.cadmio} onChange={(v) => onChange("cadmio", v)} readOnly={readOnly} colorScheme={color} />
                    <FertilizerInputField label="Crômio" value={form.cromio} onChange={(v) => onChange("cromio", v)} readOnly={readOnly} colorScheme={color} />
                    <FertilizerInputField label="Chumbo" value={form.chumbo} onChange={(v) => onChange("chumbo", v)} readOnly={readOnly} colorScheme={color} />
                    <FertilizerInputField label="Mercúrio" value={form.mercurio} onChange={(v) => onChange("mercurio", v)} readOnly={readOnly} colorScheme={color} />
                    <FertilizerInputField label="Níquel" value={form.niquel} onChange={(v) => onChange("niquel", v)} readOnly={readOnly} colorScheme={color} />
                    <FertilizerInputField label="Selênio" value={form.selenio} onChange={(v) => onChange("selenio", v)} readOnly={readOnly} colorScheme={color} />
                </Grid>
            </Box>
            <FertilizerCommercialPriceFields form={form} onChange={(field, value) => onChange(field, value)} readOnly={readOnly} colorScheme={color} />
            <Box>
                <FormSectionHeader title="Frete" colorScheme={color} />
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={3}>
                    <FertilizerInputField label="Valor do frete até a fazenda (R$/t)" value={form.valorFreteTonelada} onChange={(v) => onChange("valorFreteTonelada", v)} readOnly={readOnly} colorScheme={color} />
                </Grid>
            </Box>


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
