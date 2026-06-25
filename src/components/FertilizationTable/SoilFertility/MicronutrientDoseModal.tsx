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
  Textarea,
  VStack
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { getDiverseContentRangeByTable } from "@/services/diverseContentRangeService";
import {
  createMicronutrientDose,
  getMicronutrientDoseByTable,
  updateMicronutrientDose
} from "@/services/micronutrientDoseService";
import { DiverseContentRangeResponseDto } from "@/interfaces/DiverseContentRange";
import {
  MicronutrientDoseCreateRequestDto,
  MicronutrientDosePostRequestDto
} from "@/interfaces/MicronutrientDose";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tableId: number | null;
  isReadOnly?: boolean;
}

const INITIAL_STATE = {
  boro_baixo_dose: "",
  boro_medio_dose: "",
  boro_alto_dose: "",
  cobre_baixo_dose: "",
  cobre_medio_dose: "",
  cobre_alto_dose: "",
  ferro_baixo_dose: "",
  ferro_medio_dose: "",
  ferro_alto_dose: "",
  manganes_baixo_dose: "",
  manganes_medio_dose: "",
  manganes_alto_dose: "",
  zinco_baixo_dose: "",
  zinco_medio_dose: "",
  zinco_alto_dose: "",
  observacoes: "",
  fontes: ""
};

type MicronutrientDoseForm = typeof INITIAL_STATE;
type MicronutrientDoseFormKey = keyof MicronutrientDoseForm;
type NumericMicronutrientDoseField = Exclude<MicronutrientDoseFormKey, "observacoes" | "fontes">;
type MicronutrientSuffix = "boro" | "cobre" | "ferro" | "manganes" | "zinco";
type DoseClass = "baixo" | "medio" | "alto";

const NUMERIC_FIELDS = [
  "boro_baixo_dose",
  "boro_medio_dose",
  "boro_alto_dose",
  "cobre_baixo_dose",
  "cobre_medio_dose",
  "cobre_alto_dose",
  "ferro_baixo_dose",
  "ferro_medio_dose",
  "ferro_alto_dose",
  "manganes_baixo_dose",
  "manganes_medio_dose",
  "manganes_alto_dose",
  "zinco_baixo_dose",
  "zinco_medio_dose",
  "zinco_alto_dose"
] as const satisfies readonly NumericMicronutrientDoseField[];

const MICRONUTRIENTS = [
  {
    suffix: "boro",
    title: "Doses de Boro (B)",
    legend: "Recomendação de Doses de Boro (B) - kg/ha, extrator água quente"
  },
  {
    suffix: "cobre",
    title: "Doses de Cobre (Cu)",
    legend: "Recomendação de Doses de Cobre (Cu) - kg/ha, extrator Mehlich-1"
  },
  {
    suffix: "ferro",
    title: "Doses de Ferro (Fe)",
    legend: "Recomendação de Doses de Ferro (Fe) - kg/ha, extrator Mehlich-1"
  },
  {
    suffix: "manganes",
    title: "Doses de Manganês (Mn)",
    legend: "Recomendação de Doses de Manganês (Mn) - kg/ha, extrator Mehlich-1"
  },
  {
    suffix: "zinco",
    title: "Doses de Zinco (Zn)",
    legend: "Recomendação de Doses de Zinco (Zn) - kg/ha, extrator Mehlich-1"
  }
] as const satisfies readonly {
  suffix: MicronutrientSuffix;
  title: string;
  legend: string;
}[];

const DOSE_CLASSES = [
  { className: "baixo", baseLabel: "Baixo" },
  { className: "medio", baseLabel: "Médio" },
  { className: "alto", baseLabel: "Alto" }
] as const satisfies readonly { className: DoseClass; baseLabel: string }[];

const RANGE_PREFIXES = [
  "teor_inicial_baixo",
  "teor_final_baixo",
  "teor_inicial_medio",
  "teor_final_medio",
  "teor_inicial_alto",
  "teor_final_alto"
] as const;

const parseNumber = (value: string) => {
  if (!value) return 0;
  return parseFloat(value.replace(",", ".")) || 0;
};

const hasNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const formatThreshold = (value: number) => String(value).replace(".", ",");

