import { Button, Flex } from "@chakra-ui/react";
import { LuMessageCircle } from "react-icons/lu";
import { useNavigate } from "react-router-dom";

export const FERT_AI_ROUTE = "/fertintelligence/recommendation/fert-ai";
export const RECOMMENDATION_ROUTE = "/fertintelligence/recommendation";

export default function FertAiAccessButton() {
  const navigate = useNavigate();

  return (
    <Flex justify="flex-end" width="100%" aria-label="Acesso ao Fert-IA">
      <Button
        colorPalette="blue"
        onClick={() => navigate(FERT_AI_ROUTE)}
        width={{ base: "100%", sm: "auto" }}
      >
        <LuMessageCircle aria-hidden="true" />
        Abrir Fert-IA
      </Button>
    </Flex>
  );
}
