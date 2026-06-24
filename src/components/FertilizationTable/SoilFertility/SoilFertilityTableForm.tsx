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
import KExchangeableContentModal from "./KExchangeableContentModal";
import DiverseContentRangeModal from "./DiverseContentRangeModal";
import ExchangeableSodiumModal from "./ExchangeableSodiumModal";

type Props = {
    form: SoilFertilityFormState;
    setForm: React.Dispatch<React.SetStateAction<SoilFertilityFormState>>;
    readOnly?: boolean;
    mode: "create" | "edit" | "view";
    tableId?: number | null;
};

export default function SoilFertilityTableForm({ form, setForm, readOnly, mode, tableId }: Props) {

    // Estados para controle dos Modais
    const [isSalinityOpen, setIsSalinityOpen] = useState(false);
    const [isPMehlich1Open, setIsPMehlich1Open] = useState(false);
    const [isPResinOpen, setIsPResinOpen] = useState(false);
    const [isAvailableSOpen, setIsAvailableSOpen] = useState(false);
    const [isKExchangeableOpen, setIsKExchangeableOpen] = useState(false);
    const [isDiverseContentOpen, setIsDiverseContentOpen] = useState(false);
    const [isExchangeableSodiumOpen, setIsExchangeableSodiumOpen] = useState(false);

    const regioesCollection = createListCollection({
        items: Object.keys(RegionEnum).map((k) => ({ label: k.replace(/_/g, ' '), value: k })),
    });

    const auxiliaryTables = [
        "Salinidade",
        "Fósforo disponível, extrator Mehlich-1",
        "Fósforo disponível, extrator resina de troca aniônica",
        "S disponível",
        "Teores trocáveis de Potássio",
        "Teores de Nutrientes Diversos",
        "Sódio Trocável (mmolc/dm³)"
    ];

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
                        {auxiliaryTables.map((tableName, index) => (
                            <Box
                                key={index}
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
                                h="100px"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                onClick={() => {
                                    if (tableName === "Salinidade") setIsSalinityOpen(true);
                                    else if (tableName === "Fósforo disponível, extrator Mehlich-1") setIsPMehlich1Open(true);
                                    else if (tableName === "Fósforo disponível, extrator resina de troca aniônica") setIsPResinOpen(true);
                                    else if (tableName === "S disponível") setIsAvailableSOpen(true);
                                    else if (tableName === "Teores trocáveis de Potássio") setIsKExchangeableOpen(true);
                                    
                                    // Nova lógica para Nutrientes Diversos
                                    else if (tableName === "Teores de Nutrientes Diversos") setIsDiverseContentOpen(true);
                                    else if (tableName === "Sódio Trocável (mmolc/dm³)") setIsExchangeableSodiumOpen(true);
                                    
                                    else {
                                        if (!readOnly) console.log(`Configurar ${tableName} (Em breve)`);
                                    }
                                }}
                            >
                                <Center flexDirection="column" textAlign="center">
                                    <Text fontWeight="semibold" fontSize="sm" color="gray.700" _dark={{ color: "gray.200" }}>
                                        {tableName}
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

                    <KExchangeableContentModal
                        isOpen={isKExchangeableOpen}
                        onClose={() => setIsKExchangeableOpen(false)}
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
                </>
            )}
        </VStack>
    );
}
