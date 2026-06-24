import { useEffect, useState } from "react";
import { Dialog, Button, Input, Text, Grid, Box, Spinner, Field, Tabs } from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import {
  createExchangeableSodium,
  getExchangeableSodiumByTable,
  updateExchangeableSodium
} from "@/services/exchangeableSodiumService";
import {
  ExchangeableSodiumCreateRequestDto,
  ExchangeableSodiumPostRequestDto
} from "@/interfaces/ExchangeableSodium";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tableId: number | null;
  isReadOnly?: boolean;
}

const CTC_SECTIONS = [
  { value: "ctc_menor_4_3", tab: "CTC < 4,3", description: "CTC (T) < 4,3 mmolc/dm³" },
  { value: "ctc_4_3_a_8_6", tab: "4,3 a 8,6", description: "CTC (T) de 4,3 a 8,6 mmolc/dm³" },
  { value: "ctc_8_7_a_15_0", tab: "8,7 a 15,0", description: "CTC (T) de 8,7 a 15,0 mmolc/dm³" },
  { value: "ctc_maior_15", tab: "CTC > 15", description: "CTC (T) > 15 mmolc/dm³" },
] as const;

const FIELD_PREFIXES = [
  "menor_teor",
  "teor_inicial_baixo",
  "teor_final_baixo",
  "teor_inicial_medio",
  "teor_final_medio",
  "teor_inicial_alto",
  "teor_final_alto",
  "maior_teor",
] as const;

const INITIAL_STATE = CTC_SECTIONS.reduce<Record<string, string>>((acc, section) => {
  FIELD_PREFIXES.forEach((prefix) => {
    acc[`${prefix}_sodio_${section.value}`] = "";
  });
  return acc;
}, {});

export default function ExchangeableSodiumModal({ isOpen, onClose, tableId, isReadOnly = false }: Props) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [existingId, setExistingId] = useState<number | null>(null);
  const [form, setForm] = useState<Record<string, string>>(INITIAL_STATE);

  useEffect(() => {
    if (isOpen && tableId) {
      fetchData();
    } else {
      setExistingId(null);
      setForm(INITIAL_STATE);
    }
  }, [isOpen, tableId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getExchangeableSodiumByTable(tableId!);
      if (data) {
        setExistingId(data.id);
        const newForm: Record<string, string> = {};
        Object.keys(INITIAL_STATE).forEach((key) => {
          const value = data[key as keyof typeof data];
          newForm[key] = value !== null && value !== undefined ? String(value) : "";
        });
        setForm(newForm);
      } else {
        setExistingId(null);
        setForm(INITIAL_STATE);
      }
    } catch (error) {
      console.error(error);
      toaster.create({ title: "Erro ao carregar sódio trocável.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const parse = (value: string) => {
    if (!value) return 0;
    return parseFloat(value.replace(',', '.')) || 0;
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (existingId) {
        const payload: Record<string, number> = {};
        Object.keys(form).forEach((key) => {
          payload[`novo_${key}`] = parse(form[key]);
        });
        await updateExchangeableSodium(existingId, payload as ExchangeableSodiumPostRequestDto);
        toaster.create({ title: "Sódio trocável atualizado!", type: "success" });
      } else {
        const payload: Record<string, number> = {};
        Object.keys(INITIAL_STATE).forEach((key) => {
          payload[key] = parse(form[key] || "0");
        });
        await createExchangeableSodium(tableId!, payload as ExchangeableSodiumCreateRequestDto);
        toaster.create({ title: "Sódio trocável configurado!", type: "success" });
        onClose();
      }
    } catch (error) {
      console.error(error);
      toaster.create({ title: "Erro ao salvar.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const renderCtcInputs = (suffix: string) => {
    const fields = [
      { label: "Muito Baixo (Menor que)", key: `menor_teor_sodio_${suffix}` },
      { label: "Baixo (Menor Teor)", key: `teor_inicial_baixo_sodio_${suffix}` },
      { label: "Baixo (Maior Teor)", key: `teor_final_baixo_sodio_${suffix}` },
      { label: "Médio (Menor Teor)", key: `teor_inicial_medio_sodio_${suffix}` },
      { label: "Médio (Maior Teor)", key: `teor_final_medio_sodio_${suffix}` },
      { label: "Alto (Menor Teor)", key: `teor_inicial_alto_sodio_${suffix}` },
      { label: "Alto (Maior Teor)", key: `teor_final_alto_sodio_${suffix}` },
      { label: "Muito Alto (Maior que)", key: `maior_teor_sodio_${suffix}` },
    ];

    return (
      <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={4} mt={4}>
        {fields.map((field) => (
          <Field.Root key={field.key}>
            <Field.Label fontSize="xs" color="gray.600" _dark={{ color: "gray.300" }}>
              {field.label}
            </Field.Label>
            <Input
              size="sm"
              type="number"
              step="0.01"
              value={form[field.key] || ""}
              onChange={(event) => handleChange(field.key, event.target.value)}
              readOnly={isReadOnly}
              bg="white"
              borderColor="gray.300"
              _dark={{ bg: "gray.700", borderColor: "gray.500" }}
            />
          </Field.Root>
        ))}
      </Grid>
    );
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(event) => !event.open && onClose()} size="xl">
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content bg="white" _dark={{ bg: "gray.800" }} maxW="800px">
          <Dialog.Header>
            <Dialog.Title>Sódio Trocável (mmolc/dm³)</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            {loading ? (
              <Box textAlign="center" py={10}><Spinner size="xl" color="green.500" /></Box>
            ) : (
              <Tabs.Root defaultValue={CTC_SECTIONS[0].value} variant="enclosed">
                <Tabs.List>
                  {CTC_SECTIONS.map((section) => (
                    <Tabs.Trigger key={section.value} value={section.value}>{section.tab}</Tabs.Trigger>
                  ))}
                </Tabs.List>
                {CTC_SECTIONS.map((section) => (
                  <Tabs.Content key={section.value} value={section.value}>
                    <Text fontSize="sm" color="gray.500" _dark={{ color: "gray.400" }} mb={2}>
                      {section.description}
                    </Text>
                    {renderCtcInputs(section.value)}
                  </Tabs.Content>
                ))}
              </Tabs.Root>
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
