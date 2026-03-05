import { Box, Button, Flex, Heading } from "@chakra-ui/react";
import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import UserLayout from "@/components/Layouts/UserLayout";
import ConfigMenu from "@/components/ConfigMenu/ConfigMenu";
import FertName from "@/components/FertName/FertName";
import { toaster } from "@/components/ui/toaster";
import { useUserStore } from "@/stores/user/user.store";

const ROUTES = {
  OWNER_MANAGEMENT: "/fertintelligence/owner-property-management",
  OTHERS_MANAGEMENT: "/fertintelligence/others-property-management",
  FERTILIZATION_TABLES: "/fertintelligence/fertilization-table-management",
  FERTILIZERS: "/fertintelligence/fertilizer-management",
  MAKE_RECOMMENDATION: "/fazer-recomendacao",
  MAKE_REQUEST: "/fazer-solicitacao",
  VIEW_SOLICITATIONS: "/fertintelligence/view-solicitations",
} as const;

const normalize = (v?: string) =>
  (v ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "")
    .toUpperCase();

function isCargo(userCargo: unknown, cargo: string) {
  return normalize(String(userCargo ?? "")) === normalize(cargo);
}

export default function Home() {
  const navigate = useNavigate();
  const user = useUserStore((s) => s.user);

  const isOwner = useMemo(() => isCargo(user?.cargo, "PROPRIETARIO"), [user?.cargo]);
  const isManager = useMemo(() => isCargo(user?.cargo, "GERENTE"), [user?.cargo]);

  const go = useCallback((path: string) => navigate(path), [navigate]);

  const handleManageProperties = useCallback(() => {
    go(isOwner ? ROUTES.OWNER_MANAGEMENT : ROUTES.OTHERS_MANAGEMENT);
  }, [go, isOwner]);

  const handleMakeRequest = useCallback(() => {
    if (isOwner || isManager) {
      toaster.create({
        title: "Aviso",
        description: "Você já possui autoridade total nas propriedades sob sua gestão.",
        type: "warning",
      });
      return;
    }
    go(ROUTES.MAKE_REQUEST);
  }, [go, isOwner, isManager]);

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