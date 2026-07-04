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
  createPhosphorusClayContentAndPhosphateDose,
  getPhosphorusClayContentAndPhosphateDoseByTable,
  updatePhosphorusClayContentAndPhosphateDose
} from "@/services/phosphorusClayContentAndPhosphateDoseService";
import {
  PhosphorusClayContentAndPhosphateDoseCreateRequestDto,
  PhosphorusClayContentAndPhosphateDoseNumericField,
  PhosphorusClayContentAndPhosphateDosePostRequestDto,
  PhosphorusClayContentAndPhosphateDoseSystem
} from "@/interfaces/PhosphorusClayContentAndPhosphateDose";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tableId: number | null;
  isReadOnly?: boolean;
}

type FormState = Record<PhosphorusClayContentAndPhosphateDoseNumericField, string> & {
  observacoes: string;
  fontes: string;
};
type FormKey = keyof FormState;

const SYSTEMS = [
  {
    value: "sequeiro",
    label: "Sistemas de sequeiro",
    description: "Critérios aplicados para sistemas de produção em sequeiro."
  },
  {
    value: "irrigado",
    label: "Sistemas irrigados",
    description: "Critérios aplicados para sistemas de produção irrigados."
  }
] as const satisfies readonly {
  value: PhosphorusClayContentAndPhosphateDoseSystem;
  label: string;
  description: string;
}[];

const CLAY_BOUNDARIES = [
  { key: "menor_teor_argila", label: "Menor Teor de Argila - g/kg" },
  { key: "menor_teor_argila_primeiro_intervalo", label: "Menor Teor de Argila - 1° Intervalo - g/kg" },
  { key: "maior_teor_argila_primeiro_intervalo", label: "Maior Teor de Argila - 1° Intervalo - g/kg" },
  { key: "menor_teor_argila_segundo_intervalo", label: "Menor Teor de Argila - 2° Intervalo - g/kg" },
  { key: "maior_teor_argila_segundo_intervalo", label: "Maior Teor de Argila - 2° Intervalo - g/kg" },
  { key: "maior_teor_argila", label: "Maior Teor de Argila - g/kg" }
] as const;

const CLAY_GROUPS = [
  { key: "menor_teor_argila", label: "Argila abaixo do menor teor" },
  { key: "primeiro_intervalo", label: "Argila no 1° intervalo" },
  { key: "segundo_intervalo", label: "Argila no 2° intervalo" },
  { key: "maior_teor_argila", label: "Argila acima do maior teor" }
] as const;

const DOSE_FIELDS = [
  { key: "muito_baixo", label: "Dose de P2O5 para Teor de P Muito Baixo - kg/ha" },
  { key: "baixa", label: "Dose de P2O5 para Teor de P Baixa - kg/ha" },
  { key: "media", label: "Dose de P2O5 para Teor de P Média - kg/ha" }
] as const;

const buildInitialState = (): FormState => {
  const state = { observacoes: "", fontes: "" } as FormState;

  SYSTEMS.forEach((system) => {
    CLAY_BOUNDARIES.forEach((boundary) => {
      state[`${boundary.key}_${system.value}` as PhosphorusClayContentAndPhosphateDoseNumericField] = "";
    });

    CLAY_GROUPS.forEach((group) => {
      DOSE_FIELDS.forEach((dose) => {
        state[
          `dose_p2o5_teor_p_${dose.key}_${group.key}_${system.value}` as PhosphorusClayContentAndPhosphateDoseNumericField
        ] = "";
      });
    });
  });

  return state;
};

const INITIAL_STATE = buildInitialState();
const NUMERIC_FIELDS = Object.keys(INITIAL_STATE).filter(
  (key): key is PhosphorusClayContentAndPhosphateDoseNumericField =>
    key !== "observacoes" && key !== "fontes"
);

const parseNumber = (value: string) => {
  if (!value) return 0;
  return parseFloat(value.replace(",", ".")) || 0;
};

