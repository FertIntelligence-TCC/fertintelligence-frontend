import { useEffect, useState } from "react";
import {
  Dialog,
  Button,
  Input,
  Grid,
  Box,
  Spinner,
  Field,
  Text,
  Textarea,
  createListCollection
} from "@chakra-ui/react";
import { 
    SelectContent, 
    SelectItem, 
    SelectRoot, 
    SelectTrigger, 
    SelectValueText 
} from "@/components/ui/select";
import { toaster } from "@/components/ui/toaster";
import {
  getDiverseContentRangeByTable,
  createDiverseContentRange,
  updateDiverseContentRange
} from "@/services/diverseContentRangeService";
import {
  DiverseContentRangeCreateRequestDto,
  DiverseContentRangePostRequestDto,
  DiverseContentRangeResponseDto,
  NutrientSuffix
} from "@/interfaces/DiverseContentRange";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tableId: number | null;
  isReadOnly?: boolean;
}

// Configuração dos Nutrientes
type NutrientOption = {
    label: string;
    value: NutrientSuffix;
};

export const NUTRIENTS: NutrientOption[] = [
    { label: "Al trocável (Al³+, mmolc/dm³)", value: "aluminio" },
    { label: "H+Al (mmolc/dm³)", value: "aluminio_mais_hidrogenio" },
    { label: "CTC (t) (mmolc/dm³)", value: "ctc_efetiva" },
    { label: "CTC (T) (mmolc/dm³)", value: "ctc_ph7" },
    { label: "pH em água (1:2,5)", value: "ph_agua" },
    { label: "pH em CaCl2 0,01 mol/L (1:2,5)", value: "ph_cacl2" },
    { label: "Carbono Orgânico (g/dm³)", value: "carbono_organico" },
    { label: "Matéria Orgânica (g/dm³)", value: "materia_organica" },
    { label: "Cálcio (mmolc/dm³)", value: "calcio" },
    { label: "Magnésio (mmolc/dm³)", value: "magnesio" },
    { label: "Potássio (mmolc/dm³)", value: "potassio" },
    { label: "Soma de Bases (mmolc/dm³)", value: "soma_bases" },
    { label: "Saturação por Alumínio - m (%)", value: "saturacao_aluminio" },
    { label: "Saturação por Bases - V (%)", value: "saturacao_bases" },
    { label: "PST (%)", value: "pst" },
    { label: "Boro (mg/dm³)", value: "boro" },
    { label: "Cobre (mg/dm³)", value: "cobre" },
    { label: "Ferro (mg/dm³)", value: "ferro" },
    { label: "Manganês (mg/dm³)", value: "manganes" },
    { label: "Zinco (mg/dm³)", value: "zinco" },
];

const nutrientsCollection = createListCollection({
    items: NUTRIENTS,
});

const RANGE_PREFIXES = [
    "menor_teor",
    "teor_inicial_baixo",
    "teor_final_baixo",
    "teor_inicial_medio",
    "teor_final_medio",
    "teor_inicial_alto",
    "teor_final_alto",
    "maior_teor"
];

const NUTRIENTS_WITHOUT_EXTREME_RANGES: NutrientSuffix[] = [
    "potassio",
    "boro",
    "cobre",
    "ferro",
    "manganes",
    "zinco",
];

const MICRONUTRIENT_HIDDEN_RANGE_PREFIXES = [
    "menor_teor",
    "teor_inicial_baixo",
    "teor_final_alto",
    "maior_teor",
];
export const visibleRangeFields = (suffix: NutrientSuffix) => RANGE_PREFIXES
    .filter(prefix => !shouldHideRangeField(suffix, prefix));

export const buildDiverseContentRangePayload = (
    form: Record<string, string>,
    update: boolean,
) => {
    const payload: Record<string, number | string> = {};
    NUTRIENTS.forEach(({ value: suffix }) => {
        visibleRangeFields(suffix).forEach(prefix => {
            const key = `${prefix}_${suffix}`;
            if (suffix === "potassio" && !form[key]) return;
            const parsed = parseNumericValue(form[key]);
            payload[update ? `novo_${key}` : key] = parsed;
        });
    });
    payload[update ? "novo_observacoes" : "observacoes"] = form.observacoes ?? "";
    payload[update ? "novo_fontes" : "fontes"] = form.fontes ?? "";
    return payload;
};

