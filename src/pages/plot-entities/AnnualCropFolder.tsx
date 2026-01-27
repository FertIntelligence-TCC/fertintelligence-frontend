import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Box, 
  Container, 
  Heading, 
  HStack, 
  Text, 
  VStack,
  Spinner,
  Center 
} from "@chakra-ui/react";
import { Button } from "@/components/ui/button";
import { toaster } from "@/components/ui/toaster";
import { CropList } from "@/components/Crop/CropList";
import { CropFormDialog } from "@/components/Crop/CropFormDialog";
// Importaremos o CropDetailsDialog aqui na próxima etapa
// import { CropDetailsDialog } from "@/components/Crop/CropDetailsDialog"; 
import { CropResponseDto } from "@/interfaces/Crop";
import { getCropsByFolder } from "@/services/cropService";

export const AnnualCropFolder = () => {
  // O parâmetro deve corresponder ao definido na rota (ex: /annual-crop-folder/:folderId/crops)
  const { folderId } = useParams<{ folderId: string }>(); 
  const navigate = useNavigate();

  const [crops, setCrops] = useState<CropResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estado para Criar/Editar Cultura
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState<CropResponseDto | null>(null);

  // Estado para Gerenciar Manejos (Nível 3)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedCropForDetails, setSelectedCropForDetails] = useState<CropResponseDto | null>(null);

  // Informação de contexto (Safra) extraída da primeira cultura para exibição
  const [folderContextYear, setFolderContextYear] = useState<number | null>(null);

  const fetchCrops = useCallback(async () => {
    if (!folderId) return;
    
    setIsLoading(true);
    try {
      const data = await getCropsByFolder(Number(folderId));
      setCrops(data);

      // Tenta inferir o ano da safra para exibir no título (se houver dados)
      // Nota: Idealmente o endpoint de "GetFolderById" forneceria isso, 
      // mas podemos pegar de qualquer filho pois eles compartilham o pai.
      if (data.length > 0 && (data[0] as any).cropsYear) {
         // O DTO Java mapeado tem o campo cropsYear acessível se adicionado na interface
         // Se não, fica genérico.
         setFolderContextYear((data[0] as any).cropsYear); 
      }
    } catch (error) {
      console.error(error);
      toaster.create({
        title: "Erro ao carregar",
        description: "Não foi possível carregar as culturas desta pasta.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [folderId]);

  useEffect(() => {
    fetchCrops();
  }, [fetchCrops]);

  // Handlers do Formulário (Nível 2)
  const handleCreate = () => {
    setSelectedCrop(null);
    setIsFormOpen(true);
  };

  const handleEdit = (crop: CropResponseDto) => {
    setSelectedCrop(crop);
    setIsFormOpen(true);
  };

  // Handler para Drill-down (Nível 3 - Manejos)
  const handleManageDetails = (crop: CropResponseDto) => {
    setSelectedCropForDetails(crop);
    setIsDetailsOpen(true);
  };

  if (!folderId) {
    return (
      <Center h="50vh">
        <Text color="red.500">Erro: ID da pasta não fornecido.</Text>
      </Center>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack gap={6} align="stretch">
        
        {/* Cabeçalho */}
        <Box 
          bg="bg.panel" 
          p={6} 
          borderRadius="xl" 
          shadow="sm" 
          borderWidth="1px"
        >
          <HStack justify="space-between" wrap="wrap" gap={4}>
            <VStack align="start" gap={1}>
              <HStack>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate(-1)} // Voltar para a lista de pastas
                >
                  Voltar
                </Button>
                <Heading size="lg">Gerenciamento de Culturas</Heading>
              </HStack>
              <Text color="gray.500" ml={2}>
                Pasta de Safra {folderContextYear ? `${folderContextYear}/${folderContextYear + 1}` : `#${folderId}`}
              </Text>
            </VStack>

            <Button onClick={handleCreate} colorPalette="green">
              + Nova Cultura
            </Button>
          </HStack>
        </Box>

        {/* Lista de Conteúdo */}
        <Box>
          <CropList
            crops={crops}
            isLoading={isLoading}
            onEdit={handleEdit}
            onManage={handleManageDetails}
            onRefresh={fetchCrops}
          />
        </Box>
      </VStack>

      {/* Modal de Criação/Edição de Cultura */}
      <CropFormDialog
        open={isFormOpen}
        onOpenChange={(e) => setIsFormOpen(e.open)}
        folderId={Number(folderId)}
        selectedCrop={selectedCrop}
        onSuccess={fetchCrops}
      />

      {/* Aqui entrará o CropDetailsDialog (Nível 3) na próxima etapa.
        Por enquanto, deixamos preparado para receber o componente.
      */}
      {/* <CropDetailsDialog 
        open={isDetailsOpen} 
        onOpenChange={(e) => setIsDetailsOpen(e.open)}
        crop={selectedCropForDetails}
      /> 
      */}

    </Container>
  );
};

export default AnnualCropFolder;