export default function PhosphorusClayContentAndPhosphateDoseModal({
  isOpen,
  onClose,
  tableId,
  isReadOnly = false
}: Props) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [existingId, setExistingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(INITIAL_STATE);

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
      const data = await getPhosphorusClayContentAndPhosphateDoseByTable(tableId!);
      if (data) {
        const newForm: FormState = { ...INITIAL_STATE };
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
      toaster.create({
        title: "Erro ao carregar Teores de Fósforo e Argila, e Doses de Fosfato.",
        description: "Verifique se o endpoint backend desta tabela auxiliar está disponível.",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: FormKey, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const buildCreatePayload = (): PhosphorusClayContentAndPhosphateDoseCreateRequestDto => {
    const payload = {} as PhosphorusClayContentAndPhosphateDoseCreateRequestDto;
    NUMERIC_FIELDS.forEach((key) => {
      payload[key] = parseNumber(form[key]);
    });
    payload.observacoes = form.observacoes;
    payload.fontes = form.fontes;
    return payload;
  };

  const buildUpdatePayload = (): PhosphorusClayContentAndPhosphateDosePostRequestDto => {
    const payload: PhosphorusClayContentAndPhosphateDosePostRequestDto = {};
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
        await updatePhosphorusClayContentAndPhosphateDose(existingId, buildUpdatePayload());
        toaster.create({ title: "Teores de Fósforo e Argila, e Doses de Fosfato atualizados!", type: "success" });
      } else {
        await createPhosphorusClayContentAndPhosphateDose(tableId!, buildCreatePayload());
        toaster.create({ title: "Teores de Fósforo e Argila, e Doses de Fosfato configurados!", type: "success" });
      }
      onClose();
    } catch (error) {
      console.error(error);
      toaster.create({
        title: "Erro ao salvar Teores de Fósforo e Argila, e Doses de Fosfato.",
        description: "O frontend enviou o contrato disponível; confirme compatibilidade com o backend.",
        type: "error"
      });
    } finally {
      setSaving(false);
    }
  };

  const renderSystem = (system: PhosphorusClayContentAndPhosphateDoseSystem) => (
    <Box mt={4}>
      <Text fontSize="sm" fontWeight="semibold" color="green.700" _dark={{ color: "green.300" }} mb={3}>
        Faixas de argila
      </Text>
      <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={4}>
        {CLAY_BOUNDARIES.map((boundary) => {
          const key = `${boundary.key}_${system}` as PhosphorusClayContentAndPhosphateDoseNumericField;
          return (
            <Field.Root key={key}>
              <Field.Label fontSize="xs" color="gray.600" _dark={{ color: "gray.300" }}>
                {boundary.label}
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

      <Text fontSize="sm" fontWeight="semibold" color="green.700" _dark={{ color: "green.300" }} mt={6} mb={3}>
        Doses de P2O5 por grupo de argila
      </Text>
      {CLAY_GROUPS.map((group) => (
        <Box
          key={`${group.key}_${system}`}
          borderWidth="1px"
          borderRadius="md"
          borderColor="gray.200"
          bg="gray.50"
          _dark={{ bg: "gray.700", borderColor: "gray.600" }}
          p={4}
          mb={4}
        >
          <Text fontSize="xs" fontWeight="bold" color="gray.600" _dark={{ color: "gray.300" }} mb={3}>
            {group.label}
          </Text>
          <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
            {DOSE_FIELDS.map((dose) => {
              const key =
                `dose_p2o5_teor_p_${dose.key}_${group.key}_${system}` as PhosphorusClayContentAndPhosphateDoseNumericField;
              return (
                <Field.Root key={key}>
                  <Field.Label fontSize="xs" color="gray.600" _dark={{ color: "gray.300" }}>
                    {dose.label}
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
                    _dark={{ bg: "gray.800", borderColor: "gray.500" }}
                  />
                </Field.Root>
              );
            })}
          </Grid>
        </Box>
      ))}
    </Box>
  );

  return (
    <Dialog.Root open={isOpen} onOpenChange={(event) => !event.open && onClose()} size="xl">
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content bg="white" _dark={{ bg: "gray.800" }} maxW="1000px">
          <Dialog.Header>
            <Dialog.Title>Teores de Fósforo e Argila, e Doses de Fosfato</Dialog.Title>
          </Dialog.Header>

          <Dialog.Body>
            {loading ? (
              <Box textAlign="center" py={10}>
                <Spinner size="xl" color="green.500" />
              </Box>
            ) : (
              <>
                <Tabs.Root defaultValue="sequeiro" variant="enclosed">
                  <Tabs.List>
                    {SYSTEMS.map((system) => (
                      <Tabs.Trigger key={system.value} value={system.value}>
                        {system.label}
                      </Tabs.Trigger>
                    ))}
                  </Tabs.List>

                  {SYSTEMS.map((system) => (
                    <Tabs.Content key={system.value} value={system.value}>
                      <Text fontSize="sm" color="gray.500" _dark={{ color: "gray.400" }} mb={2}>
                        {system.description}
                      </Text>
                      {renderSystem(system.value)}
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
