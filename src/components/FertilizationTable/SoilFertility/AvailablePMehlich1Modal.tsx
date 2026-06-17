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
  getAvailablePMehlich1ByTable,
  createAvailablePMehlich1,
  updateAvailablePMehlich1
} from "@/services/availablePMehlich1Service";
import {
  AvailablePMehlich1CreateRequestDto,
  AvailablePMehlich1PostRequestDto
} from "@/interfaces/AvailablePMehlich1";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tableId: number | null;
  isReadOnly?: boolean;
}

// Chaves para o estado do formulário (Português)
const INITIAL_STATE = {
  // Arenoso
  menor_teor_fosforo_solo_arenoso: "", teor_inicial_baixo_fosforo_solo_arenoso: "", teor_final_baixo_fosforo_solo_arenoso: "",
  teor_inicial_medio_fosforo_solo_arenoso: "", teor_final_medio_fosforo_solo_arenoso: "", teor_inicial_alto_fosforo_solo_arenoso: "",
  teor_final_alto_fosforo_solo_arenoso: "", maior_teor_fosforo_solo_arenoso: "",

  // Médio
  menor_teor_fosforo_solo_arenoso_argiloso: "", teor_inicial_baixo_fosforo_solo_arenoso_argiloso: "", teor_final_baixo_fosforo_solo_arenoso_argiloso: "",
  teor_inicial_medio_fosforo_solo_arenoso_argiloso: "", teor_final_medio_fosforo_solo_arenoso_argiloso: "", teor_inicial_alto_fosforo_solo_arenoso_argiloso: "",
  teor_final_alto_fosforo_solo_arenoso_argiloso: "", maior_teor_fosforo_solo_arenoso_argiloso: "",

  // Argiloso
  menor_teor_fosforo_solo_argiloso: "", teor_inicial_baixo_fosforo_solo_argiloso: "", teor_final_baixo_fosforo_solo_argiloso: "",
  teor_inicial_medio_fosforo_solo_argiloso: "", teor_final_medio_fosforo_solo_argiloso: "", teor_inicial_alto_fosforo_solo_argiloso: "",
  teor_final_alto_fosforo_solo_argiloso: "", maior_teor_fosforo_solo_argiloso: "",

  // Muito Argiloso
  menor_teor_fosforo_solo_muito_argiloso: "", teor_inicial_baixo_fosforo_solo_muito_argiloso: "", teor_final_baixo_fosforo_solo_muito_argiloso: "",
  teor_inicial_medio_fosforo_solo_muito_argiloso: "", teor_final_medio_fosforo_solo_muito_argiloso: "", teor_inicial_alto_fosforo_solo_muito_argiloso: "",
  teor_final_alto_fosforo_solo_muito_argiloso: "", maior_teor_fosforo_solo_muito_argiloso: ""
};

export default function AvailablePMehlich1Modal({ isOpen, onClose, tableId, isReadOnly = false }: Props) {
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
      const data = await getAvailablePMehlich1ByTable(tableId!);
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
        
        await updateAvailablePMehlich1(existingId, payload as AvailablePMehlich1PostRequestDto);
        toaster.create({ title: "Fósforo (Mehlich-1) atualizado!", type: "success" });

      } else {
        // CREATE (Sem prefixo)
        const payload: any = {};
        Object.keys(form).forEach(key => {
            payload[key] = parse((form as any)[key]);
        });

        await createAvailablePMehlich1(tableId!, payload as AvailablePMehlich1CreateRequestDto);
        toaster.create({ title: "Fósforo (Mehlich-1) configurado!", type: "success" });
        onClose();
      }
    } catch (error) {
      console.error(error);
      toaster.create({ title: "Erro ao salvar.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  // Renderiza um grupo de inputs para uma textura específica
  const renderTextureInputs = (
      suffix: string // Ex: "_solo_arenoso"
  ) => {
      // Define a ordem lógica dos campos
      const fields = [
          { label: "Muito Baixo (Menor que)", key: `menor_teor_fosforo${suffix}` },
          { label: "Baixo (Menor Teor)", key: `teor_inicial_baixo_fosforo${suffix}` },
          { label: "Baixo (Maior Teor)", key: `teor_final_baixo_fosforo${suffix}` },
          { label: "Médio (Menor Teor)", key: `teor_inicial_medio_fosforo${suffix}` },
          { label: "Médio (Maior Teor)", key: `teor_final_medio_fosforo${suffix}` },
          { label: "Alto (Menor Teor)", key: `teor_inicial_alto_fosforo${suffix}` },
          { label: "Alto (Maior Teor)", key: `teor_final_alto_fosforo${suffix}` },
          { label: "Muito Alto (Maior que)", key: `maior_teor_fosforo${suffix}` },
      ];

      return (
          <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={4} mt={4}>
              {fields.map((f) => (
                  <Field.Root key={f.key}>
                      {/* CORREÇÃO DE VISIBILIDADE DO RÓTULO */}
                      <Field.Label fontSize="xs" color="gray.600" _dark={{ color: "gray.300" }}>
                          {f.label}
                      </Field.Label>
                      
                      {/* CORREÇÃO DE VISIBILIDADE DO INPUT */}
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
            <Dialog.Title>Fósforo Disponível (Extrator Mehlich-1) - mg/dm³</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            {loading ? (
               <Box textAlign="center" py={10}><Spinner size="xl" color="green.500"/></Box>
            ) : (
                <Tabs.Root defaultValue="arenoso" variant="enclosed">
                    <Tabs.List>
                        <Tabs.Trigger value="arenoso">Arenoso</Tabs.Trigger>
                        <Tabs.Trigger value="medio">Médio</Tabs.Trigger>
                        <Tabs.Trigger value="argiloso">Argiloso</Tabs.Trigger>
                        <Tabs.Trigger value="muito_argiloso">Muito Argiloso</Tabs.Trigger>
                    </Tabs.List>

                    <Tabs.Content value="arenoso">
                        <Text fontSize="sm" color="gray.500" _dark={{ color: "gray.400" }} mb={2}>Teor de Argila &lt; 15%</Text>
                        {renderTextureInputs("_solo_arenoso")}
                    </Tabs.Content>
                    
                    <Tabs.Content value="medio">
                        <Text fontSize="sm" color="gray.500" _dark={{ color: "gray.400" }} mb={2}>Teor de Argila 15% - 35%</Text>
                        {renderTextureInputs("_solo_arenoso_argiloso")}
                    </Tabs.Content>

                    <Tabs.Content value="argiloso">
                        <Text fontSize="sm" color="gray.500" _dark={{ color: "gray.400" }} mb={2}>Teor de Argila 35.1% - 60%</Text>
                        {renderTextureInputs("_solo_argiloso")}
                    </Tabs.Content>

                    <Tabs.Content value="muito_argiloso">
                        <Text fontSize="sm" color="gray.500" _dark={{ color: "gray.400" }} mb={2}>Teor de Argila &gt; 60%</Text>
                        {renderTextureInputs("_solo_muito_argiloso")}
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
