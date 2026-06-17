import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Flex,
  Heading,
  Spinner,
  Text,
  Dialog,
  IconButton,
  SimpleGrid,
  Accordion,
} from "@chakra-ui/react";
import { FiPlus, FiX } from "react-icons/fi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import UserLayout from "@/components/Layouts/UserLayout";
import FertName from "@/components/FertName/FertName";
import ConfigMenu from "@/components/ConfigMenu/ConfigMenu";
import { toaster } from "@/components/ui/toaster";

import { 
    FoliarTableResponseDto, 
    FoliarTableFormState, 
    DEFAULT_FOLIAR_TABLE_STATE,
    NutrientRangeState, 
    RegionEnum
} from "@/interfaces/FoliarAnalysisInterpretationTable";

import { 
    fetchFoliarTables, 
    fetchDefaultFoliarTables,
    createFoliarTable, 
    updateFoliarTable, 
    deleteFoliarTable,
    fetchLinesByTable, 
    createFoliarTableLine, 
    deleteFoliarTableLine
} from "@/services/foliarAnalysisInterpretationTableService";
import { useUserStore } from "@/stores/user/user.store";
import { isSupremeUser } from "@/utils/isSupremeUser";

import FoliarAnalysisTableForm from "@/components/FertilizationTable/FoliarAnalysis/FoliarAnalysisTableForm";
import FoliarAnalysisTableCard from "@/components/FertilizationTable/FoliarAnalysis/FoliarAnalysisTableCard";

// --- Helpers de Mapeamento ---
const num = (val: string): number => (val ? parseFloat(val) : 0.0);
const str = (val: number | undefined): string => (val !== undefined && val !== null ? String(val) : "");

const mapBackendRangeToState = (r: any): NutrientRangeState => ({ 
    min: str(r?.menor ?? r?.min), 
    max: str(r?.maior ?? r?.max) 
});

const mapStateToDto = (s: NutrientRangeState) => ({ min: num(s.min), max: num(s.max) });

const mapResponseToForm = (dto: FoliarTableResponseDto, lines: any[] = []): FoliarTableFormState => ({
    nome: dto.nome_tabela || "",
    region: dto.region || "",
    observacoes: dto.observacoes || "",
    fontes: dto.fontes || "",
    tabelaPublica: Boolean(dto.tabela_publica),
    rows: lines.map(line => ({
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
    }))
});

type Mode = "create" | "edit" | "view";

type Props = {
  variant?: "mine" | "default";
};

