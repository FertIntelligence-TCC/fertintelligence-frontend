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
  createCorrectiveP2O5Fertilization,
  getCorrectiveP2O5FertilizationByTable,
  updateCorrectiveP2O5Fertilization
} from "@/services/correctiveP2O5FertilizationService";
import {
  CorrectiveP2O5FertilizationCreateRequestDto,
  CorrectiveP2O5FertilizationPostRequestDto,
  CorrectiveP2O5FertilizationResponseDto
} from "@/interfaces/CorrectiveP2O5Fertilization";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tableId: number | null;
  isReadOnly?: boolean;
}

interface CorrectiveP2O5RowForm {
  localId: string;
  id: number | null;
  argila_minima: string;
  argila_maxima: string;
  p_mehlich_minimo: string;
  p_mehlich_maximo: string;
  dose_p2o5: string;
  observacoes: string;
  fontes: string;
}

type CorrectiveP2O5RowField = Exclude<keyof CorrectiveP2O5RowForm, "localId" | "id">;

const createEmptyRow = (): CorrectiveP2O5RowForm => ({
  localId: crypto.randomUUID(),
  id: null,
  argila_minima: "",
  argila_maxima: "",
  p_mehlich_minimo: "",
  p_mehlich_maximo: "",
  dose_p2o5: "",
  observacoes: "",
  fontes: ""
});

