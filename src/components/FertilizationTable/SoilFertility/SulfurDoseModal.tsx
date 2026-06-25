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
import { getAvailableSByTable } from "@/services/availableSService";
import {
  createSulfurDose,
  getSulfurDoseByTable,
  updateSulfurDose
} from "@/services/sulfurDoseService";
import { AvailableSResponseDto } from "@/interfaces/AvailableS";
import {
  SulfurDoseCreateRequestDto,
  SulfurDosePostRequestDto
} from "@/interfaces/SulfurDose";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tableId: number | null;
  isReadOnly?: boolean;
}

const INITIAL_STATE = {
  muito_baixo_dose_argila_menor_400: "",
  baixo_dose_argila_menor_400: "",
  medio_dose_argila_menor_400: "",
  alto_dose_argila_menor_400: "",
  muito_alto_dose_argila_menor_400: "",
  muito_baixo_dose_argila_maior_400: "",
  baixo_dose_argila_maior_400: "",
  medio_dose_argila_maior_400: "",
  alto_dose_argila_maior_400: "",
  muito_alto_dose_argila_maior_400: "",
  observacoes: "",
  fontes: ""
};

type SulfurDoseForm = typeof INITIAL_STATE;
type SulfurDoseFormKey = keyof SulfurDoseForm;
type NumericSulfurDoseField = Exclude<SulfurDoseFormKey, "observacoes" | "fontes">;
type AvailableSTexture = "argila_menor_400" | "argila_maior_400";

const NUMERIC_FIELDS = [
  "muito_baixo_dose_argila_menor_400",
  "baixo_dose_argila_menor_400",
  "medio_dose_argila_menor_400",
  "alto_dose_argila_menor_400",
  "muito_alto_dose_argila_menor_400",
  "muito_baixo_dose_argila_maior_400",
  "baixo_dose_argila_maior_400",
  "medio_dose_argila_maior_400",
  "alto_dose_argila_maior_400",
  "muito_alto_dose_argila_maior_400"
] as const satisfies readonly NumericSulfurDoseField[];

const FIELD_GROUPS = {
  argila_menor_400: [
    { baseLabel: "Muito Baixo", key: "muito_baixo_dose_argila_menor_400" },
    { baseLabel: "Baixo", key: "baixo_dose_argila_menor_400" },
    { baseLabel: "Médio", key: "medio_dose_argila_menor_400" },
    { baseLabel: "Alto", key: "alto_dose_argila_menor_400" },
    { baseLabel: "Muito Alto", key: "muito_alto_dose_argila_menor_400" }
  ],
  argila_maior_400: [
    { baseLabel: "Muito Baixo", key: "muito_baixo_dose_argila_maior_400" },
    { baseLabel: "Baixo", key: "baixo_dose_argila_maior_400" },
    { baseLabel: "Médio", key: "medio_dose_argila_maior_400" },
    { baseLabel: "Alto", key: "alto_dose_argila_maior_400" },
    { baseLabel: "Muito Alto", key: "muito_alto_dose_argila_maior_400" }
  ]
} as const satisfies Record<AvailableSTexture, readonly { baseLabel: string; key: NumericSulfurDoseField }[]>;

const getAvailableSKeys = (texture: AvailableSTexture) => ({
  veryLow: `menor_teor_enxofre_${texture}`,
  lowStart: `teor_inicial_baixo_enxofre_${texture}`,
  lowEnd: `teor_final_baixo_enxofre_${texture}`,
  mediumStart: `teor_inicial_medio_enxofre_${texture}`,
  mediumEnd: `teor_final_medio_enxofre_${texture}`,
  highStart: `teor_inicial_alto_enxofre_${texture}`,
  highEnd: `teor_final_alto_enxofre_${texture}`,
  veryHigh: `maior_teor_enxofre_${texture}`
}) as const;

type AvailableSRangeKeys = ReturnType<typeof getAvailableSKeys>;
type AvailableSRangeKey = AvailableSRangeKeys[keyof AvailableSRangeKeys];

const parseNumber = (value: string) => {
  if (!value) return 0;
  return parseFloat(value.replace(",", ".")) || 0;
};

const hasNumber = (value: number | undefined) => value !== undefined && Number.isFinite(value);

