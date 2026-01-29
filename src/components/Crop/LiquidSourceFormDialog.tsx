import { useEffect, useState } from "react";
import { 
  VStack, 
  SimpleGrid, 
  Input, 
  NativeSelect 
} from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { toaster } from "@/components/ui/toaster";
import { 
  LiquidSourceResponseDto, 
  LiquidSourceCreateRequestDto,
  AppliedMicronutrient 
} from "@/interfaces/FoliarFertilization";
import { CropDate } from "@/interfaces/Crop";
import { 
  createLiquidSource, 
  updateLiquidSource 
} from "@/services/liquidSourceService";

interface LiquidSourceFormDialogProps {
  open: boolean;
  onOpenChange: (details: { open: boolean }) => void;
  cropId: number;
  selectedItem?: LiquidSourceResponseDto | null;
  onSuccess: () => void;
}

// Helpers de Data
const dateToIso = (date?: CropDate): string => {
  if (!date) return "";
  const y = date.year.toString().padStart(4, '0');
  const m = date.month.toString().padStart(2, '0');
  const d = date.day.toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const isoToCropDate = (iso: string): CropDate => {
  const [year, month, day] = iso.split('-').map(Number);
  return { day, month, year };
};

// Mapeamento correto conforme o erro do Backend: [Mn, B, Zn, Fe, Cu, Mo]
const MICRONUTRIENT_OPTIONS = [
  { label: 'Boro', value: 'B' },
  { label: 'Cobre', value: 'Cu' },
  { label: 'Ferro', value: 'Fe' },
  { label: 'Manganês', value: 'Mn' },
  { label: 'Molibdênio', value: 'Mo' },
  { label: 'Zinco', value: 'Zn' },
  // Níquel e Cloro foram removidos pois não apareceram na lista de aceitos do erro.
  // Se o backend suportar no futuro, adicione: { label: 'Níquel', value: 'Ni' }
];

export const LiquidSourceFormDialog = ({
  open,
  onOpenChange,
  cropId,
  selectedItem,
  onSuccess,
}: LiquidSourceFormDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const [dataAplicacao, setDataAplicacao] = useState("");
  const [micronutriente, setMicronutriente] = useState<string>("");
  const [fonte, setFonte] = useState("");
  const [concentracao, setConcentracao] = useState("");
  const [densidade, setDensidade] = useState("");
  const [volumeAplicado, setVolumeAplicado] = useState("");
  const [volumeCalda, setVolumeCalda] = useState("");

  useEffect(() => {
    if (open) {
      if (selectedItem) {
        setDataAplicacao(dateToIso(selectedItem.data));
        setMicronutriente(selectedItem.micronutriente_aplicado);
        setFonte(selectedItem.fonte);
        setConcentracao(selectedItem.concentracao.toString());
        setDensidade(selectedItem.densidade.toString());
        setVolumeAplicado(selectedItem.volume_aplicado.toString());
        setVolumeCalda(selectedItem.volume_calda.toString());
      } else {
        setDataAplicacao("");
        setMicronutriente("");
        setFonte("");
        setConcentracao("");
        setDensidade("");
        setVolumeAplicado("");
        setVolumeCalda("");
      }
    }
  }, [open, selectedItem]);

  const handleSubmit = async () => {
    if (!dataAplicacao || !micronutriente || !fonte) {
      toaster.create({ title: "Preencha os campos obrigatórios", type: "error" });
      return;
    }

    setIsLoading(true);
    try {
      const payload: LiquidSourceCreateRequestDto = {
        data: isoToCropDate(dataAplicacao),
        micronutriente_aplicado: micronutriente as AppliedMicronutrient,
        fonte,
        concentracao: Number(concentracao) || 0,
        densidade: Number(densidade) || 0,
        volume_aplicado: Number(volumeAplicado) || 0,
        volume_calda: Number(volumeCalda) || 0,
      };

      if (selectedItem) {
        await updateLiquidSource(selectedItem.id, {
          novo_data: payload.data,
          novo_micronutriente_aplicado: payload.micronutriente_aplicado,
          novo_fonte: payload.fonte,
          novo_concentracao: payload.concentracao,
          novo_densidade: payload.densidade,
          novo_volume_aplicado: payload.volume_aplicado,
          novo_volume_calda: payload.volume_calda,
        });
        toaster.create({ title: "Adubação atualizada!", type: "success" });
      } else {
        await createLiquidSource(cropId, payload);
        toaster.create({ title: "Adubação registrada!", type: "success" });
      }

      onSuccess();
      onOpenChange({ open: false });
    } catch (error) {
      console.error(error);
      toaster.create({ title: "Erro ao salvar", description: "Verifique os dados e tente novamente.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange} size="lg">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {selectedItem ? "Editar Fonte Líquida" : "Nova Fonte Líquida"}
          </DialogTitle>
        </DialogHeader>
        <DialogBody>
          <VStack gap={4} align="stretch">
            <SimpleGrid columns={2} gap={4}>
              <Field label="Data" required>
                <Input type="date" value={dataAplicacao} onChange={e => setDataAplicacao(e.target.value)} />
              </Field>
              <Field label="Micronutriente" required>
                <NativeSelect.Root size="sm" width="100%">
                  <NativeSelect.Field 
                    placeholder="Selecione..." 
                    value={micronutriente} 
                    onChange={(e) => setMicronutriente(e.target.value)}
                  >
                    {MICRONUTRIENT_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </NativeSelect.Field>
                </NativeSelect.Root>
              </Field>
            </SimpleGrid>

            <Field label="Fonte (Produto)" required>
              <Input value={fonte} onChange={e => setFonte(e.target.value)} placeholder="Ex: Borax Líquido" />
            </Field>

            <SimpleGrid columns={2} gap={4}>
              <Field label="Concentração (g/L)">
                <Input type="number" step="0.1" value={concentracao} onChange={e => setConcentracao(e.target.value)} />
              </Field>
              <Field label="Densidade (g/cm³)">
                <Input type="number" step="0.01" value={densidade} onChange={e => setDensidade(e.target.value)} />
              </Field>
              <Field label="Dose (L/ha)">
                <Input type="number" step="0.1" value={volumeAplicado} onChange={e => setVolumeAplicado(e.target.value)} />
              </Field>
              <Field label="Volume de Calda (L/ha)">
                <Input type="number" step="1" value={volumeCalda} onChange={e => setVolumeCalda(e.target.value)} />
              </Field>
            </SimpleGrid>
          </VStack>
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button variant="outline" disabled={isLoading}>Cancelar</Button>
          </DialogActionTrigger>
          <Button onClick={handleSubmit} loading={isLoading}>Salvar</Button>
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
};