const toFormRow = (row: CorrectiveP2O5FertilizationResponseDto): CorrectiveP2O5RowForm => ({
  localId: String(row.id),
  id: row.id,
  argila_minima: row.argila_minima !== null && row.argila_minima !== undefined ? String(row.argila_minima) : "",
  argila_maxima: row.argila_maxima !== null && row.argila_maxima !== undefined ? String(row.argila_maxima) : "",
  p_mehlich_minimo: row.p_mehlich_minimo !== null && row.p_mehlich_minimo !== undefined ? String(row.p_mehlich_minimo) : "",
  p_mehlich_maximo: row.p_mehlich_maximo !== null && row.p_mehlich_maximo !== undefined ? String(row.p_mehlich_maximo) : "",
  dose_p2o5: row.dose_p2o5 !== null && row.dose_p2o5 !== undefined ? String(row.dose_p2o5) : "",
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

export default function CorrectiveP2O5FertilizationModal({
  isOpen,
  onClose,
  tableId,
  isReadOnly = false
}: Props) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState<CorrectiveP2O5RowForm[]>([]);

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
      const data = await getCorrectiveP2O5FertilizationByTable(tableId!);
      setRows(data.map(toFormRow));
    } catch (error) {
      console.error(error);
      toaster.create({
        title: "Erro ao carregar Adubação Corretiva de P2O5.",
        description: "Verifique se o endpoint backend desta tabela auxiliar está disponível.",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (localId: string, field: CorrectiveP2O5RowField, value: string) => {
    setRows((prev) => prev.map((row) => (row.localId === localId ? { ...row, [field]: value } : row)));
  };

  const addRow = () => {
    setRows((prev) => [...prev, createEmptyRow()]);
  };

  const removeUnsavedRow = (localId: string) => {
    setRows((prev) => prev.filter((row) => row.localId !== localId || row.id));
  };

  const buildCreatePayload = (row: CorrectiveP2O5RowForm): CorrectiveP2O5FertilizationCreateRequestDto => ({
    argila_minima: parseOptionalNumber(row.argila_minima),
    argila_maxima: parseOptionalNumber(row.argila_maxima),
    p_mehlich_minimo: parseOptionalNumber(row.p_mehlich_minimo),
    p_mehlich_maximo: parseOptionalNumber(row.p_mehlich_maximo),
    dose_p2o5: parseRequiredNumber(row.dose_p2o5),
    observacoes: row.observacoes,
    fontes: row.fontes
  });

  const buildUpdatePayload = (row: CorrectiveP2O5RowForm): CorrectiveP2O5FertilizationPostRequestDto => ({
    nova_argila_minima: parseOptionalNumber(row.argila_minima),
    nova_argila_maxima: parseOptionalNumber(row.argila_maxima),
    novo_p_mehlich_minimo: parseOptionalNumber(row.p_mehlich_minimo),
    novo_p_mehlich_maximo: parseOptionalNumber(row.p_mehlich_maximo),
    nova_dose_p2o5: parseRequiredNumber(row.dose_p2o5),
    novo_observacoes: row.observacoes,
    novo_fontes: row.fontes
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all(
        rows.map((row) =>
          row.id
            ? updateCorrectiveP2O5Fertilization(row.id, buildUpdatePayload(row))
            : createCorrectiveP2O5Fertilization(tableId!, buildCreatePayload(row))
        )
      );
      toaster.create({ title: "Adubação Corretiva de P2O5 salva!", type: "success" });
      await fetchData();
    } catch (error) {
      console.error(error);
      toaster.create({
        title: "Erro ao salvar Adubação Corretiva de P2O5.",
        description: "O frontend enviou o contrato disponível; confirme compatibilidade com o backend.",
        type: "error"
      });
    } finally {
      setSaving(false);
    }
  };

  const renderRow = (row: CorrectiveP2O5RowForm, index: number) => (
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
        {!isReadOnly && !row.id && (
          <Button size="xs" variant="ghost" colorPalette="red" onClick={() => removeUnsavedRow(row.localId)}>
            Remover
          </Button>
        )}
      </HStack>

      <Grid templateColumns={{ base: "1fr", md: "repeat(5, 1fr)" }} gap={4}>
        <Field.Root>
          <Field.Label fontSize="xs">Argila mínima - g/kg</Field.Label>
          <Input size="sm" type="number" step="0.01" value={row.argila_minima} onChange={(event) => handleChange(row.localId, "argila_minima", event.target.value)} readOnly={isReadOnly} bg="white" _dark={{ bg: "gray.800" }} />
        </Field.Root>
        <Field.Root>
          <Field.Label fontSize="xs">Argila máxima - g/kg</Field.Label>
          <Input size="sm" type="number" step="0.01" value={row.argila_maxima} onChange={(event) => handleChange(row.localId, "argila_maxima", event.target.value)} readOnly={isReadOnly} bg="white" _dark={{ bg: "gray.800" }} />
        </Field.Root>
        <Field.Root>
          <Field.Label fontSize="xs">P Mehlich-1 mínimo - mg/dm³</Field.Label>
          <Input size="sm" type="number" step="0.01" value={row.p_mehlich_minimo} onChange={(event) => handleChange(row.localId, "p_mehlich_minimo", event.target.value)} readOnly={isReadOnly} bg="white" _dark={{ bg: "gray.800" }} />
        </Field.Root>
        <Field.Root>
          <Field.Label fontSize="xs">P Mehlich-1 máximo - mg/dm³</Field.Label>
          <Input size="sm" type="number" step="0.01" value={row.p_mehlich_maximo} onChange={(event) => handleChange(row.localId, "p_mehlich_maximo", event.target.value)} readOnly={isReadOnly} bg="white" _dark={{ bg: "gray.800" }} />
        </Field.Root>
        <Field.Root required>
          <Field.Label fontSize="xs">Dose P2O5 - kg/ha</Field.Label>
          <Input size="sm" type="number" step="0.01" value={row.dose_p2o5} onChange={(event) => handleChange(row.localId, "dose_p2o5", event.target.value)} readOnly={isReadOnly} bg="white" _dark={{ bg: "gray.800" }} />
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
            <Dialog.Title>Adubação Corretiva de P2O5</Dialog.Title>
          </Dialog.Header>

          <Dialog.Body>
            {loading ? (
              <Box textAlign="center" py={10}>
                <Spinner size="xl" color="green.500" />
              </Box>
            ) : (
              <VStack align="stretch" gap={4}>
                {!isReadOnly && (
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.500" _dark={{ color: "gray.400" }}>
                      Configure faixas por teor de argila e P disponível Mehlich-1.
                    </Text>
                    <Button size="sm" colorPalette="green" variant="outline" onClick={addRow}>
                      Adicionar linha
                    </Button>
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
              <Button colorPalette="green" onClick={handleSave} loading={saving} disabled={!rows.length}>
                Salvar Configuração
              </Button>
            )}
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
