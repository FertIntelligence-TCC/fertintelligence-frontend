import { useEffect, useState, useCallback } from "react";
import { 
  Box, 
  Table, 
  HStack, 
  Text, 
  Spinner, 
  Center,
  VStack,
  Badge
} from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";
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
import { FoliarAnalysisResponseDto } from "@/interfaces/FoliarAnalysis";
import { 
  getFoliarAnalysesByCrop, 
  deleteFoliarAnalysis 
} from "@/services/foliarAnalysisService";
import { FoliarAnalysisFormDialog } from "./FoliarAnalysisFormDialog";

interface FoliarAnalysisManagerProps {
  cropId: number;
}

export const FoliarAnalysisManager = ({ cropId }: FoliarAnalysisManagerProps) => {
  const [data, setData] = useState<FoliarAnalysisResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FoliarAnalysisResponseDto | null>(null);
  const [itemToDelete, setItemToDelete] = useState<FoliarAnalysisResponseDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getFoliarAnalysesByCrop(cropId);
      // Ordenar por data (recente primeiro)
      result.sort((a, b) => {
        if (!a.data_coleta || !b.data_coleta) return 0;
        const dateA = new Date(a.data_coleta.year, a.data_coleta.month - 1, a.data_coleta.day).getTime();
        const dateB = new Date(b.data_coleta.year, b.data_coleta.month - 1, b.data_coleta.day).getTime();
        return dateB - dateA;
      });
      setData(result);
    } catch (error) {
      console.error(error);
      toaster.create({ title: "Erro ao carregar análises", type: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [cropId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await deleteFoliarAnalysis(itemToDelete.id);
      toaster.create({ title: "Análise removida", type: "success" });
      setItemToDelete(null);
      fetchData();
    } catch (error) {
      console.error(error);
      toaster.create({ title: "Erro ao remover", type: "error" });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (d: any) => {
    if (!d) return "-";
    return `${d.day.toString().padStart(2,'0')}/${d.month.toString().padStart(2,'0')}/${d.year}`;
  };

  return (
    <VStack align="stretch" gap={4}>
      <HStack justify="space-between">
        <Text fontWeight="bold">Histórico de Análises Foliares</Text>
        <Button size="sm" onClick={() => { setSelectedItem(null); setIsFormOpen(true); }}>
          + Nova Análise
        </Button>
      </HStack>

      {isLoading ? (
        <Center py={10}><Spinner /></Center>
      ) : data.length === 0 ? (
        <Box p={6} border="1px dashed" borderColor="border.subtle" borderRadius="md" textAlign="center">
          <Text color="gray.500">Nenhuma análise foliar registrada.</Text>
        </Box>
      ) : (
        <Box overflowX="auto" borderWidth="1px" borderRadius="md" borderColor="border.subtle">
          <Table.Root size="sm" striped interactive>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader width="120px">Data</Table.ColumnHeader>
                <Table.ColumnHeader>Laboratório</Table.ColumnHeader>
                <Table.ColumnHeader>Resumo Nutricional</Table.ColumnHeader>
                <Table.ColumnHeader width="150px" textAlign="end">Ações</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {data.map((item) => (
                <Table.Row key={item.id}>
                  <Table.Cell>{formatDate(item.data_coleta)}</Table.Cell>
                  <Table.Cell>{item.laboratorio || "-"}</Table.Cell>
                  <Table.Cell>
                    <HStack wrap="wrap" gap={1}>
                        {/* Exibe alguns badges se os valores existirem */}
                        {item.macronutrientes?.n_content && <Badge size="xs" variant="outline">N: {item.macronutrientes.n_content} g/kg</Badge>}
                        {item.macronutrientes?.k_content && <Badge size="xs" variant="outline">K: {item.macronutrientes.k_content} g/kg</Badge>}
                        
                        {/* Indicador se tem micronutrientes */}
                        {(item.micronutrientes?.b_content || item.micronutrientes?.zn_content) && 
                          <Badge size="xs" colorPalette="blue" variant="subtle">+ Micro</Badge>
                        }
                    </HStack>
                  </Table.Cell>
                  <Table.Cell textAlign="end">
                    <HStack justify="end" gap={2}>
                      <Button size="xs" variant="ghost" onClick={() => { setSelectedItem(item); setIsFormOpen(true); }}>
                        Editar
                      </Button>
                      <Button size="xs" variant="ghost" colorPalette="red" onClick={() => setItemToDelete(item)}>
                        Excluir
                      </Button>
                    </HStack>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      )}

      {/* Modal de Formulário */}
      <FoliarAnalysisFormDialog 
        open={isFormOpen} 
        onOpenChange={(e) => setIsFormOpen(e.open)} 
        cropId={cropId}
        selectedAnalysis={selectedItem}
        onSuccess={fetchData}
      />

      {/* Modal de Confirmação de Exclusão */}
      <DialogRoot open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Análise</DialogTitle>
          </DialogHeader>
          <DialogBody>
            Tem certeza que deseja excluir a análise foliar de <strong>{formatDate(itemToDelete?.data_coleta)}</strong>?
          </DialogBody>
          <DialogFooter>
            <DialogActionTrigger asChild>
              <Button variant="outline" disabled={isDeleting}>Cancelar</Button>
            </DialogActionTrigger>
            <Button colorPalette="red" loading={isDeleting} onClick={handleDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </VStack>
  );
};
