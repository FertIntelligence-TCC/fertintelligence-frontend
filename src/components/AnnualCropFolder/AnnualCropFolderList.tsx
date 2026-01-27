import { useState } from "react";
import {
  Box,
  SimpleGrid,
  Text,
  VStack,
  HStack,
  Spinner,
  Center,
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
import { toaster } from "@/components/ui/toaster";
import { AnnualCropFolderResponseDto } from "@/interfaces/AnnualCropFolder";
import { deleteAnnualCropFolder } from "@/services/annualCropFolderService";

// Ícones (você pode usar lucide-react ou react-icons, aqui usando texto/svg simulado se não tiver lib de ícones)
// Se tiver lucide-react: import { Folder, Edit, Trash2, ArrowRight } from "lucide-react";

interface AnnualCropFolderListProps {
  folders: AnnualCropFolderResponseDto[];
  isLoading: boolean;
  onEdit: (folder: AnnualCropFolderResponseDto) => void;
  onManage: (folder: AnnualCropFolderResponseDto) => void; // Navegar para as Culturas
  onRefresh: () => void; // Recarregar a lista após deletar
}

export const AnnualCropFolderList = ({
  folders,
  isLoading,
  onEdit,
  onManage,
  onRefresh,
}: AnnualCropFolderListProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [folderToDelete, setFolderToDelete] =
    useState<AnnualCropFolderResponseDto | null>(null);

  const handleDeleteClick = (folder: AnnualCropFolderResponseDto) => {
    setFolderToDelete(folder);
  };

  const handleConfirmDelete = async () => {
    if (!folderToDelete) return;

    setIsDeleting(true);
    try {
      await deleteAnnualCropFolder(folderToDelete.id);
      toaster.create({
        title: "Pasta excluída",
        description: `A pasta da safra ${folderToDelete.ano_culturas} foi removida.`,
        type: "success",
      });
      setFolderToDelete(null);
      onRefresh();
    } catch (error) {
      console.error(error);
      toaster.create({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a pasta. Tente novamente.",
        type: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <Center p={8}>
        <Spinner size="lg" />
      </Center>
    );
  }

  if (folders.length === 0) {
    return (
      <Center p={8} borderWidth="1px" borderRadius="md" borderStyle="dashed">
        <VStack>
          <Text color="gray.500">Nenhuma pasta de safra encontrada.</Text>
          <Text fontSize="sm" color="gray.400">
            Clique em "Nova Pasta" para começar.
          </Text>
        </VStack>
      </Center>
    );
  }

  return (
    <>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4} width="100%">
        {folders.map((folder) => (
          <Box
            key={folder.id}
            borderWidth="1px"
            borderRadius="lg"
            p={4}
            bg="bg.panel"
            shadow="sm"
            _hover={{ shadow: "md", borderColor: "gray.400" }}
            transition="all 0.2s"
          >
            <VStack align="start" gap={3}>
              <HStack width="100%" justify="space-between">
                <Box
                  p={2}
                  bg="green.100"
                  color="green.700"
                  borderRadius="md"
                  fontSize="xl"
                >
                  {/* Ícone de Pasta (Simulado com texto ou SVG) */}
                  📂
                </Box>
                <Text fontWeight="bold" fontSize="lg" color="fg.default">
                  Safra {folder.ano_culturas}/{folder.ano_culturas + 1}
                </Text>
              </HStack>

              <Text fontSize="sm" color="gray.500">
                Gerencie as culturas e adubações deste período agrícola.
              </Text>

              <HStack width="100%" pt={2} justify="space-between">
                <HStack>
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => onEdit(folder)}
                    aria-label="Editar pasta"
                  >
                    Editar
                  </Button>
                  <Button
                    size="xs"
                    variant="ghost"
                    colorPalette="red"
                    onClick={() => handleDeleteClick(folder)}
                    aria-label="Excluir pasta"
                  >
                    Excluir
                  </Button>
                </HStack>
                
                <Button
                  size="sm"
                  variant="solid"
                  colorPalette="green"
                  onClick={() => onManage(folder)}
                >
                  Abrir
                </Button>
              </HStack>
            </VStack>
          </Box>
        ))}
      </SimpleGrid>

      {/* Dialog de Confirmação de Exclusão */}
      <DialogRoot
        open={!!folderToDelete}
        onOpenChange={(e) => !e.open && setFolderToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Pasta de Safra</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text>
              Tem certeza que deseja excluir a pasta da Safra{" "}
              <strong>
                {folderToDelete?.ano_culturas}/
                {(folderToDelete?.ano_culturas || 0) + 1}
              </strong>
              ?
            </Text>
            <Text mt={2} fontSize="sm" color="red.500">
              Isso excluirá todas as culturas e manejos (adubações, análises)
              contidos nela. Essa ação não pode ser desfeita.
            </Text>
          </DialogBody>
          <DialogFooter>
            <DialogActionTrigger asChild>
              <Button variant="outline" disabled={isDeleting}>
                Cancelar
              </Button>
            </DialogActionTrigger>
            <Button
              colorPalette="red"
              onClick={handleConfirmDelete}
              loading={isDeleting}
            >
              Confirmar Exclusão
            </Button>
          </DialogFooter>
          <DialogCloseTrigger />
        </DialogContent>
      </DialogRoot>
    </>
  );
};