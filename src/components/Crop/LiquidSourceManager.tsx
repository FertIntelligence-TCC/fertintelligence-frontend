import { useEffect, useState, useCallback } from "react";
import { 
  Box, Table, HStack, Button, Spinner, Center, Text, VStack 
} from "@chakra-ui/react";
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
import { LiquidSourceResponseDto } from "@/interfaces/FoliarFertilization";
import { getLiquidSourcesByCrop, deleteLiquidSource } from "@/services/liquidSourceService";
import { LiquidSourceFormDialog } from "./LiquidSourceFormDialog";

interface Props { cropId: number; }

export const LiquidSourceManager = ({ cropId }: Props) => {
  const [data, setData] = useState<LiquidSourceResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LiquidSourceResponseDto | null>(null);
  const [itemToDelete, setItemToDelete] = useState<LiquidSourceResponseDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getLiquidSourcesByCrop(cropId);
      setData(result);
    } catch (error) {
      console.error(error);
      toaster.create({ title: "Erro ao carregar dados", type: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [cropId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await deleteLiquidSource(itemToDelete.id);
      toaster.create({ title: "Removido com sucesso", type: "success" });
      setItemToDelete(null);
      fetchData();
    } catch (error) {
      console.error(error);
      toaster.create({ title: "Erro ao remover", type: "error" });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (d: any) => d ? `${d.day}/${d.month}/${d.year}` : "-";

  return (
    <VStack align="stretch" gap={4}>
      <HStack justify="end">
        <Button size="sm" onClick={() => { setSelectedItem(null); setIsFormOpen(true); }}>
          + Fonte Líquida
        </Button>
      </HStack>

      {isLoading ? <Center py={8}><Spinner /></Center> : data.length === 0 ? (
        <Box p={6} border="1px dashed" borderColor="border.subtle" borderRadius="md" textAlign="center">
          <Text color="gray.500">Nenhuma adubação líquida registrada.</Text>
        </Box>
      ) : (
        <Box overflowX="auto" borderWidth="1px" borderRadius="md" borderColor="border.subtle">
          <Table.Root size="sm" striped interactive>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Data</Table.ColumnHeader>
                <Table.ColumnHeader>Nutriente</Table.ColumnHeader>
                <Table.ColumnHeader>Fonte</Table.ColumnHeader>
                <Table.ColumnHeader>Dose (L/ha)</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="end">Ações</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {data.map((item) => (
                <Table.Row key={item.id}>
                  <Table.Cell>{formatDate(item.data)}</Table.Cell>
                  <Table.Cell>{item.micronutriente_aplicado}</Table.Cell>
                  <Table.Cell>{item.fonte}</Table.Cell>
                  <Table.Cell>{item.volume_aplicado}</Table.Cell>
                  <Table.Cell textAlign="end">
                    <HStack justify="end">
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

      <LiquidSourceFormDialog 
        open={isFormOpen} 
        onOpenChange={(e) => setIsFormOpen(e.open)} 
        cropId={cropId}
        selectedItem={selectedItem}
        onSuccess={fetchData}
      />

      <DialogRoot open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Excluir</DialogTitle></DialogHeader>
          <DialogBody>Confirma a exclusão de <strong>{itemToDelete?.fonte}</strong>?</DialogBody>
          <DialogFooter>
            <DialogActionTrigger asChild><Button variant="outline">Cancelar</Button></DialogActionTrigger>
            <Button colorPalette="red" onClick={handleDelete} loading={isDeleting}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </VStack>
  );
};