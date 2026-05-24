import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Center,
  Flex,
  Grid,
  Heading,
  HStack,
  NativeSelect,
  Separator,
  SimpleGrid,
  Spinner,
  Table,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import DialogContainer from "@/components/Property/DialogContainer";
import { CropDate, CropResponseDto } from "@/interfaces/Crop";
import {
  BeneficialElementsContent,
  FoliarAnalysisResponseDto,
  MacronutrientsContent,
  MicronutrientsContent,
} from "@/interfaces/FoliarAnalysis";
import {
  LiquidSourceResponseDto,
  SolidSourceResponseDto,
} from "@/interfaces/FoliarFertilization";
import { TopDressingFertilizationResponseDto } from "@/interfaces/TopDressingFertilization";
import { getFoliarAnalysesByCrop } from "@/services/foliarAnalysisService";
import {
  fetchFoliarTables,
  fetchPublicFoliarTables,
} from "@/services/foliarAnalysisInterpretationTableService";
import { generateFertigram } from "@/services/fertigramService";
import { getLiquidSourcesByCrop } from "@/services/liquidSourceService";
import { getSolidSourcesByCrop } from "@/services/solidSourceService";
import { getTopDressingFertilizationsByCrop } from "@/services/topDressingFertilizationService";
import { FertigramResponse } from "@/interfaces/Fertigram";
import { FoliarTableResponseDto } from "@/interfaces/FoliarAnalysisInterpretationTable";
import { toaster } from "@/components/ui/toaster";
import FertigramView from "@/components/Fertigram/FertigramView";

interface CropReadOnlyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  crop: CropResponseDto | null;
}

const formatDate = (date?: CropDate) => {
  if (!date) return "-";
  const day = date.day.toString().padStart(2, "0");
  const month = date.month.toString().padStart(2, "0");
  return `${day}/${month}/${date.year}`;
};

const formatValue = (value?: string | number | null) => {
  if (value === null || value === undefined || value === "") return "-";
  return value;
};

const DetailItem = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <Box>
    <Text
      fontSize="xs"
      color="gray.500"
      fontWeight="bold"
      textTransform="uppercase"
    >
      {label}
    </Text>
    <Text fontSize="md" color="gray.700" _dark={{ color: "gray.200" }}>
      {value}
    </Text>
  </Box>
);

const NUTRIENT_LABELS: Record<string, Record<string, string>> = {
  macronutrients: {
    n_content: "N",
    p_content: "P",
    k_content: "K",
    ca_content: "Ca",
    mg_content: "Mg",
    s_content: "S",
  },
  micronutrients: {
    b_content: "B",
    cu_content: "Cu",
    fe_content: "Fe",
    ni_content: "Ni",
    mn_content: "Mn",
    mo_content: "Mo",
    zn_content: "Zn",
  },
  beneficial: {
    na_content: "Na",
    si_content: "Si",
    v_content: "V",
    co_content: "Co",
    se_content: "Se",
  },
};

const TOP_DRESSING_LABELS: Array<{
  key: keyof TopDressingFertilizationResponseDto;
  label: string;
}> = [
  { key: "formulado", label: "Formulado" },
  { key: "sulfato_de_amonio", label: "Sulfato de amônio" },
  { key: "ureia", label: "Ureia" },
  { key: "cloreto_de_potassio", label: "Cloreto de potássio" },
  { key: "superfosfato_triplo", label: "Superfosfato triplo" },
  { key: "superfosfato_simples", label: "Superfosfato simples" },
  { key: "monoamonio_fosfato", label: "Monoamônio fosfato" },
];

const renderNutrientGrid = (
  values:
    | MacronutrientsContent
    | MicronutrientsContent
    | BeneficialElementsContent
    | undefined,
  labels: Record<string, string>,
) => {
  const entries = Object.entries(labels)
    .map(([key, label]) => ({
      key,
      label,
      value:
        values?.[
          key as keyof (
            | MacronutrientsContent
            | MicronutrientsContent
            | BeneficialElementsContent
          )
        ],
    }))
    .filter((entry) => entry.value !== undefined && entry.value !== null);

  if (entries.length === 0) {
    return <Text color="gray.500">Sem registros.</Text>;
  }

  return (
    <SimpleGrid columns={{ base: 2, md: 3 }} gap={3} mt={2}>
      {entries.map((entry) => (
        <DetailItem
          key={entry.key}
          label={entry.label}
          value={Number(entry.value)}
        />
      ))}
    </SimpleGrid>
  );
};

