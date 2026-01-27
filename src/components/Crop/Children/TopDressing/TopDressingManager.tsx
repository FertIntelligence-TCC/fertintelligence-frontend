import { useEffect, useState, useCallback } from "react";
import { 
  Box, 
  Button as ChakraButton,
  Table, 
  HStack, 
  Text, 
  Spinner, 
  Center,
  VStack
} from "@chakra-ui/react";
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
import { TopDressingFertilizationResponseDto } from "@/interfaces/TopDressingFertilization";
import { 
  getTopDressingFertilizationsByCrop, 
  deleteTopDressingFertilization 
} from "@/services/topDressingFertilizationService";
import { TopDressingFormDialog } from "./TopDressingFormDialog";

interface TopDressingManagerProps {
  cropId: number;
}

export const TopDressingManager = ({ cropId }: TopDressingManagerProps) => {
  const [data, setData] = useState<TopDressingFertilizationResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados do Modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TopDressingFertilizationResponseDto | null>(null);

  // Estado de Delete
  const [itemToDelete, setItemToDelete] = useState<TopDressingFertilizationResponseDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getTopDressingFertilizationsByCrop(cropId);
      // Ordenar por ordem de aplicação
      result.sort((a, b) => a.ordem - b.ordem);
      setData(result);
    } catch (error) {
      console.error(error);
      toaster.create({ title: "Erro ao carregar adubações", type: "error" });
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
      await deleteTopDressingFertilization(itemToDelete.id);
      toaster.create({ title: "Adubação removida", type: "success" });
      setItemToDelete(null);
      fetchData();
    } catch (error) {
      console.error(error);
      toaster.create({ title: "Erro ao remover", type: "error" });
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper para mostrar apenas os fertilizantes usados na linha da tabela
  const renderFertilizersSummary = (item: TopDressingFertilizationResponseDto) => {
    const parts = [];
    if (item.formulado) parts.push(`Formulado: ${item.formulado}`);
    if (item.ureia) parts.push(`Ureia: ${item.ureia}`);
    if (item.sulfato_de_amonio) parts.push(`S. Amônio: ${item.sulfato_de_amonio}`);
    if (item.cloreto_de_potassio) parts.push(`KCl: ${item.cloreto_de_potassio}`);
    if (item.superfosfato_simples) parts.push(`Sup. Simples: ${item.superfosfato_simples}`);
    if (item.superfosfato_triplo) parts.push(`Sup. Triplo: ${item.superfosfato_triplo}`);
    if (item.monoamonio_fosfato) parts.push(`MAP: ${item.monoamonio_fosfato}`);
    
    return parts.length > 0 ? parts.join(", ") : "Nenhum fertilizante registrado";
  };

  const formatDate = (d: any) => {
    if (!d) return "-";
    return `${d.day}/${d.month}/${d.year}`;
  };

  return (
    <VStack align="stretch" gap={4}>
      <HStack justify="space-between">
        <Text fontWeight="bold">Histórico de Aplicações</Text>
        <Button size="sm" onClick={() => { setSelectedItem(null); setIsFormOpen(true); }}>
          + Nova Aplicação
        </Button>
      </HStack>

      {isLoading ? (
        <Center py={10}><Spinner /></Center>
      ) : data.length === 0 ? (
        <Box p={6} border="1px dashed" borderColor="gray.300" borderRadius="md" textAlign="center">
          <Text color="gray.500">Nenhuma adubação de cobertura registrada.</Text>
        </Box>
      ) : (
        <Box overflowX="auto" borderWidth="1px" borderRadius="md">
          <Table.Root size="sm" striped interactive>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader width="50px">#</Table.ColumnHeader>
                <Table.ColumnHeader width="120px">Data</Table.ColumnHeader>
                <Table.ColumnHeader>Fertilizantes (kg/ha)</Table.ColumnHeader>
                <Table.ColumnHeader width="150px" textAlign="end">Ações</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {data.map((item) => (
                <Table.Row key={item.id}>
                  <Table.Cell>{item.ordem}ª</Table.Cell>
                  <Table.Cell>{formatDate(item.data)}</Table.Cell>
                  <Table.Cell>
                    <Text fontSize="sm" truncate maxW="400px">
                      {renderFertilizersSummary(item)}
                    </Text>
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
      <TopDressingFormDialog 
        open={isFormOpen} 
        onOpenChange={(e) => setIsFormOpen(e.open)} 
        cropId={cropId}
        selectedFertilization={selectedItem}
        onSuccess={fetchData}
      />

      {/* Modal de Confirmação de Exclusão */}
      <DialogRoot open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Adubação</DialogTitle>
          </DialogHeader>
          <DialogBody>
            Tem certeza que deseja excluir a <strong>{itemToDelete?.ordem}ª aplicação</strong> do dia {formatDate(itemToDelete?.data)}?
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