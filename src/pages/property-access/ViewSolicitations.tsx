import { useState, useEffect } from "react";
// 1. Removemos Select, Tabs, etc, daqui:
import { Box, Button, Flex, Heading, Text, Spinner, Badge } from "@chakra-ui/react";

import UserLayout from "@/components/Layouts/UserLayout";
import { propertyAccessRequestService } from "@/services/propertyAccessRequestService";
import { fetchMyProperties } from "@/services/propertyService";
import { toaster } from "@/components/ui/toaster";
import { PropertyAccessRequestResponse } from "@/interfaces/PropertyAccessRequest";
import { PropertyResponse } from "@/interfaces/Property";
import { Cargo } from "@/interfaces/User";

// 2. Importamos os componentes customizados que criamos!
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@/components/ui/custom-tabs";

export default function ViewSolicitations() {
  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | "">("");
  const [requests, setRequests] = useState<PropertyAccessRequestResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Carregar as propriedades do proprietário ao iniciar a página
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const data = await fetchMyProperties(); 
        setProperties(data);
        if (data.length > 0) {
          setSelectedPropertyId(data[0].id);
        }
      } catch (error) {
        toaster.create({ title: "Erro", description: "Falha ao carregar as suas propriedades.", type: "error" });
      }
    };
    fetchProperties();
  }, []);

  // Carregar as solicitações sempre que a propriedade selecionada mudar
  useEffect(() => {
    if (selectedPropertyId) {
      fetchRequests(Number(selectedPropertyId));
    } else {
      setRequests([]);
    }
  }, [selectedPropertyId]);

  const fetchRequests = async (propertyId: number) => {
    setIsLoading(true);
    try {
      const data = await propertyAccessRequestService.getRequestsByProperty(propertyId);
      setRequests(data);
    } catch (error) {
      toaster.create({ title: "Erro", description: "Falha ao carregar as solicitações.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  // Filtragem das listas para as Abas
  const pendingRequests = requests.filter(r => r.status === "PENDING");
  const acceptedRequests = requests.filter(r => r.status === "APPROVED");

  // AÇÃO: Aceitar
  const handleAccept = async (requestId: number, cargoSolicitante: string) => {
    // Validação de Gerente
    if (cargoSolicitante === Cargo.GERENTE || cargoSolicitante === "GERENTE") {
      const hasGerente = acceptedRequests.some(
        (r) => r.cargo_solicitante === Cargo.GERENTE || r.cargo_solicitante === "GERENTE"
      );
      
      if (hasGerente) {
        toaster.create({
          title: "Operação não permitida",
          description: "A propriedade só pode ter 1 gerente!",
          type: "error",
        });
        return;
      }
    }

    try {
      await propertyAccessRequestService.decideRequest(requestId, { solicitacao_aprovada: true });
      toaster.create({ title: "Sucesso", description: "Acesso concedido à propriedade.", type: "success" });
      fetchRequests(Number(selectedPropertyId)); // Atualiza as listas
    } catch (error) {
      toaster.create({ title: "Erro", description: "Ocorreu um erro ao aceitar a solicitação.", type: "error" });
    }
  };

  // AÇÃO: Recusar ou Expulsar
  const handleRejectOrExpel = async (requestId: number, isExpel: boolean = false) => {
    try {
      await propertyAccessRequestService.decideRequest(requestId, { solicitacao_aprovada: false });
      toaster.create({ 
        title: "Sucesso", 
        description: isExpel ? "Utilizador expulso com sucesso." : "Solicitação recusada e removida.", 
        type: "info" 
      });
      fetchRequests(Number(selectedPropertyId)); // Atualiza as listas
    } catch (error) {
      toaster.create({ title: "Erro", description: "Ocorreu um erro na operação.", type: "error" });
    }
  };

  return (
    <UserLayout>
      <Box p={8} maxW="4xl" mx="auto" mt={8}>
        <Heading mb={6}>Gestão de Solicitações</Heading>

        {/* Seleção de Propriedade (Adaptado com Box as="select" para evitar bugs do Chakra V3) */}
        <Box mb={8} bg="white" _dark={{ bg: "gray.800" }} p={4} borderRadius="md" boxShadow="sm">
          <Text mb={2} fontWeight="bold">Selecione a Propriedade:</Text>
          <Box 
            as="select"
            w="full"
            p={2}
            borderWidth="1px"
            borderRadius="md"
            borderColor="gray.200"
            _dark={{ borderColor: "gray.600", bg: "gray.700" }}
            value={selectedPropertyId}
            onChange={(e: any) => setSelectedPropertyId(Number(e.target.value))}
          >
            <option value="" disabled>Escolha uma propriedade</option>
            {properties.map(prop => (
              <option key={prop.id} value={prop.id}>{prop.nome}</option>
            ))}
          </Box>
        </Box>

        {/* Box com as Abas */}
        <Box bg="white" _dark={{ bg: "gray.800" }} p={6} borderRadius="lg" boxShadow="md">
          {isLoading ? (
            <Flex justify="center" align="center" py={10}>
              <Spinner size="xl" />
            </Flex>
          ) : !selectedPropertyId ? (
            <Text textAlign="center" color="gray.500">Por favor, selecione uma propriedade acima.</Text>
          ) : (
            <Tabs colorScheme="green">
              <TabList>
                <Tab>Pendentes ({pendingRequests.length})</Tab>
                <Tab>Aceites ({acceptedRequests.length})</Tab>
              </TabList>

              <TabPanels>
                {/* ABA 1: PENDENTES */}
                <TabPanel>
                  {pendingRequests.length === 0 ? (
                    <Text color="gray.500" mt={4}>Não existem solicitações pendentes no momento.</Text>
                  ) : (
                    <Flex direction="column" gap={4} mt={4}>
                      {pendingRequests.map((req) => (
                        <Box key={req.id} p={4} borderWidth="1px" borderRadius="md" borderColor="yellow.400">
                          <Flex justify="space-between" align="center">
                            <Box>
                              <Text fontWeight="bold" fontSize="lg">{req.nome_solicitante}</Text>
                              <Badge colorPalette="purple">{req.cargo_solicitante}</Badge>
                              <Text fontSize="sm" color="gray.500" mt={1}>{req.email_solicitante}</Text>
                            </Box>
                            <Flex gap={3}>
                              <Button colorPalette="green" onClick={() => handleAccept(req.id, req.cargo_solicitante)}>
                                Aceitar
                              </Button>
                              <Button colorPalette="red" variant="outline" onClick={() => handleRejectOrExpel(req.id, false)}>
                                Recusar
                              </Button>
                            </Flex>
                          </Flex>
                        </Box>
                      ))}
                    </Flex>
                  )}
                </TabPanel>

                {/* ABA 2: ACEITES */}
                <TabPanel>
                  {acceptedRequests.length === 0 ? (
                    <Text color="gray.500" mt={4}>Não há utilizadores aceites nesta propriedade ainda.</Text>
                  ) : (
                    <Flex direction="column" gap={4} mt={4}>
                      {acceptedRequests.map((req) => (
                        <Box key={req.id} p={4} borderWidth="1px" borderRadius="md" borderColor="green.400">
                          <Flex justify="space-between" align="center">
                            <Box>
                              <Text fontWeight="bold" fontSize="lg">{req.nome_solicitante}</Text>
                              <Badge colorPalette="green">{req.cargo_solicitante}</Badge>
                            </Box>
                            <Button colorPalette="red" onClick={() => handleRejectOrExpel(req.id, true)}>
                              Expulsar
                            </Button>
                          </Flex>
                        </Box>
                      ))}
                    </Flex>
                  )}
                </TabPanel>
              </TabPanels>
            </Tabs>
          )}
        </Box>
      </Box>
    </UserLayout>
  );
}