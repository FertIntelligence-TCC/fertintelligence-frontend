import { Button, Flex } from "@chakra-ui/react";

import DialogContainer from "@/components/Property/DialogContainer";
import MakePlotSolicitation from "@/components/Authorizations/MakePlotSolicitation";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function PlotAuthorizationRequestDialog({ isOpen, onClose }: Props) {
  return (
    <DialogContainer isOpen={isOpen} onClose={onClose}>
      <MakePlotSolicitation />

      <Flex justify="flex-end" mt={4}>
        <Button variant="outline" onClick={onClose}>
          Fechar
        </Button>
      </Flex>
    </DialogContainer>
  );
}