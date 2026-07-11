import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  Field,
  Grid,
  HStack,
  Input,
  Spinner,
  Text,
  Textarea,
  VStack
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import {
  createCorrectiveK2OFertilization,
  deleteCorrectiveK2OFertilization,
  getCorrectiveK2OFertilizationByTable,
  updateCorrectiveK2OFertilization
} from "@/services/correctiveK2OFertilizationService";
import {
  CorrectiveK2OFertilizationCreateRequestDto,
  CorrectiveK2OFertilizationPostRequestDto,
  CorrectiveK2OFertilizationResponseDto
} from "@/interfaces/CorrectiveK2OFertilization";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tableId: number | null;
  isReadOnly?: boolean;
}

interface CorrectiveK2ORowForm {
  localId: string;
  id: number | null;
  ctc_minima: string;
  ctc_maxima: string;
  k_minimo: string;
  k_maximo: string;
  dose_k2o: string;
  observacoes: string;
  fontes: string;
}

type CorrectiveK2ORowField = Exclude<keyof CorrectiveK2ORowForm, "localId" | "id">;

const createEmptyRow = (): CorrectiveK2ORowForm => ({
  localId: crypto.randomUUID(),
  id: null,
  ctc_minima: "",
  ctc_maxima: "",
  k_minimo: "",
  k_maximo: "",
  dose_k2o: "",
  observacoes: "",
  fontes: ""
});

const toFormRow = (row: CorrectiveK2OFertilizationResponseDto): CorrectiveK2ORowForm => ({
  localId: String(row.id),
  id: row.id,
  ctc_minima: row.ctc_minima !== null && row.ctc_minima !== undefined ? String(row.ctc_minima) : "",
  ctc_maxima: row.ctc_maxima !== null && row.ctc_maxima !== undefined ? String(row.ctc_maxima) : "",
  k_minimo: row.k_minimo !== null && row.k_minimo !== undefined ? String(row.k_minimo) : "",
  k_maximo: row.k_maximo !== null && row.k_maximo !== undefined ? String(row.k_maximo) : "",
  dose_k2o: row.dose_k2o !== null && row.dose_k2o !== undefined ? String(row.dose_k2o) : "",
  observacoes: row.observacoes ?? "",
  fontes: row.fontes ?? ""
});

