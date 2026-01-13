import { VStack, Box, Input, Text } from "@chakra-ui/react";
import { FertilizationTableFormState } from "./types";
import { commonFieldStyles } from "./styles";

// Importando as novas seções
import IdentificationSection from "./sections/IdentificationSection";
import ParametersSection from "./sections/ParametersSection";
import RecommendationsSection from "./sections/RecommendationsSection";
import NutrientTableSection from "./sections/NutrientTableSection";

type Props = {
    form: FertilizationTableFormState;
    onFormChange: (field: keyof FertilizationTableFormState, value: any) => void;
    readOnly?: boolean;
};

export default function FertilizationTableFormFields({ form, onFormChange, readOnly = false }: Props) {
    return (
        <VStack gap={5} align="stretch" h="70vh" overflowY="auto" px={2} pb={8}>
            
            {/* 1. Identificação */}
            <IdentificationSection form={form} onFormChange={onFormChange} readOnly={readOnly} />

            {/* 2. Parâmetros Técnicos */}
            <ParametersSection form={form} onFormChange={onFormChange} readOnly={readOnly} />

            {/* 3. Recomendações Gerais */}
            <RecommendationsSection form={form} onFormChange={onFormChange} readOnly={readOnly} />

            {/* 4. Tabela de Faixas de Teores (com lógica encapsulada) */}
            <NutrientTableSection form={form} onFormChange={onFormChange} readOnly={readOnly} />

            {/* 5. Observações Finais */}
            <Box>
                <Text fontWeight="semibold" fontSize="sm" _dark={{ color: "gray.300" }}>Observações:</Text>
                <Input 
                    maxLength={100} 
                    {...commonFieldStyles} 
                    value={form.observacoes} 
                    onChange={(e) => onFormChange("observacoes", e.target.value)} 
                    readOnly={readOnly} 
                />
            </Box>
        </VStack>
    );
}