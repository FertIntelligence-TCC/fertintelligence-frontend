import { Box, Grid, Text, Input, Heading, VStack, HStack } from "@chakra-ui/react";
import { FertilizationTableFormState, SpacingType, SpacingLabels, LimingCriteria, LimingLabels } from "../types";
import { SelectElement, selectFieldStyles, commonFieldStyles } from "../styles";

type Props = {
    form: FertilizationTableFormState;
    onFormChange: (field: keyof FertilizationTableFormState, value: any) => void;
    readOnly?: boolean;
};

const alternativeSpacingOptions = [
    SpacingType.ENTRE_PLANTAS_COVAS,
    SpacingType.PLANTAS_POR_METRO_LINEAR,
];

const parsePositiveNumber = (value: string) => {
    if (value === "") return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const formatConversionValue = (value: number) =>
    value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function ParametersSection({ form, onFormChange, readOnly }: Props) {
    const spacingMin = parsePositiveNumber(form.espacamentoUsadoMin);
    const spacingMax = parsePositiveNumber(form.espacamentoUsadoMax);
    const canShowConversion = Boolean(form.espacamentoUsadoTipo && spacingMin && spacingMax);
    const conversionLabel =
        form.espacamentoUsadoTipo === SpacingType.ENTRE_PLANTAS_COVAS
            ? "Plantas por metro linear"
            : "Entre Plantas/Covas (m)";
    const conversionMin = spacingMin ? 1 / spacingMin : null;
    const conversionMax = spacingMax ? 1 / spacingMax : null;

    return (
        <>
            <Heading size="sm" color="gray.600" _dark={{ color: "gray.300" }} borderBottomWidth="1px" pb={1} mt={2}>Parâmetros Técnicos</Heading>
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                <Box borderWidth="1px" p={3} borderRadius="md" bg="gray.50" _dark={{ bg: "gray.700", borderColor: "gray.600" }}>
                    <Text fontWeight="bold" mb={2} fontSize="xs" textTransform="uppercase" color="gray.500" _dark={{ color: "gray.400" }}>Espaçamento Sugerido</Text>
                    <VStack gap={2} align="stretch">
                        <Text fontSize="sm" fontWeight="semibold" color="gray.700" _dark={{ color: "gray.200" }}>Entre linhas (m)</Text>
                        <HStack width="full">
                            <Input placeholder="Mín (m)" type="number" {...commonFieldStyles} value={form.espacamentoSugeridoMin} onChange={(e) => onFormChange("espacamentoSugeridoMin", e.target.value)} readOnly={readOnly} />
                            <Input placeholder="Máx (m)" type="number" {...commonFieldStyles} value={form.espacamentoSugeridoMax} onChange={(e) => onFormChange("espacamentoSugeridoMax", e.target.value)} readOnly={readOnly} />
                        </HStack>
                    </VStack>
                </Box>
                <Box borderWidth="1px" p={3} borderRadius="md" bg="gray.50" _dark={{ bg: "gray.700", borderColor: "gray.600" }}>
                    <Text fontWeight="bold" mb={2} fontSize="xs" textTransform="uppercase" color="gray.500" _dark={{ color: "gray.400" }}>Espaçamento Sugerido</Text>
                    <VStack gap={2} align="stretch">
                        <SelectElement {...selectFieldStyles} value={form.espacamentoUsadoTipo} onChange={(e: any) => onFormChange("espacamentoUsadoTipo", e.target.value)} disabled={readOnly}>
                            <option value="">Selecione o tipo</option>
                            {alternativeSpacingOptions.map(key => <option key={key} value={key}>{SpacingLabels[key]}</option>)}
                        </SelectElement>
                        <HStack width="full">
                            <Input placeholder="Mín" type="number" {...commonFieldStyles} value={form.espacamentoUsadoMin} onChange={(e) => onFormChange("espacamentoUsadoMin", e.target.value)} readOnly={readOnly} />
                            <Input placeholder="Máx" type="number" {...commonFieldStyles} value={form.espacamentoUsadoMax} onChange={(e) => onFormChange("espacamentoUsadoMax", e.target.value)} readOnly={readOnly} />
                        </HStack>
                        {canShowConversion && conversionMin && conversionMax && (
                            <Box width="full" bg="green.50" borderWidth="1px" borderColor="green.200" borderRadius="md" p={2} _dark={{ bg: "green.900", borderColor: "green.700" }}>
                                <Text fontSize="xs" fontWeight="bold" color="green.700" _dark={{ color: "green.200" }}>Conversão:</Text>
                                <Text fontSize="xs" color="green.700" _dark={{ color: "green.100" }}>
                                    {conversionLabel}: mínimo {formatConversionValue(conversionMin)}; máximo {formatConversionValue(conversionMax)}
                                </Text>
                            </Box>
                        )}
                    </VStack>
                </Box>
            </Grid>

            <HStack gap={4}>
                <Box flex={1}><Text fontWeight="semibold" fontSize="sm" _dark={{ color: "gray.300" }}>Prod. Regional (Kg/ha):</Text><Input type="number" {...commonFieldStyles} value={form.produtividadeRegional} onChange={(e) => onFormChange("produtividadeRegional", e.target.value)} readOnly={readOnly} /></Box>
                <Box flex={1}><Text fontWeight="semibold" fontSize="sm" _dark={{ color: "gray.300" }}>Prod. Esperada (Kg/ha):</Text><Input type="number" {...commonFieldStyles} value={form.produtividadeEsperada} onChange={(e) => onFormChange("produtividadeEsperada", e.target.value)} readOnly={readOnly} /></Box>
            </HStack>

            <Box>
                <Text fontWeight="semibold" fontSize="sm" _dark={{ color: "gray.300" }}>Critério de Calagem:</Text>
                <SelectElement {...selectFieldStyles} value={form.criterioCalagem} onChange={(e: any) => onFormChange("criterioCalagem", e.target.value)} disabled={readOnly}>
                    {Object.values(LimingCriteria).map(key => <option key={key} value={key}>{LimingLabels[key]}</option>)}
                </SelectElement>
            </Box>
        </>
    );
}