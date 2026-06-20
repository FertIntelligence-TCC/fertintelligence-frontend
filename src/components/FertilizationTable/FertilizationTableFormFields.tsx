import { VStack, Box, Text, HStack, Button, Textarea } from "@chakra-ui/react";
import { FertilizationTableFormState } from "./types";
import type { PropertyResponse } from "@/interfaces/Property";
import type { PlotResponse } from "@/interfaces/Plot";
import { commonFieldStyles } from "./styles";

// Importando as novas seções
import IdentificationSection from "./Sections/IdentificationSection";
import ParametersSection, { type AnalysisExtractOption } from "./Sections/ParametersSection";
import RecommendationsSection from "./Sections/RecommendationsSection";
import NutrientTableSection from "./Sections/NutrientTableSection";

type Props = {
    form: FertilizationTableFormState;
    onFormChange: (field: keyof FertilizationTableFormState, value: any) => void;
    readOnly?: boolean;
    properties?: PropertyResponse[];
    plots?: PlotResponse[];
    physicalAnalyses?: AnalysisExtractOption[];
    fertilityAnalyses?: AnalysisExtractOption[];
    loadingProperties?: boolean;
    loadingPlots?: boolean;
    loadingPhysicalAnalyses?: boolean;
    loadingFertilityAnalyses?: boolean;
};

export default function FertilizationTableFormFields({ form, onFormChange, readOnly = false, properties = [], plots = [], physicalAnalyses = [], fertilityAnalyses = [], loadingProperties = false, loadingPlots = false, loadingPhysicalAnalyses = false, loadingFertilityAnalyses = false }: Props) {
    return (
        <VStack gap={5} align="stretch" h="70vh" overflowY="auto" px={2} pb={8}>
            
            {/* 1. Identificação */}
            <IdentificationSection form={form} onFormChange={onFormChange} readOnly={readOnly} />

            {/* 2. Parâmetros Técnicos */}
            <ParametersSection
                form={form}
                onFormChange={onFormChange}
                readOnly={readOnly}
                properties={properties}
                plots={plots}
                physicalAnalyses={physicalAnalyses}
                fertilityAnalyses={fertilityAnalyses}
                loadingProperties={loadingProperties}
                loadingPlots={loadingPlots}
                loadingPhysicalAnalyses={loadingPhysicalAnalyses}
                loadingFertilityAnalyses={loadingFertilityAnalyses}
            />

            {/* 3. Recomendações Gerais */}
            <RecommendationsSection form={form} onFormChange={onFormChange} readOnly={readOnly} />

            {/* 4. Tabela de doses de N, P₂O₅ e K₂O (com lógica encapsulada) */}
            <NutrientTableSection form={form} onFormChange={onFormChange} readOnly={readOnly} />

            {/* 5. Compartilhamento */}
            <Box>
                <Text fontWeight="semibold" fontSize="sm" _dark={{ color: "gray.300" }} mb={2}>
                    Tornar essa tabela pública?
                </Text>
                <HStack>
                    <Button
                        size="sm"
                        colorPalette={form.tabelaPublica ? "green" : "gray"}
                        variant={form.tabelaPublica ? "solid" : "outline"}
                        onClick={() => onFormChange("tabelaPublica", true)}
                        disabled={readOnly}
                    >
                        Sim
                    </Button>
                    <Button
                        size="sm"
                        colorPalette={!form.tabelaPublica ? "red" : "gray"}
                        variant={!form.tabelaPublica ? "solid" : "outline"}
                        onClick={() => onFormChange("tabelaPublica", false)}
                        disabled={readOnly}
                    >
                        Não
                    </Button>
                </HStack>
            </Box>

            {/* 6. Observações e Fontes */}
            <Box>
                <Text fontWeight="semibold" fontSize="sm" _dark={{ color: "gray.300" }} mb={1}>Observações:</Text>
                <Textarea
                    {...commonFieldStyles}
                    value={form.observacoes}
                    onChange={(e) => onFormChange("observacoes", e.target.value)}
                    readOnly={readOnly}
                    rows={3}
                    placeholder="Informe observações sobre a tabela"
                />
            </Box>

            <Box>
                <Text fontWeight="semibold" fontSize="sm" _dark={{ color: "gray.300" }} mb={1}>Fontes:</Text>
                <Textarea
                    {...commonFieldStyles}
                    value={form.fontes}
                    onChange={(e) => onFormChange("fontes", e.target.value)}
                    readOnly={readOnly}
                    rows={3}
                    placeholder="Informe as fontes utilizadas"
                />
            </Box>
        </VStack>
    );
}