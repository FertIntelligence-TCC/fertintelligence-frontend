import { useEffect, useState } from "react";
import {
  Dialog,
  Button,
  Input,
  Text,
  Grid,
  Box,
  Spinner,
  Field,
  Tabs
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import {
  getKExchangeableContentByTable,
  createKExchangeableContent,
  updateKExchangeableContent
} from "@/services/kExchangeableContentService";
import {
  KExchangeableContentCreateRequestDto,
  KExchangeableContentPostRequestDto
} from "@/interfaces/KExchangeableContent";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tableId: number | null;
  isReadOnly?: boolean;
}

// Estado inicial vazio para todas as faixas de CTC
const INITIAL_STATE = {
  // CTC < 20
  menor_teor_k_ctc_menor_20: "", teor_inicial_baixo_k_ctc_menor_20: "", teor_final_baixo_k_ctc_menor_20: "",
  teor_inicial_medio_k_ctc_menor_20: "", teor_final_medio_k_ctc_menor_20: "", teor_inicial_alto_k_ctc_menor_20: "",
  teor_final_alto_k_ctc_menor_20: "", maior_teor_k_ctc_menor_20: "",

  // CTC 20-40
  menor_teor_k_ctc_20_40: "", teor_inicial_baixo_k_ctc_20_40: "", teor_final_baixo_k_ctc_20_40: "",
  teor_inicial_medio_k_ctc_20_40: "", teor_final_medio_k_ctc_20_40: "", teor_inicial_alto_k_ctc_20_40: "",
  teor_final_alto_k_ctc_20_40: "", maior_teor_k_ctc_20_40: "",

  // CTC 41-80
  menor_teor_k_ctc_41_80: "", teor_inicial_baixo_k_ctc_41_80: "", teor_final_baixo_k_ctc_41_80: "",
  teor_inicial_medio_k_ctc_41_80: "", teor_final_medio_k_ctc_41_80: "", teor_inicial_alto_k_ctc_41_80: "",
  teor_final_alto_k_ctc_41_80: "", maior_teor_k_ctc_41_80: "",

  // CTC 81-120
  menor_teor_k_ctc_81_120: "", teor_inicial_baixo_k_ctc_81_120: "", teor_final_baixo_k_ctc_81_120: "",
  teor_inicial_medio_k_ctc_81_120: "", teor_final_medio_k_ctc_81_120: "", teor_inicial_alto_k_ctc_81_120: "",
  teor_final_alto_k_ctc_81_120: "", maior_teor_k_ctc_81_120: "",

  // CTC > 120
  menor_teor_k_ctc_maior_120: "", teor_inicial_baixo_k_ctc_maior_120: "", teor_final_baixo_k_ctc_maior_120: "",
  teor_inicial_medio_k_ctc_maior_120: "", teor_final_medio_k_ctc_maior_120: "", teor_inicial_alto_k_ctc_maior_120: "",
  teor_final_alto_k_ctc_maior_120: "", maior_teor_k_ctc_maior_120: ""
};

export default function KExchangeableContentModal({ isOpen, onClose, tableId, isReadOnly = false }: Props) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [existingId, setExistingId] = useState<number | null>(null);
  const [form, setForm] = useState(INITIAL_STATE);

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
      const data = await getKExchangeableContentByTable(tableId!);
      if (data) {
        setExistingId(data.id);
        const newForm: any = {};
        Object.keys(INITIAL_STATE).forEach(key => {
            // @ts-ignore
            newForm[key] = data[key] !== null ? String(data[key]) : "";
        });
        setForm(newForm);
      } else {
        setExistingId(null);
        setForm(INITIAL_STATE);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
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
            payload[`novo_${key}`] = parse((form as any)[key]);
        });
        
        await updateKExchangeableContent(existingId, payload as KExchangeableContentPostRequestDto);
        toaster.create({ title: "Potássio atualizado!", type: "success" });

      } else {
        // CREATE (Sem prefixo)
        const payload: any = {};
        Object.keys(form).forEach(key => {
            payload[key] = parse((form as any)[key]);
        });

        await createKExchangeableContent(tableId!, payload as KExchangeableContentCreateRequestDto);
        toaster.create({ title: "Potássio configurado!", type: "success" });
        onClose();
      }
    } catch (error) {
      console.error(error);
      toaster.create({ title: "Erro ao salvar.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const renderInputs = (suffix: string) => {
      // Suffix ex: "_ctc_menor_20"
      const fields = [
          { label: "Muito Baixo (Menor que)", key: `menor_teor_k${suffix}` },
          { label: "Baixo (Menor Teor)", key: `teor_inicial_baixo_k${suffix}` },
          { label: "Baixo (Maior Teor)", key: `teor_final_baixo_k${suffix}` },
          { label: "Médio (Menor Teor)", key: `teor_inicial_medio_k${suffix}` },
          { label: "Médio (Maior Teor)", key: `teor_final_medio_k${suffix}` },
          { label: "Alto (Menor Teor)", key: `teor_inicial_alto_k${suffix}` },
          { label: "Alto (Maior Teor)", key: `teor_final_alto_k${suffix}` },
          { label: "Muito Alto (Maior que)", key: `maior_teor_k${suffix}` },
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
                          // @ts-ignore
                          value={form[f.key]}
                          // @ts-ignore
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
            <Dialog.Title>Teores Trocáveis de Potássio (K) - mg/dm³</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            {loading ? (
               <Box textAlign="center" py={10}><Spinner size="xl" color="green.500"/></Box>
            ) : (
                <Tabs.Root defaultValue="ctc_low" variant="enclosed">
                    <Tabs.List flexWrap="wrap">
                        <Tabs.Trigger value="ctc_low">CTC &lt; 20</Tabs.Trigger>
                        <Tabs.Trigger value="ctc_20_40">20 - 40</Tabs.Trigger>
                        <Tabs.Trigger value="ctc_41_80">41 - 80</Tabs.Trigger>
                        <Tabs.Trigger value="ctc_81_120">81 - 120</Tabs.Trigger>
                        <Tabs.Trigger value="ctc_high">&gt; 120</Tabs.Trigger>
                    </Tabs.List>

                    <Tabs.Content value="ctc_low">
                        <Text fontSize="sm" color="gray.500" _dark={{ color: "gray.400" }} mb={2}>CTC &lt; 20 mmolc/dm³</Text>
                        {renderInputs("_ctc_menor_20")}
                    </Tabs.Content>
                    
                    <Tabs.Content value="ctc_20_40">
                        <Text fontSize="sm" color="gray.500" _dark={{ color: "gray.400" }} mb={2}>CTC entre 20 e 40 mmolc/dm³</Text>
                        {renderInputs("_ctc_20_40")}
                    </Tabs.Content>

                    <Tabs.Content value="ctc_41_80">
                        <Text fontSize="sm" color="gray.500" _dark={{ color: "gray.400" }} mb={2}>CTC entre 41 e 80 mmolc/dm³</Text>
                        {renderInputs("_ctc_41_80")}
                    </Tabs.Content>

                    <Tabs.Content value="ctc_81_120">
                        <Text fontSize="sm" color="gray.500" _dark={{ color: "gray.400" }} mb={2}>CTC entre 81 e 120 mmolc/dm³</Text>
                        {renderInputs("_ctc_81_120")}
                    </Tabs.Content>

                    <Tabs.Content value="ctc_high">
                        <Text fontSize="sm" color="gray.500" _dark={{ color: "gray.400" }} mb={2}>CTC &gt; 120 mmolc/dm³</Text>
                        {renderInputs("_ctc_maior_120")}
                    </Tabs.Content>
                </Tabs.Root>
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