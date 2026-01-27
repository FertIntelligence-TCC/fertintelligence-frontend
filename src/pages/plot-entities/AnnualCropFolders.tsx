import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Flex,
  Heading,
  Spinner,
  Text,
  SimpleGrid,
  HStack,
  VStack,
  IconButton,
  Separator,
  Badge,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { LuPencil, LuTrash2, LuPlus, LuFolderOpen } from "react-icons/lu";

// Layout Imports
import UserLayout from "@/components/Layouts/UserLayout";
import FertName from "@/components/FertName/FertName";
import ConfigMenu from "@/components/ConfigMenu/ConfigMenu";

// Componentes
import { AnnualCropFolderFormDialog } from "@/components/AnnualCropFolder/AnnualCropFolderFormDialog";

// Services
import { 
  getAllAnnualCropFoldersByPlot, 
  deleteAnnualCropFolder 
} from "@/services/annualCropFolderService";
import { getPlotById } from "@/services/plotService";

// Interfaces
import { AnnualCropFolderResponseDto } from "@/interfaces/AnnualCropFolder";

export const AnnualCropFolders = () => {
  const { plotId } = useParams<{ plotId: string }>();
  const navigate = useNavigate();

  const [folders, setFolders] = useState<AnnualCropFolderResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estado para contexto do Talhão (Breadcrumbs)
  const [plotIdentification, setPlotIdentification] = useState<string>("");

  // Estados dos Modais
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] =
    useState<AnnualCropFolderResponseDto | null>(null);

  // Busca dados do Talhão para o Cabeçalho
  const fetchPlotDetails = useCallback(async () => {
    if (!plotId) return;
    try {
      const plot = await getPlotById(Number(plotId));
      setPlotIdentification(plot.identification);
    } catch (error) {
      console.error("Erro ao buscar detalhes do talhão", error);
    }
  }, [plotId]);

  // Busca as Pastas
  const fetchFolders = useCallback(async () => {
    if (!plotId) return;

    setIsLoading(true);
    try {
      const data = await getAllAnnualCropFoldersByPlot(Number(plotId));
      // Ordena decrescente por ano (mais recente primeiro)
      const sortedData = data.sort((a, b) => b.ano_culturas - a.ano_culturas);
      setFolders(sortedData);
    } catch (error) {
      console.error(error);
      toaster.create({
        title: "Erro ao carregar",
        description: "Não foi possível carregar as pastas de safras.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [plotId]);

  useEffect(() => {
    fetchPlotDetails();
    fetchFolders();
  }, [fetchFolders, fetchPlotDetails]);

  // Handlers
  const handleCreate = () => {
    setSelectedFolder(null);
    setIsFormOpen(true);
  };

  const handleEdit = (folder: AnnualCropFolderResponseDto) => {
    setSelectedFolder(folder);
    setIsFormOpen(true);
  };

  const handleDelete = async (folderId: number) => {
    if (!window.confirm("Tem certeza que deseja excluir esta pasta? Todos os dados contidos nela serão perdidos.")) {
        return;
    }

    try {
      await deleteAnnualCropFolder(folderId);
      toaster.create({
        title: "Sucesso",
        description: "Pasta removida com sucesso.",
        type: "success",
      });
      fetchFolders();
    } catch (error) {
      console.error(error);
      toaster.create({
        title: "Erro ao deletar",
        description: "Não foi possível remover a pasta.",
        type: "error",
      });
    }
  };

  const handleManage = (folder: AnnualCropFolderResponseDto) => {
    navigate(`/annual-crop-folder/${folder.id}/crops`);
  };

  if (!plotId) {
    return (
      <UserLayout>
        <Box p={8}><Text color="red.500">Erro: ID do talhão não fornecido.</Text></Box>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <Box pt={{ base: 4, md: 8 }} pb={8} px={{ base: 4, md: 8 }}>
        {/* Cabeçalho de Navegação e Configuração */}
        <Flex justify="space-between" align="center" mb={6} wrap="wrap" gap={4}>
          <FertName
            label={`Talhão: ${plotIdentification || "Carregando..."}`}
            crumbs={[
              { label: "Propriedades", to: "/owner-properties" },
              { label: "Detalhes", to: "#" }, // Idealmente voltaria para o modal/página do talhão
            ]}
          />
          <ConfigMenu />
        </Flex>

        {/* Título e Ação Principal */}
        <Flex justify="space-between" align="center" mb={8}>
          <VStack align="start" gap={1}>
            <Heading size="2xl" fontWeight="bold" color="fg.default">
                Pastas de Culturas Anuais
            </Heading>
            <Text color="gray.500">
                Gerencie as safras e culturas deste talhão
            </Text>
          </VStack>
          <Button 
            colorPalette="green" 
            onClick={handleCreate} 
            size="md"
          >
            <LuPlus /> Nova Pasta
          </Button>
        </Flex>

        {/* Conteúdo Principal */}
        {isLoading ? (
          <Flex justify="center" align="center" h="200px">
            <Spinner size="xl" />
          </Flex>
        ) : folders.length === 0 ? (
          <Flex 
            direction="column" 
            align="center" 
            justify="center" 
            p={10} 
            borderWidth="1px" 
            borderRadius="lg" 
            borderStyle="dashed"
            bg="bg.panel"
          >
            <Box fontSize="4xl" mb={4}>📂</Box>
            <Text fontSize="lg" fontWeight="medium" color="gray.600">Nenhuma pasta encontrada</Text>
            <Text color="gray.500">Crie uma nova pasta para começar a organizar suas safras.</Text>
          </Flex>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
            {folders.map((folder) => (
              <Box
                key={folder.id}
                borderWidth="1px"
                borderRadius="lg"
                bg="bg.panel"
                shadow="sm"
                _hover={{ shadow: "md", borderColor: "green.400" }}
                transition="all 0.2s"
                overflow="hidden"
              >
                <Box p={5}>
                  <Flex justify="space-between" align="start" mb={4}>
                    <HStack gap={3}>
                        <Box 
                            p={2} 
                            bg="green.100" 
                            color="green.700" 
                            rounded="md"
                        >
                            <LuFolderOpen size={24} />
                        </Box>
                        <VStack align="start" gap={0}>
                            <Heading size="md" fontWeight="semibold">
                                Safra {folder.ano_culturas}/{folder.ano_culturas + 1}
                            </Heading>
                            <Text fontSize="xs" color="gray.500">
                                ID: {folder.id}
                            </Text>
                        </VStack>
                    </HStack>
                    <Badge colorPalette="blue" variant="subtle">Ativo</Badge>
                  </Flex>

                  <Separator mb={4} />

                  <Flex justify="space-between" align="center">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        colorPalette="green"
                        onClick={() => handleManage(folder)}
                    >
                        Abrir Pasta
                    </Button>

                    <HStack gap={1}>
                        <IconButton
                            aria-label="Editar"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(folder)}
                        >
                            <LuPencil />
                        </IconButton>
                        <IconButton
                            aria-label="Excluir"
                            variant="ghost"
                            colorPalette="red"
                            size="sm"
                            onClick={() => handleDelete(folder.id)}
                        >
                            <LuTrash2 />
                        </IconButton>
                    </HStack>
                  </Flex>
                </Box>
              </Box>
            ))}
          </SimpleGrid>
        )}
      </Box>

      {/* Modal de Formulário */}
      <AnnualCropFolderFormDialog
        open={isFormOpen}
        onOpenChange={({ open }) => setIsFormOpen(open)}
        plotId={Number(plotId)}
        selectedFolder={selectedFolder}
        onSuccess={fetchFolders}
      />
    </UserLayout>
  );
};