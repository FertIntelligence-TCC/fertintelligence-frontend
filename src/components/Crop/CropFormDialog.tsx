import { useEffect, useState, useMemo } from "react";
import { AxiosError } from "axios";
import { 
  VStack, 
  SimpleGrid, 
  Heading, 
  Input, 
  NativeSelect,
  Tabs,
  Box,
  Text,
  HStack,
  Separator
} from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
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
  NomeComum,
  PlantSpacingMode
} from "@/interfaces/Crop";
import { createCrop, updateCrop } from "@/services/cropService";
import { getPlotById } from "@/services/plotService";

// --- IMPORTS DOS GERENCIADORES (FILHOS) ---
import { TopDressingManager } from "./TopDressingManager";
import { FoliarAnalysisManager } from "./FoliarAnalysisManager";
// NOVO IMPORT:
import { FoliarFertilizationManager } from "./FoliarFertilizationManager";
import { CropDeficiencyToxicityManager } from "./CropDeficiencyToxicityManager";
import EntityImageUploader from "@/components/EntityImageUploader";

interface CropFormDialogProps {
  open: boolean;
  onOpenChange: (details: { open: boolean }) => void;
  folderId: number;
  plotId?: number;
  selectedCrop?: CropResponseDto | null;
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

// Listas de Opções
const CULTIVATION_TYPES: CultivationType[] = ['SAFRA', 'SAFRINHA'];
const CROP_NAMES: NomeComum[] = [
  'ALGODAO', 'AMENDOIM', 'CANA_DE_ACUCAR', 'FEIJAO_CAUPI', 
  'FEIJAO_COMUM', 'GERGELIM', 'MAMONA', 'MILHO', 'SISAL', 'SOJA'
];
const PLANT_SPACING_MODES: PlantSpacingMode[] = ["plants_per_meter", "holes"];

type ApiErrorData = { message?: string; error?: string } | string;

const AREA_CONFLICT_MESSAGE =
  "A soma das áreas das culturas em meses coincidentes não pode ultrapassar a área total do talhão. Revise a área usada ou as datas da cultura.";

const normalizeMessage = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const getApiErrorMessage = (error: unknown): string => {
  const axiosError = error as AxiosError<ApiErrorData>;
  const data = axiosError.response?.data;

  if (typeof data === "string") return data;
  return data?.message || data?.error || "";
};

const isAreaConflictError = (message: string) => {
  const normalized = normalizeMessage(message);

  return (
    normalized.includes("area") &&
    normalized.includes("talhao") &&
    (
      normalized.includes("mes") ||
      normalized.includes("coincid") ||
      normalized.includes("sobrepos") ||
      normalized.includes("exced")
    )
  );
};

const isPlantSpacingMode = (value?: string | null): value is PlantSpacingMode =>
  !!value && PLANT_SPACING_MODES.includes(value as PlantSpacingMode);

const getCropPlantSpacingMode = (crop: CropResponseDto): PlantSpacingMode =>
  isPlantSpacingMode(crop.modo_espacamento) ? crop.modo_espacamento : "plants_per_meter";

export const CropFormDialog = ({
  open,
  onOpenChange,
  folderId,
  plotId,
  selectedCrop,
  onSuccess,
}: CropFormDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentCrop, setCurrentCrop] = useState<CropResponseDto | null>(null);
  
  // Dados do Talhão
  const [plotTotalArea, setPlotTotalArea] = useState<number>(0);

  // Estados dos Campos
  const [nome, setNome] = useState<NomeComum | string>("");
  const [variedade, setVariedade] = useState("");
  const [tipoCultivo, setTipoCultivo] = useState<CultivationType | string>("");
  const [ciclo, setCiclo] = useState("");
  const [modoEspacamento, setModoEspacamento] = useState<PlantSpacingMode>("plants_per_meter");
  const [distanciaEntreLinhas, setDistanciaEntreLinhas] = useState("");
  const [plantasPorMetro, setPlantasPorMetro] = useState("");
  const [distanciaEntrePlantas, setDistanciaEntrePlantas] = useState("");
  const [plantasPorCova, setPlantasPorCova] = useState("");
  const [areaUsada, setAreaUsada] = useState("");
  const [produtividadeEsperada, setProdutividadeEsperada] = useState("");
  const [produtividadeObtida, setProdutividadeObtida] = useState("");
  const [idfoto, setIdfoto] = useState("");
  
