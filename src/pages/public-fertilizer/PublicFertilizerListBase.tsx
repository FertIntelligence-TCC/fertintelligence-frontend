import { ReactNode } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Box, Button, Dialog, Flex, Heading, IconButton, SimpleGrid, Spinner, Text } from "@chakra-ui/react";
import { FiArrowLeft, FiX } from "react-icons/fi";

import UserLayout from "@/components/Layouts/UserLayout";
import FertName from "@/components/FertName/FertName";
import ConfigMenu from "@/components/ConfigMenu/ConfigMenu";
import PublicFertilizerCard from "@/components/Fertilizers/Shared/PublicFertilizerCard";

interface PublicFertilizerListBaseProps<TItem, TForm> {
  subtitle: string;
  heading: string;
  typeLabel: string;
  listLabel?: string;
  backLabel?: string;
  dialogTitle?: string;
  backPath: string;
  queryKey: string[];
  fetchFn: () => Promise<TItem[]>;
  getId: (item: TItem) => number;
  getName: (item: TItem) => string;
  getCreatorName: (item: TItem) => string;
  renderCardDetails?: (item: TItem) => ReactNode;
  toForm: (item: TItem) => TForm;
  renderReadOnlyForm: (form: TForm) => ReactNode;
}

export default function PublicFertilizerListBase<TItem, TForm>({
  subtitle,
  heading,
  typeLabel,
  listLabel = "públicos",
  backLabel = "Voltar para meus adubos",
  dialogTitle = "Visualizar adubo público",
  backPath,
  queryKey,
  fetchFn,
  getId,
  getName,
  getCreatorName,
  renderCardDetails,
  toForm,
  renderReadOnlyForm,
}: PublicFertilizerListBaseProps<TItem, TForm>) {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [activeItem, setActiveItem] = useState<TItem | null>(null);

  const { data: fertilizers = [], isLoading, isError } = useQuery({
    queryKey,
    queryFn: fetchFn,
  });

  return (
    <UserLayout>
      <FertName subtitle={subtitle} />
      <ConfigMenu />

      <Box pt={{ base: 16, md: 24 }} px={{ base: 4, md: 8 }} w="full">
        <Flex direction="column" gap={6}>
          <Button alignSelf="flex-start" variant="outline" colorPalette="blue" onClick={() => navigate(backPath)}>
            <FiArrowLeft /> {backLabel}
          </Button>

          <Heading as="h1" size="lg" color="white">{heading}</Heading>

          <Box mt={2}>
            {isLoading ? (
              <Flex justify="center" minH="200px" align="center"><Spinner color="white" size="lg" /></Flex>
            ) : isError ? (
              <Text color="red.300">Erro ao carregar adubos {listLabel}.</Text>
            ) : fertilizers.length === 0 ? (
              <Text color="white">Nenhum adubo {listLabel} disponível.</Text>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
                {fertilizers.map((fertilizer) => {
                  const id = getId(fertilizer);
                  return (
                    <PublicFertilizerCard
                      key={id}
                      fertilizerName={getName(fertilizer)}
                      creatorName={getCreatorName(fertilizer)}
                      typeLabel={typeLabel}
                      isSelected={selectedId === id}
                      onSelect={() => setSelectedId(selectedId === id ? null : id)}
                      onView={() => setActiveItem(fertilizer)}
                    >
                      {renderCardDetails?.(fertilizer)}
                    </PublicFertilizerCard>
                  );
                })}
              </SimpleGrid>
            )}
          </Box>
        </Flex>
      </Box>

      <Dialog.Root open={!!activeItem} onOpenChange={(e) => !e.open && setActiveItem(null)} size="lg" scrollBehavior="inside">
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content bg="white" _dark={{ bg: "gray.800" }}>
            <Dialog.Header>
              <Flex justify="space-between" align="center">
                <Dialog.Title>{dialogTitle}</Dialog.Title>
                <Dialog.CloseTrigger asChild>
                  <IconButton size="sm" variant="ghost" aria-label="Fechar" onClick={() => setActiveItem(null)}>
                    <FiX />
                  </IconButton>
                </Dialog.CloseTrigger>
              </Flex>
            </Dialog.Header>
            <Dialog.Body>{activeItem ? renderReadOnlyForm(toForm(activeItem)) : null}</Dialog.Body>
            <Dialog.Footer>
              <Button colorPalette="blue" onClick={() => setActiveItem(null)}>Fechar</Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </UserLayout>
  );
}
