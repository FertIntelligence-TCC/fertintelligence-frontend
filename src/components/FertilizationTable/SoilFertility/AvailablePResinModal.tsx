import { useEffect, useState } from "react";
import {
  Dialog,
  Button,
  Input,
  Grid,
  Box,
  Spinner,
  Field,
  Text
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import {
  getAvailablePResinByTable,
  createAvailablePResin,
  updateAvailablePResin
} from "@/services/availablePResinService";
import {
  AvailablePResinCreateRequestDto,
  AvailablePResinPostRequestDto
} from "@/interfaces/AvailablePResin";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tableId: number | null;
  isReadOnly?: boolean;
}

const INITIAL_STATE = {
  muito_baixo: "",
  baixo_menor: "",
  baixo_maior: "",
  medio_menor: "",
  medio_maior: "",
  alto_menor: "",
  alto_maior: "",
  muito_alto: ""
};

const FIELDS = [
  { label: "Muito Baixo", key: "muito_baixo" },
  { label: "Baixo Menor", key: "baixo_menor" },
  { label: "Baixo Maior", key: "baixo_maior" },
  { label: "Médio Menor", key: "medio_menor" },
  { label: "Médio Maior", key: "medio_maior" },
  { label: "Alto Menor", key: "alto_menor" },
  { label: "Alto Maior", key: "alto_maior" },
  { label: "Muito Alto", key: "muito_alto" }
] as const;

const UNIT = "mg/dm³";

export default function AvailablePResinModal({ isOpen, onClose, tableId, isReadOnly = false }: Props) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [existingId, setExistingId] = useState<number | null>(null);
  const [form, setForm] = useState(INITIAL_STATE);

  useEffect(() => {
    if (isOpen && tableId) {
      fetchData();
    } else {
      setForm(INITIAL_STATE);
      setExistingId(null);
    }
  }, [isOpen, tableId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getAvailablePResinByTable(tableId!);
      if (data) {
        setExistingId(data.id);

        const newForm = { ...INITIAL_STATE };
        FIELDS.forEach((field) => {
          newForm[field.key] = data[field.key] !== null && data[field.key] !== undefined ? String(data[field.key]) : "";
        });
        setForm(newForm);
      } else {
        setExistingId(null);
        setForm(INITIAL_STATE);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: keyof typeof INITIAL_STATE, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const parse = (val: string) => {
    if (!val) return 0;
    return parseFloat(val.replace(',', '.')) || 0;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (existingId) {
        const payload: AvailablePResinPostRequestDto = {};
        FIELDS.forEach((field) => {
          payload[`novo_${field.key}`] = parse(form[field.key]);
        });
        await updateAvailablePResin(existingId, payload);
        toaster.create({ title: "Fósforo (Resina) atualizado!", type: "success" });
      } else {
        const payload = {} as AvailablePResinCreateRequestDto;
        FIELDS.forEach((field) => {
          payload[field.key] = parse(form[field.key]);
        });

        await createAvailablePResin(tableId!, payload);
        toaster.create({ title: "Fósforo (Resina) configurado!", type: "success" });
        onClose();
      }
    } catch (error) {
      console.error(error);
      toaster.create({ title: "Erro ao salvar.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const renderInputs = () => (
    <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={4} mt={4}>
      {FIELDS.map((field) => (
        <Field.Root key={field.key}>
          <Field.Label fontSize="xs" color="gray.600" _dark={{ color: "gray.300" }}>
            {field.label} ({UNIT})
          </Field.Label>
          <Input
            size="sm"
            type="number"
            step="0.01"
            value={form[field.key]}
            onChange={(e) => handleChange(field.key, e.target.value)}
            readOnly={isReadOnly}
            bg="white"
            borderColor="gray.300"
            _dark={{ bg: "gray.700", borderColor: "gray.500" }}
          />
        </Field.Root>
      ))}
    </Grid>
  );

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()} size="xl">
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content bg="white" _dark={{ bg: "gray.800" }} maxW="800px">
          <Dialog.Header>
            <Dialog.Title>Fósforo Disponível (Extrator Resina) - {UNIT}</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            {loading ? (
              <Box textAlign="center" py={10}><Spinner size="xl" color="green.500" /></Box>
            ) : (
              <Box>
                <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }} mb={3}>
                  Valores gerais para todas as culturas.
                </Text>

                <Box borderWidth="1px" p={4} borderRadius="md" _dark={{ borderColor: "gray.600" }}>
                  <Text fontWeight="bold" color="green.600" _dark={{ color: "green.300" }} fontSize="sm">
                    Unidade: {UNIT}
                  </Text>
                  {renderInputs()}
                </Box>
              </Box>
            )}
          </Dialog.Body>
          <Dialog.Footer>
            <Button variant="ghost" onClick={onClose}>Fechar</Button>
            {!isReadOnly && (
              <Button colorPalette="green" onClick={handleSave} loading={saving}>
                Salvar Configuração
              </Button>
            )}
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