  // Datas
  const [dataPlantio, setDataPlantio] = useState("");
  const [dataEmergencia, setDataEmergencia] = useState("");
  const [dataBotonamento, setDataBotonamento] = useState("");
  const [dataFlorescimento, setDataFlorescimento] = useState("");
  const [dataColheita, setDataColheita] = useState("");

  // Cálculos Automáticos
  const population = useMemo(() => {
    const dist = parseFloat(distanciaEntreLinhas);
    const plantsPerMeter = modoEspacamento === "holes"
      ? Number(plantasPorCova) / Number(distanciaEntrePlantas)
      : Number(plantasPorMetro);

    if (!dist || !plantsPerMeter || dist === 0) return "0";
    return Math.round((10000 * plantsPerMeter) / dist).toLocaleString('pt-BR');
  }, [distanciaEntreLinhas, distanciaEntrePlantas, modoEspacamento, plantasPorCova, plantasPorMetro]);

  const areaPercentage = useMemo(() => {
    const used = parseFloat(areaUsada);
    if (!used || !plotTotalArea || plotTotalArea === 0) return "0%";
    return ((used / plotTotalArea) * 100).toFixed(2) + "%";
  }, [areaUsada, plotTotalArea]);

  useEffect(() => {
    if (open && plotId) {
      getPlotById(plotId).then((plot) => {
        if (plot && plot.area) setPlotTotalArea(plot.area);
      }).catch(console.error);
    }
  }, [open, plotId]);

  useEffect(() => {
    if (open) {
      const target = selectedCrop || null;
      setCurrentCrop(target);
      if (target) {
        populateFields(target);
      } else {
        resetFields();
      }
    }
  }, [open, selectedCrop]);

  const populateFields = (crop: CropResponseDto) => {
    setNome(crop.nome);
    setVariedade(crop.variedade);
    setTipoCultivo(crop.tipo_cultivo);
    setCiclo(crop.ciclo?.toString() || "");
    setModoEspacamento(getCropPlantSpacingMode(crop));
    setDistanciaEntreLinhas(crop.distancia_entre_linhas?.toString() || "");
    setPlantasPorMetro(crop.numero_plantas_por_metro?.toString() || "");
    setDistanciaEntrePlantas(crop.distancia_entre_plantas?.toString() || "");
    setPlantasPorCova(crop.numero_plantas_por_cova?.toString() || "");
    setAreaUsada(crop.area_usada_no_talhao?.toString() || "");
    setProdutividadeEsperada(crop.produtividade_esperada?.toString() || "");
    setProdutividadeObtida(crop.produtividade_obtida?.toString() || "");
    
    setDataPlantio(dateToIso(crop.data_plantio));
    setDataEmergencia(dateToIso(crop.data_emergencia));
    setDataBotonamento(dateToIso(crop.data_botonamento));
    setDataFlorescimento(dateToIso(crop.data_florescimento));
    setDataColheita(dateToIso(crop.data_colheita));
    setIdfoto(crop.idfoto ?? "");
  };

  const resetFields = () => {
    setNome("");
    setVariedade("");
    setTipoCultivo("");
    setCiclo("");
    setModoEspacamento("plants_per_meter");
    setDistanciaEntreLinhas("");
    setPlantasPorMetro("");
    setDistanciaEntrePlantas("");
    setPlantasPorCova("");
    setAreaUsada("");
    setProdutividadeEsperada("");
    setProdutividadeObtida("");
    setDataPlantio("");
    setDataEmergencia("");
    setDataBotonamento("");
    setDataFlorescimento("");
    setDataColheita("");
    setIdfoto("");
  };

