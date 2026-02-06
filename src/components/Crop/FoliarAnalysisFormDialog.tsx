import { useEffect, useState } from "react";
import { 
  VStack, 
  SimpleGrid, 
  Heading, 
  Input,
  Tabs,
  Box
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
  FoliarAnalysisResponseDto, 
  FoliarAnalysisCreateRequestDto 
} from "@/interfaces/FoliarAnalysis";
import { CropDate } from "@/interfaces/Crop";
import { 
  createFoliarAnalysis, 
  updateFoliarAnalysis 
} from "@/services/foliarAnalysisService";

interface FoliarAnalysisFormDialogProps {
  open: boolean;
  onOpenChange: (details: { open: boolean }) => void;
  cropId: number;
  selectedAnalysis?: FoliarAnalysisResponseDto | null;
  onSuccess: () => void;
}

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

export const FoliarAnalysisFormDialog = ({
  open,
  onOpenChange,
  cropId,
  selectedAnalysis,
  onSuccess,
}: FoliarAnalysisFormDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const [dataColeta, setDataColeta] = useState("");
  const [laboratorio, setLaboratorio] = useState("");

  const [n, setN] = useState("");
  const [p, setP] = useState("");
  const [k, setK] = useState("");
  const [ca, setCa] = useState("");
  const [mg, setMg] = useState("");
  const [s, setS] = useState("");

  const [b, setB] = useState("");
  const [cu, setCu] = useState("");
  const [fe, setFe] = useState("");
  const [mn, setMn] = useState("");
  const [mo, setMo] = useState("");
  const [zn, setZn] = useState("");
  const [ni, setNi] = useState("");

  const [na, setNa] = useState("");
  const [si, setSi] = useState("");
  const [v, setV] = useState("");
  const [co, setCo] = useState("");
  const [se, setSe] = useState("");

  useEffect(() => {
    if (open) {
      if (selectedAnalysis) {
        setDataColeta(dateToIso(selectedAnalysis.data_coleta));
        setLaboratorio(selectedAnalysis.laboratorio || "");
        
        const macro = selectedAnalysis.macronutrientes;
        setN(macro?.n_content?.toString() || "");
        setP(macro?.p_content?.toString() || "");
        setK(macro?.k_content?.toString() || "");
        setCa(macro?.ca_content?.toString() || "");
        setMg(macro?.mg_content?.toString() || "");
        setS(macro?.s_content?.toString() || "");

        const micro = selectedAnalysis.micronutrientes;
        setB(micro?.b_content?.toString() || "");
        setCu(micro?.cu_content?.toString() || "");
        setFe(micro?.fe_content?.toString() || "");
        setMn(micro?.mn_content?.toString() || "");
        setMo(micro?.mo_content?.toString() || "");
        setZn(micro?.zn_content?.toString() || "");
        setNi(micro?.ni_content?.toString() || "");

        const beneficial = selectedAnalysis.elementos_beneficos;
        setNa(beneficial?.na_content?.toString() || "");
        setSi(beneficial?.si_content?.toString() || "");
        setV(beneficial?.v_content?.toString() || "");
        setCo(beneficial?.co_content?.toString() || "");
        setSe(beneficial?.se_content?.toString() || "");

      } else {
        setDataColeta("");
        setLaboratorio("");
        setN(""); setP(""); setK(""); setCa(""); setMg(""); setS("");
        setB(""); setCu(""); setFe(""); setMn(""); setMo(""); setZn(""); setNi("");
        setNa(""); setSi(""); setV(""); setCo(""); setSe("");
      }
    }
  }, [open, selectedAnalysis]);

  const handleSubmit = async () => {
    if (!dataColeta) {
      toaster.create({ title: "Informe a data da coleta", type: "error" });
      return;
    }

    setIsLoading(true);
    try {
      const parseVal = (val: string) => val ? Number(val) : undefined;

      const payloadData: FoliarAnalysisCreateRequestDto = {
        data_coleta: isoToCropDate(dataColeta),
        laboratorio: laboratorio,
        
        macronutrientes: {
          n_content: parseVal(n),
          p_content: parseVal(p),
          k_content: parseVal(k),
          ca_content: parseVal(ca),
          mg_content: parseVal(mg),
          s_content: parseVal(s),
        },
        
        micronutrientes: {
          b_content: parseVal(b),
          cu_content: parseVal(cu),
          fe_content: parseVal(fe),
          mn_content: parseVal(mn),
          mo_content: parseVal(mo),
          zn_content: parseVal(zn),
          ni_content: parseVal(ni),
        },

        elementos_beneficos: {
          na_content: parseVal(na),
          si_content: parseVal(si),
          v_content: parseVal(v),
          co_content: parseVal(co),
          se_content: parseVal(se),
        }
      };

      if (selectedAnalysis) {
        const updatePayload: any = {
            novo_data_coleta: payloadData.data_coleta,
            novo_laboratorio: payloadData.laboratorio,
            novo_macronutrientes: payloadData.macronutrientes,
            novo_micronutrientes: payloadData.micronutrientes,
            novo_elementos_beneficos: payloadData.elementos_beneficos
        };

        await updateFoliarAnalysis(selectedAnalysis.id, updatePayload);
        toaster.create({ title: "Análise atualizada!", type: "success" });
      } else {
        await createFoliarAnalysis(cropId, payloadData);
        toaster.create({ title: "Análise registrada!", type: "success" });
      }

      onSuccess();
      onOpenChange({ open: false });
    } catch (error) {
      console.error(error);
      if (!selectedAnalysis) {
        toaster.create({ title: "A cultura só pode ter uma análise foliar!", type: "error" });
      } else {
        toaster.create({ title: "Erro ao salvar análise", type: "error" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange} size="lg" scrollBehavior="inside">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {selectedAnalysis ? "Editar Análise Foliar" : "Nova Análise Foliar"}
          </DialogTitle>
        </DialogHeader>
        <DialogBody>
          <VStack gap={5} align="stretch">
            <SimpleGrid columns={2} gap={4}>
              <Field label="Data da Coleta" required>
                <Input type="date" value={dataColeta} onChange={e => setDataColeta(e.target.value)} />
              </Field>
              <Field label="Laboratório">
                <Input value={laboratorio} onChange={e => setLaboratorio(e.target.value)} placeholder="Opcional" />
              </Field>
            </SimpleGrid>

            <Tabs.Root defaultValue="macro" variant="enclosed" fitted>
              <Tabs.List>
                <Tabs.Trigger value="macro">Macronutrientes</Tabs.Trigger>
                <Tabs.Trigger value="micro">Micronutrientes</Tabs.Trigger>
                <Tabs.Trigger value="beneficial">Benéficos</Tabs.Trigger>
              </Tabs.List>

              <Box pt={4}>
                <Tabs.Content value="macro">
                  <VStack align="stretch" gap={3}>
                    <Heading size="sm" color="gray.600">g/kg</Heading>
                    <SimpleGrid columns={{ base: 2, md: 3 }} gap={4}>
                      <Field label="N (Nitrogênio)">
                        <Input type="number" step="0.1" value={n} onChange={e => setN(e.target.value)} />
                      </Field>
                      <Field label="P (Fósforo)">
                        <Input type="number" step="0.1" value={p} onChange={e => setP(e.target.value)} />
                      </Field>
                      <Field label="K (Potássio)">
                        <Input type="number" step="0.1" value={k} onChange={e => setK(e.target.value)} />
                      </Field>
                      <Field label="Ca (Cálcio)">
                        <Input type="number" step="0.1" value={ca} onChange={e => setCa(e.target.value)} />
                      </Field>
                      <Field label="Mg (Magnésio)">
                        <Input type="number" step="0.1" value={mg} onChange={e => setMg(e.target.value)} />
                      </Field>
                      <Field label="S (Enxofre)">
                        <Input type="number" step="0.1" value={s} onChange={e => setS(e.target.value)} />
                      </Field>
                    </SimpleGrid>
                  </VStack>
                </Tabs.Content>

                <Tabs.Content value="micro">
                  <VStack align="stretch" gap={3}>
                    <Heading size="sm" color="gray.600">mg/kg (ppm)</Heading>
                    <SimpleGrid columns={{ base: 2, md: 3 }} gap={4}>
                      <Field label="B (Boro)">
                        <Input type="number" step="0.1" value={b} onChange={e => setB(e.target.value)} />
                      </Field>
                      <Field label="Cu (Cobre)">
                        <Input type="number" step="0.1" value={cu} onChange={e => setCu(e.target.value)} />
                      </Field>
                      <Field label="Fe (Ferro)">
                        <Input type="number" step="0.1" value={fe} onChange={e => setFe(e.target.value)} />
                      </Field>
                      <Field label="Mn (Manganês)">
                        <Input type="number" step="0.1" value={mn} onChange={e => setMn(e.target.value)} />
                      </Field>
                      <Field label="Mo (Molibdênio)">
                        <Input type="number" step="0.01" value={mo} onChange={e => setMo(e.target.value)} />
                      </Field>
                      <Field label="Zn (Zinco)">
                        <Input type="number" step="0.1" value={zn} onChange={e => setZn(e.target.value)} />
                      </Field>
                      <Field label="Ni (Níquel)">
                        <Input type="number" step="0.1" value={ni} onChange={e => setNi(e.target.value)} />
                      </Field>
                    </SimpleGrid>
                  </VStack>
                </Tabs.Content>

                <Tabs.Content value="beneficial">
                  <VStack align="stretch" gap={3}>
                    <Heading size="sm" color="gray.600">Elementos Benéficos</Heading>
                    <SimpleGrid columns={{ base: 2, md: 3 }} gap={4}>
                      <Field label="Na (Sódio)">
                        <Input type="number" step="0.1" value={na} onChange={e => setNa(e.target.value)} />
                      </Field>
                      <Field label="Si (Silício)">
                        <Input type="number" step="0.1" value={si} onChange={e => setSi(e.target.value)} />
                      </Field>
                      <Field label="V (Vanádio)">
                        <Input type="number" step="0.01" value={v} onChange={e => setV(e.target.value)} />
                      </Field>
                      <Field label="Co (Cobalto)">
                        <Input type="number" step="0.01" value={co} onChange={e => setCo(e.target.value)} />
                      </Field>
                      <Field label="Se (Selênio)">
                        <Input type="number" step="0.01" value={se} onChange={e => setSe(e.target.value)} />
                      </Field>
                    </SimpleGrid>
                  </VStack>
                </Tabs.Content>
              </Box>
            </Tabs.Root>

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