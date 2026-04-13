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
} from "@chakra-ui/react";
import { FiPlus, FiX } from "react-icons/fi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import UserLayout from "@/components/Layouts/UserLayout";
import FertName from "@/components/FertName/FertName";
import ConfigMenu from "@/components/ConfigMenu/ConfigMenu";
import { toaster } from "@/components/ui/toaster";

import { 
    SoilFertilityTableResponseDto, 
    SoilFertilityFormState, 
    DEFAULT_SOIL_FERTILITY_STATE,
    RegionEnum,
    SoilFertilityTableCreateRequestDto,
    SoilFertilityTablePostRequestDto
} from "@/interfaces/SoilFertilityInterpretationCriteriaTable";

import { 
    fetchSoilFertilityTables, 
    createSoilFertilityTable, 
    updateSoilFertilityTable, 
    deleteSoilFertilityTable
} from "@/services/soilFertilityInterpretationCriteriaTableService";

import SoilFertilityTableForm from "@/components/FertilizationTable/SoilFertility/SoilFertilityTableForm";
import SoilFertilityTableCard from "@/components/FertilizationTable/SoilFertility/SoilFertilityTableCard";

type Mode = "create" | "edit" | "view";

const mapResponseToForm = (dto: SoilFertilityTableResponseDto): SoilFertilityFormState => ({
    nome: dto.nome_criterios || "",
    descricao: dto.descricao_criterios || "",
    regiao: dto.regiao || "",
    tabelaPublica: Boolean(dto.tabela_publica)
});

