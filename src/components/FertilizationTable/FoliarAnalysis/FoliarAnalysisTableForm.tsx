import { 
    Box, 
    Input, 
    Text, 
    VStack, 
    Table, 
    IconButton, 
    createListCollection,
    Button,
    Grid,
    HStack,
    Textarea,
} from "@chakra-ui/react";
import { 
    SelectContent, 
    SelectItem, 
    SelectRoot, 
    SelectTrigger, 
    SelectValueText 
} from "@/components/ui/select";
import { FiPlus, FiMinus } from "react-icons/fi";
import { FoliarTableFormState, FoliarTableRowState, CulturaEnum, RegionEnum, DEFAULT_ROW_STATE, formatUnidadeTeor } from "@/interfaces/FoliarAnalysisInterpretationTable";

type Props = {
    form: FoliarTableFormState;
    setForm: React.Dispatch<React.SetStateAction<FoliarTableFormState>>;
    readOnly?: boolean;
};

const RangeCell = ({ value, onChange, readOnly }: any) => (
    <VStack gap={1} minW="80px">
        <Input size="xs" value={value.min} onChange={(e) => onChange('min', e.target.value)} readOnly={readOnly} placeholder="Min" bg="white" _dark={{bg:"gray.700"}} />
        <Input size="xs" value={value.max} onChange={(e) => onChange('max', e.target.value)} readOnly={readOnly} placeholder="Max" bg="white" _dark={{bg:"gray.700"}} />
    </VStack>
);

