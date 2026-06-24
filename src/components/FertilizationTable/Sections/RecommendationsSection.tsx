import { Box, Input, Text, Heading, HStack } from "@chakra-ui/react";
import {
    FertilizationTableFormState,
    ManureType,
    ManureLabels,
} from "../types";
import { SelectElement, selectFieldStyles, commonFieldStyles } from "../styles";

type Props = {
    form: FertilizationTableFormState;
    onFormChange: (field: keyof FertilizationTableFormState, value: any) => void;
    readOnly?: boolean;
};

export default function RecommendationsSection({ form, onFormChange, readOnly }: Props) {
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
        </>
    );
}
