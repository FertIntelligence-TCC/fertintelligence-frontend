import { useState } from "react";
import {
  Badge,
  Box,
  Button,
  Dialog,
  Flex,
  Heading,
  HStack,
  IconButton,
  SimpleGrid,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { FiArrowLeft, FiEye, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import UserLayout from "@/components/Layouts/UserLayout";
import FertName from "@/components/FertName/FertName";
import ConfigMenu from "@/components/ConfigMenu/ConfigMenu";
import SoilFertilityTableForm from "@/components/FertilizationTable/SoilFertility/SoilFertilityTableForm";
import {
  DEFAULT_SOIL_FERTILITY_STATE,
  SoilFertilityFormState,
  SoilFertilityTableResponseDto,
} from "@/interfaces/SoilFertilityInterpretationCriteriaTable";
import { fetchPublicSoilFertilityTables } from "@/services/soilFertilityInterpretationCriteriaTableService";

const mapResponseToForm = (dto: SoilFertilityTableResponseDto): SoilFertilityFormState => ({
  nome: dto.nome_criterios || "",
  descricao: dto.descricao_criterios || "",
  observacoes: dto.observacoes || "",
  fontes: dto.fontes || "",
  regiao: dto.regiao || "",
  tabelaPublica: Boolean(dto.tabela_publica),
});

export default function PublicSoilFertilityInterpretationTable() {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [activeItem, setActiveItem] = useState<SoilFertilityTableResponseDto | null>(null);
  const [form, setForm] = useState<SoilFertilityFormState>(DEFAULT_SOIL_FERTILITY_STATE);

  const { data: tables = [], isLoading } = useQuery({
    queryKey: ["soil-fertility-tables-public"],
    queryFn: fetchPublicSoilFertilityTables,
  });

  const handleOpenView = (table: SoilFertilityTableResponseDto) => {
    setActiveItem(table);
    setForm(mapResponseToForm(table));
  };

  return (
    <UserLayout>
      <FertName subtitle="Tabelas Públicas de Fertilidade" />
      <ConfigMenu />

      <Box pt={{ base: 24, md: 32 }} px={{ base: 4, md: 8 }} w="full" maxW="1600px" mx="auto">
        <Button
          mb={6}
          variant="outline"
          colorPalette="green"
          onClick={() => navigate("/fertintelligence/fertilization-table-management/soil-fertility-interpretation-table")}
        >
          <FiArrowLeft /> Voltar para minhas tabelas
        </Button>

        <Box mb={8}>
          <Heading size="lg" color="gray.700" _dark={{ color: "gray.200" }}>
            Tabelas públicas de critérios de fertilidade do solo
          </Heading>
          <Text color="gray.500" fontSize="sm" mt={1}>
            Consulte critérios compartilhados pela comunidade em modo somente leitura.
          </Text>
        </Box>

        {isLoading ? (
          <Flex justify="center" minH="200px" align="center">
            <Spinner color="green.500" size="xl" />
          </Flex>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} gap={6}>
            {tables.map((table: SoilFertilityTableResponseDto) => {
              const isSelected = selectedId === table.id;

              return (
                <Box
                  key={table.id}
                  borderWidth="1px"
                  borderRadius="md"
                  boxShadow="md"
                  bg="white"
                  _dark={{ bg: "gray.700" }}
                  p={4}
                  cursor="pointer"
                  transition="all 0.2s"
                  _hover={{ borderColor: "green.400", shadow: "lg" }}
                  borderColor={isSelected ? "green.500" : "gray.200"}
                  borderLeftWidth={isSelected ? "4px" : "1px"}
                  onClick={() => setSelectedId(isSelected ? null : table.id)}
                >
                  <Flex justify="space-between" align="start" gap={2}>
                    <Text fontWeight="bold" fontSize="md" color="green.700" _dark={{ color: "green.300" }}>
                      {table.nome_criterios || "-"}
                    </Text>
                    <Badge colorPalette={table.tabela_publica ? "green" : "gray"} variant="surface">
                      {table.tabela_publica ? "Pública" : "Privada"}
                    </Badge>
                  </Flex>

                  <Text fontSize="xs" fontWeight="bold" color="gray.600" _dark={{ color: "gray.300" }} mt={2}>
                    Criador: {table.nome_criador || "-"}
                  </Text>
                  <Text fontSize="xs" fontWeight="bold" color="gray.600" _dark={{ color: "gray.300" }} mt={1}>
                    Região: {table.regiao?.replace(/_/g, " ") || "-"}
                  </Text>
                  {table.descricao_criterios && (
                    <Text fontSize="xs" color="gray.500" _dark={{ color: "gray.300" }} mt={2}>
                      {table.descricao_criterios}
                    </Text>
                  )}

                  {table.observacoes && (
                    <Text fontSize="xs" color="gray.500" _dark={{ color: "gray.300" }} mt={2} lineClamp={2}>
                      <Text as="span" fontWeight="semibold">Observações:</Text> {table.observacoes}
                    </Text>
                  )}

                  {table.fontes && (
                    <Text fontSize="xs" color="gray.500" _dark={{ color: "gray.300" }} mt={1} lineClamp={2}>
                      <Text as="span" fontWeight="semibold">Fontes:</Text> {table.fontes}
                    </Text>
                  )}

                  {isSelected && (
                    <HStack justify="flex-end" gap={2} mt={3}>
                      <IconButton
                        size="sm"
                        aria-label="Visualizar"
                        borderRadius="full"
                        variant="ghost"
                        colorPalette="blue"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenView(table);
                        }}
                      >
                        <FiEye />
                      </IconButton>
                    </HStack>
                  )}
                </Box>
              );
            })}
          </SimpleGrid>
        )}
      </Box>

      <Dialog.Root
        open={!!activeItem}
        onOpenChange={(e) => !e.open && setActiveItem(null)}
        size="xl"
        scrollBehavior="inside"
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content bg="white" _dark={{ bg: "gray.800" }} maxW="800px">
            <Dialog.Header>
              <Flex justify="space-between" align="center">
                <Dialog.Title fontSize="lg" fontWeight="bold" color="green.600">
                  Visualizar Tabela Pública de Fertilidade
                </Dialog.Title>
                <Dialog.CloseTrigger asChild>
                  <IconButton size="sm" variant="ghost" aria-label="Fechar" onClick={() => setActiveItem(null)}>
                    <FiX />
                  </IconButton>
                </Dialog.CloseTrigger>
              </Flex>
            </Dialog.Header>

            <Dialog.Body>
              <SoilFertilityTableForm
                form={form}
                setForm={setForm}
                readOnly
                mode="view"
                tableId={activeItem?.id || null}
              />
            </Dialog.Body>

            <Dialog.Footer borderTopWidth="1px" _dark={{ borderColor: "gray.700" }}>
              <Button variant="ghost" onClick={() => setActiveItem(null)}>
                Fechar
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </UserLayout>
  );
}
