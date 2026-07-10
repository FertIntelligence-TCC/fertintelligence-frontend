import { useState } from "react";
import { 
    Box, 
    Input, 
    Text, 
    VStack, 
    createListCollection,
    Grid,
    Textarea,
    SimpleGrid,
    Center,
    HStack,
    Button,
} from "@chakra-ui/react";
import { 
    SelectContent, 
    SelectItem, 
    SelectRoot, 
    SelectTrigger, 
    SelectValueText 
} from "@/components/ui/select";
import { SoilFertilityFormState, RegionEnum } from "@/interfaces/SoilFertilityInterpretationCriteriaTable";

// Imports dos Modais
import SalinityTableModal from "./SalinityTableModal";
import AvailablePMehlich1Modal from "./AvailablePMehlich1Modal";
import AvailablePResinModal from "./AvailablePResinModal";
import AvailableSModal from "./AvailableSModal";
import DiverseContentRangeModal from "./DiverseContentRangeModal";
import ExchangeableSodiumModal from "./ExchangeableSodiumModal";
import SulfurDoseModal from "./SulfurDoseModal";
import PotassiumContentAndDoseModal from "./PotassiumContentAndDoseModal";
import PhosphorusClayContentAndPhosphateDoseModal from "./PhosphorusClayContentAndPhosphateDoseModal";
import CorrectiveP2O5FertilizationModal from "./CorrectiveP2O5FertilizationModal";
import CorrectiveK2OFertilizationModal from "./CorrectiveK2OFertilizationModal";
import MicronutrientDoseModal from "./MicronutrientDoseModal";
import CtcSaturationModal from "./CtcSaturationModal";
import ExchangeableBaseRatioModal from "./ExchangeableBaseRatioModal";
import RecommendedLimestoneTypeModal from "./RecommendedLimestoneTypeModal";

type Props = {
    form: SoilFertilityFormState;
    setForm: React.Dispatch<React.SetStateAction<SoilFertilityFormState>>;
    readOnly?: boolean;
    mode: "create" | "edit" | "view";
    tableId?: number | null;
};

const auxiliaryTableLabels = {
    salinity: "Salinidade",
    availablePMehlich1: "Fósforo (P) Disponível com Extrator Mehlich-1 - mg/dm³",
    availablePResin: "Fósforo (P) Disponível com Extrator Resina de Troca Aniônica - mg/dm³",
    availableS: "Enxofre (S) Disponível - mg/dm³",
    sulfurDose: "Doses de Enxofre (S) - kg/ha",
    potassiumContentAndDose: "Teores e Doses de Potássio (K) - mg/dm³ e kg/ha",
    phosphorusClayContentAndPhosphateDose: "Teores de Fósforo (P) e Argila (g/kg), e Doses de Fosfato (PO₄³⁻)",
    correctiveP2O5Fertilization: "Adubação Corretiva de Fósforo (P₂O₅)",
    correctiveK2OFertilization: "Adubação Corretiva de Potássio (K₂O)",
    micronutrientDose: "Doses de Micronutrientes - kg/ha",
    diverseContent: "Teores de Nutrientes Diversos - mg/dm³, % ou mmolc/dm³",
    exchangeableSodium: "Sódio (Na) Trocável - mmolc/dm³",
    ctcSaturation: "Saturação na CTC(T), em %",
    exchangeableBaseRatio: "Relações entre Bases Trocáveis, adimensional",
    recommendedLimestoneType: "Tipos de calcário recomendados"
} as const;

type AuxiliaryTableKey = keyof typeof auxiliaryTableLabels;

const auxiliaryTableOrder: AuxiliaryTableKey[] = [
    "salinity",
    "availablePMehlich1",
    "availablePResin",
    "availableS",
    "sulfurDose",
    "potassiumContentAndDose",
    "phosphorusClayContentAndPhosphateDose",
    "correctiveP2O5Fertilization",
    "correctiveK2OFertilization",
    "micronutrientDose",
    "diverseContent",
    "exchangeableSodium",
    "ctcSaturation",
    "exchangeableBaseRatio",
    "recommendedLimestoneType"
];

