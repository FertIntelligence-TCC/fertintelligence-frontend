import { Box, Button, Flex, Heading } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import UserLayout from "@/components/Layouts/UserLayout";
import ConfigMenu from "@/components/ConfigMenu/ConfigMenu";
import FertName from "@/components/FertName/FertName";
import { Cargo } from "@/interfaces/ServicePayload";
import { useUserStore } from "@/stores/user/user.store";

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

  return (
    <UserLayout>
      {/* Componente da legenda, agora separado */}
      <FertName subtitle="Painel principal" />

      {/* Componente do Menu de configurações */}
      <ConfigMenu />

      {/* Conteúdo principal - dois cardboxes lado a lado */}
      <Flex
        justifyContent="center"
        alignItems="flex-start"
        gap={8}
        mt={16}
        px={4}
        flexWrap={{ base: "wrap", md: "nowrap" }}
      >
        {/* Cardbox esquerdo */}
        <Box
          borderWidth="1px"
          borderRadius="md"
          boxShadow="md"
          p={8} // Aumentado para 8 para mais altura
          w={{ base: "100%", md: "35%" }} // Reduzido de 40% para 35%
          bg={{ base: "white", _dark: "gray.700" }}
        >
          <Heading as="h2" size="md" mb={6}>
            O que você quer fazer?
          </Heading>
          <Flex direction="column" gap={6}> {/* Aumentado o gap para separar mais os botões */}
            <Button
              colorScheme="teal"
              onClick={handleManageProperties}
              h="50px"
              fontSize="md"
            >
              Gerenciar propriedades
            </Button>
            <Button
              colorScheme="blue"
              onClick={() => navigate("/gerenciar-tabelas-adubacao")}
              h="50px"
              fontSize="md"
            >
              Gerenciar tabelas de adubação de culturas
            </Button>
            <Button
              colorScheme="blue"
              onClick={() => navigate("/gerenciar-adubos")}
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

        {/* Cardbox direito */}
        <Box
          borderWidth="1px"
          borderRadius="md"
          boxShadow="md"
          p={8} // Aumentado para 8 para mais altura
          w={{ base: "100%", md: "35%" }} // Reduzido de 40% para 35%
          bg={{ base: "white", _dark: "gray.700" }}
        >
          <Heading as="h2" size="md" mb={6}>
            Autorizações
          </Heading>
          <Flex direction="column" gap={6}> {/* Aumentado o gap para separar mais os botões */}
            <Button
              colorScheme="green"
              onClick={() => navigate("/fazer-solicitacao")}
              h="50px"
              fontSize="md"
            >
              Fazer solicitação
            </Button>
            <Button
              colorScheme="green"
              onClick={() => navigate("/visualizar-solicitacoes")}
              h="50px"
              fontSize="md"
            >
              Visualizar solicitações
            </Button>
          </Flex>
        </Box>
      </Flex>
    </UserLayout>
  );
}