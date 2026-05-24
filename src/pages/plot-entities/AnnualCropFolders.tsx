import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  VStack,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { LuArrowLeft, LuPlus } from "react-icons/lu";

// Layout Imports
import UserLayout from "@/components/Layouts/UserLayout";
import FertName from "@/components/FertName/FertName";
import ConfigMenu from "@/components/ConfigMenu/ConfigMenu";

// Componentes
import { AnnualCropFolderFormDialog } from "@/components/AnnualCropFolder/AnnualCropFolderFormDialog";
// Importante: Certifique-se de que está importando a versão refatorada da lista
import { AnnualCropFolderList } from "@/components/AnnualCropFolder/AnnualCropFolderList"; 
import { CropManagementDialog } from "@/components/Crop/CropManagementDialog";

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
  // Correção 1: Garantir que plotId é numérico para uso seguro
  const plotIdNum = plotId ? Number(plotId) : 0;

  const navigate = useNavigate(); 

  const [folders, setFolders] = useState<AnnualCropFolderResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [plotIdentification, setPlotIdentification] = useState<string>("");

  // Estados dos Modais
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<AnnualCropFolderResponseDto | null>(null);

  // Estado para o Modal de Gerenciamento de Culturas (O BOX Solicitado)
  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const [managementFolder, setManagementFolder] = useState<AnnualCropFolderResponseDto | null>(null);

  const fetchPlotDetails = useCallback(async () => {
    if (!plotIdNum) return;
    try {
      const plot = await getPlotById(plotIdNum);
      setPlotIdentification(plot.identification);
    } catch (error) {
      console.error("Erro ao buscar detalhes do talhão", error);
    }
  }, [plotIdNum]);

  const fetchFolders = useCallback(async () => {
    if (!plotIdNum) return;

    setIsLoading(true);
    try {
      const data = await getAllAnnualCropFoldersByPlot(plotIdNum);
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
  }, [plotIdNum]);

  useEffect(() => {
    fetchPlotDetails();
    fetchFolders();
  }, [fetchFolders, fetchPlotDetails]);

  // Handlers CRUD Pasta
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

  // Handler: Abre o Dialog de Gerenciamento
  const handleManage = (folder: AnnualCropFolderResponseDto) => {
    setManagementFolder(folder);
    setIsManagementOpen(true);
  };

  if (!plotIdNum) {
    return (
      <UserLayout>
        <Box p={8}><Text color="red.500">Erro: ID do talhão inválido ou não fornecido.</Text></Box>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <Box pt={{ base: 4, md: 8 }} pb={8} px={{ base: 4, md: 8 }}>
        <Flex justify="space-between" align="center" mb={6} wrap="wrap" gap={4}>
          <FertName
            label={`Talhão: ${plotIdentification || "Carregando..."}`}
            crumbs={[
              { label: "Propriedades", to: "/owner-properties" },
              { label: "Detalhes", to: "#" },
            ]}
          />
          <ConfigMenu />
        </Flex>

        <Flex justify="space-between" align="center" mb={4}>
          <Button
            variant="outline"
            onClick={() => navigate("/fertintelligence/owner-property-management")}
          >
            <LuArrowLeft /> Voltar para o painel
          </Button>
        </Flex>

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

        {/* Correção 2: Reutilizando o componente AnnualCropFolderList 
           Isso mantém a UI limpa e usa a lógica de listagem que já corrigimos antes (sem redirecionamento)
        */}
        <AnnualCropFolderList
          folders={folders}
          isLoading={isLoading}
          onEdit={handleEdit}
          onManage={handleManage}
          onRefresh={fetchFolders}
          onDelete={handleDelete}
        />
      </Box>

      {/* Modal de Formulário de Pasta (Criação/Edição da PASTA em si) */}
      <AnnualCropFolderFormDialog
        open={isFormOpen}
        onOpenChange={({ open }) => setIsFormOpen(open)}
        plotId={plotIdNum}
        selectedFolder={selectedFolder}
        onSuccess={fetchFolders}
      />

      {/* Correção 3: Passagem correta do plotId para o Modal de Culturas 
         Isso é CRÍTICO para que o formulário de culturas consiga calcular a área %
      */}
      <CropManagementDialog
        open={isManagementOpen}
        onOpenChange={({ open }) => setIsManagementOpen(open)}
        folder={managementFolder}
        plotId={plotIdNum} // <--- AQUI ESTÁ A CORREÇÃO PRINCIPAL
      />
    </UserLayout>
  );
};