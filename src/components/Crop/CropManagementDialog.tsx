import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Text,
  VStack,
  Spinner,
  Flex,
  Button
} from "@chakra-ui/react";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog";
import { toaster } from "@/components/ui/toaster";
import { LuPlus } from "react-icons/lu";

import { CropList } from "./CropList";
import { CropFormDialog } from "./CropFormDialog";

import { AnnualCropFolderResponseDto } from "@/interfaces/AnnualCropFolder";
import { CropResponseDto } from "@/interfaces/Crop";
import { getCropsByFolder } from "@/services/cropService";

interface CropManagementDialogProps {
  open: boolean;
  onOpenChange: (details: { open: boolean }) => void;
  folder: AnnualCropFolderResponseDto | null;
  plotId: number; // <--- NOVO CAMPO OBRIGATÓRIO
}

export const CropManagementDialog = ({
  open,
  onOpenChange,
  folder,
  plotId, // <--- Recebendo o ID explicitamente
}: CropManagementDialogProps) => {
  const [crops, setCrops] = useState<CropResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState<CropResponseDto | null>(null);

  const fetchCrops = useCallback(async () => {
    if (!folder || !open) return;

    setIsLoading(true);
    try {
      const data = await getCropsByFolder(folder.id);
      setCrops(data);
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
  }, [folder, open]);

  useEffect(() => {
    fetchCrops();
  }, [fetchCrops]);

  const handleCreate = () => {
    setSelectedCrop(null);
    setIsFormOpen(true);
  };

  const handleEditOrManage = (crop: CropResponseDto) => {
    setSelectedCrop(crop);
    setIsFormOpen(true);
  };

  if (!folder) return null;

  return (
    <>
      <DialogRoot 
        open={open} 
        onOpenChange={onOpenChange} 
        size="xl" 
        placement="center"
        scrollBehavior="inside"
      >
        <DialogContent maxWidth="1200px" height="85vh">
          <DialogHeader>
            <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
              <Box>
                <DialogTitle fontSize="xl">
                  Gerenciar Culturas
                </DialogTitle>
                <Text fontSize="sm" color="gray.500">
                  Pasta: Safra {folder.ano_culturas}/{folder.ano_culturas + 1}
                </Text>
              </Box>
              <Button size="sm" colorPalette="green" onClick={handleCreate}>
                <LuPlus /> Nova Cultura
              </Button>
            </Flex>
          </DialogHeader>

          <DialogBody>
            {isLoading ? (
              <Flex justify="center" align="center" h="200px">
                <Spinner size="lg" />
              </Flex>
            ) : (
              <VStack align="stretch" gap={4}>
                {crops.length === 0 ? (
                  <Flex 
                    direction="column" 
                    align="center" 
                    justify="center" 
                    p={8} 
                    border="1px dashed" 
                    borderColor="gray.300" 
                    borderRadius="md"
                  >
                    <Text color="gray.500">Nenhuma cultura cadastrada.</Text>
                    <Button variant="plain" colorPalette="green" onClick={handleCreate}>
                      Clique aqui para adicionar a primeira cultura.
                    </Button>
                  </Flex>
                ) : (
                  <CropList
                    crops={crops}
                    isLoading={isLoading}
                    onEdit={handleEditOrManage}
                    onRefresh={fetchCrops}
                  />
                )}
              </VStack>
            )}
          </DialogBody>
          <DialogCloseTrigger />
        </DialogContent>
      </DialogRoot>

      <CropFormDialog
        open={isFormOpen}
        onOpenChange={({ open }) => setIsFormOpen(open)}
        folderId={folder.id}
        plotId={plotId} // <--- Passando o ID correto para o Form
        selectedCrop={selectedCrop}
        onSuccess={fetchCrops}
      />
    </>
  );
};