const parseNumericValue = (value?: string) => {
    if (!value) return 0;
    return parseFloat(value.replace(',', '.')) || 0;
};

const shouldHideRangeField = (suffix: NutrientSuffix, prefix: string) =>
    NUTRIENTS_WITHOUT_EXTREME_RANGES.includes(suffix) &&
    MICRONUTRIENT_HIDDEN_RANGE_PREFIXES.includes(prefix);

const getRangeLabel = (suffix: NutrientSuffix, prefix: string, label: string) => {
    if (!NUTRIENTS_WITHOUT_EXTREME_RANGES.includes(suffix)) return label;
    if (prefix === "teor_final_baixo") return "Baixo";
    if (prefix === "teor_inicial_alto") return "Alto";
    return label;
};

const READ_SUFFIX_ALIASES: Partial<Record<NutrientSuffix, string[]>> = {
    aluminio_mais_hidrogenio: ["h_al", "hal", "aluminio_hidrogenio"],
    ctc_ph7: ["ctc_ph_7", "ctc_ph_7_0", "ctc_pH7"],
    ph_agua: ["ph_agua", "ph_h2o"]
};

const READ_PREFIX_ALIASES: Record<string, string[]> = {
    menor_teor: ["menor_valor"],
    teor_inicial_baixo: ["valor_inicial_baixo"],
    teor_final_baixo: ["valor_final_baixo"],
    teor_inicial_medio: ["valor_inicial_medio"],
    teor_final_medio: ["valor_final_medio"],
    teor_inicial_alto: ["valor_inicial_alto"],
    teor_final_alto: ["valor_final_alto"],
    maior_teor: ["maior_valor"],
};

const getRangeValue = (
    data: DiverseContentRangeResponseDto,
    prefix: string,
    suffix: NutrientSuffix
) => {
    const prefixes = [prefix, ...(READ_PREFIX_ALIASES[prefix] ?? [])];
    const suffixes = [suffix, ...(READ_SUFFIX_ALIASES[suffix] ?? [])];
    const key = prefixes
        .flatMap(p => suffixes.map(s => `${p}_${s}`))
        .find(k => data[k] !== undefined && data[k] !== null);
    const value = key ? data[key] : "";
    return typeof value === "number" ? value : "";
};

