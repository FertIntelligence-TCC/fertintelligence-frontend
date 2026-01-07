import { useState } from "react";
import { 
    Box, HStack, Input, Text, VStack, chakra, Heading, Button, 
    Table, IconButton
} from "@chakra-ui/react";
import { FiPlus, FiTrash, FiX } from "react-icons/fi";
import { 
    PopoverRoot, 
    PopoverTrigger, 
    PopoverContent, 
    PopoverBody, 
    PopoverArrow, 
    PopoverCloseTrigger, 
    PopoverHeader 
} from "@/components/ui/popover";
import { 
    FertilizationTableFormState, SpacingType, LimingCriteria, ManureType, NutrientRangeRow,
    SpacingLabels, LimingLabels, ManureLabels 
} from "./types";

const SelectElement = chakra("select");

const commonFieldStyles = {
    bg: "white",
    borderColor: "gray.300",
    borderWidth: "1px",
    borderRadius: "md",
    _hover: { borderColor: "gray.400" },
    _focus: { borderColor: "green.500", boxShadow: "0 0 0 1px var(--chakra-colors-green-500)" },
    _dark: { bg: "gray.900", borderColor: "gray.600" },
};

const selectFieldStyles = { ...commonFieldStyles, px: 3, py: 2, cursor: "pointer" };

type Props = {
    form: FertilizationTableFormState;
    onFormChange: (field: keyof FertilizationTableFormState, value: any) => void;
};

const AddRangePopover = ({ type, onAdd }: { type: "P2O5" | "K2O", onAdd: (label: string) => void }) => {
    const [mode, setMode] = useState<"less" | "between" | "more">("less");
    const [n1, setN1] = useState("");
    const [n2, setN2] = useState("");

    const handleAdd = () => {
        let label = "";
        if (mode === "less") label = `${type} < ${n1}`;
        else if (mode === "between") label = `${n1} < ${type} < ${n2}`;
        else label = `${type} > ${n1}`;
        
        onAdd(label);
        setN1(""); setN2("");
    };

    return (
        <PopoverRoot positioning={{ placement: "right" }}>
            <PopoverTrigger asChild>
                <Button size="sm" variant="outline"><FiPlus /> Adicionar faixa</Button>
            </PopoverTrigger>
            <PopoverContent width="300px" bg="white" _dark={{ bg: "gray.800" }} borderRadius="md" shadow="lg" borderWidth="1px">
                <PopoverArrow />
                <PopoverHeader fontWeight="bold">
                    Novo Intervalo ({type})
                </PopoverHeader>
                <PopoverCloseTrigger />
                
                <PopoverBody>
                    <VStack gap={3}>
                        {/* Correção: Usando SelectElement (nativo) em vez de Select (objeto do Chakra) */}
                        <SelectElement 
                            value={mode} 
                            onChange={(e: any) => setMode(e.target.value as any)}
                            {...selectFieldStyles}
                        >
                            <option value="less">{`< n (Menor que)`}</option>
                            <option value="between">{`n1 < x < n2 (Entre)`}</option>
                            <option value="more">{`> n (Maior que)`}</option>
                        </SelectElement>
                        <HStack>
                            <Input placeholder="Valor 1" type="number" value={n1} onChange={(e) => setN1(e.target.value)} {...commonFieldStyles} />
                            {mode === "between" && (
                                <Input placeholder="Valor 2" type="number" value={n2} onChange={(e) => setN2(e.target.value)} {...commonFieldStyles} />
                            )}
                        </HStack>
                        <Button size="sm" colorScheme="blue" width="full" onClick={handleAdd} isDisabled={!n1}>Adicionar</Button>
                    </VStack>
                </PopoverBody>
            </PopoverContent>
        </PopoverRoot>
    );
};

