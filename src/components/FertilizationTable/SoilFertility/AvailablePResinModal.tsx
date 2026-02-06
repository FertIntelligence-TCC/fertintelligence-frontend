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
  getAvailablePResinByTable,
  createAvailablePResin,
  updateAvailablePResin
} from "@/services/availablePResinService";
import {
  AvailablePResinCreateRequestDto,
  AvailablePResinPostRequestDto
} from "@/interfaces/AvailablePResin";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tableId: number | null;
  isReadOnly?: boolean;
}

// Configuração das Culturas
const CROPS = [
    { label: "Algodão", pt: "algodao", en: "cotton" },
    { label: "Amendoim", pt: "amendoim", en: "peanut" },
    { label: "Cana-de-Açúcar", pt: "cana_de_acucar", en: "sugar_cane" },
    { label: "Feijão-Caupi", pt: "feijao_caupi", en: "cowpea" },
    { label: "Feijão-Comum", pt: "feijao_comum", en: "common_bean" },
    { label: "Gergelim", pt: "gergelim", en: "sesame" },
    { label: "Mamona", pt: "mamona", en: "castor_bean" },
    { label: "Milho", pt: "milho", en: "corn" },
    { label: "Sisal", pt: "sisal", en: "sisal" },
    { label: "Soja", pt: "soja", en: "soybean" },
];

const cropsCollection = createListCollection({
    items: CROPS.map(c => ({ label: c.label, value: c.pt })),
});

export default function AvailablePResinModal({ isOpen, onClose, tableId, isReadOnly = false }: Props) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [existingId, setExistingId] = useState<number | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [selectedCropPt, setSelectedCropPt] = useState<string>("algodao");

  useEffect(() => {
    if (isOpen && tableId) {
      fetchData();
    } else {
      setForm({});
      setExistingId(null);
      setSelectedCropPt("algodao");
    }
  }, [isOpen, tableId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getAvailablePResinByTable(tableId!);
      if (data) {
        setExistingId(data.id);
        const newForm: Record<string, string> = {};
        
        CROPS.forEach(crop => {
            newForm[`menor_teor_fosforo_solo_${crop.pt}`] = String(data[`p_content_${crop.en}_too_low`] || "");
            newForm[`teor_inicial_baixo_fosforo_solo_${crop.pt}`] = String(data[`p_content_${crop.en}_low_i`] || "");
            newForm[`teor_final_baixo_fosforo_solo_${crop.pt}`] = String(data[`p_content_${crop.en}_low_f`] || "");
            newForm[`teor_inicial_medio_fosforo_solo_${crop.pt}`] = String(data[`p_content_${crop.en}_medium_i`] || "");
            newForm[`teor_final_medio_fosforo_solo_${crop.pt}`] = String(data[`p_content_${crop.en}_medium_f`] || "");
            newForm[`teor_inicial_alto_fosforo_solo_${crop.pt}`] = String(data[`p_content_${crop.en}_hight_i`] || "");
            newForm[`teor_final_alto_fosforo_solo_${crop.pt}`] = String(data[`p_content_${crop.en}_hight_f`] || "");
            newForm[`maior_teor_fosforo_solo_${crop.pt}`] = String(data[`p_content_${crop.en}_too_hight`] || "");
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
        const payload: any = {};
        Object.keys(form).forEach(key => {
            payload[`novo_${key}`] = parse(form[key]);
        });
        await updateAvailablePResin(existingId, payload as AvailablePResinPostRequestDto);
        toaster.create({ title: "Fósforo (Resina) atualizado!", type: "success" });

      } else {
        const payload: any = {};
        CROPS.forEach(crop => {
             const fields = [
                 `menor_teor_fosforo_solo_${crop.pt}`,
                 `teor_inicial_baixo_fosforo_solo_${crop.pt}`,
                 `teor_final_baixo_fosforo_solo_${crop.pt}`,
                 `teor_inicial_medio_fosforo_solo_${crop.pt}`,
                 `teor_final_medio_fosforo_solo_${crop.pt}`,
                 `teor_inicial_alto_fosforo_solo_${crop.pt}`,
                 `teor_final_alto_fosforo_solo_${crop.pt}`,
                 `maior_teor_fosforo_solo_${crop.pt}`
             ];
             fields.forEach(f => {
                 payload[f] = parse(form[f] || "0");
             });
        });

        await createAvailablePResin(tableId!, payload as AvailablePResinCreateRequestDto);
        toaster.create({ title: "Fósforo (Resina) configurado!", type: "success" });
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
      const suffix = `_${selectedCropPt}`;
      
      const fields = [
          { label: "Muito Baixo (Menor que)", key: `menor_teor_fosforo_solo${suffix}` },
          { label: "Baixo (Menor Teor)", key: `teor_inicial_baixo_fosforo_solo${suffix}` },
          { label: "Baixo (Maior Teor)", key: `teor_final_baixo_fosforo_solo${suffix}` },
          { label: "Médio (Menor Teor)", key: `teor_inicial_medio_fosforo_solo${suffix}` },
          { label: "Médio (Maior Teor)", key: `teor_final_medio_fosforo_solo${suffix}` },
          { label: "Alto (Menor Teor)", key: `teor_inicial_alto_fosforo_solo${suffix}` },
          { label: "Alto (Maior Teor)", key: `teor_final_alto_fosforo_solo${suffix}` },
          { label: "Muito Alto (Maior que)", key: `maior_teor_fosforo_solo${suffix}` },
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
            <Dialog.Title>Fósforo Disponível (Extrator Resina) - mg/dm³</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            {loading ? (
               <Box textAlign="center" py={10}><Spinner size="xl" color="green.500"/></Box>
            ) : (
                <Box>
                    {/* --- CORREÇÃO AQUI: Trocado Field.Label por Text --- */}
                    <Text mb={2} fontSize="sm" fontWeight="bold" color="gray.600" _dark={{ color: "gray.300" }}>
                        Selecione a Cultura:
                    </Text>
                    
                    <SelectRoot 
                        collection={cropsCollection}
                        value={[selectedCropPt]}
                        onValueChange={(e) => setSelectedCropPt(e.value[0])}
                        size="sm"
                        mb={4}
                    >
                        <SelectTrigger bg="white" _dark={{ bg: "gray.700" }}>
                            <SelectValueText placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                            {cropsCollection.items.map((item) => (
                                <SelectItem item={item} key={item.value}>
                                    {item.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </SelectRoot>

                    <Box borderWidth="1px" p={4} borderRadius="md" _dark={{ borderColor: "gray.600" }}>
                        <Text fontWeight="bold" color="green.600" _dark={{ color: "green.300" }} fontSize="sm">
                            Configuração para: {CROPS.find(c => c.pt === selectedCropPt)?.label}
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