import { useState, useEffect } from "react";
import { 
    Box, HStack, Input, Text, VStack, chakra, Heading, Button, 
    Table, Grid, GridItem, Flex
} from "@chakra-ui/react";
import { FiPlus, FiMinus } from "react-icons/fi";
import { 
    PopoverRoot, PopoverTrigger, PopoverContent, PopoverBody, 
    PopoverArrow, PopoverCloseTrigger, PopoverHeader 
} from "@/components/ui/popover";
import { 
    FertilizationTableFormState, SpacingType, LimingCriteria, ManureType, NutrientRangeRow,
    SpacingLabels, LimingLabels, ManureLabels, CropType, CropScientificNames, CropLabels
} from "./types";

const SelectElement = chakra("select");

const commonFieldStyles = {
    bg: "white",
    borderColor: "gray.300",
    borderWidth: "1px",
    borderRadius: "md",
    _hover: { borderColor: "gray.400" },
    _focus: { borderColor: "green.500", boxShadow: "0 0 0 1px var(--chakra-colors-green-500)" },
    _dark: { bg: "gray.800", borderColor: "gray.600", color: "white" },
};

const readOnlyFieldStyles = {
    ...commonFieldStyles,
    bg: "gray.100",
    _dark: { bg: "gray.700", borderColor: "gray.600", color: "gray.300" },
    cursor: "not-allowed",
    _focus: { boxShadow: "none", borderColor: "gray.300" }
};

const selectFieldStyles = { ...commonFieldStyles, px: 3, py: 2, cursor: "pointer" };

// Estilos específicos para células de cabeçalho no Dark Mode
const headerCellStyles = {
    bg: "gray.100",
    _dark: { bg: "gray.700", color: "gray.200", borderColor: "gray.600" }
};

// Estilos para linhas divisórias (Fósforo/Potássio)
const sectionHeaderStyles = {
    bg: "gray.200",
    fontWeight: "bold",
    pt: 3, 
    pb: 3,
    _dark: { bg: "gray.600", color: "white", borderColor: "gray.500" }
};

type Props = {
    form: FertilizationTableFormState;
    onFormChange: (field: keyof FertilizationTableFormState, value: any) => void;
};

// ... [O código do AddRangePopover permanece o mesmo] ...
const AddRangePopover = ({ type, currentCount, onAdd }: { type: "P2O5" | "K2O", currentCount: number, onAdd: (label: string, operator: "less" | "between" | "more") => void }) => {
    const [mode, setMode] = useState<"less" | "between" | "more">("between");
    const [n1, setN1] = useState("");
    const [n2, setN2] = useState("");

    useEffect(() => {
        if (currentCount === 0) setMode("less");
        else if (currentCount >= 4) setMode("more");
        else setMode("between");
    }, [currentCount]);

    const handleAdd = () => {
        let label = "";
        if (mode === "less") label = `${type} < ${n1}`;
        else if (mode === "between") label = `${n1} < ${type} < ${n2}`;
        else label = `${type} > ${n1}`;
        onAdd(label, mode);
        setN1(""); setN2("");
    };

    return (
        <PopoverRoot positioning={{ placement: "right" }}>
            <PopoverTrigger asChild>
                <Button size="sm" variant="outline" colorScheme="blue" disabled={currentCount >= 5}>
                    <FiPlus /> Adicionar faixa
                </Button>
            </PopoverTrigger>
            <PopoverContent width="320px" bg="white" _dark={{ bg: "gray.800", borderColor: "gray.600" }} borderRadius="md" shadow="lg" borderWidth="1px">
                <PopoverArrow />
                <PopoverHeader fontWeight="bold" _dark={{ color: "white" }}>Novo Intervalo ({type})</PopoverHeader>
                <PopoverCloseTrigger _dark={{ color: "white" }} />
                <PopoverBody>
                    <VStack gap={3}>
                        <SelectElement value={mode} onChange={(e: any) => setMode(e.target.value as any)} {...selectFieldStyles} disabled={currentCount === 0 || currentCount >= 4}>
                            <option value="less">{`${type} < n (Menor que)`}</option>
                            <option value="between">{`n1 < ${type} < n2 (Entre)`}</option>
                            <option value="more">{`${type} > n (Maior que)`}</option>
                        </SelectElement>
                        <HStack>
                            <Input placeholder="Valor 1" type="number" value={n1} onChange={(e) => setN1(e.target.value)} {...commonFieldStyles} />
                            {mode === "between" && (<Input placeholder="Valor 2" type="number" value={n2} onChange={(e) => setN2(e.target.value)} {...commonFieldStyles} />)}
                        </HStack>
                        <Button size="sm" colorScheme="blue" width="full" onClick={handleAdd} isDisabled={!n1}>Adicionar Linha</Button>
                    </VStack>
                </PopoverBody>
            </PopoverContent>
        </PopoverRoot>
    );
};
// ... [Fim do AddRangePopover] ...

