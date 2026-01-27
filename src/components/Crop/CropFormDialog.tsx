import { useEffect, useState } from "react";
import { 
  VStack, 
  SimpleGrid, 
  Heading,
  Input, 
  NativeSelect 
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
  CropResponseDto, 
  CropDate, 
  CultivationType, 
  NomeComum 
} from "@/interfaces/Crop";
import { createCrop, updateCrop } from "@/services/cropService";

interface CropFormDialogProps {
  open: boolean;
  onOpenChange: (details: { open: boolean }) => void;
  folderId: number; // ID da Pasta Pai
  selectedCrop?: CropResponseDto | null;
  onSuccess: () => void;
}

// Helpers para conversão de data
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

// Opções para Selects
const CULTIVATION_TYPES: CultivationType[] = ['SAFRA', 'SAFRINHA'];
const CROP_NAMES: NomeComum[] = [
  'ALGODAO', 'AMENDOIM', 'CANA_DE_ACUCAR', 'FEIJAO_CAUPI', 
  'FEIJAO_COMUM', 'GERGELIM', 'MAMONA', 'MILHO', 'SISAL', 'SOJA'
];

export const CropFormDialog = ({
  open,
  onOpenChange,
  folderId,
  selectedCrop,
  onSuccess,
}: CropFormDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);

  // Estados dos Campos
  const [nome, setNome] = useState<NomeComum | string>("");
  const [variedade, setVariedade] = useState("");
  const [tipoCultivo, setTipoCultivo] = useState<CultivationType | string>("");
  const [ciclo, setCiclo] = useState("");
  
  const [distanciaEntreLinhas, setDistanciaEntreLinhas] = useState("");
  const [plantasPorMetro, setPlantasPorMetro] = useState("");
  const [areaUsada, setAreaUsada] = useState("");
  
  const [produtividadeEsperada, setProdutividadeEsperada] = useState("");
  const [produtividadeObtida, setProdutividadeObtida] = useState("");

  // Estados das Datas
  const [dataPlantio, setDataPlantio] = useState("");
  const [dataEmergencia, setDataEmergencia] = useState("");
  const [dataBotonamento, setDataBotonamento] = useState("");
  const [dataFlorescimento, setDataFlorescimento] = useState("");
  const [dataColheita, setDataColheita] = useState("");

  // Reset ou Populate form
  useEffect(() => {
    if (open) {
      if (selectedCrop) {
        setNome(selectedCrop.nome);
        setVariedade(selectedCrop.variedade);
        setTipoCultivo(selectedCrop.tipo_cultivo);
        setCiclo(selectedCrop.ciclo.toString());
        setDistanciaEntreLinhas(selectedCrop.distancia_entre_linhas.toString());
        setPlantasPorMetro(selectedCrop.numero_plantas_por_metro.toString());
        setAreaUsada(selectedCrop.area_usada_no_talhao.toString());
        setProdutividadeEsperada(selectedCrop.produtividade_esperada.toString());
        setProdutividadeObtida(selectedCrop.produtividade_obtida.toString());
        
        setDataPlantio(dateToIso(selectedCrop.data_plantio));
        setDataEmergencia(dateToIso(selectedCrop.data_emergencia));
        setDataBotonamento(dateToIso(selectedCrop.data_botonamento));
        setDataFlorescimento(dateToIso(selectedCrop.data_florescimento));
        setDataColheita(dateToIso(selectedCrop.data_colheita));
      } else {
        // Reset para criação
        setNome("");
        setVariedade("");
        setTipoCultivo("");
        setCiclo("");
        setDistanciaEntreLinhas("");
        setPlantasPorMetro("");
        setAreaUsada("");
        setProdutividadeEsperada("");
        setProdutividadeObtida("");
        setDataPlantio("");
        setDataEmergencia("");
        setDataBotonamento("");
        setDataFlorescimento("");
        setDataColheita("");
      }
    }
  }, [open, selectedCrop]);

  const handleSubmit = async () => {
    // Validação básica
    if (!nome || !variedade || !tipoCultivo || !dataPlantio) {
      toaster.create({
        title: "Campos obrigatórios",
        description: "Preencha pelo menos Nome, Variedade, Tipo e Data de Plantio.",
        type: "error",
      });
      return;
    }

    setIsLoading(true);
    try {
      const commonData = {
        nome: nome as NomeComum,
        variedade,
        tipo_cultivo: tipoCultivo as CultivationType,
        ciclo: Number(ciclo) || 0,
        distancia_entre_linhas: Number(distanciaEntreLinhas) || 0,
        numero_plantas_por_metro: Number(plantasPorMetro) || 0,
        area_usada_no_talhao: Number(areaUsada) || 0,
        produtividade_esperada: Number(produtividadeEsperada) || 0,
        produtividade_obtida: Number(produtividadeObtida) || 0,
        
        data_plantio: isoToCropDate(dataPlantio),
        data_emergencia: isoToCropDate(dataEmergencia),
        data_botonamento: isoToCropDate(dataBotonamento),
        data_florescimento: isoToCropDate(dataFlorescimento),
        data_colheita: isoToCropDate(dataColheita),
      };

      if (selectedCrop) {
        // Edição (Mapeando para o DTO com prefixo 'novo_')
        await updateCrop(selectedCrop.id, {
          novo_nome: commonData.nome,
          novo_variedade: commonData.variedade,
          novo_tipo_cultivo: commonData.tipo_cultivo,
          novo_ciclo: commonData.ciclo,
          novo_distancia_entre_linhas: commonData.distancia_entre_linhas,
          novo_numero_plantas_por_metro: commonData.numero_plantas_por_metro,
          novo_area_usada_no_talhao: commonData.area_usada_no_talhao,
          novo_produtividade_esperada: commonData.produtividade_esperada,
          novo_produtividade_obtida: commonData.produtividade_obtida,
          
          novo_data_plantio: commonData.data_plantio,
          novo_data_emergencia: commonData.data_emergencia,
          novo_data_botonamento: commonData.data_botonamento,
          novo_data_florescimento: commonData.data_florescimento,
          novo_data_colheita: commonData.data_colheita,
        });
        toaster.create({ title: "Cultura atualizada com sucesso!", type: "success" });
      } else {
        // Criação
        await createCrop(folderId, commonData);
        toaster.create({ title: "Cultura criada com sucesso!", type: "success" });
      }

      onSuccess();
      onOpenChange({ open: false });
    } catch (error) {
      console.error(error);
      toaster.create({
        title: "Erro ao salvar",
        description: "Verifique os dados e tente novamente.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange} placement="center" size="lg">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{selectedCrop ? "Editar Cultura" : "Nova Cultura"}</DialogTitle>
        </DialogHeader>

        <DialogBody>
          <VStack gap={6} align="stretch">
            
            {/* Seção 1: Identificação */}
            <VStack align="stretch" gap={3}>
              <Heading size="sm" color="gray.600">Identificação</Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <Field label="Nome da Cultura" required>
                  <NativeSelect.Root size="sm" width="100%">
                    <NativeSelect.Field 
                      placeholder="Selecione..." 
                      value={nome} 
                      onChange={(e) => setNome(e.target.value)}
                    >
                      {CROP_NAMES.map(name => (
                        <option key={name} value={name}>{name.replace(/_/g, ' ')}</option>
                      ))}
                    </NativeSelect.Field>
                  </NativeSelect.Root>
                </Field>

                <Field label="Variedade" required>
                  <Input 
                    value={variedade} 
                    onChange={(e) => setVariedade(e.target.value)} 
                    placeholder="Ex: TMG 7062" 
                  />
                </Field>

                <Field label="Tipo de Cultivo" required>
                  <NativeSelect.Root size="sm" width="100%">
                    <NativeSelect.Field 
                      placeholder="Selecione..." 
                      value={tipoCultivo} 
                      onChange={(e) => setTipoCultivo(e.target.value)}
                    >
                      {CULTIVATION_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </NativeSelect.Field>
                  </NativeSelect.Root>
                </Field>

                <Field label="Ciclo (dias)">
                  <Input 
                    type="number" 
                    value={ciclo} 
                    onChange={(e) => setCiclo(e.target.value)} 
                  />
                </Field>
              </SimpleGrid>
            </VStack>

            {/* Seção 2: Parâmetros Técnicos */}
            <VStack align="stretch" gap={3}>
              <Heading size="sm" color="gray.600">Parâmetros Técnicos</Heading>
              <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                <Field label="Dist. entre Linhas (m)">
                  <Input type="number" step="0.01" value={distanciaEntreLinhas} onChange={(e) => setDistanciaEntreLinhas(e.target.value)} />
                </Field>
                <Field label="Plantas por Metro">
                  <Input type="number" step="0.1" value={plantasPorMetro} onChange={(e) => setPlantasPorMetro(e.target.value)} />
                </Field>
                <Field label="Área Usada (ha)">
                  <Input type="number" step="0.01" value={areaUsada} onChange={(e) => setAreaUsada(e.target.value)} />
                </Field>
              </SimpleGrid>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <Field label="Produtividade Esperada (kg/ha)">
                  <Input type="number" value={produtividadeEsperada} onChange={(e) => setProdutividadeEsperada(e.target.value)} />
                </Field>
                <Field label="Produtividade Obtida (kg/ha)">
                  <Input type="number" value={produtividadeObtida} onChange={(e) => setProdutividadeObtida(e.target.value)} />
                </Field>
              </SimpleGrid>
            </VStack>

            {/* Seção 3: Cronograma */}
            <VStack align="stretch" gap={3}>
              <Heading size="sm" color="gray.600">Cronograma (Datas)</Heading>
              <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                <Field label="Data Plantio" required>
                  <Input type="date" value={dataPlantio} onChange={(e) => setDataPlantio(e.target.value)} />
                </Field>
                <Field label="Emergência">
                  <Input type="date" value={dataEmergencia} onChange={(e) => setDataEmergencia(e.target.value)} />
                </Field>
                <Field label="Botonamento">
                  <Input type="date" value={dataBotonamento} onChange={(e) => setDataBotonamento(e.target.value)} />
                </Field>
                <Field label="Florescimento">
                  <Input type="date" value={dataFlorescimento} onChange={(e) => setDataFlorescimento(e.target.value)} />
                </Field>
                <Field label="Colheita">
                  <Input type="date" value={dataColheita} onChange={(e) => setDataColheita(e.target.value)} />
                </Field>
              </SimpleGrid>
            </VStack>

          </VStack>
        </DialogBody>

        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button variant="outline" disabled={isLoading}>Cancelar</Button>
          </DialogActionTrigger>
          <Button onClick={handleSubmit} loading={isLoading}>
            {selectedCrop ? "Salvar Alterações" : "Cadastrar Cultura"}
          </Button>
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
};