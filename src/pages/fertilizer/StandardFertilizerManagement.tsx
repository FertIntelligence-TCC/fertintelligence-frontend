import { Navigate, useNavigate } from "react-router-dom";

import FertilizerManagement from "@/pages/fertilizer/FertilizerManagement";
import { isSupremeUser } from "@/interfaces/Authorization";
import { useUserStore } from "@/stores/user/user.store";

export default function StandardFertilizerManagement() {
  const navigate = useNavigate();
  const user = useUserStore((s) => s.user);

  if (isSupremeUser(user)) {
    return <Navigate to="/fertintelligence/fertilizer-management" replace />;
  }

  return (
    <FertilizerManagement
      subtitle="Adubos padrão"
      soilHeading="Adubos padrão para aplicação no solo"
      foliarHeading="Adubos padrão para aplicação foliar"
      backLabel="Voltar para meus adubos"
      onBack={() => navigate("/fertintelligence/fertilizer-management")}
      getPath={(path) => `${path}/publicos`}
      getNavigationState={() => ({
        backPath: "/fertintelligence/fertilizer-management/adubos-padrao",
        backLabel: "Voltar para adubos padrão",
      })}
      showStandardFertilizers={false}
    />
  );
}
