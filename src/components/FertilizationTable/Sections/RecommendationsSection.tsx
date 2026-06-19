import { Box, Input, Text, Heading, HStack, SimpleGrid } from "@chakra-ui/react";
import {
    FertilizationTableFormState,
    ManureType,
    ManureLabels,
    MICRONUTRIENT_DOSE_KEYS,
    MICRONUTRIENT_DOSE_LABELS,
    MicronutrientDoseKey,
} from "../types";
import { SelectElement, selectFieldStyles, commonFieldStyles } from "../styles";

type Props = {
    form: FertilizationTableFormState;
    onFormChange: (field: keyof FertilizationTableFormState, value: any) => void;
    readOnly?: boolean;
};

export default function RecommendationsSection({ form, onFormChange, readOnly }: Props) {
    const updateMicronutrientDose = (nutrient: MicronutrientDoseKey, field: "min" | "max", value: string) => {
        onFormChange("dosesMicronutrientes", {
            ...form.dosesMicronutrientes,
            [nutrient]: {
                ...form.dosesMicronutrientes[nutrient],
                [field]: value,
            },
        });
    };

    return (
        <>
            <Heading size="sm" color="gray.600" _dark={{ color: "gray.300" }} borderBottomWidth="1px" pb={1} mt={2}>Recomendações Gerais</Heading>
            <HStack align="end" gap={4}>
                <Box flex={1}>
                    <Text fontWeight="semibold" fontSize="sm" _dark={{ color: "gray.300" }}>Sugestão de Esterco:</Text>
                    <SelectElement {...selectFieldStyles} value={form.sugestaoEstercoTipo} onChange={(e: any) => onFormChange("sugestaoEstercoTipo", e.target.value)} disabled={readOnly}>
                        {Object.values(ManureType).map(key => <option key={key} value={key}>{ManureLabels[key]}</option>)}
                    </SelectElement>
                </Box>
                <Box w="140px"><Text fontWeight="semibold" fontSize="xs" mb={1} color="gray.500" _dark={{ color: "gray.400" }}>Qtd (t/ha)</Text><Input placeholder="0.0" type="number" {...commonFieldStyles} value={form.sugestaoEstercoQtd} onChange={(e) => onFormChange("sugestaoEstercoQtd", e.target.value)} readOnly={readOnly} /></Box>
            </HStack>

            <Box>
                <Text fontWeight="semibold" fontSize="sm" _dark={{ color: "gray.300" }}>Gessagem (t/ha):</Text>
                <Input type="number" {...commonFieldStyles} value={form.sugestaoGessagem} onChange={(e) => onFormChange("sugestaoGessagem", e.target.value)} readOnly={readOnly} />
            </Box>

            <Box>
                <Text fontWeight="semibold" fontSize="sm" mb={2} _dark={{ color: "gray.300" }}>Doses de micronutrientes (g/ha)</Text>
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
                    {MICRONUTRIENT_DOSE_KEYS.map((nutrient) => (
                        <Box key={nutrient} borderWidth="1px" borderRadius="md" p={3} bg={{ base: "gray.50", _dark: "gray.700" }}>
                            <Text fontWeight="bold" fontSize="sm" mb={2} color="green.700" _dark={{ color: "green.300" }}>{MICRONUTRIENT_DOSE_LABELS[nutrient]}</Text>
                            <HStack gap={3}>
                                <Box flex={1}>
                                    <Text fontWeight="semibold" fontSize="xs" mb={1} color="gray.500" _dark={{ color: "gray.400" }}>Dose mínima (g/ha)</Text>
                                    <Input type="number" {...commonFieldStyles} value={form.dosesMicronutrientes[nutrient].min} onChange={(e) => updateMicronutrientDose(nutrient, "min", e.target.value)} readOnly={readOnly} />
                                </Box>
                                <Box flex={1}>
                                    <Text fontWeight="semibold" fontSize="xs" mb={1} color="gray.500" _dark={{ color: "gray.400" }}>Dose máxima (g/ha)</Text>
                                    <Input type="number" {...commonFieldStyles} value={form.dosesMicronutrientes[nutrient].max} onChange={(e) => updateMicronutrientDose(nutrient, "max", e.target.value)} readOnly={readOnly} />
                                </Box>
                            </HStack>
                        </Box>
                    ))}
                </SimpleGrid>
            </Box>
        </>
    );
}