const formatThreshold = (value: number) => String(value).replace(".", ",");

export default function SulfurDoseModal({ isOpen, onClose, tableId, isReadOnly = false }: Props) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [existingId, setExistingId] = useState<number | null>(null);
  const [availableS, setAvailableS] = useState<AvailableSResponseDto | null>(null);
  const [availableSLoadFailed, setAvailableSLoadFailed] = useState(false);
  const [form, setForm] = useState<SulfurDoseForm>(INITIAL_STATE);

  useEffect(() => {
    if (isOpen && tableId) {
      fetchData();
    } else {
      setForm(INITIAL_STATE);
      setExistingId(null);
      setAvailableS(null);
      setAvailableSLoadFailed(false);
    }
  }, [isOpen, tableId]);

  const fetchData = async () => {
    setLoading(true);
    setAvailableSLoadFailed(false);

    try {
      const [doseData, availableSData] = await Promise.all([
        getSulfurDoseByTable(tableId!),
        getAvailableSByTable(tableId!).catch((error) => {
          console.error(error);
          setAvailableSLoadFailed(true);
          return null;
        })
      ]);

      setAvailableS(availableSData);

      if (doseData) {
        setExistingId(doseData.id);
        const newForm: SulfurDoseForm = { ...INITIAL_STATE };
        NUMERIC_FIELDS.forEach((key) => {
          const value = doseData[key];
          newForm[key] = value !== null && value !== undefined ? String(value) : "";
        });
        newForm.observacoes = doseData.observacoes ?? "";
        newForm.fontes = doseData.fontes ?? "";
        setForm(newForm);
      } else {
        setExistingId(null);
        setForm(INITIAL_STATE);
      }
    } catch (error) {
      console.error(error);
      toaster.create({ title: "Erro ao carregar Doses de S.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: SulfurDoseFormKey, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const getAvailableSRange = (texture: AvailableSTexture) => {
    if (!availableS) return null;

    const keys = getAvailableSKeys(texture);
    const values = Object.fromEntries(
      Object.entries(keys).map(([key, availableSKey]) => [
        key,
        availableS[availableSKey as AvailableSRangeKey]
      ])
    ) as Record<keyof AvailableSRangeKeys, number | undefined>;

    if (!Object.values(values).every(hasNumber)) {
      return null;
    }

    return values as Record<keyof AvailableSRangeKeys, number>;
  };

  const getLabels = (texture: AvailableSTexture) => {
    const range = getAvailableSRange(texture);
    if (!range) {
      return ["Muito Baixo", "Baixo", "Médio", "Alto", "Muito Alto"];
    }

    return [
      `Muito Baixo (Menor que ${formatThreshold(range.veryLow)} mg/dm³)`,
      `Baixo (Teores entre ${formatThreshold(range.lowStart)} mg/dm³ e ${formatThreshold(range.lowEnd)} mg/dm³)`,
      `Médio (Teores entre ${formatThreshold(range.mediumStart)} mg/dm³ e ${formatThreshold(range.mediumEnd)} mg/dm³)`,
      `Alto (Teores entre ${formatThreshold(range.highStart)} mg/dm³ e ${formatThreshold(range.highEnd)} mg/dm³)`,
      `Muito Alto (Maior que ${formatThreshold(range.veryHigh)} mg/dm³)`
    ];
  };

  const buildCreatePayload = (): SulfurDoseCreateRequestDto => ({
    muito_baixo_dose_argila_menor_400: parseNumber(form.muito_baixo_dose_argila_menor_400),
    baixo_dose_argila_menor_400: parseNumber(form.baixo_dose_argila_menor_400),
    medio_dose_argila_menor_400: parseNumber(form.medio_dose_argila_menor_400),
    alto_dose_argila_menor_400: parseNumber(form.alto_dose_argila_menor_400),
    muito_alto_dose_argila_menor_400: parseNumber(form.muito_alto_dose_argila_menor_400),
    muito_baixo_dose_argila_maior_400: parseNumber(form.muito_baixo_dose_argila_maior_400),
    baixo_dose_argila_maior_400: parseNumber(form.baixo_dose_argila_maior_400),
    medio_dose_argila_maior_400: parseNumber(form.medio_dose_argila_maior_400),
    alto_dose_argila_maior_400: parseNumber(form.alto_dose_argila_maior_400),
    muito_alto_dose_argila_maior_400: parseNumber(form.muito_alto_dose_argila_maior_400),
    observacoes: form.observacoes,
    fontes: form.fontes
  });

  const buildUpdatePayload = (): SulfurDosePostRequestDto => ({
    novo_muito_baixo_dose_argila_menor_400: parseNumber(form.muito_baixo_dose_argila_menor_400),
    novo_baixo_dose_argila_menor_400: parseNumber(form.baixo_dose_argila_menor_400),
    novo_medio_dose_argila_menor_400: parseNumber(form.medio_dose_argila_menor_400),
    novo_alto_dose_argila_menor_400: parseNumber(form.alto_dose_argila_menor_400),
    novo_muito_alto_dose_argila_menor_400: parseNumber(form.muito_alto_dose_argila_menor_400),
    novo_muito_baixo_dose_argila_maior_400: parseNumber(form.muito_baixo_dose_argila_maior_400),
    novo_baixo_dose_argila_maior_400: parseNumber(form.baixo_dose_argila_maior_400),
    novo_medio_dose_argila_maior_400: parseNumber(form.medio_dose_argila_maior_400),
    novo_alto_dose_argila_maior_400: parseNumber(form.alto_dose_argila_maior_400),
    novo_muito_alto_dose_argila_maior_400: parseNumber(form.muito_alto_dose_argila_maior_400),
    novo_observacoes: form.observacoes,
    novo_fontes: form.fontes
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      if (existingId) {
        await updateSulfurDose(existingId, buildUpdatePayload());
        toaster.create({ title: "Doses de S atualizadas!", type: "success" });
      } else {
        await createSulfurDose(tableId!, buildCreatePayload());
        toaster.create({ title: "Doses de S configuradas!", type: "success" });
      }
      onClose();
    } catch (error) {
      console.error(error);
      toaster.create({ title: "Erro ao salvar Doses de S.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const renderTextureInputs = (texture: AvailableSTexture) => {
    const labels = getLabels(texture);

    return (
      <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={4} mt={4}>
        {FIELD_GROUPS[texture].map((field, index) => (
          <Field.Root key={field.key}>
            <Field.Label fontSize="xs" color="gray.600" _dark={{ color: "gray.300" }}>
              {labels[index]}
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
          </Field.Root>
        ))}
      </Grid>
    );
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(event) => !event.open && onClose()} size="xl">
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content bg="white" _dark={{ bg: "gray.800" }} maxW="850px">
          <Dialog.Header>
            <Dialog.Title>Recomendação de Doses de Enxofre (S) - kg/ha</Dialog.Title>
          </Dialog.Header>

          <Dialog.Body>
            {loading ? (
              <Box textAlign="center" py={10}>
                <Spinner size="xl" color="green.500" />
              </Box>
            ) : (
              <>
                {(!availableS || availableSLoadFailed) && (
                  <Text fontSize="xs" color="orange.600" _dark={{ color: "orange.300" }} mb={3}>
                    S disponível ausente ou indisponível. Os rótulos técnicos serão exibidos sem faixas.
                  </Text>
                )}

                <Tabs.Root defaultValue="argila_menor_400" variant="enclosed">
                  <Tabs.List>
                    <Tabs.Trigger value="argila_menor_400">Argila &lt; 400 g/dm³</Tabs.Trigger>
                    <Tabs.Trigger value="argila_maior_400">Argila &gt; 400 g/dm³</Tabs.Trigger>
                  </Tabs.List>

                  <Tabs.Content value="argila_menor_400">
                    <Text fontSize="sm" color="gray.500" _dark={{ color: "gray.400" }} mb={2}>
                      Solos com teor de argila &lt; 400 g/dm³
                    </Text>
                    {renderTextureInputs("argila_menor_400")}
                  </Tabs.Content>

                  <Tabs.Content value="argila_maior_400">
                    <Text fontSize="sm" color="gray.500" _dark={{ color: "gray.400" }} mb={2}>
                      Solos com teor de argila &gt; 400 g/dm³
                    </Text>
                    {renderTextureInputs("argila_maior_400")}
                  </Tabs.Content>
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
