import { Box, Button } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { LuArrowLeft } from "react-icons/lu";
import { useNavigate } from "react-router-dom";

import ConfigMenu from "@/components/ConfigMenu/ConfigMenu";
import FertAiPanel from "@/components/FertAi/FertAiPanel";
import { RECOMMENDATION_ROUTE } from "@/components/FertAi/FertAiAccessButton";
import FertName from "@/components/FertName/FertName";
import UserLayout from "@/components/Layouts/UserLayout";
import type { RecommendationResponse } from "@/interfaces/Recommendation";
import { getMyRecommendations } from "@/services/recommendationService";

const recommendationLoadError =
  "Não foi possível carregar suas recomendações agora. Tente novamente em instantes.";

export default function FertAi() {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<RecommendationResponse[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const [recommendationsError, setRecommendationsError] = useState<string | null>(null);
  const recommendationsRequestRef = useRef<Promise<RecommendationResponse[]> | null>(null);

  useEffect(() => {
    let active = true;
    if (!recommendationsRequestRef.current) {
      recommendationsRequestRef.current = getMyRecommendations();
    }

    setRecommendationsError(null);
    recommendationsRequestRef.current
      .then((result) => {
        if (active) setRecommendations(result);
      })
      .catch(() => {
        if (active) {
          setRecommendations([]);
          setRecommendationsError(recommendationLoadError);
        }
      })
      .finally(() => {
        if (active) setLoadingRecommendations(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <UserLayout>
      <FertName subtitle="Assistente agronômico" />
      <ConfigMenu />
      <Box px={4} py={8} maxW="1200px" mx="auto">
        <Button
          variant="outline"
          mb={4}
          onClick={() => navigate(RECOMMENDATION_ROUTE)}
        >
          <LuArrowLeft aria-hidden="true" />
          Voltar para recomendações
        </Button>
        <FertAiPanel
          recommendations={recommendations}
          loadingRecommendations={loadingRecommendations}
          recommendationsError={recommendationsError}
        />
      </Box>
    </UserLayout>
  );
}