export default function FoliarAnalysisInterpretationTable({ variant = "mine" }: Props) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const user = useUserStore((s) => s.user);
  const isDefaultView = variant === "default";
  const isSupreme = isSupremeUser(user);
  const usesDefaultTables = isDefaultView || isSupreme;
  const canManage = !isDefaultView || isSupreme;
  const queryKey = usesDefaultTables ? ["foliar-tables-default"] : ["foliar-tables"];
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("create");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [activeItem, setActiveItem] = useState<FoliarTableResponseDto | null>(null);
  
  const [form, setForm] = useState<FoliarTableFormState>(DEFAULT_FOLIAR_TABLE_STATE);
  const [isSaving, setIsSaving] = useState(false);
  const [originalLines, setOriginalLines] = useState<any[]>([]); 

  const isReadOnly = mode === "view";
  
  const modalTitle = useMemo(() => {
      if (mode === "create") return "Nova Tabela TIAF";
      if (mode === "edit") return "Editar Tabela";
      return "Visualizar Tabela";
  }, [mode]);

  const { data: tables = [], isLoading, isError } = useQuery({
    queryKey,
    queryFn: usesDefaultTables ? fetchDefaultFoliarTables : fetchFoliarTables,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFoliarTable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      setIsDeleteOpen(false);
      setSelectedId(null);
      toaster.create({ title: "Tabela removida com sucesso.", type: "success" });
    },
    onError: () => toaster.create({ title: "Erro ao remover tabela.", type: "error" })
  });

  const handleOpen = async (newMode: Mode, item?: FoliarTableResponseDto) => {
    setMode(newMode);
    setActiveItem(item || null);
    
    if (item) {
        try {
            const lines = await fetchLinesByTable(item.id);
            setOriginalLines(lines);
            setForm(mapResponseToForm(item, lines));
        } catch (error) {
            toaster.create({ title: "Erro ao carregar detalhes da tabela.", type: "error" });
            setForm(mapResponseToForm(item, []));
            setOriginalLines([]);
        }
    } else {
        setForm(DEFAULT_FOLIAR_TABLE_STATE);
        setOriginalLines([]);
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (isReadOnly) { setIsModalOpen(false); return; }
    
    // --- VALIDAÇÕES OBRIGATÓRIAS ---
    
    // 1. Validação do Nome da Tabela
    if (!form.nome || form.nome.trim() === "") {
        toaster.create({ title: "O Nome da tabela é obrigatório.", type: "error" });
        return;
    }

    // 2. Validação da Região
    if (!form.region || form.region === "") { 
        toaster.create({ title: "A Região é obrigatória.", type: "error" }); 
        return; 
    }

    // 3. Validação das Culturas (Linhas)
    // Verifica se alguma linha adicionada não tem cultura selecionada
    const hasInvalidRows = form.rows.some(row => !row.cultura || row.cultura.trim() === "");
    
    if (hasInvalidRows) {
        toaster.create({ 
            title: "Cultura não selecionada.", 
            description: "Todas as linhas adicionadas devem ter uma cultura selecionada.",
            type: "error" 
        });
        return;
    }

    // -------------------------------

    setIsSaving(true);
    try {
        let tableId = activeItem?.id;

        // 1. Criar ou Atualizar Cabeçalho da Tabela
        if (mode === "create") {
            const tableRes = await createFoliarTable({ 
                nome_tabela: form.nome, 
                region: form.region as RegionEnum,
                observacoes: form.observacoes,
                fontes: form.fontes,
                tabela_publica: form.tabelaPublica 
            });
            tableId = tableRes.id;
        } else if (tableId) {
            await updateFoliarTable(tableId, { 
                novo_nome_tabela: form.nome, 
                novo_regiao_analise_foliar_culturas: form.region as RegionEnum,
                novas_observacoes: form.observacoes,
                novas_fontes: form.fontes,
                tabela_publica: form.tabelaPublica 
            } as any);
            
            // Limpa linhas antigas para evitar duplicidade no backend
            if (originalLines.length > 0) {
                for (const oldLine of originalLines) {
                    await deleteFoliarTableLine(oldLine.id);
                }
            }
        }

        if (!tableId) throw new Error("Falha ao identificar ID da tabela.");

        // 2. Salvar Linhas (Recriando todas)
        const linesPayloads = form.rows.map(row => ({
            cultura: row.cultura,
            n: mapStateToDto(row.n), p: mapStateToDto(row.p), k: mapStateToDto(row.k),
            ca: mapStateToDto(row.ca), mg: mapStateToDto(row.mg), s: mapStateToDto(row.s),
            b: mapStateToDto(row.b), cu: mapStateToDto(row.cu), fe: mapStateToDto(row.fe),
            mn: mapStateToDto(row.mn), mo: mapStateToDto(row.mo), zn: mapStateToDto(row.zn)
        }));

        for (const linePayload of linesPayloads) {
            // Mapeia para o formato exato esperado pelo DTO do Backend
            const lineRequest = {
                nome_cultura: linePayload.cultura,
                teores_n: { menor: linePayload.n.min, maior: linePayload.n.max, unity: "g_per_kg" },
                teores_p: { menor: linePayload.p.min, maior: linePayload.p.max, unity: "g_per_kg" },
                teores_k: { menor: linePayload.k.min, maior: linePayload.k.max, unity: "g_per_kg" },
                teores_ca: { menor: linePayload.ca.min, maior: linePayload.ca.max, unity: "g_per_kg" },
                teores_mg: { menor: linePayload.mg.min, maior: linePayload.mg.max, unity: "g_per_kg" },
                teores_s: { menor: linePayload.s.min, maior: linePayload.s.max, unity: "g_per_kg" },
                
                teores_b: { menor: linePayload.b.min, maior: linePayload.b.max, unity: "mg_per_kg" },
                teores_cu: { menor: linePayload.cu.min, maior: linePayload.cu.max, unity: "mg_per_kg" },
                teores_fe: { menor: linePayload.fe.min, maior: linePayload.fe.max, unity: "mg_per_kg" },
                teores_mn: { menor: linePayload.mn.min, maior: linePayload.mn.max, unity: "mg_per_kg" },
                teores_mo: { menor: linePayload.mo.min, maior: linePayload.mo.max, unity: "mg_per_kg" },
                teores_zn: { menor: linePayload.zn.min, maior: linePayload.zn.max, unity: "mg_per_kg" },
            };
            
            await createFoliarTableLine(tableId, lineRequest);
        }

        toaster.create({ title: mode === "create" ? "Tabela criada com sucesso!" : "Tabela atualizada com sucesso!", type: "success" });
        queryClient.invalidateQueries({ queryKey });
        setIsModalOpen(false);

    } catch (error) {
        console.error(error);
        toaster.create({ title: "Erro ao salvar dados.", type: "error" });
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <UserLayout>
      <FertName subtitle={isDefaultView ? "Tabelas Padrão de Análise Foliar" : "Tabelas de Interpretação para Análise Foliar (TIAF)"} />
      <ConfigMenu />

      <Box 
        pt={{ base: 24, md: 32 }} 
        px={{ base: 4, md: 8 }} 
        w="full" 
        maxW="1600px" 
        mx="auto"
      >
        <Button
          variant="outline"
          onClick={() => navigate(isDefaultView ? "/fertintelligence/fertilization-table-management/default" : "/fertintelligence/fertilization-table-management")}
          mb={4}
        >
          Voltar para o painel
        </Button>
        <Flex 
            justify="space-between" 
            align="center" 
            mb={8} 
            direction={{ base: "column", sm: "row" }} 
            gap={4}
        >
            <Box>
                <Heading size="lg" color="gray.700" _dark={{ color: "gray.200" }}>
                  {canManage ? "Gerenciar Tabelas" : "Tabelas Padrão"}
                </Heading>
                <Text color="gray.500" fontSize="sm" mt={1}>
                  {canManage ? "Interpretação de análise foliar por cultura e região" : "Consulte as tabelas padrão em modo somente leitura"}
                </Text>
            </Box>
            
            <Flex gap={2}>
              {canManage && (
                <Button
                    colorPalette="orange"
                    onClick={() => handleOpen("create")}
                    size="md"
                >
                    <FiPlus /> Nova Tabela
                </Button>
              )}
              <Button variant="outline" colorPalette="orange" onClick={() => navigate("/fertintelligence/fertilization-table-management/foliar-analysis-interpretation-table/public") }>
                  Consultar tabelas públicas
              </Button>
            </Flex>
        </Flex>

        <Accordion.Root collapsible defaultValue={["list"]}>
          <Accordion.Item value="list">
            <Accordion.ItemTrigger>
              <Box flex="1" textAlign="left">
                <Heading size="md">Tabelas de Interpretação</Heading>
              </Box>
            </Accordion.ItemTrigger>
            <Accordion.ItemContent>
              <Accordion.ItemBody>
                {isLoading ? (
                    <Flex justify="center" minH="200px" align="center">
                        <Spinner color="orange.500" size="xl" />
                    </Flex>
                ) : isError ? (
                    <Flex justify="center" minH="200px" align="center" direction="column" gap={2}>
                        <Text color="red.500" fontWeight="bold">Erro ao carregar dados.</Text>
                        <Button size="sm" variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey })}>Tentar Novamente</Button>
                    </Flex>
                ) : tables.length === 0 ? (
                    <Flex 
                        justify="center" 
                        align="center" 
                        minH="300px" 
                        borderWidth="2px" 
                        borderStyle="dashed" 
                        borderColor="gray.300" 
                        borderRadius="lg"
                        direction="column"
                        gap={4}
                        color="gray.500"
                    >
                        <Text fontSize="lg">Nenhuma tabela de interpretação encontrada.</Text>
                        {canManage && <Button variant="ghost" colorPalette="orange" onClick={() => handleOpen("create")}>Comece criando uma agora</Button>}
                    </Flex>
                ) : (
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} gap={6}>
                        {tables.map((table) => (
                            <FoliarAnalysisTableCard
                                key={table.id}
                                item={table}
                                isSelected={selectedId === table.id}
                                onSelect={() => setSelectedId(selectedId === table.id ? null : table.id)}
                                onView={() => handleOpen("view", table)}
                                onEdit={canManage ? () => handleOpen("edit", table) : undefined}
                                onDelete={canManage ? () => { setActiveItem(table); setIsDeleteOpen(true); } : undefined}
                            />
                        ))}
                    </SimpleGrid>
                )}
              </Accordion.ItemBody>
            </Accordion.ItemContent>
          </Accordion.Item>
        </Accordion.Root>
      </Box>

      {/* --- Dialog Principal (Formulário) --- */}
      <Dialog.Root 
        open={isModalOpen} 
        onOpenChange={(e) => setIsModalOpen(e.open)} 
        size="xl" 
        scrollBehavior="inside"
        motionPreset="slide-in-bottom"
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content bg="white" _dark={{ bg: "gray.800" }} maxW="95vw" h={{ base: "100%", md: "auto" }}>
            <Dialog.Header>
              <Flex justify="space-between" align="center">
                <Dialog.Title fontSize="lg" fontWeight="bold" color="orange.600">
                    {modalTitle}
                </Dialog.Title>
                <Dialog.CloseTrigger asChild>
                  <IconButton size="sm" variant="ghost" aria-label="Fechar" onClick={() => setIsModalOpen(false)}>
                    <FiX />
                  </IconButton>
                </Dialog.CloseTrigger>
              </Flex>
            </Dialog.Header>

            <Dialog.Body>
              <FoliarAnalysisTableForm 
                form={form} 
                setForm={setForm} 
                readOnly={isReadOnly} 
              />
            </Dialog.Body>

            <Dialog.Footer borderTopWidth="1px" _dark={{ borderColor: "gray.700" }}>
              <Button 
                variant="ghost" 
                onClick={() => setIsModalOpen(false)}
                disabled={isSaving}
              >
                {isReadOnly ? "Fechar" : "Cancelar"}
              </Button>
              {!isReadOnly && (
                <Button colorPalette="orange" onClick={handleSave} loading={isSaving}>
                  Salvar
                </Button>
              )}
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>

      {/* --- Dialog Exclusão --- */}
      <Dialog.Root open={isDeleteOpen} onOpenChange={(e) => setIsDeleteOpen(e.open)}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content bg="white" _dark={{ bg: "gray.800" }}>
            <Dialog.Header>
                <Dialog.Title fontWeight="bold">Excluir Tabela</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Text>
                Tem certeza que deseja excluir a tabela <Text as="span" fontWeight="bold">{activeItem?.nome_tabela}</Text>?
              </Text>
              <Text fontSize="sm" color="gray.500" mt={2}>
                Todas as faixas de nutrientes associadas serão perdidas. Esta ação não pode ser desfeita.
              </Text>
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={deleteMutation.isPending}>
                Cancelar
              </Button>
              <Button 
                colorPalette="red" 
                onClick={() => activeItem && deleteMutation.mutate(activeItem.id)} 
                loading={deleteMutation.isPending}
              >
                Excluir Definitivamente
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </UserLayout>
  );
}
