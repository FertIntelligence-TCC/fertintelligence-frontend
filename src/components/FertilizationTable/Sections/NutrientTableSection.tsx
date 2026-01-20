import { useState, useEffect } from "react";
import { Box, HStack, Input, VStack, Heading, Button, Table, Flex } from "@chakra-ui/react";
import { FiPlus, FiMinus } from "react-icons/fi";
import { 
    PopoverRoot, PopoverTrigger, PopoverContent, PopoverBody, 
    PopoverArrow, PopoverCloseTrigger, PopoverHeader 
} from "@/components/ui/popover";
import { FertilizationTableFormState, NutrientRangeRow } from "../types";
import { SelectElement, selectFieldStyles, commonFieldStyles, headerCellStyles, sectionHeaderStyles } from "../styles";

type Props = {
    form: FertilizationTableFormState;
    onFormChange: (field: keyof FertilizationTableFormState, value: any) => void;
    readOnly?: boolean;
};

// Subcomponente interno para o Popover
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

export default function NutrientTableSection({ form, onFormChange, readOnly }: Props) {
    
    // --- Lógica de Manipulação da Tabela ---
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
                                {!readOnly && (
                                    <HStack gap={1}>
                                        <Button size="xs" colorScheme="blue" variant="solid" onClick={addCoverageColumn} title="Adicionar Cobertura">(+) Cob.</Button>
                                        <Button size="xs" colorScheme="red" variant="outline" onClick={removeCoverageColumn} disabled={form.coberturaLabels.length <= 1} title="Remover última cobertura">(-) Cob.</Button>
                                    </HStack>
                                )}
                            </Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {/* Nitrogênio */}
                        <Table.Row bg="blue.50" _dark={{ bg: "whiteAlpha.100" }}>
                            <Table.Cell fontWeight="bold" _dark={{ color: "blue.200" }}>Nitrogênio (N)</Table.Cell>
                            <Table.Cell><Input size="sm" type="number" {...commonFieldStyles} value={form.plantioN} onChange={(e) => updateRowValue("N", null, "plantio", e.target.value)} readOnly={readOnly} /></Table.Cell>
                            {form.coberturasN.map((val, idx) => (<Table.Cell key={idx}><Input size="sm" type="number" {...commonFieldStyles} value={val} onChange={(e) => updateRowValue("N", null, idx, e.target.value)} readOnly={readOnly} /></Table.Cell>))}
                            <Table.Cell bg="transparent" />
                        </Table.Row>

                        {/* Fósforo */}
                        <Table.Row><Table.Cell colSpan={10} {...sectionHeaderStyles}>Fósforo (P2O5) disponível em mg/dm³</Table.Cell></Table.Row>
                        {form.faixasP.map((row) => (
                                <Table.Row key={row.id} _dark={{ bg: "transparent" }}>
                                <Table.Cell fontSize="sm" _dark={{ color: "gray.200" }}>{row.label}</Table.Cell>
                                <Table.Cell><Input size="sm" type="number" {...commonFieldStyles} value={row.plantio} onChange={(e) => updateRowValue("P", row.id, "plantio", e.target.value)} readOnly={readOnly} /></Table.Cell>
                                {row.coberturas.map((val, idx) => (<Table.Cell key={idx}><Input size="sm" type="number" {...commonFieldStyles} value={val} onChange={(e) => updateRowValue("P", row.id, idx, e.target.value)} readOnly={readOnly} /></Table.Cell>))}
                                <Table.Cell bg="transparent"></Table.Cell>
                                </Table.Row>
                        ))}
                        {!readOnly && (
                            <Table.Row>
                                <Table.Cell colSpan={10} p={3}>
                                    <VStack align="start" gap={2}>
                                        <AddRangePopover type="P2O5" currentCount={form.faixasP.length} onAdd={(lbl, op) => addRangeRow("P", lbl, op)} />
                                        <Button size="sm" variant="ghost" colorScheme="red" onClick={() => removeLastRangeRow("P")} isDisabled={form.faixasP.length === 0}><FiMinus /> Remover faixa</Button>
                                    </VStack>
                                </Table.Cell>
                            </Table.Row>
                        )}

                        {/* Potássio */}
                        <Table.Row><Table.Cell colSpan={10} {...sectionHeaderStyles}>Potássio (K2O)</Table.Cell></Table.Row>
                        {form.faixasK.map((row) => (
                                <Table.Row key={row.id} _dark={{ bg: "transparent" }}>
                                <Table.Cell fontSize="sm" _dark={{ color: "gray.200" }}>{row.label}</Table.Cell>
                                <Table.Cell><Input size="sm" type="number" {...commonFieldStyles} value={row.plantio} onChange={(e) => updateRowValue("K", row.id, "plantio", e.target.value)} readOnly={readOnly} /></Table.Cell>
                                {row.coberturas.map((val, idx) => (<Table.Cell key={idx}><Input size="sm" type="number" {...commonFieldStyles} value={val} onChange={(e) => updateRowValue("K", row.id, idx, e.target.value)} readOnly={readOnly} /></Table.Cell>))}
                                <Table.Cell bg="transparent"></Table.Cell>
                                </Table.Row>
                        ))}
                        {!readOnly && (
                            <Table.Row>
                                <Table.Cell colSpan={10} p={3}>
                                    <VStack align="start" gap={2}>
                                        <AddRangePopover type="K2O" currentCount={form.faixasK.length} onAdd={(lbl, op) => addRangeRow("K", lbl, op)} />
                                        <Button size="sm" variant="ghost" colorScheme="red" onClick={() => removeLastRangeRow("K")} isDisabled={form.faixasK.length === 0}><FiMinus /> Remover faixa</Button>
                                    </VStack>
                                </Table.Cell>
                            </Table.Row>
                        )}
                    </Table.Body>
                </Table.Root>
            </Box>
        </Box>
    );
}