  const handleSaveBasicInfo = async () => {
    if (!nome || !variedade || !tipoCultivo || !dataPlantio) {
      toaster.create({
        title: "Campos obrigatórios",
        description: "Preencha Nome, Variedade, Tipo e Data de Plantio.",
        type: "error",
      });
      return;
    }

    setIsLoading(true);
    try {
      const computedPlantsPerMeter = modoEspacamento === "holes"
        ? Number(plantasPorCova) / Number(distanciaEntrePlantas)
        : Number(plantasPorMetro);
      const commonData = {
        nome: nome as NomeComum,
        variedade,
        tipo_cultivo: tipoCultivo as CultivationType,
        ciclo: Number(ciclo) || 0,
        distancia_entre_linhas: Number(distanciaEntreLinhas) || 0,
        numero_plantas_por_metro: Number.isFinite(computedPlantsPerMeter) ? computedPlantsPerMeter : 0,
        modo_espacamento: modoEspacamento,
        distancia_entre_plantas: modoEspacamento === "holes" ? Number(distanciaEntrePlantas) || 0 : null,
        numero_plantas_por_cova: modoEspacamento === "holes" ? Number(plantasPorCova) || 0 : null,
        area_usada_no_talhao: Number(areaUsada) || 0,
        produtividade_esperada: Number(produtividadeEsperada) || 0,
        produtividade_obtida: Number(produtividadeObtida) || 0,
        
        data_plantio: isoToCropDate(dataPlantio),
        data_emergencia: isoToCropDate(dataEmergencia),
        data_botonamento: isoToCropDate(dataBotonamento),
        data_florescimento: isoToCropDate(dataFlorescimento),
        data_colheita: isoToCropDate(dataColheita),
        idfoto,
      };

      if (currentCrop) {
        // UPDATE
        const response = await updateCrop(currentCrop.id, {
          novo_nome: commonData.nome,
          novo_variedade: commonData.variedade,
          novo_tipo_cultivo: commonData.tipo_cultivo,
          novo_ciclo: commonData.ciclo,
          novo_distancia_entre_linhas: commonData.distancia_entre_linhas,
          novo_numero_plantas_por_metro: commonData.numero_plantas_por_metro,
          novo_modo_espacamento: commonData.modo_espacamento,
          novo_distancia_entre_plantas: commonData.distancia_entre_plantas,
          novo_numero_plantas_por_cova: commonData.numero_plantas_por_cova,
          novo_area_usada_no_talhao: commonData.area_usada_no_talhao,
          novo_produtividade_esperada: commonData.produtividade_esperada,
          novo_produtividade_obtida: commonData.produtividade_obtida,
          
          novo_data_plantio: commonData.data_plantio,
          novo_data_emergencia: commonData.data_emergencia,
          novo_data_botonamento: commonData.data_botonamento,
          novo_data_florescimento: commonData.data_florescimento,
          novo_data_colheita: commonData.data_colheita,
          novo_idfoto: commonData.idfoto,
        });
        setCurrentCrop(response);
        toaster.create({ title: "Dados atualizados com sucesso!", type: "success" });
      } else {
        // CREATE
        const response = await createCrop(folderId, commonData);
        setCurrentCrop(response);
        toaster.create({ 
          title: "Cultura Criada!", 
          description: "Agora você pode adicionar adubações e análises nas abas acima.", 
          type: "success" 
        });
      }
      onSuccess();
    } catch (error) {
      console.error(error);
      const apiMessage = getApiErrorMessage(error);
      const isAreaConflict = isAreaConflictError(apiMessage);

      toaster.create({
        title: isAreaConflict ? "Área do talhão excedida" : "Erro ao salvar",
        description: isAreaConflict
          ? AREA_CONFLICT_MESSAGE
          : apiMessage || "Ocorreu um erro ao tentar salvar a cultura. Tente novamente.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DialogRoot 
      open={open} 
      onOpenChange={onOpenChange} 
      placement="center" 
      size="xl" 
      scrollBehavior="inside"
    >
      <DialogContent height="90vh" maxWidth="1100px">
        <DialogHeader>
          <DialogTitle fontSize="xl">
            {currentCrop ? `Cultura: ${currentCrop.nome} - ${currentCrop.variedade}` : "Nova Cultura"}
          </DialogTitle>
        </DialogHeader>

        <DialogBody display="flex" flexDirection="column" gap={4}>
          <Tabs.Root defaultValue="dados-gerais" variant="enclosed" width="100%">
            <Tabs.List>
              <Tabs.Trigger value="dados-gerais">Dados Gerais</Tabs.Trigger>
              <Tabs.Trigger value="top-dressing" disabled={!currentCrop}>
                Adubação Cobertura
              </Tabs.Trigger>
              <Tabs.Trigger value="foliar-analysis" disabled={!currentCrop}>
                Análise Foliar
              </Tabs.Trigger>
              <Tabs.Trigger value="foliar-fert" disabled={!currentCrop}>
                Adubação Foliar
              </Tabs.Trigger>
              <Tabs.Trigger value="deficiency-toxicity" disabled={!currentCrop}>
                Deficiências/Toxidez
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="dados-gerais">
              <VStack gap={6} align="stretch" pt={4}>
                <EntityImageUploader
                  label="Imagem da Cultura"
                  currentImageId={idfoto}
                  onImageIdChange={setIdfoto}
                />
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
                      <Input value={variedade} onChange={(e) => setVariedade(e.target.value)} placeholder="Ex: TMG 7062" />
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
                      <Input type="number" value={ciclo} onChange={(e) => setCiclo(e.target.value)} />
                    </Field>
                  </SimpleGrid>
                </VStack>

                <Separator />

                {/* Seção 2: Espaçamento */}
                <VStack align="stretch" gap={3}>
                  <Heading size="sm" color="gray.600">Espaçamento</Heading>
                  <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} alignItems="end">
                    <Field label="Distância entre linhas (m)">
                      <Input type="number" step="0.01" value={distanciaEntreLinhas} onChange={(e) => setDistanciaEntreLinhas(e.target.value)} placeholder="Ex: 0.5" />
                    </Field>
                    <Field label="Distância entre plantas">
                      <NativeSelect.Root size="sm" width="100%">
                        <NativeSelect.Field
                          value={modoEspacamento}
                          onChange={(e) => {
                            if (isPlantSpacingMode(e.target.value)) {
                              setModoEspacamento(e.target.value);
                            }
                          }}
                        >
                          <option value="plants_per_meter">Nº de Plantas/m linear</option>
                          <option value="holes">Distância entre covas (m)</option>
                        </NativeSelect.Field>
                      </NativeSelect.Root>
                    </Field>
                  </SimpleGrid>

                  <SimpleGrid columns={{ base: 1, md: modoEspacamento === "holes" ? 3 : 2 }} gap={4} alignItems="end">
                    {modoEspacamento === "holes" ? (
                      <>
                        <Field label="Distância entre covas (m)">
                          <Input
                            type="number"
                            step="0.01"
                            value={distanciaEntrePlantas}
                            onChange={(e) => setDistanciaEntrePlantas(e.target.value)}
                            placeholder="Ex: 0.25"
                          />
                        </Field>
                        <Field label="Nº de Plantas/cova">
                          <Input
                            type="number"
                            step="1"
                            value={plantasPorCova}
                            onChange={(e) => setPlantasPorCova(e.target.value)}
                            placeholder="Ex: 2"
                          />
                        </Field>
                      </>
                    ) : (
                      <Field label="Nº de Plantas/m linear">
                        <Input
                          type="number"
                          step="0.1"
                          value={plantasPorMetro}
                          onChange={(e) => setPlantasPorMetro(e.target.value)}
                          placeholder="Ex: 12"
                        />
                      </Field>
                    )}
                    <Box pb={2}>
                      <Text fontSize="sm" color="gray.500">População Estimada</Text>
                      <Text fontWeight="bold" fontSize="lg">{population} plantas/ha</Text>
                      {modoEspacamento === "holes" ? (
                        <Text fontSize="xs" color="gray.500">
                          O valor legado de plantas/m linear será calculado a partir das covas.
                        </Text>
                      ) : null}
                    </Box>
                  </SimpleGrid>

                  {currentCrop && !currentCrop.modo_espacamento ? (
                    <Text fontSize="xs" color="gray.500">
                      Cultura antiga sem modo de espaçamento salvo: usando Nº de Plantas/m linear.
                    </Text>
                  ) : null}
                </VStack>

                <Separator />

                {/* Seção 3: Produção */}
                <VStack align="stretch" gap={3}>
                  <Heading size="sm" color="gray.600">Produção e Área</Heading>
                  <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                    <Field label="Produtividade Esperada (kg/ha)">
                      <Input type="number" value={produtividadeEsperada} onChange={(e) => setProdutividadeEsperada(e.target.value)} />
                    </Field>
                    <Field label="Produtividade Obtida (kg/ha)">
                      <Input type="number" value={produtividadeObtida} onChange={(e) => setProdutividadeObtida(e.target.value)} />
                    </Field>
                  </SimpleGrid>
                  
                  <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} alignItems="end">
                    <Field label="Área Usada no Talhão (ha)">
                      <Input type="number" step="0.01" value={areaUsada} onChange={(e) => setAreaUsada(e.target.value)} />
                    </Field>
                    <Box pb={2}>
                      <Text fontSize="sm" color="gray.500">Porcentagem do Talhão</Text>
                      <HStack>
                        <Text fontWeight="bold">{areaPercentage}</Text>
                        <Text fontSize="xs" color="gray.400">(Área Total: {plotTotalArea} ha)</Text>
                      </HStack>
                    </Box>
                  </SimpleGrid>
                </VStack>

                <Separator />

                {/* Seção 4: Datas */}
                <VStack align="stretch" gap={3}>
                  <Heading size="sm" color="gray.600">Cronograma</Heading>
                  <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                    <Field label="Data de Plantio" required>
                      <Input type="date" value={dataPlantio} onChange={(e) => setDataPlantio(e.target.value)} />
                    </Field>
                    <Field label="Data de Emergência">
                      <Input type="date" value={dataEmergencia} onChange={(e) => setDataEmergencia(e.target.value)} />
                    </Field>
                    <Field label="Data de Abotoamento">
                      <Input type="date" value={dataBotonamento} onChange={(e) => setDataBotonamento(e.target.value)} />
                    </Field>
                    <Field label="Data de Florescimento">
                      <Input type="date" value={dataFlorescimento} onChange={(e) => setDataFlorescimento(e.target.value)} />
                    </Field>
                    <Field label="Data de Colheita">
                      <Input type="date" value={dataColheita} onChange={(e) => setDataColheita(e.target.value)} />
                    </Field>
                  </SimpleGrid>
                </VStack>

                <Box pt={4}>
                  <Button 
                    width="full" 
                    colorPalette="blue" 
                    onClick={handleSaveBasicInfo} 
                    loading={isLoading}
                  >
                    {currentCrop ? "Salvar Alterações de Dados Básicos" : "Criar Cultura e Habilitar Manejos"}
                  </Button>
                </Box>
              </VStack>
            </Tabs.Content>

            <Tabs.Content value="top-dressing">
              {currentCrop && <TopDressingManager cropId={currentCrop.id} />}
            </Tabs.Content>

            <Tabs.Content value="foliar-analysis">
              {currentCrop && (
                <FoliarAnalysisManager
                  cropId={currentCrop.id}
                  plantingYearLimit={currentCrop.data_plantio?.year}
                />
              )}
            </Tabs.Content>

            {/* ABA 4: ADUBAÇÃO FOLIAR (INTEGRADA) */}
            <Tabs.Content value="foliar-fert">
              {currentCrop ? (
                <FoliarFertilizationManager cropId={currentCrop.id} />
              ) : (
                <Box p={4} textAlign="center" color="gray.500">
                  Salve a cultura primeiro para adicionar adubações foliares.
                </Box>
              )}
            </Tabs.Content>


            <Tabs.Content value="deficiency-toxicity">
              {currentCrop ? (
                <CropDeficiencyToxicityManager cropId={currentCrop.id} />
              ) : (
                <Box p={4} textAlign="center" color="gray.500">
                  Salve a cultura primeiro para adicionar deficiências/toxidez.
                </Box>
              )}
            </Tabs.Content>
          </Tabs.Root>
        </DialogBody>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
};
