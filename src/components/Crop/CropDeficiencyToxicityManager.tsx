import { useCallback, useEffect, useState } from "react";
import { Box, Center, HStack, Spinner, Table, Text, VStack } from "@chakra-ui/react";
import { Button } from "@/components/ui/button";
import { toaster } from "@/components/ui/toaster";
import {
  DialogActionTrigger,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog";
import ImageThumb from "@/components/ImageThumb";
import { CropDeficiencyToxicityResponseDto } from "@/interfaces/CropDeficiencyToxicity";
import {
  deleteCropDeficiencyToxicity,
  getCropDeficiencyToxicitiesByCrop,
} from "@/services/cropDeficiencyToxicityService";
import { CropDeficiencyToxicityFormDialog } from "./CropDeficiencyToxicityFormDialog";

interface Props { cropId: number }

export const CropDeficiencyToxicityManager = ({ cropId }: Props) => {
  const [data, setData] = useState<CropDeficiencyToxicityResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CropDeficiencyToxicityResponseDto | null>(null);
  const [itemToDelete, setItemToDelete] = useState<CropDeficiencyToxicityResponseDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imagesReloadToken, setImagesReloadToken] = useState(0);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getCropDeficiencyToxicitiesByCrop(cropId);
      setData(result);
      setImagesReloadToken((prev) => prev + 1);
    } catch (error) {
      console.error(error);
      toaster.create({ title: "Erro ao carregar deficiências/toxidez", type: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [cropId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await deleteCropDeficiencyToxicity(itemToDelete.id);
      toaster.create({ title: "Registro removido", type: "success" });
      setItemToDelete(null);
      fetchData();
    } catch (error) {
      console.error(error);
      toaster.create({ title: "Erro ao remover registro", type: "error" });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <VStack align="stretch" gap={4}>
      <HStack justify="space-between">
        <Text fontWeight="bold">Registros de Deficiência/Toxidez</Text>
        <Button size="sm" onClick={() => { setSelectedItem(null); setIsFormOpen(true); }}>+ Deficiência/Toxidez</Button>
      </HStack>

      {isLoading ? <Center py={10}><Spinner /></Center> : data.length === 0 ? (
        <Box p={6} border="1px dashed" borderColor="gray.300" borderRadius="md" textAlign="center">
          <Text color="gray.500">Nenhuma deficiência/toxidez registrada.</Text>
        </Box>
      ) : (
        <Box overflowX="auto" borderWidth="1px" borderRadius="md">
          <Table.Root size="sm" striped interactive>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Nutriente</Table.ColumnHeader>
                <Table.ColumnHeader>Tipo</Table.ColumnHeader>
                <Table.ColumnHeader>Planta saudável</Table.ColumnHeader>
                <Table.ColumnHeader>Planta com sintoma</Table.ColumnHeader>
                <Table.ColumnHeader>Observações</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="end">Ações</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {data.map((item) => (
                <Table.Row key={item.id}>
                  <Table.Cell>{item.nutrient || item.nutriente || "-"}</Table.Cell>
                  <Table.Cell>{item.nutrient_type || "-"}</Table.Cell>
                  <Table.Cell>
                    <ImageThumb
                      imageId={item.healthy_plant_image_id || ""}
                      alt="Planta saudável"
                      reloadToken={imagesReloadToken}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <ImageThumb
                      imageId={item.symptomatic_plant_image_id || ""}
                      alt="Planta com sintoma"
                      reloadToken={imagesReloadToken}
                    />
                  </Table.Cell>
                  <Table.Cell><Text fontSize="sm" maxW="300px" truncate>{item.observations || item.observacoes || "-"}</Text></Table.Cell>
                  <Table.Cell textAlign="end">
                    <HStack justify="end" gap={2}>
                      <Button size="xs" variant="ghost" onClick={() => { setSelectedItem(item); setIsFormOpen(true); }}>Editar</Button>
                      <Button size="xs" variant="ghost" colorPalette="red" onClick={() => setItemToDelete(item)}>Excluir</Button>
                    </HStack>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      )}

      <CropDeficiencyToxicityFormDialog
        open={isFormOpen}
        onOpenChange={(e) => setIsFormOpen(e.open)}
        cropId={cropId}
        selectedItem={selectedItem}
        onSuccess={fetchData}
      />

      <DialogRoot open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Deficiência/Toxidez</DialogTitle>
          </DialogHeader>
          <DialogBody>
            Tem certeza que deseja excluir o registro de <strong>{itemToDelete?.nutrient || itemToDelete?.nutriente}</strong>?
          </DialogBody>
          <DialogFooter>
            <DialogActionTrigger asChild>
              <Button variant="outline" disabled={isDeleting}>Cancelar</Button>
            </DialogActionTrigger>
            <Button colorPalette="red" loading={isDeleting} onClick={handleDelete}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </VStack>
  );
};
