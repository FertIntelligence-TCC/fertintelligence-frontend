import { Box, Grid, Input, Text, VStack } from "@chakra-ui/react";
import { ChelatedFertilizerFormState } from "@/interfaces/Fertilizer";

type Props = {
    form: ChelatedFertilizerFormState;
    onChange: (field: keyof ChelatedFertilizerFormState, value: string) => void;
    readOnly?: boolean;
};

const styles = {
    field: {
        bg: "white",
        borderColor: "gray.300",
        borderWidth: "1px",
        borderRadius: "md",
        _focus: { borderColor: "purple.500", boxShadow: "0 0 0 1px var(--chakra-colors-purple-500)" },
        _dark: { bg: "gray.800", borderColor: "gray.600", color: "white" },
        _disabled: { opacity: 1, bg: "gray.100", cursor: "not-allowed", _dark: { bg: "gray.700" } }
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

export default function ChelatedFertilizerFormFields({ form, onChange, readOnly }: Props) {
    return (
        <VStack gap={5} align="stretch" py={2}>
            
            {/* Identificação */}
            <Box>
                <Text fontWeight="bold" mb={2} color="purple.600" _dark={{ color: "purple.300" }} borderBottomWidth="1px" pb={1}>Identificação</Text>
                <InputField 
                    label="Nome do Adubo Quelatado *" 
                    type="text" 
                    value={form.nome} 
                    onChange={(v: string) => onChange("nome", v)} 
                    readOnly={readOnly} 
                />
            </Box>

            {/* Micronutrientes (Destaque para Quelatados) */}
            <Box>
                <Text fontWeight="bold" mb={2} color="purple.600" _dark={{ color: "purple.300" }} borderBottomWidth="1px" pb={1}>Micronutrientes (%)</Text>
                <Grid templateColumns="repeat(3, 1fr)" gap={3}>
                    <InputField label="Ferro (Fe)" value={form.fe} onChange={(v: string) => onChange("fe", v)} readOnly={readOnly} />
                    <InputField label="Manganês (Mn)" value={form.mn} onChange={(v: string) => onChange("mn", v)} readOnly={readOnly} />
                    <InputField label="Zinco (Zn)" value={form.zn} onChange={(v: string) => onChange("zn", v)} readOnly={readOnly} />
                    
                    <InputField label="Cobre (Cu)" value={form.cu} onChange={(v: string) => onChange("cu", v)} readOnly={readOnly} />
                    <InputField label="Boro (B)" value={form.b} onChange={(v: string) => onChange("b", v)} readOnly={readOnly} />
                    <InputField label="Molibdênio (Mo)" value={form.mo} onChange={(v: string) => onChange("mo", v)} readOnly={readOnly} />
                </Grid>
            </Box>

            {/* Macronutrientes */}
            <Box>
                <Text fontWeight="bold" mb={2} color="purple.600" _dark={{ color: "purple.300" }} borderBottomWidth="1px" pb={1}>Macronutrientes (%)</Text>
                <Grid templateColumns="repeat(3, 1fr)" gap={3}>
                    <InputField label="N" value={form.n} onChange={(v: string) => onChange("n", v)} readOnly={readOnly} />
                    <InputField label="P₂O₅" value={form.p2o5} onChange={(v: string) => onChange("p2o5", v)} readOnly={readOnly} />
                    <InputField label="K₂O" value={form.k2o} onChange={(v: string) => onChange("k2o", v)} readOnly={readOnly} />
                    
                    <InputField label="Ca" value={form.ca} onChange={(v: string) => onChange("ca", v)} readOnly={readOnly} />
                    <InputField label="Mg" value={form.mg} onChange={(v: string) => onChange("mg", v)} readOnly={readOnly} />
                    <InputField label="S" value={form.s} onChange={(v: string) => onChange("s", v)} readOnly={readOnly} />
                </Grid>
            </Box>

            {/* Índices */}
            <Box>
                <Text fontWeight="bold" mb={2} color="purple.600" _dark={{ color: "purple.300" }} borderBottomWidth="1px" pb={1}>Índices Físico-Químicos</Text>
                <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                    <InputField label="Índice Salino" value={form.indiceSalino} onChange={(v: string) => onChange("indiceSalino", v)} readOnly={readOnly} />
                    <InputField label="Índice de Acidez" value={form.indiceAcidez} onChange={(v: string) => onChange("indiceAcidez", v)} readOnly={readOnly} />
                </Grid>
            </Box>
        </VStack>
    );
}