export default function SoilFertilityTableForm({ form, setForm, readOnly, mode, tableId }: Props) {

    // Estados para controle dos Modais
    const [isSalinityOpen, setIsSalinityOpen] = useState(false);
    const [isPMehlich1Open, setIsPMehlich1Open] = useState(false);
    const [isPResinOpen, setIsPResinOpen] = useState(false);
    const [isAvailableSOpen, setIsAvailableSOpen] = useState(false);
    const [isDiverseContentOpen, setIsDiverseContentOpen] = useState(false);
    const [isExchangeableSodiumOpen, setIsExchangeableSodiumOpen] = useState(false);
    const [isSulfurDoseOpen, setIsSulfurDoseOpen] = useState(false);
    const [isPotassiumContentAndDoseOpen, setIsPotassiumContentAndDoseOpen] = useState(false);
    const [isPhosphorusClayContentAndPhosphateDoseOpen, setIsPhosphorusClayContentAndPhosphateDoseOpen] = useState(false);
    const [isCorrectiveP2O5FertilizationOpen, setIsCorrectiveP2O5FertilizationOpen] = useState(false);
    const [isCorrectiveK2OFertilizationOpen, setIsCorrectiveK2OFertilizationOpen] = useState(false);
    const [isMicronutrientDoseOpen, setIsMicronutrientDoseOpen] = useState(false);
    const [isCtcSaturationOpen, setIsCtcSaturationOpen] = useState(false);
    const [isExchangeableBaseRatioOpen, setIsExchangeableBaseRatioOpen] = useState(false);
    const [isRecommendedLimestoneTypeOpen, setIsRecommendedLimestoneTypeOpen] = useState(false);

    const regioesCollection = createListCollection({
        items: Object.keys(RegionEnum).map((k) => ({ label: k.replace(/_/g, ' '), value: k })),
    });

    const openAuxiliaryTable = (tableKey: AuxiliaryTableKey) => {
        switch (tableKey) {
            case "salinity":
                setIsSalinityOpen(true);
                break;
            case "availablePMehlich1":
                setIsPMehlich1Open(true);
                break;
            case "availablePResin":
                setIsPResinOpen(true);
                break;
            case "availableS":
                setIsAvailableSOpen(true);
                break;
            case "sulfurDose":
                setIsSulfurDoseOpen(true);
                break;
            case "potassiumContentAndDose":
                setIsPotassiumContentAndDoseOpen(true);
                break;
            case "phosphorusClayContentAndPhosphateDose":
                setIsPhosphorusClayContentAndPhosphateDoseOpen(true);
                break;
            case "correctiveP2O5Fertilization":
                setIsCorrectiveP2O5FertilizationOpen(true);
                break;
            case "correctiveK2OFertilization":
                setIsCorrectiveK2OFertilizationOpen(true);
                break;
            case "micronutrientDose":
                setIsMicronutrientDoseOpen(true);
                break;
            case "diverseContent":
                setIsDiverseContentOpen(true);
                break;
            case "exchangeableSodium":
                setIsExchangeableSodiumOpen(true);
                break;
            case "ctcSaturation":
                setIsCtcSaturationOpen(true);
                break;
            case "exchangeableBaseRatio":
                setIsExchangeableBaseRatioOpen(true);
                break;
            case "recommendedLimestoneType":
                setIsRecommendedLimestoneTypeOpen(true);
                break;
        }
    };

    return (
        <VStack gap={6} align="stretch" py={2}>
            
            {/* Seção de Identificação */}
            <Box borderWidth="1px" borderRadius="md" p={4} bg="gray.50" _dark={{ bg: "gray.800" }} borderColor="gray.200">
                <Grid templateColumns={{ base: "1fr", md: "2fr 1fr" }} gap={4} mb={4}>
                    <Box>
                        <Text fontSize="xs" fontWeight="bold" mb={1} color="gray.600">Nome dos Critérios *</Text>
                        <Input 
                            value={form.nome} 
                            onChange={(e) => setForm(p => ({ ...p, nome: e.target.value }))}
                            readOnly={readOnly}
                            placeholder="Ex: Critérios Sul 2025"
                            bg="white" _dark={{ bg: "gray.700" }}
                        />
                    </Box>
                    <Box>
                        <Text fontSize="xs" fontWeight="bold" mb={1} color="gray.600">Região *</Text>
                        <SelectRoot 
                            collection={regioesCollection}
                            value={form.regiao ? [form.regiao] : []}
                            onValueChange={(e) => setForm(p => ({ ...p, regiao: e.value[0] }))}
                            disabled={readOnly}
                            size="md"
                        >
                            <SelectTrigger bg="white" _dark={{ bg: "gray.700" }}>
                                <SelectValueText placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                                {regioesCollection.items.map((item) => (
                                    <SelectItem item={item} key={item.value}>
                                        {item.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </SelectRoot>
                    </Box>
                </Grid>

                <Box mt={4}>
                    <Text fontSize="xs" fontWeight="bold" mb={2} color="gray.600">Tornar essa tabela pública?</Text>
                    <HStack>
                        <Button
                            size="sm"
                            colorPalette={form.tabelaPublica ? "green" : "gray"}
                            variant={form.tabelaPublica ? "solid" : "outline"}
                            onClick={() => setForm(p => ({ ...p, tabelaPublica: true }))}
                            disabled={readOnly}
                        >
                            Sim
                        </Button>
                        <Button
                            size="sm"
                            colorPalette={!form.tabelaPublica ? "red" : "gray"}
                            variant={!form.tabelaPublica ? "solid" : "outline"}
                            onClick={() => setForm(p => ({ ...p, tabelaPublica: false }))}
                            disabled={readOnly}
                        >
                            Não
                        </Button>
                    </HStack>
                </Box>

                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4} mt={4}>
                    <Box>
                        <Text fontSize="xs" fontWeight="bold" mb={1} color="gray.600">Observações</Text>
                        <Textarea
                            value={form.observacoes}
                            onChange={(e) => setForm(p => ({ ...p, observacoes: e.target.value }))}
                            readOnly={readOnly}
                            placeholder="Informe observações sobre a tabela"
                            bg="white" _dark={{ bg: "gray.700" }}
                            rows={3}
                        />
                    </Box>
                    <Box>
                        <Text fontSize="xs" fontWeight="bold" mb={1} color="gray.600">Fontes</Text>
                        <Textarea
                            value={form.fontes}
                            onChange={(e) => setForm(p => ({ ...p, fontes: e.target.value }))}
                            readOnly={readOnly}
                            placeholder="Informe as fontes utilizadas"
                            bg="white" _dark={{ bg: "gray.700" }}
                            rows={3}
                        />
                    </Box>
                </Grid>

                {mode !== 'create' && (
                    <Box>
                        <Text fontSize="xs" fontWeight="bold" mb={1} color="gray.600">Descrição (Opcional)</Text>
                        <Textarea 
                            value={form.descricao}
                            onChange={(e) => setForm(p => ({ ...p, descricao: e.target.value }))}
                            readOnly={readOnly}
                            placeholder="Descreva detalhes sobre a metodologia ou fonte destes critérios..."
                            bg="white" _dark={{ bg: "gray.700" }}
                            rows={3}
                        />
                    </Box>
                )}
            </Box>

            {/* Seção das Tabelas Auxiliares */}
            {mode !== 'create' && (
                <Box>
                    <Text fontSize="md" fontWeight="bold" mb={3} color="green.700" _dark={{ color: "green.300" }}>
                        Tabelas Auxiliares
                    </Text>
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
                        {auxiliaryTableOrder.map((tableKey) => (
                            <Box
                                key={tableKey}
                                borderWidth="1px"
                                borderRadius="md"
                                p={4}
                                bg="white"
                                _dark={{ bg: "gray.700" }}
                                borderColor="gray.200"
                                _hover={{ 
                                    borderColor: readOnly ? "blue.400" : "green.400", 
                                    bg: readOnly ? "blue.50" : "green.50", 
                                    _dark: { bg: "gray.600" }, 
                                    cursor: "pointer" 
                                }}
                                transition="all 0.2s"
                                minH="116px"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                minW={0}
                                onClick={() => openAuxiliaryTable(tableKey)}
                            >
                                <Center flexDirection="column" textAlign="center" w="full" minW={0}>
                                    <Text
                                        fontWeight="semibold"
                                        fontSize="sm"
                                        color="gray.700"
                                        _dark={{ color: "gray.200" }}
                                        whiteSpace="normal"
                                        overflowWrap="anywhere"
                                        wordBreak="normal"
                                    >
                                        {auxiliaryTableLabels[tableKey]}
                                    </Text>
                                    
                                    <Text fontSize="xs" color={readOnly ? "blue.500" : "green.500"} mt={1}>
                                        {readOnly ? "Visualizar" : "Configurar"}
                                    </Text>
                                </Center>
                            </Box>
                        ))}
                    </SimpleGrid>
                </Box>
            )}

            {/* Modais Ativos */}
            {tableId && (
                <>
                    <SalinityTableModal 
                        isOpen={isSalinityOpen}
                        onClose={() => setIsSalinityOpen(false)}
                        tableId={tableId}
                        isReadOnly={readOnly}
                    />

                    <AvailablePMehlich1Modal 
                        isOpen={isPMehlich1Open}
                        onClose={() => setIsPMehlich1Open(false)}
                        tableId={tableId}
                        isReadOnly={readOnly}
                    />

                    <AvailablePResinModal
                        isOpen={isPResinOpen}
                        onClose={() => setIsPResinOpen(false)}
                        tableId={tableId}
                        isReadOnly={readOnly}
                    />

                    <AvailableSModal
                        isOpen={isAvailableSOpen}
                        onClose={() => setIsAvailableSOpen(false)}
                        tableId={tableId}
                        isReadOnly={readOnly}
                    />

                    <SulfurDoseModal
                        isOpen={isSulfurDoseOpen}
                        onClose={() => setIsSulfurDoseOpen(false)}
                        tableId={tableId}
                        isReadOnly={readOnly}
                    />

                    <PotassiumContentAndDoseModal
                        isOpen={isPotassiumContentAndDoseOpen}
                        onClose={() => setIsPotassiumContentAndDoseOpen(false)}
                        tableId={tableId}
                        isReadOnly={readOnly}
                    />

                    <PhosphorusClayContentAndPhosphateDoseModal
                        isOpen={isPhosphorusClayContentAndPhosphateDoseOpen}
                        onClose={() => setIsPhosphorusClayContentAndPhosphateDoseOpen(false)}
                        tableId={tableId}
                        isReadOnly={readOnly}
                    />

                    <CorrectiveP2O5FertilizationModal
                        isOpen={isCorrectiveP2O5FertilizationOpen}
                        onClose={() => setIsCorrectiveP2O5FertilizationOpen(false)}
                        tableId={tableId}
                        isReadOnly={readOnly}
                    />

                    <CorrectiveK2OFertilizationModal
                        isOpen={isCorrectiveK2OFertilizationOpen}
                        onClose={() => setIsCorrectiveK2OFertilizationOpen(false)}
                        tableId={tableId}
                        isReadOnly={readOnly}
                    />

                    <MicronutrientDoseModal
                        isOpen={isMicronutrientDoseOpen}
                        onClose={() => setIsMicronutrientDoseOpen(false)}
                        tableId={tableId}
                        isReadOnly={readOnly}
                    />

                    {/* Novo Modal de Nutrientes Diversos */}
                    <DiverseContentRangeModal
                        isOpen={isDiverseContentOpen}
                        onClose={() => setIsDiverseContentOpen(false)}
                        tableId={tableId}
                        isReadOnly={readOnly}
                    />

                    <ExchangeableSodiumModal
                        isOpen={isExchangeableSodiumOpen}
                        onClose={() => setIsExchangeableSodiumOpen(false)}
                        tableId={tableId}
                        isReadOnly={readOnly}
                    />

                    <CtcSaturationModal
                        isOpen={isCtcSaturationOpen}
                        onClose={() => setIsCtcSaturationOpen(false)}
                        tableId={tableId}
                        isReadOnly={readOnly}
                    />

                    <ExchangeableBaseRatioModal
                        isOpen={isExchangeableBaseRatioOpen}
                        onClose={() => setIsExchangeableBaseRatioOpen(false)}
                        tableId={tableId}
                        isReadOnly={readOnly}
                    />

                    <RecommendedLimestoneTypeModal
                        isOpen={isRecommendedLimestoneTypeOpen}
                        onClose={() => setIsRecommendedLimestoneTypeOpen(false)}
                        tableId={tableId}
                        isReadOnly={readOnly}
                    />
                </>
            )}
        </VStack>
    );
}
