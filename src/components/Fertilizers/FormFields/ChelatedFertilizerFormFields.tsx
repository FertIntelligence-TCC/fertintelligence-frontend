import { Box, Grid, VStack } from "@chakra-ui/react";
import { ChelatedFertilizerFormState } from "@/interfaces/Fertilizer";
import { FertilizerCommercialPriceFields, FertilizerInputField, FertilizerPhotosSection, FormSectionHeader, PublicVisibilitySelector } from "@/components/Fertilizers/Shared/FertilizerFormComponents";

type Props = {
    form: ChelatedFertilizerFormState;
    onChange: (field: keyof ChelatedFertilizerFormState, value: ChelatedFertilizerFormState[keyof ChelatedFertilizerFormState]) => void;
    readOnly?: boolean;
};

export default function ChelatedFertilizerFormFields({ form, onChange, readOnly }: Props) {
    const color = "purple";

    return (
        <VStack gap={5} align="stretch" py={2}>
            <Box>
                <FormSectionHeader title="Identificação" colorScheme={color} />
                <FertilizerInputField label="Nome do Adubo Quelatado *" type="text" value={form.nome} onChange={(v) => onChange("nome", v)} readOnly={readOnly} colorScheme={color} />
            </Box>

            <FertilizerPhotosSection
                photoIds={form.fotoIds}
                onChange={(fotoIds) => onChange("fotoIds", fotoIds)}
                readOnly={readOnly}
                colorScheme={color}
            />

            <Box>
                <FormSectionHeader title="Especificações Técnicas" colorScheme={color} />
                <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={3}>
                    <FertilizerInputField label="Densidade (g/ml)" value={form.densidade} onChange={(v) => onChange("densidade", v)} readOnly={readOnly} colorScheme={color} />
                    <FertilizerInputField label="Concentração em volume (g/L)" value={form.concentracaoVolume} onChange={(v) => onChange("concentracaoVolume", v)} readOnly={readOnly} colorScheme={color} />
                    <FertilizerInputField label="Concentração em massa (g/kg)" value={form.concentracaoMassa} onChange={(v) => onChange("concentracaoMassa", v)} readOnly={readOnly} colorScheme={color} />
                </Grid>
            </Box>

            {/* Destaque para Micronutrientes */}
            <Box>
                <FormSectionHeader title="Micronutrientes (%)" colorScheme={color} />
                <Grid templateColumns="repeat(3, 1fr)" gap={3}>
                    <FertilizerInputField label="Ferro (Fe)" value={form.fe} onChange={(v) => onChange("fe", v)} readOnly={readOnly} colorScheme={color} />
                    <FertilizerInputField label="Manganês (Mn)" value={form.mn} onChange={(v) => onChange("mn", v)} readOnly={readOnly} colorScheme={color} />
                    <FertilizerInputField label="Zinco (Zn)" value={form.zn} onChange={(v) => onChange("zn", v)} readOnly={readOnly} colorScheme={color} />
                    <FertilizerInputField label="Cobre (Cu)" value={form.cu} onChange={(v) => onChange("cu", v)} readOnly={readOnly} colorScheme={color} />
                    <FertilizerInputField label="Boro (B)" value={form.b} onChange={(v) => onChange("b", v)} readOnly={readOnly} colorScheme={color} />
                    <FertilizerInputField label="Molibdênio (Mo)" value={form.mo} onChange={(v) => onChange("mo", v)} readOnly={readOnly} colorScheme={color} />
                </Grid>
            </Box>

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
                <FormSectionHeader title="Índices Físico-Químicos" colorScheme={color} />
                <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                    <FertilizerInputField label="Índice Salino" value={form.indiceSalino} onChange={(v) => onChange("indiceSalino", v)} readOnly={readOnly} colorScheme={color} />
                    <FertilizerInputField label="Índice de Acidez" value={form.indiceAcidez} onChange={(v) => onChange("indiceAcidez", v)} readOnly={readOnly} colorScheme={color} />
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