export default function DiverseContentRangeModal({ isOpen, onClose, tableId, isReadOnly = false }: Props) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [existingId, setExistingId] = useState<number | null>(null);
  
  // Armazena todos os valores. Chaves em formato PT (ex: menor_teor_calcio)
  const [form, setForm] = useState<Record<string, string>>({});
  
  // Nutriente selecionado atualmente
  const [selectedNutrient, setSelectedNutrient] = useState<NutrientSuffix>("carbono_organico");

  useEffect(() => {
    if (isOpen && tableId) {
      fetchData();
    } else {
      setForm({});
      setExistingId(null);
      setSelectedNutrient("carbono_organico");
    }
  }, [isOpen, tableId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getDiverseContentRangeByTable(tableId!);
      if (data) {
        setExistingId(data.id);
        
        // Mapeia os dados recebidos para o estado do formulário
        const newForm: Record<string, string> = {};
        NUTRIENTS.forEach(n => {
            const suffix = n.value;
            RANGE_PREFIXES.forEach(prefix => {
                newForm[`${prefix}_${suffix}`] = String(getRangeValue(data, prefix, suffix));
            });
        });
        newForm.observacoes = data.observacoes ?? "";
        newForm.fontes = data.fontes ?? "";
        setForm(newForm);
      } else {
        setExistingId(null);
        setForm({});
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (existingId) {
        // UPDATE (Prefixo "novo_")
        const payload = buildDiverseContentRangePayload(form, true);
        await updateDiverseContentRange(existingId, payload as DiverseContentRangePostRequestDto);
        toaster.create({ title: "Nutrientes atualizados!", type: "success" });

      } else {
        // CREATE (Sem prefixo)
        const payload = buildDiverseContentRangePayload(form, false);

        await createDiverseContentRange(tableId!, payload as DiverseContentRangeCreateRequestDto);
        toaster.create({ title: "Nutrientes configurados!", type: "success" });
        onClose();
      }
    } catch (error) {
      console.error(error);
      toaster.create({ title: "Erro ao salvar.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const renderInputs = () => {
      const suffix = selectedNutrient;
      
      const fields = [
          { label: "Muito Baixo (Menor que)", prefix: "menor_teor" },
          { label: "Baixo (Menor Teor)", prefix: "teor_inicial_baixo" },
          { label: "Baixo (Maior Teor)", prefix: "teor_final_baixo" },
          { label: "Médio (Menor Teor)", prefix: "teor_inicial_medio" },
          { label: "Médio (Maior Teor)", prefix: "teor_final_medio" },
          { label: "Alto (Menor Teor)", prefix: "teor_inicial_alto" },
          { label: "Alto (Maior Teor)", prefix: "teor_final_alto" },
          { label: "Muito Alto (Maior que)", prefix: "maior_teor" },
      ].filter(({ prefix }) => {
          return !shouldHideRangeField(suffix, prefix);
      }).map(({ label, prefix }) => {
          return {
              label: getRangeLabel(suffix, prefix, label),
              key: `${prefix}_${suffix}`,
          };
      });

      return (
          <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={4} mt={4}>
              {fields.map((f) => (
                  <Field.Root key={f.key}>
                      <Field.Label fontSize="xs" color="gray.600" _dark={{ color: "gray.300" }}>
                          {f.label}
                      </Field.Label>
                      <Input
                          size="sm"
                          type="number"
                          step="0.01"
                          value={form[f.key] || ""}
                          onChange={(e) => handleChange(f.key, e.target.value)}
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
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()} size="xl">
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content bg="white" _dark={{ bg: "gray.800" }} maxW="800px">
          <Dialog.Header>
            <Dialog.Title>Teores de Nutrientes Diversos</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            {loading ? (
               <Box textAlign="center" py={10}><Spinner size="xl" color="green.500"/></Box>
            ) : (
                <Box>
                    <Text mb={2} fontSize="sm" fontWeight="bold" color="gray.600" _dark={{ color: "gray.300" }}>
                        Selecione o Nutriente:
                    </Text>
                    
                    <SelectRoot 
                        collection={nutrientsCollection}
                        value={[selectedNutrient]}
                        onValueChange={(e) => setSelectedNutrient(e.value[0] as NutrientSuffix)}
                        size="sm"
                        mb={4}
                    >
                        <SelectTrigger bg="white" _dark={{ bg: "gray.700" }}>
                            <SelectValueText placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                            {nutrientsCollection.items.map((item) => (
                                <SelectItem item={item} key={item.value}>
                                    {item.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </SelectRoot>

                    <Box borderWidth="1px" p={4} borderRadius="md" _dark={{ borderColor: "gray.600" }}>
                        <Text fontWeight="bold" color="green.600" _dark={{ color: "green.300" }} fontSize="sm">
                            Configuração para: {NUTRIENTS.find(n => n.value === selectedNutrient)?.label}
                        </Text>
                        {renderInputs()}
                    </Box>

                    <Grid templateColumns={{ base: "1fr" }} gap={4} mt={6}>
                        <Field.Root>
                            <Field.Label>Observações</Field.Label>
                            <Textarea
                                value={form.observacoes || ""}
                                onChange={(e) => handleChange("observacoes", e.target.value)}
                                readOnly={isReadOnly}
                                minH="100px"
                                bg="white"
                                _dark={{ bg: "gray.700" }}
                            />
                        </Field.Root>

                        <Field.Root>
                            <Field.Label>Fontes</Field.Label>
                            <Textarea
                                value={form.fontes || ""}
                                onChange={(e) => handleChange("fontes", e.target.value)}
                                readOnly={isReadOnly}
                                minH="100px"
                                bg="white"
                                _dark={{ bg: "gray.700" }}
                            />
                        </Field.Root>
                    </Grid>
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
