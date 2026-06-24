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

const NUTRIENTS: NutrientOption[] = [
    { label: "Al trocável (Al³+, mmolc/dm³)", value: "aluminio" },
    { label: "H+Al (mmolc/dm³)", value: "aluminio_mais_hidrogenio" },
    { label: "CTC (t) (mmolc/dm³)", value: "ctc_efetiva" },
    { label: "CTC (T) (mmolc/dm³)", value: "ctc_ph7" },
    { label: "pH em água (1:2,5)", value: "ph_agua" },
    { label: "pH em CaCl2 0,01 mol/L (1:2,5)", value: "ph_cacl2" },
    { label: "Carbono Orgânico (g/dm3)", value: "carbono_organico" },
    { label: "Matéria Orgânica (g/dm3)", value: "materia_organica" },
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
    data: Record<string, number>,
    prefix: string,
    suffix: NutrientSuffix
) => {
    const prefixes = [prefix, ...(READ_PREFIX_ALIASES[prefix] ?? [])];
    const suffixes = [suffix, ...(READ_SUFFIX_ALIASES[suffix] ?? [])];
    const key = prefixes
        .flatMap(p => suffixes.map(s => `${p}_${s}`))
        .find(k => data[k] !== undefined && data[k] !== null);
    return key ? data[key] : "";
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

  const parse = (val: string) => {
    if (!val) return 0;
    return parseFloat(val.replace(',', '.')) || 0;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (existingId) {
        // UPDATE (Prefixo "novo_")
        const payload: any = {};
        Object.keys(form).forEach(key => {
            payload[`novo_${key}`] = parse(form[key]);
        });
        await updateDiverseContentRange(existingId, payload as DiverseContentRangePostRequestDto);
        toaster.create({ title: "Nutrientes atualizados!", type: "success" });

      } else {
        // CREATE (Sem prefixo)
        const payload: any = {};
        
        // Garante que todos os campos de todos os nutrientes sejam enviados (mesmo que 0)
        NUTRIENTS.forEach(n => {
            const suffix = n.value;
            const fields = RANGE_PREFIXES.map(prefix => `${prefix}_${suffix}`);
            fields.forEach(f => {
                payload[f] = parse(form[f] || "0");
            });
        });

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
          { label: "Muito Baixo (Menor que)", key: `menor_teor_${suffix}` },
          { label: "Baixo (Menor Teor)", key: `teor_inicial_baixo_${suffix}` },
          { label: "Baixo (Maior Teor)", key: `teor_final_baixo_${suffix}` },
          { label: "Médio (Menor Teor)", key: `teor_inicial_medio_${suffix}` },
          { label: "Médio (Maior Teor)", key: `teor_final_medio_${suffix}` },
          { label: "Alto (Menor Teor)", key: `teor_inicial_alto_${suffix}` },
          { label: "Alto (Maior Teor)", key: `teor_final_alto_${suffix}` },
          { label: "Muito Alto (Maior que)", key: `maior_teor_${suffix}` },
      ];

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