export default function SoilFertilityInterpretationCriteriaTable() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  // Estados
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("create");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [activeItem, setActiveItem] = useState<SoilFertilityTableResponseDto | null>(null);
  const [form, setForm] = useState<SoilFertilityFormState>(DEFAULT_SOIL_FERTILITY_STATE);
  const [isSaving, setIsSaving] = useState(false);

  const isReadOnly = mode === "view";
  
  const modalTitle = useMemo(() => {
      if (mode === "create") return "Nova Tabela de Critérios";
      if (mode === "edit") return "Editar Critérios";
      return "Visualizar Critérios";
  }, [mode]);

  // Queries
  const { data: tables = [], isLoading, isError } = useQuery({
    queryKey: ["soil-fertility-tables"],
    queryFn: fetchSoilFertilityTables,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSoilFertilityTable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["soil-fertility-tables"] });
      setIsDeleteOpen(false);
      setSelectedId(null);
      toaster.create({ title: "Tabela removida com sucesso.", type: "success" });
    },
    onError: () => toaster.create({ title: "Erro ao remover tabela.", type: "error" })
  });

  // Handlers
  const handleOpen = (newMode: Mode, item?: SoilFertilityTableResponseDto) => {
    setMode(newMode);
    setActiveItem(item || null);
    
    if (item) {
        setForm(mapResponseToForm(item));
    } else {
        setForm(DEFAULT_SOIL_FERTILITY_STATE);
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (isReadOnly) { setIsModalOpen(false); return; }
    
    if (!form.nome || form.nome.trim() === "") {
        toaster.create({ title: "O Nome é obrigatório.", type: "error" });
        return;
    }
    if (!form.regiao) { 
        toaster.create({ title: "A Região é obrigatória.", type: "error" }); 
        return; 
    }

    setIsSaving(true);
    try {
        if (mode === "create") {
            const payload: SoilFertilityTableCreateRequestDto = {
                nome_criterios: form.nome,
                regiao: form.regiao as RegionEnum,
                tabela_publica: form.tabelaPublica
            };
            await createSoilFertilityTable(payload);
            toaster.create({ title: "Tabela criada com sucesso!", type: "success" });
        } else if (mode === "edit" && activeItem) {
            const payload: SoilFertilityTablePostRequestDto = {
                novo_nome_criterios: form.nome,
                nova_regiao: form.regiao as RegionEnum,
                nova_descricao_criterios: form.descricao,
                tabela_publica: form.tabelaPublica
            };
            await updateSoilFertilityTable(activeItem.id, payload);
            toaster.create({ title: "Tabela atualizada com sucesso!", type: "success" });
        }

        queryClient.invalidateQueries({ queryKey: ["soil-fertility-tables"] });
        setIsModalOpen(false);
    } catch (error) {
        console.error(error);
        toaster.create({ title: "Erro ao salvar.", type: "error" });
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <UserLayout>
      <FertName subtitle="Interpretação de Fertilidade do Solo" />
      <ConfigMenu />

      <Box 
        pt={{ base: 24, md: 32 }} 
        px={{ base: 4, md: 8 }} 
        w="full" 
        maxW="1600px" 
        mx="auto"
      >
        <Flex 
            justify="space-between" 
            align="center" 
            mb={8} 
            direction={{ base: "column", sm: "row" }} 
            gap={4}
        >
            <Box>
                <Heading size="lg" color="gray.700" _dark={{ color: "gray.200" }}>Critérios de Fertilidade</Heading>
                <Text color="gray.500" fontSize="sm" mt={1}>Gerencie as tabelas de referência para interpretação de solo</Text>
            </Box>
            
            <Flex gap={2}>
              <Button 
                  colorPalette="green" 
                  onClick={() => handleOpen("create")}
                  size="md"
              >
                  <FiPlus /> Nova Tabela
              </Button>
              <Button variant="outline" colorPalette="green" onClick={() => navigate("/fertintelligence/fertilization-table-management/soil-fertility-interpretation-table/public") }>
                  Consultar tabelas públicas
              </Button>
            </Flex>
        </Flex>

        <Box>
            {isLoading ? (
                <Flex justify="center" minH="200px" align="center">
                    <Spinner color="green.500" size="xl" />
                </Flex>
            ) : isError ? (
                <Flex justify="center" minH="200px" align="center" direction="column" gap={2}>
                    <Text color="red.500" fontWeight="bold">Erro ao carregar dados.</Text>
                    <Button size="sm" variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["soil-fertility-tables"] })}>Tentar Novamente</Button>
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
                    <Text fontSize="lg">Nenhuma tabela de critérios encontrada.</Text>
                    <Button variant="ghost" colorPalette="green" onClick={() => handleOpen("create")}>Criar primeira tabela</Button>
                </Flex>
            ) : (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} gap={6}>
                    {tables.map((table) => (
                        <SoilFertilityTableCard
                            key={table.id}
                            item={table}
                            isSelected={selectedId === table.id}
                            onSelect={() => setSelectedId(selectedId === table.id ? null : table.id)}
                            onView={() => handleOpen("view", table)}
                            onEdit={() => handleOpen("edit", table)}
                            onDelete={() => { setActiveItem(table); setIsDeleteOpen(true); }}
                        />
                    ))}
                </SimpleGrid>
            )}
        </Box>
      </Box>

      {/* --- Modal Principal --- */}
      <Dialog.Root 
        open={isModalOpen} 
        onOpenChange={(e) => setIsModalOpen(e.open)} 
        size="xl" 
        scrollBehavior="inside"
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content bg="white" _dark={{ bg: "gray.800" }} maxW="800px">
            <Dialog.Header>
              <Flex justify="space-between" align="center">
                <Dialog.Title fontSize="lg" fontWeight="bold" color="green.600">
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
              <SoilFertilityTableForm 
                form={form} 
                setForm={setForm} 
                readOnly={isReadOnly}
                mode={mode}
                // --- INSERÇÃO DA PROPRIEDADE FALTANTE ---
                tableId={activeItem?.id || null} 
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
                <Button colorPalette="green" onClick={handleSave} loading={isSaving}>
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
                Tem certeza que deseja excluir <Text as="span" fontWeight="bold">{activeItem?.nome_criterios}</Text>?
              </Text>
              <Text fontSize="sm" color="gray.500" mt={2}>
                Todas as configurações e tabelas auxiliares associadas serão perdidas.
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