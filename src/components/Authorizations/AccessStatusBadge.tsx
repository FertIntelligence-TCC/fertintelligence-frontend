import { Badge } from "@chakra-ui/react";

import type { AccessCardStatus } from "@/interfaces/Authorization";

const STATUS_PRESENTATION: Record<
  AccessCardStatus,
  { label: string; colorPalette: "gray" | "orange" | "green" | "red"; borderColor: string }
> = {
  NONE: {
    label: "Sem solicitação",
    colorPalette: "gray",
    borderColor: "gray.500",
  },
  PENDING: {
    label: "Solicitação pendente",
    colorPalette: "orange",
    borderColor: "orange.400",
  },
  APPROVED: {
    label: "Acesso aprovado",
    colorPalette: "green",
    borderColor: "green.400",
  },
  REJECTED: {
    label: "Solicitação recusada",
    colorPalette: "red",
    borderColor: "red.400",
  },
};

export const getAccessStatusPresentation = (status: AccessCardStatus) =>
  STATUS_PRESENTATION[status];

type Props = {
  status: AccessCardStatus;
};

export default function AccessStatusBadge({ status }: Props) {
  const presentation = getAccessStatusPresentation(status);

  return (
    <Badge
      colorPalette={presentation.colorPalette}
      variant="subtle"
      px={2}
      py={1}
      borderRadius="full"
      aria-label={`Estado: ${presentation.label}`}
    >
      {presentation.label}
    </Badge>
  );
}
