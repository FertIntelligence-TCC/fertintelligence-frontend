import { Box, Grid, Text, Input, Heading, VStack, HStack } from "@chakra-ui/react";
import { FertilizationTableFormState, SpacingType, SpacingLabels } from "../types";
import type { PropertyResponse } from "@/interfaces/Property";
import type { PlotResponse } from "@/interfaces/Plot";
import type { SoilAnalysisResponse } from "@/interfaces/SoilAnalysis";
import { SelectElement, selectFieldStyles, commonFieldStyles } from "../styles";

type Props = {
    form: FertilizationTableFormState;
    onFormChange: (field: keyof FertilizationTableFormState, value: any) => void;
    readOnly?: boolean;
    properties?: PropertyResponse[];
    plots?: PlotResponse[];
    physicalAnalyses?: SoilAnalysisResponse[];
    fertilityAnalyses?: SoilAnalysisResponse[];
    loadingProperties?: boolean;
    loadingPlots?: boolean;
    loadingPhysicalAnalyses?: boolean;
    loadingFertilityAnalyses?: boolean;
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

export default function ParametersSection({ form, onFormChange, readOnly, properties = [], plots = [], physicalAnalyses = [], fertilityAnalyses = [], loadingProperties = false, loadingPlots = false, loadingPhysicalAnalyses = false, loadingFertilityAnalyses = false }: Props) {
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

            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                <Box>
                    <Text fontWeight="semibold" fontSize="sm" _dark={{ color: "gray.300" }}>Propriedade</Text>
                    <SelectElement {...selectFieldStyles} value={form.propertyId} onChange={(e: any) => onFormChange("propertyId", e.target.value)} disabled={readOnly || loadingProperties}>
                        <option value="">{loadingProperties ? "Carregando propriedades..." : "Selecione uma propriedade"}</option>
                        {properties.map((property) => <option key={property.id} value={property.id}>{property.nome}</option>)}
                    </SelectElement>
                </Box>
                <Box>
                    <Text fontWeight="semibold" fontSize="sm" _dark={{ color: "gray.300" }}>Talhão</Text>
                    <SelectElement {...selectFieldStyles} value={form.plotId} onChange={(e: any) => onFormChange("plotId", e.target.value)} disabled={readOnly || !form.propertyId || loadingPlots}>
                        <option value="">{loadingPlots ? "Carregando talhões..." : "Selecione um talhão"}</option>
                        {plots.map((plot) => <option key={plot.id} value={plot.id}>{plot.identificacao}</option>)}
                    </SelectElement>
                </Box>
                <Box>
                    <Text fontWeight="semibold" fontSize="sm" _dark={{ color: "gray.300" }}>Análise física</Text>
                    <SelectElement {...selectFieldStyles} value={form.physicalAnalysisId} onChange={(e: any) => onFormChange("physicalAnalysisId", e.target.value)} disabled={readOnly || !form.plotId || loadingPhysicalAnalyses}>
                        <option value="">{loadingPhysicalAnalyses ? "Carregando análises físicas..." : "Selecione uma análise física"}</option>
                        {physicalAnalyses.map((analysis) => <option key={analysis.id} value={analysis.id}>{`${analysis.ano_analise} - ${analysis.laboratorio_responsavel}`}</option>)}
                    </SelectElement>
                </Box>
                <Box>
                    <Text fontWeight="semibold" fontSize="sm" _dark={{ color: "gray.300" }}>Análise de fertilidade</Text>
                    <SelectElement {...selectFieldStyles} value={form.fertilityAnalysisId} onChange={(e: any) => onFormChange("fertilityAnalysisId", e.target.value)} disabled={readOnly || !form.plotId || loadingFertilityAnalyses}>
                        <option value="">{loadingFertilityAnalyses ? "Carregando análises de fertilidade..." : "Selecione uma análise de fertilidade"}</option>
                        {fertilityAnalyses.map((analysis) => <option key={analysis.id} value={analysis.id}>{`${analysis.ano_analise} - ${analysis.laboratorio_responsavel}`}</option>)}
                    </SelectElement>
                </Box>
            </Grid>

            <Box>
                <Text fontWeight="semibold" fontSize="sm" _dark={{ color: "gray.300" }}>Critério de calagem indicado</Text>
                <Input {...commonFieldStyles} value={form.criterioCalagemIndicado || "Não é possível definir um critério de calagem"} readOnly />
            </Box>
        </>
    );
}