export default function MicronutrientDoseModal({ isOpen, onClose, tableId, isReadOnly = false }: Props) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [existingId, setExistingId] = useState<number | null>(null);
  const [diverseContentRange, setDiverseContentRange] = useState<DiverseContentRangeResponseDto | null>(null);
  const [diverseContentRangeLoadFailed, setDiverseContentRangeLoadFailed] = useState(false);
  const [form, setForm] = useState<MicronutrientDoseForm>(INITIAL_STATE);

  useEffect(() => {
    if (isOpen && tableId) {
      fetchData();
    } else {
      setForm(INITIAL_STATE);
      setExistingId(null);
      setDiverseContentRange(null);
      setDiverseContentRangeLoadFailed(false);
    }
  }, [isOpen, tableId]);

  const fetchData = async () => {
    setLoading(true);
    setDiverseContentRangeLoadFailed(false);

    try {
      const [doseData, diverseData] = await Promise.all([
        getMicronutrientDoseByTable(tableId!),
        getDiverseContentRangeByTable(tableId!).catch((error) => {
          console.error(error);
          setDiverseContentRangeLoadFailed(true);
          return null;
        })
      ]);

      setDiverseContentRange(diverseData);

      if (doseData) {
        setExistingId(doseData.id);
        const newForm: MicronutrientDoseForm = { ...INITIAL_STATE };
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
      toaster.create({ title: "Erro ao carregar Doses de micronutrientes.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: MicronutrientDoseFormKey, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const getRangeValue = (suffix: MicronutrientSuffix, prefix: typeof RANGE_PREFIXES[number]) => {
    if (!diverseContentRange) return undefined;
    return diverseContentRange[`${prefix}_${suffix}`];
  };

  const getLabels = (suffix: MicronutrientSuffix) => {
    const ranges = {
      lowStart: getRangeValue(suffix, "teor_inicial_baixo"),
      lowEnd: getRangeValue(suffix, "teor_final_baixo"),
      mediumStart: getRangeValue(suffix, "teor_inicial_medio"),
      mediumEnd: getRangeValue(suffix, "teor_final_medio"),
      highStart: getRangeValue(suffix, "teor_inicial_alto"),
      highEnd: getRangeValue(suffix, "teor_final_alto")
    };

    if (
      !hasNumber(ranges.lowStart) ||
      !hasNumber(ranges.lowEnd) ||
      !hasNumber(ranges.mediumStart) ||
      !hasNumber(ranges.mediumEnd) ||
      !hasNumber(ranges.highStart) ||
      !hasNumber(ranges.highEnd)
    ) {
      return {
        baixo: "Baixo",
        medio: "Médio",
        alto: "Alto"
      };
    }

    return {
      baixo: `Baixo (Teores entre ${formatThreshold(ranges.lowStart)} mg/dm³ e ${formatThreshold(ranges.lowEnd)} mg/dm³)`,
      medio: `Médio (Teores entre ${formatThreshold(ranges.mediumStart)} mg/dm³ e ${formatThreshold(ranges.mediumEnd)} mg/dm³)`,
      alto: `Alto (Teores entre ${formatThreshold(ranges.highStart)} mg/dm³ e ${formatThreshold(ranges.highEnd)} mg/dm³)`
    };
  };

  const buildCreatePayload = (): MicronutrientDoseCreateRequestDto => ({
    boro_baixo_dose: parseNumber(form.boro_baixo_dose),
    boro_medio_dose: parseNumber(form.boro_medio_dose),
    boro_alto_dose: parseNumber(form.boro_alto_dose),
    cobre_baixo_dose: parseNumber(form.cobre_baixo_dose),
    cobre_medio_dose: parseNumber(form.cobre_medio_dose),
    cobre_alto_dose: parseNumber(form.cobre_alto_dose),
    ferro_baixo_dose: parseNumber(form.ferro_baixo_dose),
    ferro_medio_dose: parseNumber(form.ferro_medio_dose),
    ferro_alto_dose: parseNumber(form.ferro_alto_dose),
    manganes_baixo_dose: parseNumber(form.manganes_baixo_dose),
    manganes_medio_dose: parseNumber(form.manganes_medio_dose),
    manganes_alto_dose: parseNumber(form.manganes_alto_dose),
    zinco_baixo_dose: parseNumber(form.zinco_baixo_dose),
    zinco_medio_dose: parseNumber(form.zinco_medio_dose),
    zinco_alto_dose: parseNumber(form.zinco_alto_dose),
    observacoes: form.observacoes,
    fontes: form.fontes
  });

  const buildUpdatePayload = (): MicronutrientDosePostRequestDto => ({
    novo_boro_baixo_dose: parseNumber(form.boro_baixo_dose),
    novo_boro_medio_dose: parseNumber(form.boro_medio_dose),
    novo_boro_alto_dose: parseNumber(form.boro_alto_dose),
    novo_cobre_baixo_dose: parseNumber(form.cobre_baixo_dose),
    novo_cobre_medio_dose: parseNumber(form.cobre_medio_dose),
    novo_cobre_alto_dose: parseNumber(form.cobre_alto_dose),
    novo_ferro_baixo_dose: parseNumber(form.ferro_baixo_dose),
    novo_ferro_medio_dose: parseNumber(form.ferro_medio_dose),
    novo_ferro_alto_dose: parseNumber(form.ferro_alto_dose),
    novo_manganes_baixo_dose: parseNumber(form.manganes_baixo_dose),
    novo_manganes_medio_dose: parseNumber(form.manganes_medio_dose),
    novo_manganes_alto_dose: parseNumber(form.manganes_alto_dose),
    novo_zinco_baixo_dose: parseNumber(form.zinco_baixo_dose),
    novo_zinco_medio_dose: parseNumber(form.zinco_medio_dose),
    novo_zinco_alto_dose: parseNumber(form.zinco_alto_dose),
    novo_observacoes: form.observacoes,
    novo_fontes: form.fontes
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      if (existingId) {
        await updateMicronutrientDose(existingId, buildUpdatePayload());
        toaster.create({ title: "Doses de micronutrientes atualizadas!", type: "success" });
      } else {
        await createMicronutrientDose(tableId!, buildCreatePayload());
        toaster.create({ title: "Doses de micronutrientes configuradas!", type: "success" });
      }
      onClose();
    } catch (error) {
      console.error(error);
      toaster.create({ title: "Erro ao salvar Doses de micronutrientes.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const renderMicronutrientSection = (suffix: MicronutrientSuffix, title: string, legend: string) => {
    const labels = getLabels(suffix);

    return (
      <Box key={suffix} borderWidth="1px" p={4} borderRadius="md" _dark={{ borderColor: "gray.600" }}>
        <Text fontWeight="bold" color="green.600" _dark={{ color: "green.300" }} fontSize="sm">
          {title}
        </Text>
        <Text fontSize="sm" color="gray.500" _dark={{ color: "gray.400" }} mt={1}>
          {legend}
        </Text>
        <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr", lg: "repeat(3, 1fr)" }} gap={4} mt={4}>
          {DOSE_CLASSES.map(({ className }) => {
            const key = `${suffix}_${className}_dose` as NumericMicronutrientDoseField;
            return (
              <Field.Root key={key}>
                <Field.Label fontSize="xs" color="gray.600" _dark={{ color: "gray.300" }}>
                  {labels[className]}
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
      </Box>
    );
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(event) => !event.open && onClose()} size="xl">
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content bg="white" _dark={{ bg: "gray.800" }} maxW="900px">
          <Dialog.Header>
            <Dialog.Title>Recomendação de Doses de Micronutrientes - kg/ha</Dialog.Title>
          </Dialog.Header>

          <Dialog.Body>
            {loading ? (
              <Box textAlign="center" py={10}>
                <Spinner size="xl" color="green.500" />
              </Box>
            ) : (
              <>
                {(!diverseContentRange || diverseContentRangeLoadFailed) && (
                  <Text fontSize="xs" color="orange.600" _dark={{ color: "orange.300" }} mb={3}>
                    Teores de Nutrientes Diversos ausentes ou indisponíveis. Os rótulos técnicos serão exibidos sem faixas.
                  </Text>
                )}

                <VStack align="stretch" gap={4}>
                  {MICRONUTRIENTS.map((nutrient) =>
                    renderMicronutrientSection(nutrient.suffix, nutrient.title, nutrient.legend)
                  )}
                </VStack>

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