export default function FoliarAnalysisTableForm({ form, setForm, readOnly }: Props) {

    const culturasCollection = createListCollection({
        items: Object.keys(CulturaEnum).map((k) => ({ label: k.replace(/_/g, ' '), value: k })),
    });

    const regioesCollection = createListCollection({
        items: Object.keys(RegionEnum).map((k) => ({ label: k.replace(/_/g, ' '), value: k })),
    });

    const handleAddRow = () => {
        setForm(prev => ({ ...prev, rows: [...prev.rows, { ...DEFAULT_ROW_STATE }] }));
    };

    const handleRemoveRow = (index: number) => {
        setForm(prev => ({ ...prev, rows: prev.rows.filter((_, i) => i !== index) }));
    };

    const updateRow = (index: number, field: keyof FoliarTableRowState, value: any) => {
        setForm(prev => {
            const newRows = [...prev.rows];
            newRows[index] = { ...newRows[index], [field]: value };
            return { ...prev, rows: newRows };
        });
    };

    const updateRange = (index: number, nutrient: keyof FoliarTableRowState, type: 'min' | 'max', value: string) => {
        setForm(prev => {
            const newRows = [...prev.rows];
            // @ts-ignore
            newRows[index] = { ...newRows[index], [nutrient]: { ...newRows[index][nutrient], [type]: value } };
            return { ...prev, rows: newRows };
        });
    };

    return (
        <VStack gap={6} align="stretch" py={2}>
            
            <Box borderWidth="1px" borderRadius="md" p={4} bg="gray.50" _dark={{ bg: "gray.800" }}>
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                    <Box>
                        <Text fontSize="sm" fontWeight="bold" mb={1} color="gray.600">Nome da Tabela (Opcional)</Text>
                        <Input 
                            value={form.nome} 
                            onChange={(e) => setForm(p => ({ ...p, nome: e.target.value }))}
                            readOnly={readOnly}
                            placeholder="Ex: Tabela Soja 2024"
                            bg="white" _dark={{ bg: "gray.700" }}
                        />
                    </Box>
                    <Box>
                        <Text fontSize="sm" fontWeight="bold" mb={1} color="gray.600">Região *</Text>
                        <SelectRoot 
                            collection={regioesCollection}
                            value={[form.region]}
                            onValueChange={(e) => setForm(p => ({ ...p, region: e.value[0] }))}
                            disabled={readOnly}
                        >
                            <SelectTrigger bg="white" _dark={{ bg: "gray.700" }}>
                                <SelectValueText placeholder="Selecione a Região..." />
                            </SelectTrigger>
                            <SelectContent>
                                {regioesCollection.items.map((item) => (
                                    <SelectItem item={item} key={item.value}>{item.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </SelectRoot>
                    </Box>
                </Grid>

                <Box mt={4}>
                    <Text fontSize="sm" fontWeight="bold" mb={2} color="gray.600">Tornar essa tabela pública?</Text>
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
                        <Text fontSize="sm" fontWeight="bold" mb={1} color="gray.600">Observações</Text>
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
                        <Text fontSize="sm" fontWeight="bold" mb={1} color="gray.600">Fontes</Text>
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

            </Box>

            <Box overflowX="auto" borderWidth="1px" borderRadius="md">
                <Table.Root size="sm" variant="outline">
                    <Table.Header bg="gray.100" _dark={{ bg: "gray.700" }}>
                        <Table.Row>
                            <Table.ColumnHeader rowSpan={2} minW="50px">
                                {!readOnly && (
                                    <Button size="xs" colorPalette="green" onClick={handleAddRow}>
                                        <FiPlus />
                                    </Button>
                                )}
                            </Table.ColumnHeader>
                            <Table.ColumnHeader rowSpan={2} minW="180px">Cultura</Table.ColumnHeader>
                            <Table.ColumnHeader colSpan={6} textAlign="center" borderBottomWidth="1px">Macronutrientes ({formatUnidadeTeor("g_per_kg")})</Table.ColumnHeader>
                            <Table.ColumnHeader colSpan={6} textAlign="center" borderBottomWidth="1px">Micronutrientes ({formatUnidadeTeor("mg_per_kg")})</Table.ColumnHeader>
                        </Table.Row>
                        <Table.Row>
                            {['N', 'P', 'K', 'Ca', 'Mg', 'S'].map(n => <Table.ColumnHeader key={n} textAlign="center">{n}</Table.ColumnHeader>)}
                            {['B', 'Cu', 'Fe', 'Mn', 'Mo', 'Zn'].map(n => <Table.ColumnHeader key={n} textAlign="center">{n}</Table.ColumnHeader>)}
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {form.rows.map((row, index) => (
                            <Table.Row key={index}>
                                <Table.Cell>
                                    {!readOnly && (
                                        <IconButton aria-label="Remover" size="xs" colorPalette="red" variant="ghost" onClick={() => handleRemoveRow(index)}>
                                            <FiMinus />
                                        </IconButton>
                                    )}
                                </Table.Cell>
                                <Table.Cell>
                                    <SelectRoot 
                                        collection={culturasCollection} 
                                        size="sm" 
                                        value={[row.cultura]} 
                                        onValueChange={(e) => updateRow(index, 'cultura', e.value[0])}
                                        disabled={readOnly}
                                    >
                                        <SelectTrigger><SelectValueText placeholder="..." /></SelectTrigger>
                                        <SelectContent>
                                            {culturasCollection.items.map(c => <SelectItem item={c} key={c.value}>{c.label}</SelectItem>)}
                                        </SelectContent>
                                    </SelectRoot>
                                </Table.Cell>
                                <Table.Cell><RangeCell value={row.n} onChange={(t:any, v:any) => updateRange(index, 'n', t, v)} readOnly={readOnly} /></Table.Cell>
                                <Table.Cell><RangeCell value={row.p} onChange={(t:any, v:any) => updateRange(index, 'p', t, v)} readOnly={readOnly} /></Table.Cell>
                                <Table.Cell><RangeCell value={row.k} onChange={(t:any, v:any) => updateRange(index, 'k', t, v)} readOnly={readOnly} /></Table.Cell>
                                <Table.Cell><RangeCell value={row.ca} onChange={(t:any, v:any) => updateRange(index, 'ca', t, v)} readOnly={readOnly} /></Table.Cell>
                                <Table.Cell><RangeCell value={row.mg} onChange={(t:any, v:any) => updateRange(index, 'mg', t, v)} readOnly={readOnly} /></Table.Cell>
                                <Table.Cell><RangeCell value={row.s} onChange={(t:any, v:any) => updateRange(index, 's', t, v)} readOnly={readOnly} /></Table.Cell>
                                <Table.Cell><RangeCell value={row.b} onChange={(t:any, v:any) => updateRange(index, 'b', t, v)} readOnly={readOnly} /></Table.Cell>
                                <Table.Cell><RangeCell value={row.cu} onChange={(t:any, v:any) => updateRange(index, 'cu', t, v)} readOnly={readOnly} /></Table.Cell>
                                <Table.Cell><RangeCell value={row.fe} onChange={(t:any, v:any) => updateRange(index, 'fe', t, v)} readOnly={readOnly} /></Table.Cell>
                                <Table.Cell><RangeCell value={row.mn} onChange={(t:any, v:any) => updateRange(index, 'mn', t, v)} readOnly={readOnly} /></Table.Cell>
                                <Table.Cell><RangeCell value={row.mo} onChange={(t:any, v:any) => updateRange(index, 'mo', t, v)} readOnly={readOnly} /></Table.Cell>
                                <Table.Cell><RangeCell value={row.zn} onChange={(t:any, v:any) => updateRange(index, 'zn', t, v)} readOnly={readOnly} /></Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table.Root>
            </Box>
        </VStack>
    );
}
