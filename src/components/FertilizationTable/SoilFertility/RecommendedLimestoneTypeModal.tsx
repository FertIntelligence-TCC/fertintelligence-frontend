import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  Field,
  Grid,
  Input,
  Spinner,
  Text,
  Textarea
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import {
  createRecommendedLimestoneType,
  getRecommendedLimestoneTypeByTable,
  updateRecommendedLimestoneType
} from "@/services/recommendedLimestoneTypeService";
import {
  RecommendedLimestoneTypeCreateRequestDto,
  RecommendedLimestoneTypePostRequestDto
} from "@/interfaces/RecommendedLimestoneType";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tableId: number | null;
  isReadOnly?: boolean;
}

export const INITIAL_STATE = {
  relacao_ca_mg_baixa: "",
  relacao_ca_mg_alta: "",
  observacoes: "",
  fontes: ""
};

type RecommendedLimestoneTypeForm = typeof INITIAL_STATE;
type RecommendedLimestoneTypeFormKey = keyof RecommendedLimestoneTypeForm;
type NumericRecommendedLimestoneTypeField = Exclude<RecommendedLimestoneTypeFormKey, "observacoes" | "fontes">;

const NUMERIC_FIELDS = Object.keys(INITIAL_STATE).filter(
  (key): key is NumericRecommendedLimestoneTypeField => key !== "observacoes" && key !== "fontes"
);

export const RECOMMENDED_LIMESTONE_TYPE_FIELDS = [
  {
    label: "Relação Ca/Mg Baixa",
    key: "relacao_ca_mg_baixa",
    legend: "Calcário Calcítico (Teor de MgO menor que 5%)"
  },
  {
    label: "Relação Ca/Mg Alta",
    key: "relacao_ca_mg_alta",
    legend: "Calcário Dolomítico (Teor de MgO igual ou maior que 5%)"
  }
] as const satisfies readonly {
  label: string;
  key: NumericRecommendedLimestoneTypeField;
  legend: string;
}[];

const parseNumber = (value: string) => {
  if (!value.trim()) return null;
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
};

export const buildRecommendedLimestoneTypeCreatePayload = (
  form: RecommendedLimestoneTypeForm,
): RecommendedLimestoneTypeCreateRequestDto => ({
  relacao_ca_mg_baixa: parseNumber(form.relacao_ca_mg_baixa),
  relacao_ca_mg_alta: parseNumber(form.relacao_ca_mg_alta),
  observacoes: form.observacoes,
  fontes: form.fontes,
});

export const buildRecommendedLimestoneTypeUpdatePayload = (
  form: RecommendedLimestoneTypeForm,
): RecommendedLimestoneTypePostRequestDto => ({
  novo_relacao_ca_mg_baixa: parseNumber(form.relacao_ca_mg_baixa),
  novo_relacao_ca_mg_alta: parseNumber(form.relacao_ca_mg_alta),
  novo_observacoes: form.observacoes,
  novo_fontes: form.fontes,
});

export default function RecommendedLimestoneTypeModal({
  isOpen,
  onClose,
  tableId,
  isReadOnly = false
}: Props) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [existingId, setExistingId] = useState<number | null>(null);
  const [form, setForm] = useState<RecommendedLimestoneTypeForm>(INITIAL_STATE);

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
      const data = await getRecommendedLimestoneTypeByTable(tableId!);
      if (data) {
        const newForm: RecommendedLimestoneTypeForm = { ...INITIAL_STATE };
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
      toaster.create({ title: "Erro ao carregar Tipos de calcário recomendados.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: RecommendedLimestoneTypeFormKey, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const buildCreatePayload = (): RecommendedLimestoneTypeCreateRequestDto => {
    return buildRecommendedLimestoneTypeCreatePayload(form);
  };

  const buildUpdatePayload = (): RecommendedLimestoneTypePostRequestDto => {
    return buildRecommendedLimestoneTypeUpdatePayload(form);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (existingId) {
        await updateRecommendedLimestoneType(existingId, buildUpdatePayload());
        toaster.create({ title: "Tipos de calcário atualizados!", type: "success" });
      } else {
        await createRecommendedLimestoneType(tableId!, buildCreatePayload());
        toaster.create({ title: "Tipos de calcário configurados!", type: "success" });
      }
      onClose();
    } catch (error) {
      console.error(error);
      toaster.create({ title: "Erro ao salvar Tipos de calcário recomendados.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(event) => !event.open && onClose()} size="xl">
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content bg="white" _dark={{ bg: "gray.800" }} maxW="760px">
          <Dialog.Header>
            <Dialog.Title>Tipos de calcário recomendados</Dialog.Title>
          </Dialog.Header>

          <Dialog.Body>
            {loading ? (
              <Box textAlign="center" py={10}>
                <Spinner size="xl" color="green.500" />
              </Box>
            ) : (
              <>
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                  {RECOMMENDED_LIMESTONE_TYPE_FIELDS.map((field) => (
                    <Field.Root key={field.key}>
                      <Field.Label fontSize="xs" color="gray.600" _dark={{ color: "gray.300" }}>
                        {field.label}
                      </Field.Label>
                      <Input
                        size="sm"
                        type="number"
                        step="0.01"
                        value={form[field.key]}
                        onChange={(event) => handleChange(field.key, event.target.value)}
                        readOnly={isReadOnly}
                        bg="white"
                        borderColor="gray.300"
                        _dark={{ bg: "gray.700", borderColor: "gray.500" }}
                      />
                      <Text fontSize="xs" color="gray.500" _dark={{ color: "gray.400" }} mt={1}>
                        {field.legend}
                      </Text>
                    </Field.Root>
                  ))}
                </Grid>

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
