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
  createCtcSaturation,
  getCtcSaturationByTable,
  updateCtcSaturation
} from "@/services/ctcSaturationService";
import {
  CtcSaturationCreateRequestDto,
  CtcSaturationPostRequestDto
} from "@/interfaces/CtcSaturation";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tableId: number | null;
  isReadOnly?: boolean;
}

const INITIAL_STATE = {
  percentual_k_baixo: "",
  percentual_k_medio_menor_teor: "",
  percentual_k_medio_maior_teor: "",
  percentual_k_adequado_menor_teor: "",
  percentual_k_adequado_maior_teor: "",
  percentual_k_alto: "",
  percentual_ca_baixo: "",
  percentual_ca_medio_menor_teor: "",
  percentual_ca_medio_maior_teor: "",
  percentual_ca_adequado_menor_teor: "",
  percentual_ca_adequado_maior_teor: "",
  percentual_ca_alto: "",
  percentual_mg_baixo: "",
  percentual_mg_medio_menor_teor: "",
  percentual_mg_medio_maior_teor: "",
  percentual_mg_adequado_menor_teor: "",
  percentual_mg_adequado_maior_teor: "",
  percentual_mg_alto: "",
  observacoes: "",
  fontes: ""
};

type CtcSaturationForm = typeof INITIAL_STATE;
type CtcSaturationFormKey = keyof CtcSaturationForm;
type NumericCtcSaturationField = Exclude<CtcSaturationFormKey, "observacoes" | "fontes">;

const NUMERIC_FIELDS = Object.keys(INITIAL_STATE).filter(
  (key): key is NumericCtcSaturationField => key !== "observacoes" && key !== "fontes"
);

const FIELD_LABELS = [
  ["Baixo", "baixo"],
  ["Médio (Menor Teor)", "medio_menor_teor"],
  ["Médio (Maior Teor)", "medio_maior_teor"],
  ["Adequado (Menor Teor)", "adequado_menor_teor"],
  ["Adequado (Maior Teor)", "adequado_maior_teor"],
  ["Alto", "alto"]
] as const;

const SECTIONS = [
  { value: "k", label: "% de K+", prefix: "percentual_k" },
  { value: "ca", label: "% de Ca2+", prefix: "percentual_ca" },
  { value: "mg", label: "% de Mg2+", prefix: "percentual_mg" }
] as const;

const parseNumber = (value: string) => {
  if (!value) return 0;
  return parseFloat(value.replace(",", ".")) || 0;
};

export default function CtcSaturationModal({ isOpen, onClose, tableId, isReadOnly = false }: Props) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [existingId, setExistingId] = useState<number | null>(null);
  const [form, setForm] = useState<CtcSaturationForm>(INITIAL_STATE);

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
      const data = await getCtcSaturationByTable(tableId!);
      if (data) {
        const newForm: CtcSaturationForm = { ...INITIAL_STATE };
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
      toaster.create({ title: "Erro ao carregar Saturação na CTC(T).", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: CtcSaturationFormKey, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const buildCreatePayload = (): CtcSaturationCreateRequestDto => {
    const payload = {} as CtcSaturationCreateRequestDto;
    NUMERIC_FIELDS.forEach((key) => {
      payload[key] = parseNumber(form[key]);
    });
    payload.observacoes = form.observacoes;
    payload.fontes = form.fontes;
    return payload;
  };

  const buildUpdatePayload = (): CtcSaturationPostRequestDto => {
    const payload: CtcSaturationPostRequestDto = {};
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
        await updateCtcSaturation(existingId, buildUpdatePayload());
        toaster.create({ title: "Saturação na CTC(T) atualizada!", type: "success" });
      } else {
        await createCtcSaturation(tableId!, buildCreatePayload());
        toaster.create({ title: "Saturação na CTC(T) configurada!", type: "success" });
      }
      onClose();
    } catch (error) {
      console.error(error);
      toaster.create({ title: "Erro ao salvar Saturação na CTC(T).", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const renderSection = (prefix: (typeof SECTIONS)[number]["prefix"]) => (
    <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={4} mt={4}>
      {FIELD_LABELS.map(([label, suffix]) => {
        const key = `${prefix}_${suffix}` as CtcSaturationFormKey;
        return (
          <Field.Root key={key}>
            <Field.Label fontSize="xs" color="gray.600" _dark={{ color: "gray.300" }}>
              {label}
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
        <Dialog.Content bg="white" _dark={{ bg: "gray.800" }} maxW="850px">
          <Dialog.Header>
            <Dialog.Title>Saturação na CTC(T), em %</Dialog.Title>
          </Dialog.Header>

          <Dialog.Body>
            {loading ? (
              <Box textAlign="center" py={10}>
                <Spinner size="xl" color="green.500" />
              </Box>
            ) : (
              <>
                <Text fontSize="sm" color="gray.500" _dark={{ color: "gray.400" }} mb={4}>
                  Unidade: %
                </Text>

                <Tabs.Root defaultValue="k" variant="enclosed">
                  <Tabs.List>
                    {SECTIONS.map((section) => (
                      <Tabs.Trigger key={section.value} value={section.value}>
                        {section.label}
                      </Tabs.Trigger>
                    ))}
                  </Tabs.List>

                  {SECTIONS.map((section) => (
                    <Tabs.Content key={section.value} value={section.value}>
                      {renderSection(section.prefix)}
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