export default function FertilizationTableFormFields({ form, onFormChange }: Props) {
    const addCoverageColumn = () => {
        const newIndex = form.coberturaLabels.length + 1;
        onFormChange("coberturaLabels", [...form.coberturaLabels, `${newIndex}ª cobertura`]);
        onFormChange("coberturasN", [...form.coberturasN, ""]);
        onFormChange("faixasP", form.faixasP.map(row => ({ ...row, coberturas: [...row.coberturas, ""] })));
        onFormChange("faixasK", form.faixasK.map(row => ({ ...row, coberturas: [...row.coberturas, ""] })));
    };

    const addRangeRow = (nutrient: "P" | "K", label: string) => {
        const newRow: NutrientRangeRow = {
            id: Math.random().toString(36).substr(2, 9),
            label,
            plantio: "",
            coberturas: Array(form.coberturaLabels.length).fill("")
        };
        if (nutrient === "P") onFormChange("faixasP", [...form.faixasP, newRow]);
        else onFormChange("faixasK", [...form.faixasK, newRow]);
    };

    const updateRowValue = (nutrient: "N" | "P" | "K", rowId: string | null, colIndex: number | "plantio", value: string) => {
        if (nutrient === "N") {
            if (colIndex === "plantio") onFormChange("plantioN", value);
            else {
                const newCob = [...form.coberturasN];
                newCob[colIndex] = value;
                onFormChange("coberturasN", newCob);
            }
        } else {
            const field = nutrient === "P" ? "faixasP" : "faixasK";
            const rows = nutrient === "P" ? [...form.faixasP] : [...form.faixasK];
            const rowIdx = rows.findIndex(r => r.id === rowId);
            if (rowIdx === -1) return;

            if (colIndex === "plantio") rows[rowIdx].plantio = value;
            else rows[rowIdx].coberturas[colIndex] = value;
            onFormChange(field, rows);
        }
    };

    const removeRangeRow = (nutrient: "P" | "K", id: string) => {
        if (nutrient === "P") onFormChange("faixasP", form.faixasP.filter(r => r.id !== id));
        else onFormChange("faixasK", form.faixasK.filter(r => r.id !== id));
    };

    return (
        <VStack gap={4} align="stretch" h="65vh" overflowY="auto" px={2} pb={4}>
            <Heading size="sm" color="gray.600">Identificação</Heading>
            <HStack>
                <Box flex={1}>
                    <Text fontWeight="semibold" mb={1}>Nome comum:</Text>
                    <Input {...commonFieldStyles} value={form.nomeComum} onChange={(e) => onFormChange("nomeComum", e.target.value)} />
                </Box>
                <Box flex={1}>
                    <Text fontWeight="semibold" mb={1}>Nome científico:</Text>
                    <Input {...commonFieldStyles} value={form.nomeCientifico} onChange={(e) => onFormChange("nomeCientifico", e.target.value)} />
                </Box>
            </HStack>
            <Box>
                <Text fontWeight="semibold" mb={1}>Cultivares:</Text>
                <Input {...commonFieldStyles} value={form.cultivares} onChange={(e) => onFormChange("cultivares", e.target.value)} />
            </Box>

            <Heading size="sm" color="gray.600" mt={2}>Parâmetros Técnicos</Heading>
            <Box borderWidth="1px" p={3} borderRadius="md" bg="gray.50" _dark={{ bg: "gray.700" }}>
                <Text fontWeight="bold" mb={2} fontSize="sm">Espaçamento Sugerido</Text>
                <HStack>
                    <SelectElement {...selectFieldStyles} value={form.espacamentoSugeridoTipo} onChange={(e: any) => onFormChange("espacamentoSugeridoTipo", e.target.value)}>
                        {Object.values(SpacingType).map(key => <option key={key} value={key}>{SpacingLabels[key]}</option>)}
                    </SelectElement>
                    <Input placeholder="Min (m)" type="number" {...commonFieldStyles} value={form.espacamentoSugeridoMin} onChange={(e) => onFormChange("espacamentoSugeridoMin", e.target.value)} />
                    <Input placeholder="Max (m)" type="number" {...commonFieldStyles} value={form.espacamentoSugeridoMax} onChange={(e) => onFormChange("espacamentoSugeridoMax", e.target.value)} />
                </HStack>
            </Box>
             <Box borderWidth="1px" p={3} borderRadius="md" bg="gray.50" _dark={{ bg: "gray.700" }}>
                <Text fontWeight="bold" mb={2} fontSize="sm">Espaçamento Usado na Região</Text>
                <HStack>
                    <SelectElement {...selectFieldStyles} value={form.espacamentoUsadoTipo} onChange={(e: any) => onFormChange("espacamentoUsadoTipo", e.target.value)}>
                        {Object.values(SpacingType).map(key => <option key={key} value={key}>{SpacingLabels[key]}</option>)}
                    </SelectElement>
                    <Input placeholder="Valor (m)" type="number" {...commonFieldStyles} value={form.espacamentoUsadoValor} onChange={(e) => onFormChange("espacamentoUsadoValor", e.target.value)} />
                </HStack>
            </Box>

            <HStack>
                <Box flex={1}><Text fontWeight="semibold">Prod. Regional (Kg/ha):</Text><Input type="number" {...commonFieldStyles} value={form.produtividadeRegional} onChange={(e) => onFormChange("produtividadeRegional", e.target.value)} /></Box>
                <Box flex={1}><Text fontWeight="semibold">Prod. Esperada (Kg/ha):</Text><Input type="number" {...commonFieldStyles} value={form.produtividadeEsperada} onChange={(e) => onFormChange("produtividadeEsperada", e.target.value)} /></Box>
            </HStack>

            <Box>
                <Text fontWeight="semibold">Critério de Calagem:</Text>
                <SelectElement {...selectFieldStyles} value={form.criterioCalagem} onChange={(e: any) => onFormChange("criterioCalagem", e.target.value)}>
                    {Object.values(LimingCriteria).map(key => <option key={key} value={key}>{LimingLabels[key]}</option>)}
                </SelectElement>
            </Box>

            <Heading size="sm" color="gray.600" mt={2}>Recomendações Gerais</Heading>
            <HStack align="end">
                <Box flex={1}>
                    <Text fontWeight="semibold">Sugestão de Esterco:</Text>
                    <SelectElement {...selectFieldStyles} value={form.sugestaoEstercoTipo} onChange={(e: any) => onFormChange("sugestaoEstercoTipo", e.target.value)}>
                        {Object.values(ManureType).map(key => <option key={key} value={key}>{ManureLabels[key]}</option>)}
                    </SelectElement>
                </Box>
                <Box w="120px"><Text fontWeight="semibold" fontSize="xs" mb={1}>Qtd (t/ha)</Text><Input placeholder="0.0" type="number" {...commonFieldStyles} value={form.sugestaoEstercoQtd} onChange={(e) => onFormChange("sugestaoEstercoQtd", e.target.value)} /></Box>
            </HStack>
            <HStack>
                <Box flex={1}><Text fontWeight="semibold">Gessagem (t/ha):</Text><Input type="number" {...commonFieldStyles} value={form.sugestaoGessagem} onChange={(e) => onFormChange("sugestaoGessagem", e.target.value)} /></Box>
                <Box flex={1}><Text fontWeight="semibold">Micronutrientes (g/ha):</Text><Input type="number" {...commonFieldStyles} value={form.sugestaoMicronutrientes} onChange={(e) => onFormChange("sugestaoMicronutrientes", e.target.value)} /></Box>
            </HStack>
            <Box>
                <Text fontWeight="semibold">Adubação NPK (Kg/ha):</Text>
                <HStack>
                    <Input placeholder="N" type="number" {...commonFieldStyles} value={form.sugestaoN} onChange={(e) => onFormChange("sugestaoN", e.target.value)} />
                    <Input placeholder="P2O5" type="number" {...commonFieldStyles} value={form.sugestaoP} onChange={(e) => onFormChange("sugestaoP", e.target.value)} />
                    <Input placeholder="K2O" type="number" {...commonFieldStyles} value={form.sugestaoK} onChange={(e) => onFormChange("sugestaoK", e.target.value)} />
                </HStack>
            </Box>

            <Box mt={4} borderTopWidth="2px" pt={4}>
                <Heading size="md" mb={3}>Tabela de Faixas de Teores</Heading>
                <Box overflowX="auto" borderWidth="1px" borderRadius="md" p={2} bg="white" _dark={{ bg: "gray.800" }}>
                    <Table.Root size="sm" variant="outline">
                        <Table.Header>
                            <Table.Row>
                                <Table.ColumnHeader minW="150px">Teor no solo</Table.ColumnHeader>
                                <Table.ColumnHeader minW="100px">Plantio (kg/ha)</Table.ColumnHeader>
                                {form.coberturaLabels.map((lbl, idx) => <Table.ColumnHeader key={idx} minW="100px">{lbl}</Table.ColumnHeader>)}
                                <Table.ColumnHeader><Button size="xs" colorScheme="blue" variant="ghost" onClick={addCoverageColumn}>+ Cobertura</Button></Table.ColumnHeader>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            <Table.Row bg="blue.50" _dark={{ bg: "blue.900" }}>
                                <Table.Cell fontWeight="bold">Nitrogênio (N)</Table.Cell>
                                <Table.Cell><Input size="sm" type="number" bg="white" _dark={{ bg: "gray.700" }} value={form.plantioN} onChange={(e) => updateRowValue("N", null, "plantio", e.target.value)} /></Table.Cell>
                                {form.coberturasN.map((val, idx) => (
                                    <Table.Cell key={idx}><Input size="sm" type="number" bg="white" _dark={{ bg: "gray.700" }} value={val} onChange={(e) => updateRowValue("N", null, idx, e.target.value)} /></Table.Cell>
                                ))}
                                <Table.Cell></Table.Cell>
                            </Table.Row>

                            <Table.Row><Table.Cell colSpan={10} fontWeight="bold" bg="gray.100" _dark={{ bg: "gray.600" }} pt={4}>Fósforo (P2O5) - mg/dm³</Table.Cell></Table.Row>
                            {form.faixasP.map((row) => (
                                 <Table.Row key={row.id}>
                                    <Table.Cell fontSize="sm">{row.label}</Table.Cell>
                                    <Table.Cell><Input size="sm" type="number" value={row.plantio} onChange={(e) => updateRowValue("P", row.id, "plantio", e.target.value)} /></Table.Cell>
                                    {row.coberturas.map((val, idx) => (
                                        <Table.Cell key={idx}><Input size="sm" type="number" value={val} onChange={(e) => updateRowValue("P", row.id, idx, e.target.value)} /></Table.Cell>
                                    ))}
                                    <Table.Cell><IconButton size="xs" aria-label="Remove" icon={<FiTrash />} colorScheme="red" variant="ghost" onClick={() => removeRangeRow("P", row.id)} /></Table.Cell>
                                 </Table.Row>
                            ))}
                            {form.faixasP.length < 5 && (
                                <Table.Row><Table.Cell colSpan={10}><AddRangePopover type="P2O5" onAdd={(lbl) => addRangeRow("P", lbl)} /></Table.Cell></Table.Row>
                            )}

                            <Table.Row><Table.Cell colSpan={10} fontWeight="bold" bg="gray.100" _dark={{ bg: "gray.600" }} pt={4}>Potássio (K2O)</Table.Cell></Table.Row>
                            {form.faixasK.map((row) => (
                                 <Table.Row key={row.id}>
                                    <Table.Cell fontSize="sm">{row.label}</Table.Cell>
                                    <Table.Cell><Input size="sm" type="number" value={row.plantio} onChange={(e) => updateRowValue("K", row.id, "plantio", e.target.value)} /></Table.Cell>
                                    {row.coberturas.map((val, idx) => (
                                        <Table.Cell key={idx}><Input size="sm" type="number" value={val} onChange={(e) => updateRowValue("K", row.id, idx, e.target.value)} /></Table.Cell>
                                    ))}
                                    <Table.Cell><IconButton size="xs" aria-label="Remove" icon={<FiTrash />} colorScheme="red" variant="ghost" onClick={() => removeRangeRow("K", row.id)} /></Table.Cell>
                                 </Table.Row>
                            ))}
                            {form.faixasK.length < 5 && (
                                <Table.Row><Table.Cell colSpan={10}><AddRangePopover type="K2O" onAdd={(lbl) => addRangeRow("K", lbl)} /></Table.Cell></Table.Row>
                            )}
                        </Table.Body>
                    </Table.Root>
                </Box>
            </Box>

            <Box>
                <Text fontWeight="semibold">Observações:</Text>
                <Input maxLength={100} {...commonFieldStyles} value={form.observacoes} onChange={(e) => onFormChange("observacoes", e.target.value)} />
            </Box>
        </VStack>
    );
}