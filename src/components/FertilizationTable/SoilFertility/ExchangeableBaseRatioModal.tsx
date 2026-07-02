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
  createExchangeableBaseRatio,
  getExchangeableBaseRatioByTable,
  updateExchangeableBaseRatio
} from "@/services/exchangeableBaseRatioService";
import {
  ExchangeableBaseRatioCreateRequestDto,
  ExchangeableBaseRatioPostRequestDto
} from "@/interfaces/ExchangeableBaseRatio";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tableId: number | null;
  isReadOnly?: boolean;
}

const INITIAL_STATE = {
  relacao_ca_mg_baixo: "",
  relacao_ca_mg_medio_menor_relacao: "",
  relacao_ca_mg_medio_maior_relacao: "",
  relacao_ca_mg_adequado_menor_relacao: "",
  relacao_ca_mg_adequado_maior_relacao: "",
  relacao_ca_mg_alto: "",
  relacao_ca_k_baixo: "",
  relacao_ca_k_medio_menor_relacao: "",
  relacao_ca_k_medio_maior_relacao: "",
  relacao_ca_k_adequado_menor_relacao: "",
  relacao_ca_k_adequado_maior_relacao: "",
  relacao_ca_k_alto: "",
  relacao_mg_k_baixo: "",
  relacao_mg_k_medio_menor_relacao: "",
  relacao_mg_k_medio_maior_relacao: "",
  relacao_mg_k_adequado_menor_relacao: "",
  relacao_mg_k_adequado_maior_relacao: "",
  relacao_mg_k_alto: "",
  relacao_ca_mg_sobre_k_baixo: "",
  relacao_ca_mg_sobre_k_medio_menor_relacao: "",
  relacao_ca_mg_sobre_k_medio_maior_relacao: "",
  relacao_ca_mg_sobre_k_adequado_menor_relacao: "",
  relacao_ca_mg_sobre_k_adequado_maior_relacao: "",
  relacao_ca_mg_sobre_k_alto: "",
  observacoes: "",
  fontes: ""
};

type ExchangeableBaseRatioForm = typeof INITIAL_STATE;
type ExchangeableBaseRatioFormKey = keyof ExchangeableBaseRatioForm;
type NumericExchangeableBaseRatioField = Exclude<ExchangeableBaseRatioFormKey, "observacoes" | "fontes">;

const NUMERIC_FIELDS = Object.keys(INITIAL_STATE).filter(
  (key): key is NumericExchangeableBaseRatioField => key !== "observacoes" && key !== "fontes"
);

const FIELD_LABELS = [
  ["Baixo", "baixo"],
  ["Médio (Menor Relação)", "medio_menor_relacao"],
  ["Médio (Maior Relação)", "medio_maior_relacao"],
  ["Adequado (Menor Relação)", "adequado_menor_relacao"],
  ["Adequado (Maior Relação)", "adequado_maior_relacao"],
  ["Alto", "alto"]
] as const;

const SECTIONS = [
  { value: "ca_mg", label: "Relação Ca/Mg", prefix: "relacao_ca_mg" },
  { value: "ca_k", label: "Relação Ca/K", prefix: "relacao_ca_k" },
  { value: "mg_k", label: "Relação Mg/K", prefix: "relacao_mg_k" },
  { value: "ca_mg_k", label: "Relação (Ca + Mg)/K", prefix: "relacao_ca_mg_sobre_k" }
] as const;

const parseNumber = (value: string) => {
  if (!value) return 0;
  return parseFloat(value.replace(",", ".")) || 0;
};

export default function ExchangeableBaseRatioModal({ isOpen, onClose, tableId, isReadOnly = false }: Props) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [existingId, setExistingId] = useState<number | null>(null);
  const [form, setForm] = useState<ExchangeableBaseRatioForm>(INITIAL_STATE);

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
      const data = await getExchangeableBaseRatioByTable(tableId!);
      if (data) {
        const newForm: ExchangeableBaseRatioForm = { ...INITIAL_STATE };
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
      toaster.create({ title: "Erro ao carregar Relações entre bases trocáveis.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: ExchangeableBaseRatioFormKey, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const buildCreatePayload = (): ExchangeableBaseRatioCreateRequestDto => {
    const payload = {} as ExchangeableBaseRatioCreateRequestDto;
    NUMERIC_FIELDS.forEach((key) => {
      payload[key] = parseNumber(form[key]);
    });
    payload.observacoes = form.observacoes;
    payload.fontes = form.fontes;
    return payload;
  };

  const buildUpdatePayload = (): ExchangeableBaseRatioPostRequestDto => {
    const payload: ExchangeableBaseRatioPostRequestDto = {};
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
        await updateExchangeableBaseRatio(existingId, buildUpdatePayload());
        toaster.create({ title: "Relações entre bases atualizadas!", type: "success" });
      } else {
        await createExchangeableBaseRatio(tableId!, buildCreatePayload());
        toaster.create({ title: "Relações entre bases configuradas!", type: "success" });
      }
      onClose();
    } catch (error) {
      console.error(error);
      toaster.create({ title: "Erro ao salvar Relações entre bases trocáveis.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const renderSection = (prefix: (typeof SECTIONS)[number]["prefix"]) => (
    <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={4} mt={4}>
      {FIELD_LABELS.map(([label, suffix]) => {
        const key = `${prefix}_${suffix}` as ExchangeableBaseRatioFormKey;
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
            <Dialog.Title>Relações entre bases trocáveis</Dialog.Title>
          </Dialog.Header>

          <Dialog.Body>
            {loading ? (
              <Box textAlign="center" py={10}>
                <Spinner size="xl" color="green.500" />
              </Box>
            ) : (
              <>
                <Text fontSize="sm" color="gray.500" _dark={{ color: "gray.400" }} mb={4}>
                  Unidade: adimensional
                </Text>

                <Tabs.Root defaultValue="ca_mg" variant="enclosed">
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
