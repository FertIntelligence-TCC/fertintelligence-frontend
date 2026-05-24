import { useEffect, useState } from "react";
import { Box, Input, NativeSelect, Textarea, VStack } from "@chakra-ui/react";
import { AxiosError } from "axios";
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
  NutrientKind,
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

const MACRONUTRIENTS: DeficiencyToxicityNutrient[] = [
  "NITROGENIO",
  "FOSFORO",
  "POTASSIO",
  "CALCIO",
  "MAGNESIO",
  "ENXOFRE",
];

const MICRONUTRIENTS: DeficiencyToxicityNutrient[] = [
  "BORO",
  "COBRE",
  "FERRO",
  "MANGANES",
  "MOLIBDENIO",
  "ZINCO",
  "NIQUEL",
  "CLORO",
];

const resolveNutrientType = (nutrient: string): NutrientKind | "" => {
  if (MACRONUTRIENTS.includes(nutrient as DeficiencyToxicityNutrient)) return "MACRONUTRIENT";
  if (MICRONUTRIENTS.includes(nutrient as DeficiencyToxicityNutrient)) return "MICRONUTRIENT";
  return "";
};

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
  const [nutrientType, setNutrientType] = useState<NutrientKind | "">("");
  const [idfotoPlantaSaudavel, setIdfotoPlantaSaudavel] = useState("");
  const [idfotoPlantaSintoma, setIdfotoPlantaSintoma] = useState("");
  const [observacoes, setObservacoes] = useState("");

  useEffect(() => {
    if (!open) return;
    if (selectedItem) {
      setNutriente(selectedItem.nutrient || selectedItem.nutriente || "");
      setNutrientType(
        selectedItem.nutrientType || selectedItem.tipo_nutriente || resolveNutrientType(selectedItem.nutrient || selectedItem.nutriente || ""),
      );
      setIdfotoPlantaSaudavel(selectedItem.healthyPlantImageId || selectedItem.idfoto_planta_saudavel || "");
      setIdfotoPlantaSintoma(selectedItem.symptomaticPlantImageId || selectedItem.idfoto_planta_sintoma || "");
      setObservacoes(selectedItem.observations || selectedItem.observacoes || "");
      return;
    }
    setNutriente("");
    setNutrientType("");
    setIdfotoPlantaSaudavel("");
    setIdfotoPlantaSintoma("");
    setObservacoes("");
  }, [open, selectedItem]);

  const handleSave = async () => {
    if (!nutriente) {
      toaster.create({ title: "Selecione o nutriente", type: "error" });
      return;
    }
    if (!nutrientType) {
      toaster.create({ title: "Não foi possível identificar o tipo do nutriente", type: "error" });
      return;
    }

    const payload = {
      nutrientType,
      nutrient: nutriente,
      healthyPlantImageId: idfotoPlantaSaudavel.trim() || undefined,
      symptomaticPlantImageId: idfotoPlantaSintoma.trim() || undefined,
      observations: observacoes.trim() || undefined,
    };

    setIsLoading(true);
    try {
      if (selectedItem) {
        await updateCropDeficiencyToxicity(selectedItem.id, {
          nutrientType: payload.nutrientType,
          nutrient: payload.nutrient,
          healthyPlantImageId: payload.healthyPlantImageId,
          symptomaticPlantImageId: payload.symptomaticPlantImageId,
          observations: payload.observations,
        });
        toaster.create({ title: "Deficiência/Toxidez atualizada", type: "success" });
      } else {
        await createCropDeficiencyToxicity(cropId, payload);
        toaster.create({ title: "Deficiência/Toxidez criada", type: "success" });
      }
      onSuccess();
      onOpenChange({ open: false });
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      console.error("Erro ao salvar deficiência/toxidez:", axiosError.response?.data || axiosError);
      toaster.create({
        title: axiosError.response?.data?.message || "Erro ao salvar deficiência/toxidez",
        type: "error",
      });
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
                <NativeSelect.Field
                  value={nutriente}
                  onChange={(e) => {
                    const selectedNutrient = e.target.value;
                    setNutriente(selectedNutrient);
                    setNutrientType(resolveNutrientType(selectedNutrient));
                  }}
                >
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
