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
import { TopDressingManager } from "./TopDressingManager";

// --- PLACEHOLDERS ---

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
        Aqui será exibida a lista e o formulário de análises foliares.
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

// --- COMPONENTE PRINCIPAL ---

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
      size="xl"
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
              <Badge colorPalette={crop.tipo_cultivo === "SAFRA" ? "green" : "orange"}>
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

          <Tabs.Root defaultValue="top-dressing" variant="enclosed" width="100%">
            <Tabs.List>
              <Tabs.Trigger value="top-dressing">
                Adubação Cobertura
              </Tabs.Trigger>
              <Tabs.Trigger value="foliar-analysis">
                Análise Foliar
              </Tabs.Trigger>
              <Tabs.Trigger value="foliar-fert">
                Adubação Foliar
              </Tabs.Trigger>
            </Tabs.List>

            <Box pt={4} minH="400px">
              <Tabs.Content value="top-dressing">
                <TopDressingManager cropId={crop.id} />
              </Tabs.Content>

              <Tabs.Content value="foliar-analysis">
                <FoliarAnalysisPlaceholder />
              </Tabs.Content>

              <Tabs.Content value="foliar-fert">
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