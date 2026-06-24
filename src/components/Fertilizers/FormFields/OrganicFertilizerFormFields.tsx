import { Box, Grid, VStack } from "@chakra-ui/react";
import { formatOrganicCarbon, OrganicFertilizerFormState } from "@/interfaces/Fertilizer";
import { FertilizerInputField, FertilizerPhotosSection, FormSectionHeader, PublicVisibilitySelector } from "@/components/Fertilizers/Shared/FertilizerFormComponents";

type Props = {
    form: OrganicFertilizerFormState;
    onChange: (field: keyof OrganicFertilizerFormState, value: OrganicFertilizerFormState[keyof OrganicFertilizerFormState]) => void;
    readOnly?: boolean;
};

export default function OrganicFertilizerFormFields({ form, onChange, readOnly }: Props) {
    const color = "green";
    const organicCarbon = formatOrganicCarbon(form.teorMateriaOrganica);

    return (
        <VStack gap={5} align="stretch" py={2}>
            <Box>
                <FormSectionHeader title="Identificação" colorScheme={color} />
                <Grid templateColumns="1fr" gap={3}>
                    <FertilizerInputField label="Nome do Adubo *" type="text" value={form.nome} onChange={(v) => onChange("nome", v)} readOnly={readOnly} colorScheme={color} />
                    <FertilizerInputField label="Teor de Carbono Orgânico (%)" value={organicCarbon} readOnly colorScheme={color} isCalc />
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

            <Box>
                <FormSectionHeader title="Composição Física (%)" colorScheme={color} />
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={3}>
                    <FertilizerInputField label="Teor de Umidade (%) *" value={form.teorUmidade} onChange={(v) => onChange("teorUmidade", v)} readOnly={readOnly} colorScheme={color} />
                    <FertilizerInputField label="Teor de Matéria Orgânica (%) *" value={form.teorMateriaOrganica} onChange={(v) => onChange("teorMateriaOrganica", v)} readOnly={readOnly} colorScheme={color} />
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
                    <FertilizerInputField label="N" value={form.n} onChange={(v) => onChange("n", v)} readOnly={readOnly} colorScheme={color} />
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
