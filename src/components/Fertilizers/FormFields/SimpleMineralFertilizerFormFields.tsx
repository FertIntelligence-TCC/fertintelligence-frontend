import { Box, Grid, VStack } from "@chakra-ui/react";
import { SimpleMineralFertilizerFormState } from "@/interfaces/Fertilizer";
import { FertilizerInputField, FormSectionHeader, PublicVisibilitySelector } from "@/components/Fertilizers/Shared/FertilizerFormComponents";

type Props = {
    form: SimpleMineralFertilizerFormState;
    onChange: (field: keyof SimpleMineralFertilizerFormState, value: string) => void;
    readOnly?: boolean;
};

export default function SimpleMineralFertilizerFormFields({ form, onChange, readOnly }: Props) {
    const color = "green";

    return (
        <VStack gap={5} align="stretch" py={2}>
            
            {/* Identificação */}
            <Box>
                <FormSectionHeader title="Identificação" colorScheme={color} />
                <FertilizerInputField 
                    label="Nome do Adubo *" 
                    type="text" 
                    value={form.nome} 
                    onChange={(v) => onChange("nome", v)} 
                    readOnly={readOnly} 
                    colorScheme={color}
                />
            </Box>

            {/* Macronutrientes */}
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

            {/* Micronutrientes */}
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

            {/* Índices */}
            <Box>
                <FormSectionHeader title="Índices Físico-Químicos" colorScheme={color} />
                <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                    <FertilizerInputField label="Índice Salino" value={form.indiceSalino} onChange={(v) => onChange("indiceSalino", v)} readOnly={readOnly} colorScheme={color} />
                    <FertilizerInputField label="Índice de Acidez" value={form.indiceAcidez} onChange={(v) => onChange("indiceAcidez", v)} readOnly={readOnly} colorScheme={color} />
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