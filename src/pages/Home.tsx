import { Box, Button, Flex, Heading } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import UserLayout from "@/components/Layouts/UserLayout";
import ConfigMenu from "@/components/ConfigMenu/ConfigMenu";
import FertName from "@/components/FertName/FertName";
import { Cargo } from "@/interfaces/User";
import { useUserStore } from "@/stores/user/user.store";
import { toaster } from "@/components/ui/toaster";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useUserStore();

  const normalizeCargo = (cargo?: string) =>
    cargo
      ?.normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "")
      .toUpperCase();

  const isOwner = normalizeCargo(user?.cargo) === Cargo.PROPRIETARIO;

  const handleManageProperties = () => {
    if (isOwner) {
      navigate('/fertintelligence/owner-property-management');
    } else {
      navigate('/fertintelligence/others-property-management');
    }
  };

  const handleMakeRequestClick = () => {
    if (isOwner) {
      toaster.create({
        title: "Aviso",
        description: "Proprietário, você já possui todas as permissões de suas propriedades!",
        type: "warning",
      });
      return;
    }
    navigate("/fazer-solicitacao");
  };

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
            <Button
              colorScheme="green"
              onClick={handleManageProperties}
              h="50px"
              fontSize="md"
            >
              Gerenciar propriedades
            </Button>
            <Button
              colorScheme="blue"
              onClick={() => navigate("/fertintelligence/fertilization-table-management")}
              h="50px"
              fontSize="md"
            >
              Tabelas de adubação
            </Button>
            <Button
              colorScheme="blue"
              onClick={() => navigate("/fertintelligence/fertilizer-management")}
              h="50px"
              fontSize="md"
            >
              Gerenciar adubos
            </Button>
            <Button
              colorScheme="blue"
              onClick={() => navigate("/fazer-recomendacao")}
              h="50px"
              fontSize="md"
            >
              Fazer recomendação
            </Button>
          </Flex>
        </Box>

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
            <Button
              colorScheme="green"
              onClick={handleMakeRequestClick}
              h="50px"
              fontSize="md"
            >
              Fazer solicitação
            </Button>
            {isOwner && (
              <Button
                colorScheme="green"
                onClick={() => navigate("/fertintelligence/view-solicitations")}
                h="50px"
                fontSize="md"
              >
                Visualizar solicitações
              </Button>
            )}
          </Flex>
        </Box>
      </Flex>
    </UserLayout>
  );
}