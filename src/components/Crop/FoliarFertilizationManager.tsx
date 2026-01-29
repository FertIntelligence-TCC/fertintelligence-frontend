import { Tabs, Box } from "@chakra-ui/react";
import { LiquidSourceManager } from "./LiquidSourceManager";
import { SolidSourceManager } from "./SolidSourceManager";

interface FoliarFertilizationManagerProps {
  cropId: number;
}

export const FoliarFertilizationManager = ({ cropId }: FoliarFertilizationManagerProps) => {
  return (
    <Tabs.Root defaultValue="liquid" variant="subtle">
      <Tabs.List>
        <Tabs.Trigger value="liquid">Fontes Líquidas</Tabs.Trigger>
        <Tabs.Trigger value="solid">Fontes Sólidas</Tabs.Trigger>
      </Tabs.List>

      <Box pt={4}>
        <Tabs.Content value="liquid">
          <LiquidSourceManager cropId={cropId} />
        </Tabs.Content>
        <Tabs.Content value="solid">
          <SolidSourceManager cropId={cropId} />
        </Tabs.Content>
      </Box>
    </Tabs.Root>
  );
};