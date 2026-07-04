import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  Field,
  Grid,
  Input,
  Spinner,
  Tabs,
  Text,
  Textarea
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import {
  createPotassiumContentAndDose,
  getPotassiumContentAndDoseByTable,
  updatePotassiumContentAndDose
} from "@/services/potassiumContentAndDoseService";
import {
  PotassiumContentAndDoseCreateRequestDto,
  PotassiumContentAndDosePostRequestDto
} from "@/interfaces/PotassiumContentAndDose";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tableId: number | null;
  isReadOnly?: boolean;
}

const INITIAL_STATE = {
  teor_baixo_menor_ctc_menor_40: "",
  dose_teor_baixo_ctc_menor_40: "",
  medio_menor_teor_ctc_menor_40: "",
  medio_maior_teor_ctc_menor_40: "",
  dose_teor_medio_ctc_menor_40: "",
  adequado_menor_teor_ctc_menor_40: "",
  adequado_maior_teor_ctc_menor_40: "",
  dose_teor_adequado_ctc_menor_40: "",
  teor_alto_maior_ctc_menor_40: "",
  dose_teor_alto_ctc_menor_40: "",
  teor_baixo_menor_ctc_maior_igual_40: "",
  dose_teor_baixo_ctc_maior_igual_40: "",
  medio_menor_teor_ctc_maior_igual_40: "",
  medio_maior_teor_ctc_maior_igual_40: "",
  dose_teor_medio_ctc_maior_igual_40: "",
  adequado_menor_teor_ctc_maior_igual_40: "",
  adequado_maior_teor_ctc_maior_igual_40: "",
  dose_teor_adequado_ctc_maior_igual_40: "",
  teor_alto_maior_ctc_maior_igual_40: "",
  dose_teor_alto_ctc_maior_igual_40: "",
  observacoes: "",
  fontes: ""
};

type PotassiumContentAndDoseForm = typeof INITIAL_STATE;
type PotassiumContentAndDoseFormKey = keyof PotassiumContentAndDoseForm;
type NumericPotassiumContentAndDoseField = Exclude<PotassiumContentAndDoseFormKey, "observacoes" | "fontes">;
type CtcSection = "ctc_menor_40" | "ctc_maior_igual_40";

const NUMERIC_FIELDS = Object.keys(INITIAL_STATE).filter(
  (key): key is NumericPotassiumContentAndDoseField => key !== "observacoes" && key !== "fontes"
);

const FIELD_LABELS = [
  { label: "Teor Baixo (Menor que)", unit: "mmolc/dm³", prefix: "teor_baixo_menor" },
  { label: "Dose para Teor Baixo", unit: "kg/ha", prefix: "dose_teor_baixo" },
  { label: "Médio (Menor Teor)", unit: "mmolc/dm³", prefix: "medio_menor_teor" },
  { label: "Médio (Maior Teor)", unit: "mmolc/dm³", prefix: "medio_maior_teor" },
  { label: "Dose para Teor Médio", unit: "kg/ha", prefix: "dose_teor_medio" },
  { label: "Adequado (Menor Teor)", unit: "mmolc/dm³", prefix: "adequado_menor_teor" },
  { label: "Adequado (Maior Teor)", unit: "mmolc/dm³", prefix: "adequado_maior_teor" },
  { label: "Dose para Teor Adequado", unit: "kg/ha", prefix: "dose_teor_adequado" },
  { label: "Teor Alto (Maior que)", unit: "mmolc/dm³", prefix: "teor_alto_maior" },
  { label: "Dose para Teor Alto", unit: "kg/ha", prefix: "dose_teor_alto" }
] as const;

const SECTIONS = [
  {
    value: "ctc_menor_40",
    label: "CTC a pH 7.0 < 40 mmolc/dm³",
    description: "CTC a pH 7.0 menor do que 40 mmolc/dm³"
  },
  {
    value: "ctc_maior_igual_40",
    label: "CTC a pH 7.0 >= 40 mmolc/dm³",
    description: "CTC a pH 7.0 igual ou maior que 40 mmolc/dm³"
  }
] as const satisfies readonly { value: CtcSection; label: string; description: string }[];

const parseNumber = (value: string) => {
  if (!value) return 0;
  return parseFloat(value.replace(",", ".")) || 0;
};

