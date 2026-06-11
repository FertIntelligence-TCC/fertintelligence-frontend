import { useEffect, useState } from "react";
import {
Dialog,
Button,
Input,
Grid,
Box,
Spinner,
Field
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

const INITIAL_STATE = {
menor_teor_k: "",
teor_inicial_baixo_k: "",
teor_final_baixo_k: "",
teor_inicial_medio_k: "",
teor_final_medio_k: "",
teor_inicial_alto_k: "",
teor_final_alto_k: "",
maior_teor_k: ""
};

export default function KExchangeableContentModal({
isOpen,
onClose,
tableId,
isReadOnly = false
}: Props) {

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

const handleSave = async () => {
setSaving(true);


try {
  if (existingId) {
    const payload: any = {};

    Object.keys(form).forEach(key => {
      payload[`novo_${key}`] = parse((form as any)[key]);
    });

    await updateKExchangeableContent(
      existingId,
      payload as KExchangeableContentPostRequestDto
    );

    toaster.create({
      title: "Potássio atualizado!",
      type: "success"
    });
  } else {
    const payload: any = {};

    Object.keys(form).forEach(key => {
      payload[key] = parse((form as any)[key]);
    });

    await createKExchangeableContent(
      tableId!,
      payload as KExchangeableContentCreateRequestDto
    );

    toaster.create({
      title: "Potássio configurado!",
      type: "success"
    });
  }

  onClose();

} catch (e) {
  console.error(e);

  toaster.create({
    title: "Erro ao salvar.",
    type: "error"
  });
} finally {
  setSaving(false);
}


};

const fields = [
["Muito Baixo (Menor que)", "menor_teor_k"],
["Baixo (Menor Teor)", "teor_inicial_baixo_k"],
["Baixo (Maior Teor)", "teor_final_baixo_k"],
["Médio (Menor Teor)", "teor_inicial_medio_k"],
["Médio (Maior Teor)", "teor_final_medio_k"],
["Alto (Menor Teor)", "teor_inicial_alto_k"],
["Alto (Maior Teor)", "teor_final_alto_k"],
["Muito Alto (Maior que)", "maior_teor_k"]
];

return (
<Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()} size="xl">
<Dialog.Backdrop />


  <Dialog.Positioner>
    <Dialog.Content bg="white" _dark={{ bg: "gray.800" }} maxW="700px">

      <Dialog.Header>
        <Dialog.Title>
          Teores Trocáveis de Potássio (K) - mg/dm³
        </Dialog.Title>
      </Dialog.Header>

      <Dialog.Body>

        {loading ? (
          <Box textAlign="center" py={10}>
            <Spinner size="xl" />
          </Box>
        ) : (
          <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={4}>

            {fields.map(([label, key]) => (
              <Field.Root key={key}>
                <Field.Label>{label}</Field.Label>

                <Input
                  type="number"
                  step="0.01"
                  value={(form as any)[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                  readOnly={isReadOnly}
                />
              </Field.Root>
            ))}

          </Grid>
        )}

      </Dialog.Body>

      <Dialog.Footer>
        <Button variant="ghost" onClick={onClose}>
          Fechar
        </Button>

        {!isReadOnly && (
          <Button
            colorPalette="green"
            onClick={handleSave}
            loading={saving}
          >
            Salvar Configuração
          </Button>
        )}
      </Dialog.Footer>

    </Dialog.Content>
  </Dialog.Positioner>
</Dialog.Root>


);
}
