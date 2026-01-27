import {
  Box,
  Tabs,
  Text,
  VStack,
  HStack,
  Badge,
  Separator,
} from "@chakra-ui/react";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog";
import { CropResponseDto } from "@/interfaces/Crop";
import { TopDressingManager } from "./Children/TopDressing/TopDressingManager";

// --- PLACEHOLDERS PARA OS COMPONENTES FILHOS (Criaremos a seguir) ---
// No futuro, substituiremos isso por imports, ex:
// import { TopDressingManager } from "./Children/TopDressingManager";

<Tabs.Content value="top-dressing">
  <TopDressingManager cropId={crop.id} />
</Tabs.Content>;

const FoliarAnalysisPlaceholder = () => (
  <Box
    p={4}
    borderWidth="1px"
    borderRadius="md"
    borderStyle="dashed"
    bg="gray.50"
  >
    <VStack>
      <Text fontWeight="medium">Gerenciamento de Análise Foliar</Text>
      <Text fontSize="sm" color="gray.500">
        Aqui será exibida a lista e o formulário de análises foliares
        (Macro/Micro nutrientes).
      </Text>
    </VStack>
  </Box>
);

const FoliarFertilizationPlaceholder = () => (
  <Box
    p={4}
    borderWidth="1px"
    borderRadius="md"
    borderStyle="dashed"
    bg="gray.50"
  >
    <VStack>
      <Text fontWeight="medium">Gerenciamento de Adubação Foliar</Text>
      <Text fontSize="sm" color="gray.500">
        Aqui será exibida a lista de Fontes Líquidas e Sólidas.
      </Text>
    </VStack>
  </Box>
);
// ---------------------------------------------------------------------

interface CropDetailsDialogProps {
  open: boolean;
  onOpenChange: (details: { open: boolean }) => void;
  crop: CropResponseDto | null;
}

export const CropDetailsDialog = ({
  open,
  onOpenChange,
  crop,
}: CropDetailsDialogProps) => {
  if (!crop) return null;

  return (
    <DialogRoot
      open={open}
      onOpenChange={onOpenChange}
      size="xl" // Tamanho grande para acomodar as tabelas
      placement="center"
      scrollBehavior="inside"
    >
      <DialogContent height="90vh" maxWidth="1000px">
        <DialogHeader>
          <VStack align="start" gap={1}>
            <HStack>
              <DialogTitle fontSize="xl">
                Manejos da Cultura: {crop.nome}
              </DialogTitle>
              <Badge
                colorPalette={
                  crop.tipo_cultivo === "SAFRA" ? "green" : "orange"
                }
              >
                {crop.tipo_cultivo}
              </Badge>
            </HStack>
            <Text fontSize="sm" color="gray.500">
              Variedade: {crop.variedade} | Ciclo: {crop.ciclo} dias
            </Text>
          </VStack>
        </DialogHeader>

        <DialogBody display="flex" flexDirection="column" gap={4}>
          <Separator />

          <Tabs.Root
            defaultValue="top-dressing"
            variant="enclosed"
            width="100%"
          >
            <Tabs.List>
              <Tabs.Trigger value="top-dressing">
                Adubação Cobertura
              </Tabs.Trigger>
              <Tabs.Trigger value="foliar-analysis">
                Análise Foliar
              </Tabs.Trigger>
              <Tabs.Trigger value="foliar-fert">Adubação Foliar</Tabs.Trigger>
            </Tabs.List>

            <Box pt={4} minH="400px">
              <Tabs.Content value="top-dressing">
                {/* Aqui entra o componente real TopDressingManager */}
                <TopDressingPlaceHolder />
              </Tabs.Content>

              <Tabs.Content value="foliar-analysis">
                {/* Aqui entra o componente real FoliarAnalysisManager */}
                <FoliarAnalysisPlaceholder />
              </Tabs.Content>

              <Tabs.Content value="foliar-fert">
                {/* Aqui entra o componente real FoliarFertilizationManager */}
                <FoliarFertilizationPlaceholder />
              </Tabs.Content>
            </Box>
          </Tabs.Root>
        </DialogBody>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
};
