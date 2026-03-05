import { Box } from "@chakra-ui/react";
import UserLayout from "@/components/Layouts/UserLayout";
import FertName from "@/components/FertName/FertName";
import ConfigMenu from "@/components/ConfigMenu/ConfigMenu";
import MakePlotSolicitation from "@/components/Authorizations/MakePlotSolicitation";

export default function ConsultantAgronomistMakePlotSolicitations() {
  return (
    <UserLayout>
      <FertName subtitle="Fazer solicitação" />
      <ConfigMenu />
      <Box p={8} mt={8}>
        <MakePlotSolicitation roleOverride="CONSULTANT" />
      </Box>
    </UserLayout>
  );
}