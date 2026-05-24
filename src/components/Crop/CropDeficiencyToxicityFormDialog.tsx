import { useEffect, useState } from "react";
import { Box, Input, NativeSelect, Textarea, VStack } from "@chakra-ui/react";
import { Button } from "@/components/ui/button";
import {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { toaster } from "@/components/ui/toaster";
import EntityImageUploader from "@/components/EntityImageUploader";
import {
  CropDeficiencyToxicityResponseDto,
  DeficiencyToxicityNutrient,
} from "@/interfaces/CropDeficiencyToxicity";
import {
  createCropDeficiencyToxicity,
  updateCropDeficiencyToxicity,
} from "@/services/cropDeficiencyToxicityService";

const NUTRIENT_OPTIONS: { label: string; value: DeficiencyToxicityNutrient }[] = [
  { label: "Nitrogênio (Macro)", value: "NITROGENIO" },
  { label: "Fósforo (Macro)", value: "FOSFORO" },
  { label: "Potássio (Macro)", value: "POTASSIO" },
  { label: "Cálcio (Macro)", value: "CALCIO" },
  { label: "Magnésio (Macro)", value: "MAGNESIO" },
  { label: "Enxofre (Macro)", value: "ENXOFRE" },
  { label: "Boro (Micro)", value: "BORO" },
  { label: "Cobre (Micro)", value: "COBRE" },
  { label: "Ferro (Micro)", value: "FERRO" },
  { label: "Manganês (Micro)", value: "MANGANES" },
  { label: "Molibdênio (Micro)", value: "MOLIBDENIO" },
  { label: "Zinco (Micro)", value: "ZINCO" },
  { label: "Níquel (Micro)", value: "NIQUEL" },
  { label: "Cloro (Micro)", value: "CLORO" },
];

interface Props {
  open: boolean;
  onOpenChange: (details: { open: boolean }) => void;
  cropId: number;
  selectedItem?: CropDeficiencyToxicityResponseDto | null;
  onSuccess: () => void;
}

export const CropDeficiencyToxicityFormDialog = ({ open, onOpenChange, cropId, selectedItem, onSuccess }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [nutriente, setNutriente] = useState<string>("");
  const [idfotoPlantaSaudavel, setIdfotoPlantaSaudavel] = useState("");
  const [idfotoPlantaSintoma, setIdfotoPlantaSintoma] = useState("");
  const [observacoes, setObservacoes] = useState("");

  useEffect(() => {
    if (!open) return;
    if (selectedItem) {
      setNutriente(selectedItem.nutriente || "");
      setIdfotoPlantaSaudavel(selectedItem.idfoto_planta_saudavel || "");
      setIdfotoPlantaSintoma(selectedItem.idfoto_planta_sintoma || "");
      setObservacoes(selectedItem.observacoes || "");
      return;
    }
    setNutriente("");
    setIdfotoPlantaSaudavel("");
    setIdfotoPlantaSintoma("");
    setObservacoes("");
  }, [open, selectedItem]);

  const handleSave = async () => {
    if (!nutriente) {
      toaster.create({ title: "Selecione o nutriente", type: "error" });
      return;
    }

    const payload = {
      nutriente,
      idfoto_planta_saudavel: idfotoPlantaSaudavel || undefined,
      idfoto_planta_sintoma: idfotoPlantaSintoma || undefined,
      observacoes: observacoes || undefined,
    };

    setIsLoading(true);
    try {
      if (selectedItem) {
        await updateCropDeficiencyToxicity(selectedItem.id, {
          novo_nutriente: payload.nutriente,
          novo_idfoto_planta_saudavel: payload.idfoto_planta_saudavel,
          novo_idfoto_planta_sintoma: payload.idfoto_planta_sintoma,
          novo_observacoes: payload.observacoes,
        });
        toaster.create({ title: "Deficiência/Toxidez atualizada", type: "success" });
      } else {
        await createCropDeficiencyToxicity(cropId, payload);
        toaster.create({ title: "Deficiência/Toxidez criada", type: "success" });
      }
      onSuccess();
      onOpenChange({ open: false });
    } catch (error) {
      console.error(error);
      toaster.create({ title: "Erro ao salvar deficiência/toxidez", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange} placement="center" size="xl">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{selectedItem ? "Editar Deficiência/Toxidez" : "Nova Deficiência/Toxidez"}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <VStack align="stretch" gap={4}>
            <Field label="Deficiência de" required>
              <NativeSelect.Root size="sm" width="100%">
                <NativeSelect.Field value={nutriente} onChange={(e) => setNutriente(e.target.value)}>
                  <option value="">Selecione...</option>
                  {NUTRIENT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </NativeSelect.Field>
              </NativeSelect.Root>
            </Field>

            <Box>
              <EntityImageUploader
                label="Foto da planta saudável"
                currentImageId={idfotoPlantaSaudavel}
                onImageIdChange={setIdfotoPlantaSaudavel}
              />
            </Box>

            <Box>
              <EntityImageUploader
                label="Foto da planta com sintoma"
                currentImageId={idfotoPlantaSintoma}
                onImageIdChange={setIdfotoPlantaSintoma}
              />
            </Box>

            <Field label="Observações">
              <Textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} minH="110px" />
            </Field>

            <Input type="hidden" value={cropId} readOnly />
          </VStack>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange({ open: false })} disabled={isLoading}>Cancelar</Button>
          <Button colorPalette="blue" onClick={handleSave} loading={isLoading}>
            {selectedItem ? "Salvar Alterações" : "Criar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};