export default function PotassiumContentAndDoseModal({ isOpen, onClose, tableId, isReadOnly = false }: Props) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [existingId, setExistingId] = useState<number | null>(null);
  const [form, setForm] = useState<PotassiumContentAndDoseForm>(INITIAL_STATE);

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
      const data = await getPotassiumContentAndDoseByTable(tableId!);
      if (data) {
        const newForm: PotassiumContentAndDoseForm = { ...INITIAL_STATE };
        NUMERIC_FIELDS.forEach((key) => {
          const value = data[key];
          newForm[key] = value !== null && value !== undefined ? String(value) : "";
        });
        newForm.observacoes = data.observacoes ?? "";
        newForm.fontes = data.fontes ?? "";
        setExistingId(data.id);
        setForm(newForm);
      } else {
        setExistingId(null);
        setForm(INITIAL_STATE);
      }
    } catch (error) {
      console.error(error);
      toaster.create({ title: "Erro ao carregar Teores e Doses de K.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: PotassiumContentAndDoseFormKey, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const buildCreatePayload = (): PotassiumContentAndDoseCreateRequestDto => {
    const payload = {} as PotassiumContentAndDoseCreateRequestDto;
    NUMERIC_FIELDS.forEach((key) => {
      payload[key] = parseNumber(form[key]);
    });
    payload.observacoes = form.observacoes;
    payload.fontes = form.fontes;
    return payload;
  };

  const buildUpdatePayload = (): PotassiumContentAndDosePostRequestDto => {
    const payload: PotassiumContentAndDosePostRequestDto = {};
    NUMERIC_FIELDS.forEach((key) => {
      payload[`novo_${key}`] = parseNumber(form[key]);
    });
    payload.novo_observacoes = form.observacoes;
    payload.novo_fontes = form.fontes;
    return payload;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (existingId) {
        await updatePotassiumContentAndDose(existingId, buildUpdatePayload());
        toaster.create({ title: "Teores e Doses de K atualizados!", type: "success" });
      } else {
        await createPotassiumContentAndDose(tableId!, buildCreatePayload());
        toaster.create({ title: "Teores e Doses de K configurados!", type: "success" });
      }
      onClose();
    } catch (error) {
      console.error(error);
      toaster.create({ title: "Erro ao salvar Teores e Doses de K.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const renderSection = (section: CtcSection) => (
    <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={4} mt={4}>
      {FIELD_LABELS.map((field) => {
        const key = `${field.prefix}_${section}` as NumericPotassiumContentAndDoseField;
        return (
          <Field.Root key={key}>
            <Field.Label fontSize="xs" color="gray.600" _dark={{ color: "gray.300" }}>
              {field.label} - {field.unit}
            </Field.Label>
            <Input
              size="sm"
              type="number"
              step="0.01"
              value={form[key]}
              onChange={(event) => handleChange(key, event.target.value)}
              readOnly={isReadOnly}
              bg="white"
              borderColor="gray.300"
              _dark={{ bg: "gray.700", borderColor: "gray.500" }}
            />
          </Field.Root>
        );
      })}
    </Grid>
  );

  return (
    <Dialog.Root open={isOpen} onOpenChange={(event) => !event.open && onClose()} size="xl">
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content bg="white" _dark={{ bg: "gray.800" }} maxW="900px">
          <Dialog.Header>
            <Dialog.Title>Teores e Doses de K</Dialog.Title>
          </Dialog.Header>

          <Dialog.Body>
            {loading ? (
              <Box textAlign="center" py={10}>
                <Spinner size="xl" color="green.500" />
              </Box>
            ) : (
              <>
                <Tabs.Root defaultValue="ctc_menor_40" variant="enclosed">
                  <Tabs.List>
                    {SECTIONS.map((section) => (
                      <Tabs.Trigger key={section.value} value={section.value}>
                        {section.label}
                      </Tabs.Trigger>
                    ))}
                  </Tabs.List>

                  {SECTIONS.map((section) => (
                    <Tabs.Content key={section.value} value={section.value}>
                      <Text fontSize="sm" color="gray.500" _dark={{ color: "gray.400" }} mb={2}>
                        {section.description}
                      </Text>
                      {renderSection(section.value)}
                    </Tabs.Content>
                  ))}
                </Tabs.Root>

                <Grid templateColumns={{ base: "1fr" }} gap={4} mt={6}>
                  <Field.Root>
                    <Field.Label>Observações</Field.Label>
                    <Textarea
                      value={form.observacoes}
                      onChange={(event) => handleChange("observacoes", event.target.value)}
                      readOnly={isReadOnly}
                      minH="100px"
                      bg="white"
                      _dark={{ bg: "gray.700" }}
                    />
                  </Field.Root>

                  <Field.Root>
                    <Field.Label>Fontes</Field.Label>
                    <Textarea
                      value={form.fontes}
                      onChange={(event) => handleChange("fontes", event.target.value)}
                      readOnly={isReadOnly}
                      minH="100px"
                      bg="white"
                      _dark={{ bg: "gray.700" }}
                    />
                  </Field.Root>
                </Grid>
              </>
            )}
          </Dialog.Body>

          <Dialog.Footer>
            <Button variant="ghost" onClick={onClose}>
              Fechar
            </Button>
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
