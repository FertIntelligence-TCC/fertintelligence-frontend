import { Box, Grid, Text, Input, Heading, VStack, HStack } from "@chakra-ui/react";
import { FertilizationTableFormState, SpacingType, SpacingLabels, LimingCriteria, LimingLabels } from "../types";
import { SelectElement, selectFieldStyles, commonFieldStyles } from "../styles";

type Props = {
    form: FertilizationTableFormState;
    onFormChange: (field: keyof FertilizationTableFormState, value: any) => void;
    readOnly?: boolean;
};

export default function ParametersSection({ form, onFormChange, readOnly }: Props) {
    return (
        <>
            <Heading size="sm" color="gray.600" _dark={{ color: "gray.300" }} borderBottomWidth="1px" pb={1} mt={2}>Parâmetros Técnicos</Heading>
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                <Box borderWidth="1px" p={3} borderRadius="md" bg="gray.50" _dark={{ bg: "gray.700", borderColor: "gray.600" }}>
                    <Text fontWeight="bold" mb={2} fontSize="xs" textTransform="uppercase" color="gray.500" _dark={{ color: "gray.400" }}>Espaçamento Sugerido</Text>
                    <VStack gap={2}>
                        <SelectElement {...selectFieldStyles} value={form.espacamentoSugeridoTipo} onChange={(e: any) => onFormChange("espacamentoSugeridoTipo", e.target.value)} disabled={readOnly}>
                            {Object.values(SpacingType).map(key => <option key={key} value={key}>{SpacingLabels[key]}</option>)}
                        </SelectElement>
                        <HStack width="full">
                            <Input placeholder="Mín (m)" type="number" {...commonFieldStyles} value={form.espacamentoSugeridoMin} onChange={(e) => onFormChange("espacamentoSugeridoMin", e.target.value)} readOnly={readOnly} />
                            <Input placeholder="Máx (m)" type="number" {...commonFieldStyles} value={form.espacamentoSugeridoMax} onChange={(e) => onFormChange("espacamentoSugeridoMax", e.target.value)} readOnly={readOnly} />
                        </HStack>
                    </VStack>
                </Box>
                <Box borderWidth="1px" p={3} borderRadius="md" bg="gray.50" _dark={{ bg: "gray.700", borderColor: "gray.600" }}>
                    <Text fontWeight="bold" mb={2} fontSize="xs" textTransform="uppercase" color="gray.500" _dark={{ color: "gray.400" }}>Espaçamento Usado na Região</Text>
                    <VStack gap={2}>
                        <SelectElement {...selectFieldStyles} value={form.espacamentoUsadoTipo} onChange={(e: any) => onFormChange("espacamentoUsadoTipo", e.target.value)} disabled={readOnly}>
                            {Object.values(SpacingType).map(key => <option key={key} value={key}>{SpacingLabels[key]}</option>)}
                        </SelectElement>
                        <Input placeholder="Valor (m)" type="number" {...commonFieldStyles} value={form.espacamentoUsadoValor} onChange={(e) => onFormChange("espacamentoUsadoValor", e.target.value)} readOnly={readOnly} />
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