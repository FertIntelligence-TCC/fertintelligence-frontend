import ImageThumb from "@/components/ImageThumb";
import { useState } from "react";
import {
  Box,
  SimpleGrid,
  Text,
  VStack,
  HStack,
  Badge,
  Spinner,
  Center,
  Separator,
} from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";
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
import { CropResponseDto, CropDate } from "@/interfaces/Crop";
import { deleteCrop } from "@/services/cropService";

interface CropListProps {
  crops: CropResponseDto[];
  isLoading: boolean;
  onEdit: (crop: CropResponseDto) => void;
  onManage: (crop: CropResponseDto) => void;
  onRefresh: () => void;
}

export const CropList = ({
  crops,
  isLoading,
  onEdit,
  onManage,
  onRefresh,
}: CropListProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [cropToDelete, setCropToDelete] = useState<CropResponseDto | null>(null);

  const handleDeleteClick = (crop: CropResponseDto) => {
    setCropToDelete(crop);
  };

  const handleConfirmDelete = async () => {
    if (!cropToDelete) return;

    setIsDeleting(true);
    try {
      await deleteCrop(cropToDelete.id);
      toaster.create({
        title: "Cultura excluída",
        description: `${cropToDelete.nome} (${cropToDelete.variedade}) foi removida com sucesso.`,
        type: "success",
      });
      setCropToDelete(null);
      onRefresh();
    } catch (error) {
      console.error(error);
      toaster.create({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a cultura. Tente novamente.",
        type: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Função auxiliar para formatar a data que vem como objeto {day, month, year}
  const formatDate = (date: CropDate | undefined) => {
    if (!date) return "-";
    const day = date.day.toString().padStart(2, "0");
    const month = date.month.toString().padStart(2, "0");
    return `${day}/${month}/${date.year}`;
  };

  if (isLoading) {
    return (
      <Center p={8}>
        <Spinner size="lg" />
      </Center>
    );
  }

  if (crops.length === 0) {
    // Retornamos null aqui porque o componente pai (CropManagementDialog) 
    // já trata o estado vazio com uma UI específica.
    // Se quiser exibir algo aqui, pode descomentar o código abaixo.
    return null; 
    /*
    <Center p={8} borderWidth="1px" borderRadius="md" borderStyle="dashed">
      <VStack>
        <Text color="gray.500">Nenhuma cultura cadastrada nesta pasta.</Text>
      </VStack>
    </Center>
    */
  }

  return (
    <>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4} width="100%">
        {crops.map((crop) => (
          <Box
            key={crop.id}
            borderWidth="1px"
            borderColor="border.subtle" // Borda adaptável ao tema
            borderRadius="lg"
            bg="bg.panel" // Fundo do painel adaptável
            shadow="sm"
            overflow="hidden"
            _hover={{ shadow: "md", borderColor: "green.400" }}
            transition="all 0.2s"
          >
            <Box p={4}>
              <ImageThumb imageId={crop.idfoto} alt={crop.nome} />
              {/* Cabeçalho do Card */}
              <HStack justify="space-between" mb={2}>
                <VStack align="start" gap={0}>
                  <Text fontWeight="bold" fontSize="lg" color="fg.default">
                    {crop.nome.replace(/_/g, " ")}
                  </Text>
                  <Text fontSize="sm" color="fg.muted">
                    {crop.variedade}
                  </Text>
                </VStack>
                <Badge
                  colorPalette={
                    crop.tipo_cultivo === "SAFRA" ? "green" : "orange"
                  }
                >
                  {crop.tipo_cultivo}
                </Badge>
              </HStack>

              <Separator my={3} borderColor="border.subtle" />

              {/* Corpo com Detalhes */}
              <VStack align="stretch" gap={2} fontSize="sm">
                <HStack justify="space-between">
                  <Text color="fg.muted">Ciclo:</Text>
                  <Text fontWeight="medium" color="fg.default">
                    {crop.ciclo} dias
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text color="fg.muted">Plantio:</Text>
                  <Text fontWeight="medium" color="fg.default">
                    {formatDate(crop.data_plantio)}
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text color="fg.muted">Colheita (Prev.):</Text>
                  <Text fontWeight="medium" color="fg.default">
                    {formatDate(crop.data_colheita)}
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text color="fg.muted">Produtividade:</Text>
                  <Text fontWeight="medium" color="fg.default">
                    {crop.produtividade_obtida > 0
                      ? `${crop.produtividade_obtida} kg/ha`
                      : `${crop.produtividade_esperada} kg/ha (Esp.)`}
                  </Text>
                </HStack>
              </VStack>
            </Box>

            {/* Rodapé com Ações */}
            <Box 
              p={3} 
              borderTopWidth="1px" 
              borderColor="border.subtle"
              // bg="gray.50" REMOVIDO para corrigir o modo escuro
            >
              <HStack justify="space-between">
                <HStack>
                  <Button
                    size="xs"
                    variant="ghost" // Mudado para ghost para limpar visualmente
                    onClick={() => onEdit(crop)}
                  >
                    Editar
                  </Button>
                  <Button
                    size="xs"
                    variant="ghost"
                    colorPalette="red"
                    onClick={() => handleDeleteClick(crop)}
                  >
                    Excluir
                  </Button>
                </HStack>
                <Button
                  size="xs"
                  variant="solid"
                  colorPalette="blue"
                  onClick={() => onManage(crop)}
                >
                  Manejos
                </Button>
              </HStack>
            </Box>
          </Box>
        ))}
      </SimpleGrid>

      {/* Dialog de Confirmação de Exclusão */}
      <DialogRoot
        open={!!cropToDelete}
        onOpenChange={(e) => !e.open && setCropToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Cultura</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text>
              Tem certeza que deseja excluir a cultura{" "}
              <strong>{cropToDelete?.nome}</strong> ({cropToDelete?.variedade})?
            </Text>
            <Text mt={2} fontSize="sm" color="red.500">
              Isso excluirá permanentemente todos os dados associados, incluindo
              adubações e análises foliares.
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