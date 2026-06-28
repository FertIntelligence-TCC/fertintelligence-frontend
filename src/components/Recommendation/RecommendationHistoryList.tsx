import { Box, Button, Flex, Heading, Separator, Spinner, Text, VStack } from "@chakra-ui/react";

import type {
  RecommendationLimingCriteria,
  RecommendationResponse,
} from "@/interfaces/Recommendation";

type RecommendationHistoryListProps = {
  recommendations: RecommendationResponse[];
  loading: boolean;
  errorMessage?: string | null;
  openingRecommendationId?: number | null;
  deletingId?: number | null;
  getFolderName: (recommendation: RecommendationResponse) => string;
  normalizeLimingCriteria: (criteria?: string | null) => RecommendationLimingCriteria | undefined;
  onOpen: (recommendation: RecommendationResponse) => void;
  onDelete: (recommendation: RecommendationResponse) => void;
};

export default function RecommendationHistoryList({
  recommendations,
  loading,
  errorMessage,
  openingRecommendationId,
  deletingId,
  getFolderName,
  normalizeLimingCriteria,
  onOpen,
  onDelete,
}: RecommendationHistoryListProps) {
  return (
    <Box borderWidth="1px" borderRadius="lg" p={6} mt={4}>
      <Heading size="md" mb={3}>Minhas Recomendações</Heading>
      <Separator mb={4} />
      {loading ? (
        <Spinner />
      ) : errorMessage ? (
        <Text color="orange.600">{errorMessage}</Text>
      ) : recommendations.length === 0 ? (
        <Text color="fg.muted">Nenhuma recomendação encontrada.</Text>
      ) : (
        <VStack align="stretch" gap={3}>
          {recommendations.map((item) => (
            <Flex key={item.id} borderWidth="1px" borderRadius="md" p={3} justify="space-between" wrap="wrap" gap={3}>
              <VStack align="start" gap={1}>
                <Text fontWeight="bold">{getFolderName(item)}</Text>
                <Text fontSize="sm">
                  Propriedade: {item.nome_propriedade ?? item.id_propriedade ?? "-"} • Talhão: {item.identificacao_talhao ?? item.id_talhao ?? "-"}
                </Text>
                <Text fontSize="sm">
                  Cultura: {item.cultura ?? "-"} • Ano: {item.ano_safra ?? "-"} • Tipo: {item.tipo_recomendacao ?? "-"} • Calagem: {normalizeLimingCriteria(item.criterio_calagem ?? item.criterioCalagem) ?? "-"}
                </Text>
              </VStack>
              <Flex gap={2}>
                <Button size="sm" loading={openingRecommendationId === item.id} onClick={() => onOpen(item)}>
                  Abrir
                </Button>
                <Button
                  size="sm"
                  colorPalette="red"
                  loading={deletingId === item.id}
                  onClick={() => {
                    if (!window.confirm("Deseja excluir esta recomendação?")) return;
                    onDelete(item);
                  }}
                >
                  Excluir
                </Button>
              </Flex>
            </Flex>
          ))}
        </VStack>
      )}
    </Box>
  );
}
