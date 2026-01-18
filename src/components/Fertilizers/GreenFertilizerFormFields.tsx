import { Box, Grid, Input, Text, VStack } from "@chakra-ui/react";
import { GreenFertilizerFormState } from "@/interfaces/Fertilizer";

type Props = {
    form: GreenFertilizerFormState;
    onChange: (field: keyof GreenFertilizerFormState, value: string) => void;
    readOnly?: boolean;
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
    readOnlyDisplay: {
        bg: "gray.50",
        borderWidth: "1px",
        borderColor: "gray.200",
        borderRadius: "md",
        px: 3,
        py: 2,
        fontWeight: "bold",
        color: "gray.700",
        display: "flex",
        alignItems: "center",
        height: "40px", // Para alinhar altura com inputs
        _dark: { bg: "gray.700", borderColor: "gray.600", color: "gray.200" }
    }
};

const InputField = ({ label, value, onChange, readOnly, type = "number" }: any) => (
    <Box>
        <Text fontSize="xs" fontWeight="semibold" mb={1} color="gray.600" _dark={{ color: "gray.400" }}>{label}</Text>
        <Input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            readOnly={readOnly}
            disabled={readOnly}
            {...styles.field}
        />
    </Box>
);

export default function GreenFertilizerFormFields({ form, onChange, readOnly }: Props) {
    
    // Cálculo dinâmico da Relação C/N
    const cVal = parseFloat(form.c) || 0;
    const nVal = parseFloat(form.n) || 0;
    // Evita divisão por zero
    const cnRatio = nVal > 0 ? (cVal / nVal).toFixed(2) : "-";

    return (
        <VStack gap={5} align="stretch" py={2}>
            
            {/* Identificação e C/N */}
            <Box>
                <Text fontWeight="bold" mb={2} color="green.600" _dark={{ color: "green.300" }} borderBottomWidth="1px" pb={1}>Identificação e Relação C/N</Text>
                <Grid templateColumns={{ base: "1fr", md: "2fr 1fr 1fr 1fr" }} gap={3}>
                    <InputField 
                        label="Nome do Adubo *" 
                        type="text" 
                        value={form.nome} 
                        onChange={(v: string) => onChange("nome", v)} 
                        readOnly={readOnly} 
                    />
                     <InputField 
                        label="Carbono (%) *" 
                        value={form.c} 
                        onChange={(v: string) => onChange("c", v)} 
                        readOnly={readOnly} 
                    />
                    <InputField 
                        label="Nitrogênio (%) *" 
                        value={form.n} 
                        onChange={(v: string) => onChange("n", v)} 
                        readOnly={readOnly} 
                    />
                    <Box>
                        <Text fontSize="xs" fontWeight="semibold" mb={1} color="gray.600" _dark={{ color: "gray.400" }}>Relação C/N</Text>
                        <Box {...styles.readOnlyDisplay}>
                            {cnRatio}
                        </Box>
                    </Box>
                </Grid>
            </Box>

            {/* Macronutrientes Restantes */}
            <Box>
                <Text fontWeight="bold" mb={2} color="green.600" _dark={{ color: "green.300" }} borderBottomWidth="1px" pb={1}>Outros Macronutrientes (%)</Text>
                <Grid templateColumns="repeat(3, 1fr)" gap={3}>
                    {/* N já foi pedido acima, então aqui focamos no resto */}
                    <InputField label="P₂O₅" value={form.p2o5} onChange={(v: string) => onChange("p2o5", v)} readOnly={readOnly} />
                    <InputField label="K₂O" value={form.k2o} onChange={(v: string) => onChange("k2o", v)} readOnly={readOnly} />
                    <InputField label="Ca" value={form.ca} onChange={(v: string) => onChange("ca", v)} readOnly={readOnly} />
                    
                    <InputField label="Mg" value={form.mg} onChange={(v: string) => onChange("mg", v)} readOnly={readOnly} />
                    <InputField label="S" value={form.s} onChange={(v: string) => onChange("s", v)} readOnly={readOnly} />
                    <Box /> {/* Spacer */}
                </Grid>
            </Box>

            {/* Micronutrientes */}
            <Box>
                <Text fontWeight="bold" mb={2} color="green.600" _dark={{ color: "green.300" }} borderBottomWidth="1px" pb={1}>Micronutrientes (%)</Text>
                <Grid templateColumns="repeat(3, 1fr)" gap={3}>
                    <InputField label="B" value={form.b} onChange={(v: string) => onChange("b", v)} readOnly={readOnly} />
                    <InputField label="Cu" value={form.cu} onChange={(v: string) => onChange("cu", v)} readOnly={readOnly} />
                    <InputField label="Fe" value={form.fe} onChange={(v: string) => onChange("fe", v)} readOnly={readOnly} />
                    <InputField label="Mn" value={form.mn} onChange={(v: string) => onChange("mn", v)} readOnly={readOnly} />
                    <InputField label="Mo" value={form.mo} onChange={(v: string) => onChange("mo", v)} readOnly={readOnly} />
                    <InputField label="Zn" value={form.zn} onChange={(v: string) => onChange("zn", v)} readOnly={readOnly} />
                </Grid>
            </Box>

            {/* Índices */}
            <Box>
                <Text fontWeight="bold" mb={2} color="green.600" _dark={{ color: "green.300" }} borderBottomWidth="1px" pb={1}>Índices Físico-Químicos</Text>
                <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                    <InputField label="Índice Salino" value={form.indiceSalino} onChange={(v: string) => onChange("indiceSalino", v)} readOnly={readOnly} />
                    <InputField label="Índice de Acidez" value={form.indiceAcidez} onChange={(v: string) => onChange("indiceAcidez", v)} readOnly={readOnly} />
                </Grid>
            </Box>
        </VStack>
    );
}