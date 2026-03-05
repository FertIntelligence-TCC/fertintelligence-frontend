import { Box, Button, Flex, Heading } from "@chakra-ui/react";
import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import UserLayout from "@/components/Layouts/UserLayout";
import ConfigMenu from "@/components/ConfigMenu/ConfigMenu";
import FertName from "@/components/FertName/FertName";
import { toaster } from "@/components/ui/toaster";
import { getAuthorizationRoleMode } from "@/interfaces/Authorization";
import { useUserStore } from "@/stores/user/user.store";

const ROUTES = {
  OWNER_MANAGEMENT: "/fertintelligence/owner-property-management",
  OTHERS_MANAGEMENT: "/fertintelligence/others-property-management",
  MANAGER_MANAGEMENT: "/fertintelligence/manager-property-management",
  RESIDENT_MANAGEMENT: "/fertintelligence/resident-agronomist-property-management",
  CONSULTANT_MANAGEMENT: "/fertintelligence/consultant-agronomist-property-management",
  SECRETARY_MANAGEMENT: "/fertintelligence/secretary-property-management",
  SUPERVISOR_MANAGEMENT: "/fertintelligence/area-supervisor-property-management",
  FERTILIZATION_TABLES: "/fertintelligence/fertilization-table-management",
  FERTILIZERS: "/fertintelligence/fertilizer-management",
  MAKE_RECOMMENDATION: "/fazer-recomendacao",
  RESIDENT_MAKE_REQUEST: "/fertintelligence/resident-agronomist-make-plot-solicitations",
  CONSULTANT_MAKE_REQUEST: "/fertintelligence/consultant-agronomist-make-plot-solicitations",
  SECRETARY_MAKE_REQUEST: "/fertintelligence/secretarymake-plot-solicitations",
  VIEW_SOLICITATIONS: "/fertintelligence/view-solicitations",
} as const;

export default function Home() {
  const navigate = useNavigate();
  const user = useUserStore((s) => s.user);
  const roleMode = useMemo(() => getAuthorizationRoleMode(user?.cargo), [user?.cargo]);

  const isOwner = roleMode === "OWNER";
  const isManager = roleMode === "MANAGER";

  const go = useCallback((path: string) => navigate(path), [navigate]);

  const handleManageProperties = useCallback(() => {
    const pathByRole = {
      OWNER: ROUTES.OWNER_MANAGEMENT,
      MANAGER: ROUTES.MANAGER_MANAGEMENT,
      RESIDENT: ROUTES.RESIDENT_MANAGEMENT,
      CONSULTANT: ROUTES.CONSULTANT_MANAGEMENT,
      SECRETARY: ROUTES.SECRETARY_MANAGEMENT,
      SUPERVISOR: ROUTES.SUPERVISOR_MANAGEMENT,
      OTHER: ROUTES.OTHERS_MANAGEMENT,
    } as const;

    go(pathByRole[roleMode]);
  }, [go, roleMode]);

  const handleMakeRequest = useCallback(() => {
    if (isOwner || isManager) {
      toaster.create({
        title: "Aviso",
        description: "Você já possui autoridade total nas propriedades sob sua gestão.",
        type: "warning",
      });
      return;
    }

    if (roleMode === "RESIDENT") {
      go(ROUTES.RESIDENT_MAKE_REQUEST);
      return;
    }

    if (roleMode === "CONSULTANT") {
      go(ROUTES.CONSULTANT_MAKE_REQUEST);
      return;
    }

    if (roleMode === "SECRETARY") {
      go(ROUTES.SECRETARY_MAKE_REQUEST);
      return;
    }

    if (roleMode === "SUPERVISOR") {
      alert("Seu cargo não possui essa funcionalidade no sistema!");
      return;
    }

    alert("Seu cargo não possui essa funcionalidade no sistema!");
  }, [go, isOwner, isManager, roleMode]);

  const handleViewSolicitations = useCallback(() => {
    if (isOwner || isManager) {
      go(ROUTES.VIEW_SOLICITATIONS);
      return;
    }
    alert("Seu cargo não possui essa funcionalidade no sistema!");
  }, [go, isOwner, isManager]);

  return (
    <UserLayout>
      <FertName subtitle="Painel principal" />
      <ConfigMenu />

      <Flex
        justifyContent="center"
        alignItems="flex-start"
        gap={8}
        mt={16}
        px={4}
        flexWrap={{ base: "wrap", md: "nowrap" }}
      >
        {/* BLOCO 1 */}
        <Box
          borderWidth="1px"
          borderRadius="md"
          boxShadow="md"
          p={8}
          w={{ base: "100%", md: "35%" }}
          bg={{ base: "white", _dark: "gray.700" }}
        >
          <Heading as="h2" size="md" mb={6}>
            Minhas propriedades e cultivos
          </Heading>

          <Flex direction="column" gap={4}>
            <Button colorScheme="green" onClick={handleManageProperties} h="50px" fontSize="md">
              Gerenciar propriedades
            </Button>

            <Button colorScheme="blue" onClick={() => go(ROUTES.FERTILIZATION_TABLES)} h="50px" fontSize="md">
              Tabelas de adubação
            </Button>

            <Button colorScheme="blue" onClick={() => go(ROUTES.FERTILIZERS)} h="50px" fontSize="md">
              Gerenciar adubos
            </Button>

            <Button colorScheme="blue" onClick={() => go(ROUTES.MAKE_RECOMMENDATION)} h="50px" fontSize="md">
              Fazer recomendação
            </Button>
          </Flex>
        </Box>

        {/* BLOCO 2 */}
        <Box
          borderWidth="1px"
          borderRadius="md"
          boxShadow="md"
          p={8}
          w={{ base: "100%", md: "35%" }}
          bg={{ base: "white", _dark: "gray.700" }}
        >
          <Heading as="h2" size="md" mb={6}>
            Autorizações
          </Heading>

          <Flex direction="column" gap={6}>
            <Button colorScheme="green" onClick={handleMakeRequest} h="50px" fontSize="md">
              Fazer solicitação
            </Button>

            <Button colorScheme="green" onClick={handleViewSolicitations} h="50px" fontSize="md">
              Visualizar solicitações
            </Button>
          </Flex>
        </Box>
      </Flex>
    </UserLayout>
  );
}