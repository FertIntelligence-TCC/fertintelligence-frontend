import { useState } from "react";
import {
  Badge,
  Box,
  Button,
  Dialog,
  Flex,
  Heading,
  HStack,
  IconButton,
  SimpleGrid,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { FiArrowLeft, FiEye, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import UserLayout from "@/components/Layouts/UserLayout";
import FertName from "@/components/FertName/FertName";
import ConfigMenu from "@/components/ConfigMenu/ConfigMenu";
import FoliarAnalysisTableForm from "@/components/FertilizationTable/FoliarAnalysis/FoliarAnalysisTableForm";
import { toaster } from "@/components/ui/toaster";
import {
  DEFAULT_FOLIAR_TABLE_STATE,
  FoliarTableFormState,
  FoliarTableResponseDto,
  NutrientRangeState,
} from "@/interfaces/FoliarAnalysisInterpretationTable";
import {
  fetchLinesByTable,
  fetchPublicFoliarTables,
} from "@/services/foliarAnalysisInterpretationTableService";

const str = (val: number | undefined): string => (val !== undefined && val !== null ? String(val) : "");

const mapBackendRangeToState = (r: any): NutrientRangeState => ({
  min: str(r?.menor ?? r?.min),
  max: str(r?.maior ?? r?.max),
});

const mapResponseToForm = (dto: FoliarTableResponseDto, lines: any[] = []): FoliarTableFormState => ({
  nome: dto.nome_tabela || "",
  region: dto.region || "",
  observacoes: dto.observacoes || "",
  fontes: dto.fontes || "",
  tabelaPublica: Boolean(dto.tabela_publica),
  rows: lines.map((line) => ({
    id: line.id,
    cultura: line.nome_cultura || line.cultura,
    n: mapBackendRangeToState(line.teores_n || line.n),
    p: mapBackendRangeToState(line.teores_p || line.p),
    k: mapBackendRangeToState(line.teores_k || line.k),
    ca: mapBackendRangeToState(line.teores_ca || line.ca),
    mg: mapBackendRangeToState(line.teores_mg || line.mg),
    s: mapBackendRangeToState(line.teores_s || line.s),
    b: mapBackendRangeToState(line.teores_b || line.b),
    cu: mapBackendRangeToState(line.teores_cu || line.cu),
    fe: mapBackendRangeToState(line.teores_fe || line.fe),
    mn: mapBackendRangeToState(line.teores_mn || line.mn),
    mo: mapBackendRangeToState(line.teores_mo || line.mo),
    zn: mapBackendRangeToState(line.teores_zn || line.zn),
  })),
});

export default function PublicFoliarAnalysisInterpretationTable() {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<FoliarTableFormState>(DEFAULT_FOLIAR_TABLE_STATE);

  const { data = [], isLoading } = useQuery({
    queryKey: ["foliar-tables-public"],
    queryFn: fetchPublicFoliarTables,
  });

  const handleView = async (table: FoliarTableResponseDto) => {
    try {
      const lines = await fetchLinesByTable(table.id);
      setForm(mapResponseToForm(table, lines));
    } catch {
      setForm(mapResponseToForm(table, []));
      toaster.create({
        title: "Não foi possível carregar todas as linhas da tabela.",
        type: "error",
      });
    }
    setIsModalOpen(true);
  };

  return (
    <UserLayout>
      <FertName subtitle="Tabelas Públicas de Análise Foliar" />
      <ConfigMenu />

      <Box pt={{ base: 24, md: 32 }} px={{ base: 4, md: 8 }} w="full" maxW="1600px" mx="auto">
        <Button
          mb={6}
          variant="outline"
          colorPalette="orange"
          onClick={() =>
            navigate("/fertintelligence/fertilization-table-management/foliar-analysis-interpretation-table")
          }
        >
          <FiArrowLeft /> Voltar para minhas tabelas
        </Button>

        <Box mb={8}>
          <Heading size="lg" color="gray.700" _dark={{ color: "gray.200" }}>
            Tabelas públicas de interpretação de análise foliar
          </Heading>
          <Text color="gray.500" fontSize="sm" mt={1}>
            Visualização pública em modo somente leitura
          </Text>
        </Box>

        {isLoading ? (
          <Flex justify="center" minH="200px" align="center">
            <Spinner color="orange.500" size="xl" />
          </Flex>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} gap={6}>
            {data.map((table: FoliarTableResponseDto & { nome_criador?: string; nome_comum_cultura?: string }) => (
              <Box
                key={table.id}
                borderWidth="1px"
                borderRadius="md"
                boxShadow="md"
                bg="white"
                _dark={{ bg: "gray.700" }}
                p={4}
                cursor="pointer"
                transition="all 0.2s"
                _hover={{ borderColor: "orange.400", shadow: "lg" }}
                borderColor={selectedId === table.id ? "orange.500" : "gray.200"}
                borderLeftWidth={selectedId === table.id ? "4px" : "1px"}
                onClick={() => setSelectedId(selectedId === table.id ? null : table.id)}
              >
                <Flex justify="space-between" align="start" gap={3}>
                  <Text
                    fontWeight="bold"
                    fontSize="md"
                    color="orange.700"
                    _dark={{ color: "orange.300" }}
                    lineClamp={2}
                  >
                    {table.nome_tabela || "Tabela de Interpretação"}
                  </Text>
                  <Badge colorPalette="orange" variant="surface">
                    Análise Foliar
                  </Badge>
                </Flex>

                <Text fontSize="sm" color="gray.700" _dark={{ color: "gray.200" }} mt={3}>
                  <Text as="span" fontWeight="bold">
                    Criador:
                  </Text>{" "}
                  {table.nome_criador || "-"}
                </Text>

                {table.region && (
                  <Text fontSize="sm" color="gray.700" _dark={{ color: "gray.200" }} mt={1}>
                    <Text as="span" fontWeight="bold">
                      Região:
                    </Text>{" "}
                    {table.region.replace(/_/g, " ")}
                  </Text>
                )}

                {table.observacoes && (
                  <Text fontSize="xs" color="gray.500" _dark={{ color: "gray.300" }} mt={2} lineClamp={2}>
                    <Text as="span" fontWeight="semibold">Observações:</Text> {table.observacoes}
                  </Text>
                )}

                {table.fontes && (
                  <Text fontSize="xs" color="gray.500" _dark={{ color: "gray.300" }} mt={1} lineClamp={2}>
                    <Text as="span" fontWeight="semibold">Fontes:</Text> {table.fontes}
                  </Text>
                )}

                {table.nome_comum_cultura && (
                  <Text fontSize="sm" color="gray.700" _dark={{ color: "gray.200" }} mt={1}>
                    <Text as="span" fontWeight="bold">
                      Cultura:
                    </Text>{" "}
                    {table.nome_comum_cultura}
                  </Text>
                )}

                {selectedId === table.id && (
                  <HStack justify="flex-end" gap={2} mt={3}>
                    <IconButton
                      size="sm"
                      aria-label="Visualizar"
                      borderRadius="full"
                      variant="ghost"
                      colorPalette="blue"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleView(table);
                      }}
                    >
                      <FiEye />
                    </IconButton>
                  </HStack>
                )}
              </Box>
            ))}
          </SimpleGrid>
        )}
      </Box>

      <Dialog.Root open={isModalOpen} onOpenChange={(e) => setIsModalOpen(e.open)} size="xl" scrollBehavior="inside">
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content bg="white" _dark={{ bg: "gray.800" }} maxW="95vw" h={{ base: "100%", md: "auto" }}>
            <Dialog.Header>
              <Flex justify="space-between" align="center">
                <Dialog.Title fontSize="lg" fontWeight="bold" color="orange.600">
                  Visualizar Tabela Pública de Análise Foliar
                </Dialog.Title>
                <Dialog.CloseTrigger asChild>
                  <IconButton size="sm" variant="ghost" aria-label="Fechar" onClick={() => setIsModalOpen(false)}>
                    <FiX />
                  </IconButton>
                </Dialog.CloseTrigger>
              </Flex>
            </Dialog.Header>

            <Dialog.Body>
              <FoliarAnalysisTableForm form={form} setForm={setForm} readOnly />
            </Dialog.Body>

            <Dialog.Footer borderTopWidth="1px" _dark={{ borderColor: "gray.700" }}>
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                Fechar
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </UserLayout>
  );
}
