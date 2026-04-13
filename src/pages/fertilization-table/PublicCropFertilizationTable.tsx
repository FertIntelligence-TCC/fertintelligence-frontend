import { useState } from "react";
import { Box, Button, Dialog, Flex, Heading, HStack, IconButton, SimpleGrid, Spinner, Text } from "@chakra-ui/react";
import { FiArrowLeft, FiEye } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import UserLayout from "@/components/Layouts/UserLayout";
import FertName from "@/components/FertName/FertName";
import ConfigMenu from "@/components/ConfigMenu/ConfigMenu";
import { fetchPublicCropFertilizationTables } from "@/services/cropFertilizationTableService";

export default function PublicCropFertilizationTable() {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [viewItem, setViewItem] = useState<any | null>(null);
  const { data = [], isLoading } = useQuery({ queryKey: ["crop-fertilization-tables-public"], queryFn: fetchPublicCropFertilizationTables });

  return (
    <UserLayout>
      <FertName subtitle="Tabelas de Adubação Públicas" />
      <ConfigMenu />
      <Box pt={{ base: 16, md: 24 }} px={{ base: 4, md: 8 }}>
        <Button mb={6} onClick={() => navigate("/fertintelligence/fertilization-table-management/crop-fertilization-table")}><FiArrowLeft /> Voltar para minhas tabelas</Button>
        <Heading size="lg" color="white" mb={4}>Tabelas públicas de adubação de culturas</Heading>
        {isLoading ? <Spinner color="white" /> : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
            {data.map((table: any) => (
              <Box key={table.id} borderWidth="1px" borderRadius="md" bg="white" p={4} onClick={() => setSelectedId(selectedId === table.id ? null : table.id)} cursor="pointer">
                <Text><b>Criador:</b> {table.nome_criador || "-"}</Text>
                <Text><b>Cultura:</b> {table.nome_comum_cultura || "-"}</Text>
                <Text><b>Região:</b> {table.regioes_cultura || "-"}</Text>
                <Text><b>Cultivar:</b> {table.cultivares || "-"}</Text>
                {selectedId === table.id && <HStack justify="end" mt={2}><IconButton aria-label="Visualizar" onClick={(e) => { e.stopPropagation(); setViewItem(table); }}><FiEye /></IconButton></HStack>}
              </Box>
            ))}
          </SimpleGrid>
        )}
      </Box>

      <Dialog.Root open={!!viewItem} onOpenChange={(e) => !e.open && setViewItem(null)}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header><Dialog.Title>Visualização da tabela</Dialog.Title></Dialog.Header>
            <Dialog.Body><Text whiteSpace="pre-wrap">{JSON.stringify(viewItem, null, 2)}</Text></Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </UserLayout>
  );
}