const parseOptionalNumber = (value: string) => {
  if (!value) return null;
  const parsed = parseFloat(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
};

const parseRequiredNumber = (value: string) => {
  const parsed = parseFloat(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
};

export default function CorrectiveK2OFertilizationModal({
  isOpen,
  onClose,
  tableId,
  isReadOnly = false
}: Props) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState<CorrectiveK2ORowForm[]>([]);
  const [removedRowIds, setRemovedRowIds] = useState<number[]>([]);

  useEffect(() => {
    if (isOpen && tableId) {
      fetchData();
    } else {
      setRows([]);
    }
  }, [isOpen, tableId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getCorrectiveK2OFertilizationByTable(tableId!);
      setRows(data.map(toFormRow));
      setRemovedRowIds([]);
    } catch (error) {
      console.error(error);
      toaster.create({
        title: "Erro ao carregar Adubação Corretiva de K2O.",
        description: "Verifique se o endpoint backend desta tabela auxiliar está disponível.",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (localId: string, field: CorrectiveK2ORowField, value: string) => {
    setRows((prev) => prev.map((row) => (row.localId === localId ? { ...row, [field]: value } : row)));
  };

  const addRow = () => {
    setRows((prev) => [...prev, createEmptyRow()]);
  };

  const removeLastRow = () => {
    setRows((prev) => {
      const lastRow = prev.at(-1);
      if (!lastRow) return prev;
      if (lastRow.id !== null) {
        setRemovedRowIds((ids) => [...ids, lastRow.id!]);
      }
      return prev.slice(0, -1);
    });
  };

  const buildCreatePayload = (row: CorrectiveK2ORowForm): CorrectiveK2OFertilizationCreateRequestDto => ({
    ctc_minima: parseOptionalNumber(row.ctc_minima),
    ctc_maxima: parseOptionalNumber(row.ctc_maxima),
    k_minimo: parseOptionalNumber(row.k_minimo),
    k_maximo: parseOptionalNumber(row.k_maximo),
    dose_k2o: parseRequiredNumber(row.dose_k2o),
    observacoes: row.observacoes,
    fontes: row.fontes
  });

  const buildUpdatePayload = (row: CorrectiveK2ORowForm): CorrectiveK2OFertilizationPostRequestDto => ({
    nova_ctc_minima: parseOptionalNumber(row.ctc_minima),
    nova_ctc_maxima: parseOptionalNumber(row.ctc_maxima),
    novo_k_minimo: parseOptionalNumber(row.k_minimo),
    novo_k_maximo: parseOptionalNumber(row.k_maximo),
    nova_dose_k2o: parseRequiredNumber(row.dose_k2o),
    novo_observacoes: row.observacoes,
    novo_fontes: row.fontes
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all(
        [
          ...removedRowIds.map((id) => deleteCorrectiveK2OFertilization(id)),
          ...rows.map((row) =>
            row.id
              ? updateCorrectiveK2OFertilization(row.id, buildUpdatePayload(row))
              : createCorrectiveK2OFertilization(tableId!, buildCreatePayload(row))
          )
        ]
      );
      toaster.create({ title: "Adubação Corretiva de K2O salva!", type: "success" });
      await fetchData();
    } catch (error) {
      console.error(error);
      toaster.create({
        title: "Erro ao salvar Adubação Corretiva de K2O.",
        description: "O frontend enviou o contrato disponível; confirme compatibilidade com o backend.",
        type: "error"
      });
    } finally {
      setSaving(false);
    }
  };

  const renderRow = (row: CorrectiveK2ORowForm, index: number) => (
    <Box
      key={row.localId}
      borderWidth="1px"
      borderRadius="md"
      borderColor="gray.200"
      bg="gray.50"
      _dark={{ bg: "gray.700", borderColor: "gray.600" }}
      p={4}
    >
      <HStack justify="space-between" mb={4} align="center">
        <Text fontWeight="semibold" color="green.700" _dark={{ color: "green.300" }}>
          Linha {index + 1}
        </Text>
      </HStack>

      <Grid templateColumns={{ base: "1fr", md: "repeat(5, 1fr)" }} gap={4}>
        <Field.Root>
          <Field.Label fontSize="xs">CTC mínima - mmolc/dm³</Field.Label>
          <Input size="sm" type="number" step="0.01" value={row.ctc_minima} onChange={(event) => handleChange(row.localId, "ctc_minima", event.target.value)} readOnly={isReadOnly} bg="white" _dark={{ bg: "gray.800" }} />
        </Field.Root>
        <Field.Root>
          <Field.Label fontSize="xs">CTC máxima - mmolc/dm³</Field.Label>
          <Input size="sm" type="number" step="0.01" value={row.ctc_maxima} onChange={(event) => handleChange(row.localId, "ctc_maxima", event.target.value)} readOnly={isReadOnly} bg="white" _dark={{ bg: "gray.800" }} />
        </Field.Root>
        <Field.Root>
          <Field.Label fontSize="xs">K+ mínimo - mmolc/dm³</Field.Label>
          <Input size="sm" type="number" step="0.01" value={row.k_minimo} onChange={(event) => handleChange(row.localId, "k_minimo", event.target.value)} readOnly={isReadOnly} bg="white" _dark={{ bg: "gray.800" }} />
        </Field.Root>
        <Field.Root>
          <Field.Label fontSize="xs">K+ máximo - mmolc/dm³</Field.Label>
          <Input size="sm" type="number" step="0.01" value={row.k_maximo} onChange={(event) => handleChange(row.localId, "k_maximo", event.target.value)} readOnly={isReadOnly} bg="white" _dark={{ bg: "gray.800" }} />
        </Field.Root>
        <Field.Root required>
          <Field.Label fontSize="xs">Dose K2O - kg/ha</Field.Label>
          <Input size="sm" type="number" step="0.01" value={row.dose_k2o} onChange={(event) => handleChange(row.localId, "dose_k2o", event.target.value)} readOnly={isReadOnly} bg="white" _dark={{ bg: "gray.800" }} />
        </Field.Root>
      </Grid>

      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4} mt={4}>
        <Field.Root>
          <Field.Label fontSize="xs">Observações</Field.Label>
          <Textarea value={row.observacoes} onChange={(event) => handleChange(row.localId, "observacoes", event.target.value)} readOnly={isReadOnly} bg="white" _dark={{ bg: "gray.800" }} />
        </Field.Root>
        <Field.Root>
          <Field.Label fontSize="xs">Fontes</Field.Label>
          <Textarea value={row.fontes} onChange={(event) => handleChange(row.localId, "fontes", event.target.value)} readOnly={isReadOnly} bg="white" _dark={{ bg: "gray.800" }} />
        </Field.Root>
      </Grid>
    </Box>
  );

  return (
    <Dialog.Root open={isOpen} onOpenChange={(event) => !event.open && onClose()} size="xl">
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content bg="white" _dark={{ bg: "gray.800" }} maxW="1100px">
          <Dialog.Header>
            <Dialog.Title>Adubação Corretiva de K₂O</Dialog.Title>
          </Dialog.Header>

          <Dialog.Body>
            {loading ? (
              <Box textAlign="center" py={10}>
                <Spinner size="xl" color="green.500" />
              </Box>
            ) : (
              <VStack align="stretch" gap={4}>
                {!isReadOnly && (
                  <HStack justify="space-between" align="flex-start" flexWrap="wrap">
                    <Text fontSize="sm" color="gray.500" _dark={{ color: "gray.400" }}>
                      Configure faixas por CTC e K+ trocável, conforme contrato do backend.
                    </Text>
                    <HStack flexWrap="wrap">
                      <Button size="sm" colorPalette="red" variant="outline" onClick={removeLastRow} disabled={!rows.length}>
                        Remover última linha
                      </Button>
                      <Button size="sm" colorPalette="green" variant="outline" onClick={addRow}>
                        Adicionar linha
                      </Button>
                    </HStack>
                  </HStack>
                )}
                {rows.length ? rows.map(renderRow) : (
                  <Box borderWidth="1px" borderRadius="md" p={6} textAlign="center" borderColor="gray.200">
                    <Text color="gray.500">Nenhuma linha cadastrada.</Text>
                  </Box>
                )}
              </VStack>
            )}
          </Dialog.Body>

          <Dialog.Footer>
            <Button variant="ghost" onClick={onClose}>
              Fechar
            </Button>
            {!isReadOnly && (
              <Button colorPalette="green" onClick={handleSave} loading={saving} disabled={!rows.length && !removedRowIds.length}>
                Salvar Configuração
              </Button>
            )}
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