export default function FertilizationTableFormFields({ form, onFormChange }: Props) {
    
    const handleCropChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCrop = e.target.value as CropType;
        onFormChange("nomeComum", selectedCrop);
        
        if (selectedCrop && CropScientificNames[selectedCrop]) {
            onFormChange("nomeCientifico", CropScientificNames[selectedCrop]);
        } else {
            onFormChange("nomeCientifico", "");
        }
    };

    const addCoverageColumn = () => {
        const nextIndex = form.coberturaLabels.length + 1;
        onFormChange("coberturaLabels", [...form.coberturaLabels, `${nextIndex}ª cobertura`]);
        onFormChange("coberturasN", [...form.coberturasN, ""]);
        onFormChange("faixasP", form.faixasP.map(row => ({ ...row, coberturas: [...row.coberturas, ""] })));
        onFormChange("faixasK", form.faixasK.map(row => ({ ...row, coberturas: [...row.coberturas, ""] })));
    };
    const removeCoverageColumn = () => {
        if (form.coberturaLabels.length <= 1) return;
        onFormChange("coberturaLabels", form.coberturaLabels.slice(0, -1));
        onFormChange("coberturasN", form.coberturasN.slice(0, -1));
        onFormChange("faixasP", form.faixasP.map(row => ({ ...row, coberturas: row.coberturas.slice(0, -1) })));
        onFormChange("faixasK", form.faixasK.map(row => ({ ...row, coberturas: row.coberturas.slice(0, -1) })));
    };
    const addRangeRow = (nutrient: "P" | "K", label: string, operator: "less" | "between" | "more") => {
        const newRow: NutrientRangeRow = {
            id: Math.random().toString(36).substr(2, 9),
            label, operatorType: operator, plantio: "", coberturas: Array(form.coberturaLabels.length).fill("")
        };
        nutrient === "P" ? onFormChange("faixasP", [...form.faixasP, newRow]) : onFormChange("faixasK", [...form.faixasK, newRow]);
    };
    const removeLastRangeRow = (nutrient: "P" | "K") => {
        if (nutrient === "P") { if (form.faixasP.length === 0) return; onFormChange("faixasP", form.faixasP.slice(0, -1)); }
        else { if (form.faixasK.length === 0) return; onFormChange("faixasK", form.faixasK.slice(0, -1)); }
    };
    const updateRowValue = (nutrient: "N" | "P" | "K", rowId: string | null, colIndex: number | "plantio", value: string) => {
        if (nutrient === "N") {
            if (colIndex === "plantio") onFormChange("plantioN", value);
            else { const newCob = [...form.coberturasN]; newCob[colIndex] = value; onFormChange("coberturasN", newCob); }
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

    return (
        <VStack gap={5} align="stretch" h="70vh" overflowY="auto" px={2} pb={8}>
            
            {/* 1. Identificação */}
            <Heading size="sm" color="gray.600" _dark={{ color: "gray.300" }} borderBottomWidth="1px" pb={1}>Identificação</Heading>
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                <Box>
                    <Text fontWeight="semibold" mb={1} fontSize="sm" _dark={{ color: "gray.300" }}>Nome comum:</Text>
                    <SelectElement 
                        {...selectFieldStyles} 
                        value={form.nomeComum} 
                        onChange={handleCropChange}
                        placeholder="Selecione uma cultura"
                    >
                        {Object.values(CropType).map(key => (
                            <option key={key} value={key}>{CropLabels[key]}</option>
                        ))}
                    </SelectElement>
                </Box>
                <Box>
                    <Text fontWeight="semibold" mb={1} fontSize="sm" _dark={{ color: "gray.300" }}>Nome científico:</Text>
                    <Input {...readOnlyFieldStyles} value={form.nomeCientifico} isReadOnly tabIndex={-1} />
                </Box>
                <GridItem colSpan={{ base: 1, md: 2 }}>
                    <Text fontWeight="semibold" mb={1} fontSize="sm" _dark={{ color: "gray.300" }}>Cultivares:</Text>
                    <Input {...commonFieldStyles} value={form.cultivares} onChange={(e) => onFormChange("cultivares", e.target.value)} />
                </GridItem>
            </Grid>

            {/* 2. Parâmetros Técnicos */}
            <Heading size="sm" color="gray.600" _dark={{ color: "gray.300" }} borderBottomWidth="1px" pb={1} mt={2}>Parâmetros Técnicos</Heading>
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                <Box borderWidth="1px" p={3} borderRadius="md" bg="gray.50" _dark={{ bg: "gray.700", borderColor: "gray.600" }}>
                    <Text fontWeight="bold" mb={2} fontSize="xs" textTransform="uppercase" color="gray.500" _dark={{ color: "gray.400" }}>Espaçamento Sugerido</Text>
                    <VStack gap={2}>
                        <SelectElement {...selectFieldStyles} value={form.espacamentoSugeridoTipo} onChange={(e: any) => onFormChange("espacamentoSugeridoTipo", e.target.value)}>
                            {Object.values(SpacingType).map(key => <option key={key} value={key}>{SpacingLabels[key]}</option>)}
                        </SelectElement>
                        <HStack width="full">
                            <Input placeholder="Mín (m)" type="number" {...commonFieldStyles} value={form.espacamentoSugeridoMin} onChange={(e) => onFormChange("espacamentoSugeridoMin", e.target.value)} />
                            <Input placeholder="Máx (m)" type="number" {...commonFieldStyles} value={form.espacamentoSugeridoMax} onChange={(e) => onFormChange("espacamentoSugeridoMax", e.target.value)} />
                        </HStack>
                    </VStack>
                </Box>
                <Box borderWidth="1px" p={3} borderRadius="md" bg="gray.50" _dark={{ bg: "gray.700", borderColor: "gray.600" }}>
                    <Text fontWeight="bold" mb={2} fontSize="xs" textTransform="uppercase" color="gray.500" _dark={{ color: "gray.400" }}>Espaçamento Usado na Região</Text>
                    <VStack gap={2}>
                        <SelectElement {...selectFieldStyles} value={form.espacamentoUsadoTipo} onChange={(e: any) => onFormChange("espacamentoUsadoTipo", e.target.value)}>
                            {Object.values(SpacingType).map(key => <option key={key} value={key}>{SpacingLabels[key]}</option>)}
                        </SelectElement>
                        <Input placeholder="Valor (m)" type="number" {...commonFieldStyles} value={form.espacamentoUsadoValor} onChange={(e) => onFormChange("espacamentoUsadoValor", e.target.value)} />
                    </VStack>
                </Box>
            </Grid>

            <HStack gap={4}>
                <Box flex={1}><Text fontWeight="semibold" fontSize="sm" _dark={{ color: "gray.300" }}>Prod. Regional (Kg/ha):</Text><Input type="number" {...commonFieldStyles} value={form.produtividadeRegional} onChange={(e) => onFormChange("produtividadeRegional", e.target.value)} /></Box>
                <Box flex={1}><Text fontWeight="semibold" fontSize="sm" _dark={{ color: "gray.300" }}>Prod. Esperada (Kg/ha):</Text><Input type="number" {...commonFieldStyles} value={form.produtividadeEsperada} onChange={(e) => onFormChange("produtividadeEsperada", e.target.value)} /></Box>
            </HStack>

            <Box>
                <Text fontWeight="semibold" fontSize="sm" _dark={{ color: "gray.300" }}>Critério de Calagem:</Text>
                <SelectElement {...selectFieldStyles} value={form.criterioCalagem} onChange={(e: any) => onFormChange("criterioCalagem", e.target.value)}>
                    {Object.values(LimingCriteria).map(key => <option key={key} value={key}>{LimingLabels[key]}</option>)}
                </SelectElement>
            </Box>

            {/* 3. Recomendações Gerais */}
            <Heading size="sm" color="gray.600" _dark={{ color: "gray.300" }} borderBottomWidth="1px" pb={1} mt={2}>Recomendações Gerais</Heading>
            <HStack align="end" gap={4}>
                <Box flex={1}>
                    <Text fontWeight="semibold" fontSize="sm" _dark={{ color: "gray.300" }}>Sugestão de Esterco:</Text>
                    <SelectElement {...selectFieldStyles} value={form.sugestaoEstercoTipo} onChange={(e: any) => onFormChange("sugestaoEstercoTipo", e.target.value)}>
                        {Object.values(ManureType).map(key => <option key={key} value={key}>{ManureLabels[key]}</option>)}
                    </SelectElement>
                </Box>
                <Box w="140px"><Text fontWeight="semibold" fontSize="xs" mb={1} color="gray.500" _dark={{ color: "gray.400" }}>Qtd (t/ha)</Text><Input placeholder="0.0" type="number" {...commonFieldStyles} value={form.sugestaoEstercoQtd} onChange={(e) => onFormChange("sugestaoEstercoQtd", e.target.value)} /></Box>
            </HStack>

            <HStack gap={4}>
                <Box flex={1}><Text fontWeight="semibold" fontSize="sm" _dark={{ color: "gray.300" }}>Gessagem (t/ha):</Text><Input type="number" {...commonFieldStyles} value={form.sugestaoGessagem} onChange={(e) => onFormChange("sugestaoGessagem", e.target.value)} /></Box>
                <Box flex={1}><Text fontWeight="semibold" fontSize="sm" _dark={{ color: "gray.300" }}>Micronutrientes (g/ha):</Text><Input type="number" {...commonFieldStyles} value={form.sugestaoMicronutrientes} onChange={(e) => onFormChange("sugestaoMicronutrientes", e.target.value)} /></Box>
            </HStack>
            
            <Box>
                <Text fontWeight="semibold" fontSize="sm" mb={1} _dark={{ color: "gray.300" }}>Sugestão Adubação NPK (Kg/ha):</Text>
                <HStack>
                    <Input placeholder="N" type="number" {...commonFieldStyles} value={form.sugestaoN} onChange={(e) => onFormChange("sugestaoN", e.target.value)} />
                    <Input placeholder="P2O5" type="number" {...commonFieldStyles} value={form.sugestaoP} onChange={(e) => onFormChange("sugestaoP", e.target.value)} />
                    <Input placeholder="K2O" type="number" {...commonFieldStyles} value={form.sugestaoK} onChange={(e) => onFormChange("sugestaoK", e.target.value)} />
                </HStack>
            </Box>

            {/* 4. Tabela de Faixas de Teores (Corrigida para Dark Mode) */}
            <Box mt={4} borderTopWidth="2px" pt={4} _dark={{ borderColor: "gray.600" }}>
                <Flex justify="space-between" align="center" mb={3}><Heading size="md" _dark={{ color: "white" }}>Tabela de Faixas de Teores</Heading></Flex>
                <Box overflowX="auto" borderWidth="1px" borderRadius="md" bg="white" _dark={{ bg: "gray.800", borderColor: "gray.600" }}>
                    <Table.Root size="sm" variant="outline">
                        <Table.Header>
                            <Table.Row>
                                <Table.ColumnHeader minW="200px" {...headerCellStyles}>Teor no solo</Table.ColumnHeader>
                                <Table.ColumnHeader minW="100px" {...headerCellStyles}>Plantio (kg/ha)</Table.ColumnHeader>
                                {form.coberturaLabels.map((lbl, idx) => (<Table.ColumnHeader key={idx} minW="100px" {...headerCellStyles}>{lbl}</Table.ColumnHeader>))}
                                <Table.ColumnHeader minW="140px" {...headerCellStyles}>
                                    <HStack gap={1}>
                                        <Button size="xs" colorScheme="blue" variant="solid" onClick={addCoverageColumn} title="Adicionar Cobertura">(+) Cob.</Button>
                                        <Button size="xs" colorScheme="red" variant="outline" onClick={removeCoverageColumn} disabled={form.coberturaLabels.length <= 1} title="Remover última cobertura">(-) Cob.</Button>
                                    </HStack>
                                </Table.ColumnHeader>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {/* Nitrogênio */}
                            <Table.Row bg="blue.50" _dark={{ bg: "whiteAlpha.100" }}>
                                <Table.Cell fontWeight="bold" _dark={{ color: "blue.200" }}>Nitrogênio (N)</Table.Cell>
                                <Table.Cell><Input size="sm" type="number" {...commonFieldStyles} value={form.plantioN} onChange={(e) => updateRowValue("N", null, "plantio", e.target.value)} /></Table.Cell>
                                {form.coberturasN.map((val, idx) => (<Table.Cell key={idx}><Input size="sm" type="number" {...commonFieldStyles} value={val} onChange={(e) => updateRowValue("N", null, idx, e.target.value)} /></Table.Cell>))}
                                <Table.Cell bg="transparent" />
                            </Table.Row>

                            {/* Fósforo */}
                            <Table.Row><Table.Cell colSpan={10} {...sectionHeaderStyles}>Fósforo (P2O5) disponível em mg/dm³</Table.Cell></Table.Row>
                            {form.faixasP.map((row) => (
                                 <Table.Row key={row.id} _dark={{ bg: "transparent" }}>
                                    <Table.Cell fontSize="sm" _dark={{ color: "gray.200" }}>{row.label}</Table.Cell>
                                    <Table.Cell><Input size="sm" type="number" {...commonFieldStyles} value={row.plantio} onChange={(e) => updateRowValue("P", row.id, "plantio", e.target.value)} /></Table.Cell>
                                    {row.coberturas.map((val, idx) => (<Table.Cell key={idx}><Input size="sm" type="number" {...commonFieldStyles} value={val} onChange={(e) => updateRowValue("P", row.id, idx, e.target.value)} /></Table.Cell>))}
                                    <Table.Cell bg="transparent"></Table.Cell>
                                 </Table.Row>
                            ))}
                            <Table.Row>
                                <Table.Cell colSpan={10} p={3}>
                                    <VStack align="start" gap={2}>
                                        <AddRangePopover type="P2O5" currentCount={form.faixasP.length} onAdd={(lbl, op) => addRangeRow("P", lbl, op)} />
                                        <Button size="sm" variant="ghost" colorScheme="red" onClick={() => removeLastRangeRow("P")} isDisabled={form.faixasP.length === 0}><FiMinus /> Remover faixa</Button>
                                    </VStack>
                                </Table.Cell>
                            </Table.Row>

                            {/* Potássio */}
                            <Table.Row><Table.Cell colSpan={10} {...sectionHeaderStyles}>Potássio (K2O)</Table.Cell></Table.Row>
                            {form.faixasK.map((row) => (
                                 <Table.Row key={row.id} _dark={{ bg: "transparent" }}>
                                    <Table.Cell fontSize="sm" _dark={{ color: "gray.200" }}>{row.label}</Table.Cell>
                                    <Table.Cell><Input size="sm" type="number" {...commonFieldStyles} value={row.plantio} onChange={(e) => updateRowValue("K", row.id, "plantio", e.target.value)} /></Table.Cell>
                                    {row.coberturas.map((val, idx) => (<Table.Cell key={idx}><Input size="sm" type="number" {...commonFieldStyles} value={val} onChange={(e) => updateRowValue("K", row.id, idx, e.target.value)} /></Table.Cell>))}
                                    <Table.Cell bg="transparent"></Table.Cell>
                                 </Table.Row>
                            ))}
                            <Table.Row>
                                <Table.Cell colSpan={10} p={3}>
                                    <VStack align="start" gap={2}>
                                        <AddRangePopover type="K2O" currentCount={form.faixasK.length} onAdd={(lbl, op) => addRangeRow("K", lbl, op)} />
                                        <Button size="sm" variant="ghost" colorScheme="red" onClick={() => removeLastRangeRow("K")} isDisabled={form.faixasK.length === 0}><FiMinus /> Remover faixa</Button>
                                    </VStack>
                                </Table.Cell>
                            </Table.Row>
                        </Table.Body>
                    </Table.Root>
                </Box>
            </Box>
            <Box><Text fontWeight="semibold" fontSize="sm" _dark={{ color: "gray.300" }}>Observações:</Text><Input maxLength={100} {...commonFieldStyles} value={form.observacoes} onChange={(e) => onFormChange("observacoes", e.target.value)} /></Box>
        </VStack>
    );
}