import { Box, Grid, Text, VStack, chakra } from "@chakra-ui/react";
import { MineralFertilizerFormState } from "@/interfaces/Fertilizer";
import { FertilizerCommercialPriceFields, FertilizerInputField, FertilizerPhotosSection, FormSectionHeader, PublicVisibilitySelector } from "@/components/Fertilizers/Shared/FertilizerFormComponents";

type Props = {
    form: MineralFertilizerFormState;
    onChange: (field: keyof MineralFertilizerFormState, value: MineralFertilizerFormState[keyof MineralFertilizerFormState]) => void;
    readOnly?: boolean;
};

const SelectElement = chakra("select");

export default function FoliarMineralFertilizerFormFields({ form, onChange, readOnly }: Props) {
    const color = "blue";
    const isLiquid = form.naturezaFisica === "LIQUIDO";

    return (
        <VStack gap={5} align="stretch" py={2}>
            <Box>
                <FormSectionHeader title="Identificação" colorScheme={color} />
                <FertilizerInputField label="Nome do Adubo *" type="text" value={form.nome} onChange={(v) => onChange("nome", v)} readOnly={readOnly} colorScheme={color} />
            </Box>

            <Box>
                <FormSectionHeader title="Especificações Técnicas" colorScheme={color} />
                <Grid templateColumns={{ base: "1fr", md: isLiquid ? "repeat(4, 1fr)" : "1fr" }} gap={3}>
                    <Box>
                        <Text fontSize="xs" fontWeight="semibold" mb={1} color="gray.600" _dark={{ color: "gray.400" }}>
                            Natureza Física
                        </Text>
                        <SelectElement
                            value={form.naturezaFisica}
                            onChange={(e) => onChange("naturezaFisica", e.target.value)}
                            disabled={readOnly}
                            bg="white"
                            borderColor="gray.300"
                            borderWidth="1px"
                            borderRadius="md"
                            h="40px"
                            px={3}
                            _focus={{ borderColor: `${color}.500`, boxShadow: `0 0 0 1px var(--chakra-colors-${color}-500)` }}
                            _dark={{ bg: "gray.800", borderColor: "gray.600", color: "white" }}
                            _disabled={{ opacity: 1, bg: "gray.100", cursor: "not-allowed", _dark: { bg: "gray.700" } }}
                        >
                            <option value="SOLIDO">SÓLIDO</option>
                            <option value="LIQUIDO">LÍQUIDO</option>
                        </SelectElement>
                    </Box>

                    {isLiquid && (
                        <>
                            <FertilizerInputField label="Densidade (g/ml)" value={form.densidade} onChange={(v) => onChange("densidade", v)} readOnly={readOnly} colorScheme={color} />
                            <FertilizerInputField label="Concentração em volume (g/L)" value={form.concentracaoVolume} onChange={(v) => onChange("concentracaoVolume", v)} readOnly={readOnly} colorScheme={color} />
                            <FertilizerInputField label="Concentração em massa (g/kg)" value={form.concentracaoMassa} onChange={(v) => onChange("concentracaoMassa", v)} readOnly={readOnly} colorScheme={color} />
                        </>
                    )}
                </Grid>
            </Box>

            <Box>
                <FormSectionHeader title="Macronutrientes Primários (%)" colorScheme={color} />
                <Grid templateColumns="repeat(3, 1fr)" gap={3}>
                    <FertilizerInputField label="N" value={form.n} onChange={(v) => onChange("n", v)} readOnly={readOnly} colorScheme={color} />
                    <FertilizerInputField label="P₂O₅" value={form.p2o5} onChange={(v) => onChange("p2o5", v)} readOnly={readOnly} colorScheme={color} />
                    <FertilizerInputField label="K₂O" value={form.k2o} onChange={(v) => onChange("k2o", v)} readOnly={readOnly} colorScheme={color} />
                </Grid>
            </Box>

            <Box>
                <FormSectionHeader title="Macronutrientes Secundários (%)" colorScheme={color} />
                <Grid templateColumns="repeat(3, 1fr)" gap={3}>
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
                <FormSectionHeader title="Índices Físico-Químicos" colorScheme={color} />
                <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                    <FertilizerInputField label="Índice Salino" value={form.indiceSalino} onChange={(v) => onChange("indiceSalino", v)} readOnly={readOnly} colorScheme={color} />
                    <FertilizerInputField label="Índice de Acidez" value={form.indiceAcidez} onChange={(v) => onChange("indiceAcidez", v)} readOnly={readOnly} colorScheme={color} />
                </Grid>
            </Box>

            <FertilizerPhotosSection
                photoIds={form.fotoIds}
                onChange={(fotoIds) => onChange("fotoIds", fotoIds)}
                readOnly={readOnly}
                colorScheme={color}
            />
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
