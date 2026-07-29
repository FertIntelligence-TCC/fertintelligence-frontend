import { Box } from "@chakra-ui/react";
import UserLayout from "@/components/Layouts/UserLayout";
import FertName from "@/components/FertName/FertName";
import ConfigMenu from "@/components/ConfigMenu/ConfigMenu";
import MakePlotSolicitation from "@/components/Authorizations/MakePlotSolicitation";

export default function SecretaryMakePlotSolicitations() {
  return (
    <UserLayout>
      <FertName subtitle="Fazer solicitação" />
      <ConfigMenu />
      <Box px={{ base: 0, md: 8 }} py={{ base: 4, md: 8 }} mt={{ base: 4, md: 8 }} w={{ base: "calc(100vw - 48px)", md: "auto" }} maxW="100%">
        <MakePlotSolicitation roleOverride="SECRETARY" />
      </Box>
    </UserLayout>
  );
}
