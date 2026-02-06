import { useEffect, useState } from "react";
import { 
  VStack, 
  SimpleGrid, 
  Heading, 
  Input,
  Text 
} from "@chakra-ui/react";
import { Button } from "@/components/ui/button";
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
  TopDressingFertilizationResponseDto, 
  TopDressingFertilizationCreateRequestDto,
  TopDressingFertilizationPostRequestDto
} from "@/interfaces/TopDressingFertilization";
import { CropDate } from "@/interfaces/Crop";
import { 
  createTopDressingFertilization, 
  updateTopDressingFertilization 
} from "@/services/topDressingFertilizationService";

interface TopDressingFormDialogProps {
  open: boolean;
  onOpenChange: (details: { open: boolean }) => void;
  cropId: number;
  selectedFertilization?: TopDressingFertilizationResponseDto | null;
  onSuccess: () => void;
}

// Helpers de Data (reutilizando lógica)
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

export const TopDressingFormDialog = ({
  open,
  onOpenChange,
  cropId,
  selectedFertilization,
  onSuccess,
}: TopDressingFormDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);

  // Estados
  const [dataAplicacao, setDataAplicacao] = useState("");
  const [ordem, setOrdem] = useState("1");
  
  // Fertilizantes (kg/ha)
  const [formulado, setFormulado] = useState("");
  const [sulfatoAmonio, setSulfatoAmonio] = useState("");
  const [ureia, setUreia] = useState("");
  const [cloretoPotassio, setCloretoPotassio] = useState("");
  const [superTriplo, setSuperTriplo] = useState("");
  const [superSimples, setSuperSimples] = useState("");
  const [map, setMap] = useState(""); // Monoamônio Fosfato

  useEffect(() => {
    if (open) {
      if (selectedFertilization) {
        setDataAplicacao(dateToIso(selectedFertilization.data));
        setOrdem(selectedFertilization.ordem.toString());
        setFormulado(selectedFertilization.formulado?.toString() || "");
        setSulfatoAmonio(selectedFertilization.sulfato_de_amonio?.toString() || "");
        setUreia(selectedFertilization.ureia?.toString() || "");
        setCloretoPotassio(selectedFertilization.cloreto_de_potassio?.toString() || "");
        setSuperTriplo(selectedFertilization.superfosfato_triplo?.toString() || "");
        setSuperSimples(selectedFertilization.superfosfato_simples?.toString() || "");
        setMap(selectedFertilization.monoamonio_fosfato?.toString() || "");
      } else {
        // Reset
        setDataAplicacao("");
        setOrdem("1");
        setFormulado("");
        setSulfatoAmonio("");
        setUreia("");
        setCloretoPotassio("");
        setSuperTriplo("");
        setSuperSimples("");
        setMap("");
      }
    }
  }, [open, selectedFertilization]);

  const handleSubmit = async () => {
    if (!dataAplicacao || !ordem) {
      toaster.create({ title: "Preencha a Data e a Ordem", type: "error" });
      return;
    }

    setIsLoading(true);
    try {
      // Helper para converter string vazia para undefined ou number
      const parseVal = (val: string) => val ? Number(val) : undefined;

      const commonData = {
        data: isoToCropDate(dataAplicacao),
        ordem: Number(ordem),
        formulado: parseVal(formulado),
        sulfato_de_amonio: parseVal(sulfatoAmonio),
        ureia: parseVal(ureia),
        cloreto_de_potassio: parseVal(cloretoPotassio),
        superfosfato_triplo: parseVal(superTriplo),
        superfosfato_simples: parseVal(superSimples),
        monoamonio_fosfato: parseVal(map),
      };

      if (selectedFertilization) {
        // Update
        const payload: TopDressingFertilizationPostRequestDto = {
          novo_data: commonData.data,
          novo_ordem: commonData.ordem,
          novo_formulado: commonData.formulado,
          novo_sulfato_de_amonio: commonData.sulfato_de_amonio,
          novo_ureia: commonData.ureia,
          novo_cloreto_de_potassio: commonData.cloreto_de_potassio,
          novo_superfosfato_triplo: commonData.superfosfato_triplo,
          novo_superfosfato_simples: commonData.superfosfato_simples,
          novo_monoamonio_fosfato: commonData.monoamonio_fosfato,
        };
        await updateTopDressingFertilization(selectedFertilization.id, payload);
        toaster.create({ title: "Adubação atualizada!", type: "success" });
      } else {
        // Create
        const payload: TopDressingFertilizationCreateRequestDto = commonData;
        await createTopDressingFertilization(cropId, payload);
        toaster.create({ title: "Adubação registrada!", type: "success" });
      }

      onSuccess();
      onOpenChange({ open: false });
    } catch (error) {
      console.error(error);
      toaster.create({ title: "Erro ao salvar", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange} size="lg">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {selectedFertilization ? "Editar Adubação" : "Nova Adubação de Cobertura"}
          </DialogTitle>
        </DialogHeader>
        <DialogBody>
          <VStack gap={5} align="stretch">
            <SimpleGrid columns={2} gap={4}>
              <Field label="Data da Aplicação" required>
                <Input type="date" value={dataAplicacao} onChange={e => setDataAplicacao(e.target.value)} />
              </Field>
              <Field label="Ordem (Nº da Aplicação)" required>
                <Input type="number" value={ordem} onChange={e => setOrdem(e.target.value)} />
              </Field>
            </SimpleGrid>

            <VStack align="stretch" gap={3}>
              <Heading size="sm" color="gray.600">Fontes Utilizadas (kg/ha)</Heading>
              <Text fontSize="xs" color="gray.400">Preencha apenas os fertilizantes utilizados.</Text>
              
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <Field label="Formulado">
                  <Input type="number" step="0.1" value={formulado} onChange={e => setFormulado(e.target.value)} />
                </Field>
                <Field label="Ureia">
                  <Input type="number" step="0.1" value={ureia} onChange={e => setUreia(e.target.value)} />
                </Field>
                <Field label="Sulfato de Amônio">
                  <Input type="number" step="0.1" value={sulfatoAmonio} onChange={e => setSulfatoAmonio(e.target.value)} />
                </Field>
                <Field label="Cloreto de Potássio">
                  <Input type="number" step="0.1" value={cloretoPotassio} onChange={e => setCloretoPotassio(e.target.value)} />
                </Field>
                <Field label="Superfosfato Simples">
                  <Input type="number" step="0.1" value={superSimples} onChange={e => setSuperSimples(e.target.value)} />
                </Field>
                <Field label="Superfosfato Triplo">
                  <Input type="number" step="0.1" value={superTriplo} onChange={e => setSuperTriplo(e.target.value)} />
                </Field>
                <Field label="Monoamônio Fosfato (MAP)">
                  <Input type="number" step="0.1" value={map} onChange={e => setMap(e.target.value)} />
                </Field>
              </SimpleGrid>
            </VStack>
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