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
  Tabs,
  Textarea
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import {
  getAvailableSByTable,
  createAvailableS,
  updateAvailableS
} from "@/services/availableSService";
import {
  AvailableSCreateRequestDto,
  AvailableSPostRequestDto
} from "@/interfaces/AvailableS";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tableId: number | null;
  isReadOnly?: boolean;
}

const DEFAULT_OBSERVATIONS =
  "Os teores de S disponível são os estimados por solução de 500 mg/L de P em ácido acético glacial 0,5 mol/L.\n\n" +
  "E o valor considerado é a média das camadas de 0 a 20 cm e 21 a 40 cm.";

const INITIAL_STATE = {
  menor_teor_enxofre_argila_menor_400: "",
  teor_inicial_baixo_enxofre_argila_menor_400: "",
  teor_final_baixo_enxofre_argila_menor_400: "",
  teor_inicial_medio_enxofre_argila_menor_400: "",
  teor_final_medio_enxofre_argila_menor_400: "",
  teor_inicial_alto_enxofre_argila_menor_400: "",
  teor_final_alto_enxofre_argila_menor_400: "",
  maior_teor_enxofre_argila_menor_400: "",
  menor_teor_enxofre_argila_maior_400: "",
  teor_inicial_baixo_enxofre_argila_maior_400: "",
  teor_final_baixo_enxofre_argila_maior_400: "",
  teor_inicial_medio_enxofre_argila_maior_400: "",
  teor_final_medio_enxofre_argila_maior_400: "",
  teor_inicial_alto_enxofre_argila_maior_400: "",
  teor_final_alto_enxofre_argila_maior_400: "",
  maior_teor_enxofre_argila_maior_400: "",
  fonte_literatura: "",
  observacoes: DEFAULT_OBSERVATIONS
};

const NUMERIC_FIELDS = Object.keys(INITIAL_STATE).filter(
  key => key !== "fonte_literatura" && key !== "observacoes"
);

export default function AvailableSModal({ isOpen, onClose, tableId, isReadOnly = false }: Props) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [existingId, setExistingId] = useState<number | null>(null);
  const [form, setForm] = useState(INITIAL_STATE);

  useEffect(() => {
    if (isOpen && tableId) fetchData();
    else {
      setForm(INITIAL_STATE);
      setExistingId(null);
    }
  }, [isOpen, tableId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getAvailableSByTable(tableId!);
      if (data) {
        setExistingId(data.id);
        const newForm: any = {};
        Object.keys(INITIAL_STATE).forEach(key => {
          // @ts-ignore
          newForm[key] = data[key] !== null && data[key] !== undefined ? String(data[key]) : "";
        });
        if (!newForm.observacoes) newForm.observacoes = DEFAULT_OBSERVATIONS;
        setForm(newForm);
      } else {
        setExistingId(null);
        setForm(INITIAL_STATE);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const parse = (value: string) => {
    if (!value) return 0;
    return parseFloat(value.replace(",", ".")) || 0;
  };

  const buildPayload = (update: boolean) => {
    const payload: any = {};
    Object.keys(form).forEach(key => {
      const payloadKey = update ? `novo_${key}` : key;
      payload[payloadKey] = NUMERIC_FIELDS.includes(key)
        ? parse((form as any)[key])
        : (form as any)[key];
    });
    return payload;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (existingId) {
        await updateAvailableS(existingId, buildPayload(true) as AvailableSPostRequestDto);
        toaster.create({ title: "Enxofre atualizado!", type: "success" });
      } else {
        await createAvailableS(tableId!, buildPayload(false) as AvailableSCreateRequestDto);
        toaster.create({ title: "Enxofre configurado!", type: "success" });
      }
      onClose();
    } catch (error) {
      console.error(error);
      toaster.create({ title: "Erro ao salvar.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const renderTextureInputs = (suffix: string) => {
    const fields = [
      ["Muito Baixo (Menor que)", `menor_teor_enxofre${suffix}`],
      ["Baixo (Menor Teor)", `teor_inicial_baixo_enxofre${suffix}`],
      ["Baixo (Maior Teor)", `teor_final_baixo_enxofre${suffix}`],
      ["Médio (Menor Teor)", `teor_inicial_medio_enxofre${suffix}`],
      ["Médio (Maior Teor)", `teor_final_medio_enxofre${suffix}`],
      ["Alto (Menor Teor)", `teor_inicial_alto_enxofre${suffix}`],
      ["Alto (Maior Teor)", `teor_final_alto_enxofre${suffix}`],
      ["Muito Alto (Maior que)", `maior_teor_enxofre${suffix}`]
    ];

    return (
      <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={4} mt={4}>
        {fields.map(([label, key]) => (
          <Field.Root key={key}>
            <Field.Label fontSize="xs" color="gray.600" _dark={{ color: "gray.300" }}>
              {label}
            </Field.Label>
            <Input
              size="sm"
              type="number"
              step="0.01"
              value={(form as any)[key]}
              onChange={(e) => handleChange(key, e.target.value)}
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
        <Dialog.Content bg="white" _dark={{ bg: "gray.800" }} maxW="850px">
          <Dialog.Header>
            <Dialog.Title>Enxofre Disponível (S) - mg/dm³</Dialog.Title>
          </Dialog.Header>

          <Dialog.Body>
            {loading ? (
              <Box textAlign="center" py={10}>
                <Spinner size="xl" color="green.500" />
              </Box>
            ) : (
              <>
                <Tabs.Root defaultValue="argila_menor_400" variant="enclosed">
                  <Tabs.List>
                    <Tabs.Trigger value="argila_menor_400">Argila &lt; 400 g/dm³</Tabs.Trigger>
                    <Tabs.Trigger value="argila_maior_400">Argila &gt; 400 g/dm³</Tabs.Trigger>
                  </Tabs.List>

                  <Tabs.Content value="argila_menor_400">
                    <Text fontSize="sm" color="gray.500" _dark={{ color: "gray.400" }} mb={2}>
                      Solos com teor de argila &lt; 400 g/dm³
                    </Text>
                    {renderTextureInputs("_argila_menor_400")}
                  </Tabs.Content>

                  <Tabs.Content value="argila_maior_400">
                    <Text fontSize="sm" color="gray.500" _dark={{ color: "gray.400" }} mb={2}>
                      Solos com teor de argila &gt; 400 g/dm³
                    </Text>
                    {renderTextureInputs("_argila_maior_400")}
                  </Tabs.Content>
                </Tabs.Root>

                <Grid templateColumns={{ base: "1fr" }} gap={4} mt={6}>
                  <Field.Root>
                    <Field.Label>Fonte da Literatura</Field.Label>
                    <Input
                      value={form.fonte_literatura}
                      onChange={(e) => handleChange("fonte_literatura", e.target.value)}
                      readOnly={isReadOnly}
                    />
                  </Field.Root>

                  <Field.Root>
                    <Field.Label>Observações</Field.Label>
                    <Textarea
                      value={form.observacoes}
                      onChange={(e) => handleChange("observacoes", e.target.value)}
                      readOnly={isReadOnly}
                      minH="120px"
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