const renderTopDressingDetails = (item: TopDressingFertilizationResponseDto) => {
  const entries = TOP_DRESSING_LABELS.filter(
    (entry) => item[entry.key] !== undefined && item[entry.key] !== null,
  );

  if (entries.length === 0) {
    return (
      <Text fontSize="sm" color="gray.500">
        Nenhum fertilizante registrado.
      </Text>
    );
  }

  return (
    <VStack align="start" gap={1}>
      {entries.map((entry) => (
        <Text key={String(entry.key)} fontSize="sm">
          {entry.label}: {String(item[entry.key])}
        </Text>
      ))}
    </VStack>
  );
};

export const CropReadOnlyDialog = ({
  isOpen,
  onClose,
  crop,
}: CropReadOnlyDialogProps) => {
  const cropId = crop?.id;
  const queriesEnabled = isOpen && !!cropId;
  const [isFertigramOpen, setIsFertigramOpen] = useState(false);
  const [selectedFoliarAnalysisId, setSelectedFoliarAnalysisId] = useState("");
  const [selectedFoliarTableId, setSelectedFoliarTableId] = useState("");
  const [fertigram, setFertigram] = useState<FertigramResponse | null>(null);
  const [loadingFertigram, setLoadingFertigram] = useState(false);

  const { data: foliarAnalyses = [], isLoading: isLoadingFoliar } = useQuery({
    queryKey: ["crop", cropId, "foliar-analyses"],
    queryFn: () => getFoliarAnalysesByCrop(cropId as number),
    enabled: queriesEnabled,
  });

  const { data: topDressing = [], isLoading: isLoadingTopDressing } = useQuery(
    {
      queryKey: ["crop", cropId, "top-dressing"],
      queryFn: () => getTopDressingFertilizationsByCrop(cropId as number),
      enabled: queriesEnabled,
    },
  );

  const { data: liquidSources = [], isLoading: isLoadingLiquid } = useQuery({
    queryKey: ["crop", cropId, "liquid-sources"],
    queryFn: () => getLiquidSourcesByCrop(cropId as number),
    enabled: queriesEnabled,
  });

  const { data: solidSources = [], isLoading: isLoadingSolid } = useQuery({
    queryKey: ["crop", cropId, "solid-sources"],
    queryFn: () => getSolidSourcesByCrop(cropId as number),
    enabled: queriesEnabled,
  });

  const { data: privateFoliarTables = [], isLoading: isLoadingPrivateTables } =
    useQuery({
      queryKey: ["foliar-tables"],
      queryFn: fetchFoliarTables,
      enabled: queriesEnabled,
    });

  const { data: publicFoliarTables = [], isLoading: isLoadingPublicTables } =
    useQuery({
      queryKey: ["foliar-tables-public"],
      queryFn: fetchPublicFoliarTables,
      enabled: queriesEnabled,
    });

  const foliarTables = useMemo(() => {
    const all = [...privateFoliarTables, ...publicFoliarTables];
    const dedup = new Map<number, FoliarTableResponseDto>();
    all.forEach((table) => dedup.set(table.id, table));
    return Array.from(dedup.values());
  }, [privateFoliarTables, publicFoliarTables]);

  const sortedTopDressing = useMemo(() => {
    return [...topDressing].sort((a, b) => a.ordem - b.ordem);
  }, [topDressing]);

  const sortedFoliarAnalyses = useMemo(() => {
    return [...foliarAnalyses].sort((a, b) => {
      if (!a.data_coleta || !b.data_coleta) return 0;
      const dateA = new Date(
        a.data_coleta.year,
        a.data_coleta.month - 1,
        a.data_coleta.day,
      ).getTime();
      const dateB = new Date(
        b.data_coleta.year,
        b.data_coleta.month - 1,
        b.data_coleta.day,
      ).getTime();
      return dateB - dateA;
    });
  }, [foliarAnalyses]);

  const renderLoading = () => (
    <Center py={6}>
      <Spinner size="sm" />
    </Center>
  );

  const handleGenerateFertigram = async () => {
    if (!selectedFoliarAnalysisId || !selectedFoliarTableId) {
      toaster.create({
        title: "Selecione uma análise foliar e uma tabela.",
        type: "error",
      });
      return;
    }

    setLoadingFertigram(true);
    try {
      const response = await generateFertigram(
        Number(selectedFoliarAnalysisId),
        Number(selectedFoliarTableId),
      );
      setFertigram(response);
    } catch {
      toaster.create({
        title: "Erro ao gerar Fertigrama",
        type: "error",
      });
    } finally {
      setLoadingFertigram(false);
    }
  };

  if (!isOpen || !crop) return null;

  return (
    <DialogContainer isOpen={isOpen} onClose={onClose} zIndex={1600}>
      <Heading as="h3" size="md" mb={4} color="green.600">
        Detalhes da Cultura: {crop.nome.replace(/_/g, " ")}
      </Heading>

      <VStack align="stretch" gap={4}>
        <Grid templateColumns="1fr 1fr" gap={4}>
          <DetailItem label="Tipo de Cultivo" value={crop.tipo_cultivo} />
          <DetailItem label="Variedade" value={crop.variedade} />
        </Grid>

        <Grid templateColumns="1fr 1fr" gap={4}>
          <DetailItem label="Ciclo" value={`${crop.ciclo} dias`} />
          <DetailItem label="Nome" value={crop.nome.replace(/_/g, " ")} />
        </Grid>

        <Separator my={1} />

        <Grid templateColumns="1fr 1fr" gap={4}>
          <DetailItem
            label="Distância entre linhas"
            value={`${crop.distancia_entre_linhas} m`}
          />
          <Box />
        </Grid>

        <Grid templateColumns="1fr 1fr" gap={4}>
          <DetailItem label="Data de Plantio" value={formatDate(crop.data_plantio)} />
          <DetailItem
            label="Data de Emergência"
            value={formatDate(crop.data_emergencia)}
          />
        </Grid>

        <Grid templateColumns="1fr 1fr" gap={4}>
          <DetailItem
            label="Data de Botonamento"
            value={formatDate(crop.data_botonamento)}
          />
          <DetailItem
            label="Data de Florescimento"
            value={formatDate(crop.data_florescimento)}
          />
        </Grid>

        <Grid templateColumns="1fr 1fr" gap={4}>
          <DetailItem
            label="Data de Colheita"
            value={formatDate(crop.data_colheita)}
          />
          <Box />
        </Grid>

        <Separator my={1} />

        <VStack align="stretch" gap={4}>
          <Flex justify="space-between" align="center" gap={3}>
            <Heading as="h4" size="sm" color="gray.600">
              Análises Foliares
            </Heading>
            {!!cropId && (
              <Button
                size="sm"
                variant="outline"
                colorPalette="green"
                onClick={() => setIsFertigramOpen((prev) => !prev)}
              >
                Exibir Fertigrama
              </Button>
            )}
          </Flex>

          {isLoadingFoliar ? (
            renderLoading()
          ) : sortedFoliarAnalyses.length === 0 ? (
            <Text color="gray.500">Nenhuma análise foliar registrada.</Text>
          ) : (
            <VStack align="stretch" gap={4}>
              {sortedFoliarAnalyses.map((analysis: FoliarAnalysisResponseDto) => (
                <Box key={analysis.id} borderWidth="1px" borderRadius="md" p={4}>
                  <Grid templateColumns="1fr 1fr" gap={4}>
                    <DetailItem
                      label="Data de coleta"
                      value={formatDate(analysis.data_coleta)}
                    />
                    <DetailItem
                      label="Laboratório"
                      value={String(formatValue(analysis.laboratorio))}
                    />
                  </Grid>

                  <Separator my={3} />

                  <VStack align="stretch" gap={3}>
                    <Box>
                      <Text fontSize="sm" fontWeight="bold" color="gray.600">
                        Macronutrientes
                      </Text>
                      {renderNutrientGrid(
                        analysis.macronutrientes,
                        NUTRIENT_LABELS.macronutrients,
                      )}
                    </Box>

                    <Box>
                      <Text fontSize="sm" fontWeight="bold" color="gray.600">
                        Micronutrientes
                      </Text>
                      {renderNutrientGrid(
                        analysis.micronutrientes,
                        NUTRIENT_LABELS.micronutrients,
                      )}
                    </Box>

                    <Box>
                      <Text fontSize="sm" fontWeight="bold" color="gray.600">
                        Elementos benéficos
                      </Text>
                      {renderNutrientGrid(
                        analysis.elementos_beneficos,
                        NUTRIENT_LABELS.beneficial,
                      )}
                    </Box>
                  </VStack>
                </Box>
              ))}
            </VStack>
          )}

          {isFertigramOpen && (
            <Box borderWidth="1px" borderRadius="md" p={4}>
              <VStack align="stretch" gap={3}>
                <Heading as="h5" size="xs" color="gray.600">
                  Geração do Fertigrama
                </Heading>

                {isLoadingFoliar ? (
                  renderLoading()
                ) : sortedFoliarAnalyses.length === 0 ? (
                  <Text color="gray.500">
                    Nenhuma análise foliar disponível para esta cultura.
                  </Text>
                ) : (
                  <NativeSelect.Root size="sm" width="100%">
                    <NativeSelect.Field
                      value={selectedFoliarAnalysisId}
                      onChange={(e) => setSelectedFoliarAnalysisId(e.target.value)}
                    >
                      <option value="">Selecione a análise foliar</option>
                      {sortedFoliarAnalyses.map((analysis) => (
                        <option key={analysis.id} value={analysis.id}>
                          {`Coleta ${formatDate(analysis.data_coleta)} - ${formatValue(analysis.laboratorio)}`}
                        </option>
                      ))}
                    </NativeSelect.Field>
                  </NativeSelect.Root>
                )}

                {isLoadingPrivateTables || isLoadingPublicTables ? (
                  renderLoading()
                ) : foliarTables.length === 0 ? (
                  <Text color="gray.500">
                    Nenhuma tabela de interpretação foliar disponível.
                  </Text>
                ) : (
                  <NativeSelect.Root size="sm" width="100%">
                    <NativeSelect.Field
                      value={selectedFoliarTableId}
                      onChange={(e) => setSelectedFoliarTableId(e.target.value)}
                    >
                      <option value="">Selecione a tabela de interpretação</option>
                      {foliarTables.map((table) => (
                        <option key={table.id} value={table.id}>
                          {table.nome_tabela ?? `Tabela #${table.id}`}
                        </option>
                      ))}
                    </NativeSelect.Field>
                  </NativeSelect.Root>
                )}

                <HStack justify="flex-end">
                  <Button
                    size="sm"
                    colorPalette="green"
                    onClick={handleGenerateFertigram}
                    loading={loadingFertigram}
                    disabled={
                      !selectedFoliarAnalysisId ||
                      !selectedFoliarTableId ||
                      sortedFoliarAnalyses.length === 0 ||
                      foliarTables.length === 0
                    }
                  >
                    Gerar Fertigrama
                  </Button>
                </HStack>

                {fertigram && (
                  <FertigramView
                    data={{
                      ...fertigram,
                      cropName: fertigram.cropName ?? crop.nome.replace(/_/g, " "),
                    }}
                  />
                )}
              </VStack>
            </Box>
          )}
        </VStack>

        <Separator my={1} />

        <VStack align="stretch" gap={4}>
          <Heading as="h4" size="sm" color="gray.600">
            Adubação de Cobertura
          </Heading>

          {isLoadingTopDressing ? (
            renderLoading()
          ) : sortedTopDressing.length === 0 ? (
            <Text color="gray.500">Nenhuma adubação de cobertura registrada.</Text>
          ) : (
            <Box borderWidth="1px" borderRadius="md" overflowX="auto">
              <Table.Root size="sm" striped>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader width="80px">Ordem</Table.ColumnHeader>
                    <Table.ColumnHeader width="140px">Data</Table.ColumnHeader>
                    <Table.ColumnHeader>Fertilizantes (kg/ha)</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {sortedTopDressing.map(
                    (item: TopDressingFertilizationResponseDto) => (
                      <Table.Row key={item.id}>
                        <Table.Cell>{item.ordem}ª</Table.Cell>
                        <Table.Cell>{formatDate(item.data)}</Table.Cell>
                        <Table.Cell>{renderTopDressingDetails(item)}</Table.Cell>
                      </Table.Row>
                    ),
                  )}
                </Table.Body>
              </Table.Root>
            </Box>
          )}
        </VStack>

        <Separator my={1} />

        <VStack align="stretch" gap={4}>
          <Heading as="h4" size="sm" color="gray.600">
            Adubação Foliar - Fontes Líquidas
          </Heading>

          {isLoadingLiquid ? (
            renderLoading()
          ) : liquidSources.length === 0 ? (
            <Text color="gray.500">Nenhuma fonte líquida registrada.</Text>
          ) : (
            <Box borderWidth="1px" borderRadius="md" overflowX="auto">
              <Table.Root size="sm" striped>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader width="140px">Data</Table.ColumnHeader>
                    <Table.ColumnHeader>Micronutriente</Table.ColumnHeader>
                    <Table.ColumnHeader>Fonte</Table.ColumnHeader>
                    <Table.ColumnHeader>Concentração</Table.ColumnHeader>
                    <Table.ColumnHeader>Densidade</Table.ColumnHeader>
                    <Table.ColumnHeader>Volume aplicado (L/ha)</Table.ColumnHeader>
                    <Table.ColumnHeader>Volume calda (L/ha)</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {liquidSources.map((item: LiquidSourceResponseDto) => (
                    <Table.Row key={item.id}>
                      <Table.Cell>{formatDate(item.data)}</Table.Cell>
                      <Table.Cell>{formatValue(item.micronutriente_aplicado)}</Table.Cell>
                      <Table.Cell>{formatValue(item.fonte)}</Table.Cell>
                      <Table.Cell>{formatValue(item.concentracao)}</Table.Cell>
                      <Table.Cell>{formatValue(item.densidade)}</Table.Cell>
                      <Table.Cell>{formatValue(item.volume_aplicado)}</Table.Cell>
                      <Table.Cell>{formatValue(item.volume_calda)}</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Box>
          )}
        </VStack>

        <Separator my={1} />

        <VStack align="stretch" gap={4}>
          <Heading as="h4" size="sm" color="gray.600">
            Adubação Foliar - Fontes Sólidas
          </Heading>

          {isLoadingSolid ? (
            renderLoading()
          ) : solidSources.length === 0 ? (
            <Text color="gray.500">Nenhuma fonte sólida registrada.</Text>
          ) : (
            <Box borderWidth="1px" borderRadius="md" overflowX="auto">
              <Table.Root size="sm" striped>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader width="140px">Data</Table.ColumnHeader>
                    <Table.ColumnHeader>Micronutriente</Table.ColumnHeader>
                    <Table.ColumnHeader>Fonte</Table.ColumnHeader>
                    <Table.ColumnHeader>Concentração</Table.ColumnHeader>
                    <Table.ColumnHeader>
                      Quantidade aplicada (kg/ha)
                    </Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {solidSources.map((item: SolidSourceResponseDto) => (
                    <Table.Row key={item.id}>
                      <Table.Cell>{formatDate(item.data)}</Table.Cell>
                      <Table.Cell>{formatValue(item.micronutriente_aplicado)}</Table.Cell>
                      <Table.Cell>{formatValue(item.fonte)}</Table.Cell>
                      <Table.Cell>{formatValue(item.concentracao)}</Table.Cell>
                      <Table.Cell>{formatValue(item.quantidade_aplicada)}</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Box>
          )}
        </VStack>
      </VStack>

      <Flex justify="flex-end" mt={6}>
        <Button onClick={onClose} colorScheme="red" variant="outline">
          Fechar
        </Button>
      </Flex>
    </DialogContainer>
  );
};
