import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Box, Button, Flex, Heading, SimpleGrid, Spinner, Text, VStack } from "@chakra-ui/react";

import { toaster } from "@/components/ui/toaster";
import { propertyAccessRequestService } from "@/services/propertyAccessRequestService";
import { getPlotsByProperty } from "@/services/plotService";
import {
  getPlotAccessRequests,
  requestPlotAccess,
  revokePlotAccessRequest,
} from "@/services/plotAccessRequestService";
import { useUserStore } from "@/stores/user/user.store";
import type { PropertyResponse } from "@/interfaces/Property";
import type { PlotResponse } from "@/interfaces/Plot";
import type { AccessCardStatus, AuthorizationRoleMode, NormalizedPlotPermission } from "@/interfaces/Authorization";
import { getAuthorizationRoleMode } from "@/interfaces/Authorization";
import type { PermissionType } from "@/interfaces/PlotAccessRequest";
import AccessStatusBadge, {
  getAccessStatusPresentation,
} from "@/components/Authorizations/AccessStatusBadge";

type Props = {
  roleOverride?: Extract<AuthorizationRoleMode, "RESIDENT" | "CONSULTANT" | "SECRETARY">;
};

const normalizeRequest = (item: any): NormalizedPlotPermission => ({
  id: item.id,
  propertyId: Number(item.propertyId ?? item.id_propriedade ?? 0),
  plotId: item.plotId ?? item.id_talhao ?? null,
  requesterId: Number(item.requesterId ?? item.id_solicitante ?? 0),
  requesterName: item.requesterName ?? item.nome_solicitante,
  requesterCargo: item.requesterCargo ?? item.cargo_solicitante,
  plotIdentification: item.plotIdentification ?? item.identificacao_talhao,
  status: item.status,
  permissionType: item.permissionType ?? item.tipo_permissao ?? null,
});

const requestStatus = (requests: NormalizedPlotPermission[]): AccessCardStatus => {
  if (requests.some((r) => r.status === "APPROVED")) return "APPROVED";
  if (requests.some((r) => r.status === "PENDING")) return "PENDING";
  if (requests.some((r) => r.status === "REJECTED")) return "REJECTED";
  return "NONE";
};

export default function MakePlotSolicitation({ roleOverride }: Props) {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const roleMode = roleOverride ?? getAuthorizationRoleMode(user?.cargo);

  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [requests, setRequests] = useState<NormalizedPlotPermission[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<PropertyResponse | null>(null);
  const [plots, setPlots] = useState<PlotResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const isResident = roleMode === "RESIDENT";
  const isConsultant = roleMode === "CONSULTANT";
  const isSecretary = roleMode === "SECRETARY";

  const permissionType: PermissionType = isSecretary
    ? "EDIT_ANALYSES"
    : "EDIT_ANALYSES_AND_CROPS";

  const refresh = async () => {
    if (!user || (!isResident && !isConsultant && !isSecretary)) return;

    setLoading(true);
    try {
      const approvedProperties = await propertyAccessRequestService.getMyApprovedProperties();
      setProperties(approvedProperties ?? []);

      const allRequests = await Promise.all(
        (approvedProperties ?? []).map(async (property) => {
          const propertyRequests = await getPlotAccessRequests({ propertyId: property.id });
          return propertyRequests.map(normalizeRequest);
        })
      );

      setRequests(allRequests.flat().filter((r) => r.requesterId === user.id));
    } catch {
      toaster.create({
        title: "Erro",
        description: "Falha ao carregar solicitações de autorização.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSelectedProperty(null);
    setPlots([]);
    void refresh();
  }, [roleMode, user?.id]);

  const loadPlots = async (propertyId: number) => {
    try {
      const data = await getPlotsByProperty(propertyId);
      setPlots(data ?? []);
    } catch {
      toaster.create({
        title: "Erro",
        description: "Falha ao carregar talhões da propriedade.",
        type: "error",
      });
    }
  };

  const residentPropertyStatus = (propertyId: number): AccessCardStatus => {
    const byProperty = requests.filter((r) => r.propertyId === propertyId && !r.plotId);
    return requestStatus(byProperty);
  };

  const plotStatus = (propertyId: number, plotId: number): AccessCardStatus => {
    const byPlot = requests.filter((r) => r.propertyId === propertyId && r.plotId === plotId);
    return requestStatus(byPlot);
  };

  const requestForProperty = async (propertyId: number) => {
    await requestPlotAccess({ propertyId, plotId: null, permissionType: "EDIT_ANALYSES_AND_CROPS" });
  };

  const requestForPlot = async (propertyId: number, plotId: number) => {
    await requestPlotAccess({ propertyId, plotId, permissionType });
  };

  const revokeByStatus = async (propertyId: number, status: AccessCardStatus, plotId?: number) => {
    const found = requests.find((r) => {
      const statusMatch = status === "APPROVED" ? r.status === "APPROVED" : r.status === "PENDING";
      return r.propertyId === propertyId && (plotId ? r.plotId === plotId : !r.plotId) && statusMatch;
    });

    if (!found) return;
    await revokePlotAccessRequest(found.id);
  };

  const submitAction = async (action: () => Promise<void>) => {
    try {
      await action();
      toaster.create({
        title: "Sucesso",
        description: "Operação concluída com sucesso.",
        type: "success",
      });
      await refresh();
    } catch {
      toaster.create({
        title: "Erro",
        description: "Não foi possível concluir a operação.",
        type: "error",
      });
    }
  };

  if (!isResident && !isConsultant && !isSecretary) {
    return <Text>Seu cargo não possui essa funcionalidade no sistema!</Text>;
  }

  return (
    <VStack
      align="stretch"
      gap={5}
      maxW="1100px"
      mx="auto"
      p={{ base: 4, md: 6 }}
      borderWidth="1px"
      borderColor="gray.600"
      borderRadius="lg"
      bg="blackAlpha.600"
      color="gray.100"
      boxShadow="md"
    >
      <Button
        alignSelf="flex-start"
        variant="outline"
        colorPalette="gray"
        color="gray.100"
        borderColor="gray.500"
        _hover={{ bg: "whiteAlpha.200" }}
        onClick={() => navigate("/fertintelligence/home")}
      >
        Voltar para o painel
      </Button>
      <Heading size="md">Fazer solicitação</Heading>
      {loading ? (
        <Flex justify="center" align="center" py={8} role="status" aria-live="polite">
          <Spinner color="gray.100" />
          <Text srOnly>Carregando solicitações</Text>
        </Flex>
      ) : (
        <>
          <Text fontSize="sm" color="gray.300">
            Selecione as permissões a solicitar ao gerente para os recursos internos da propriedade.
          </Text>

          <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={4}>
            {properties.map((property) => {
              const status = residentPropertyStatus(property.id);
              const isSelected = selectedProperty?.id === property.id;
              const presentation = getAccessStatusPresentation(status);
              return (
                <Box
                  key={property.id}
                  p={4}
                  borderWidth="1px"
                  borderLeftWidth={isResident ? "4px" : "1px"}
                  borderLeftColor={isResident ? presentation.borderColor : undefined}
                  borderRadius="lg"
                  bg={isSelected ? "gray.600" : "gray.700"}
                  borderColor={isSelected ? "blue.400" : "gray.600"}
                  color="gray.100"
                  cursor="pointer"
                  minH="132px"
                  transition="background 0.2s, border-color 0.2s, transform 0.2s"
                  _hover={{ bg: "gray.600", borderColor: isSelected ? "blue.300" : "gray.500" }}
                  _focusVisible={{ outline: "2px solid", outlineColor: "blue.300", outlineOffset: "2px" }}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  onClick={async () => {
                    setSelectedProperty(property);
                    if (!isResident) await loadPlots(property.id);
                  }}
                  onKeyDown={async (event) => {
                    if (event.target !== event.currentTarget) return;
                    if (event.key !== "Enter" && event.key !== " ") return;
                    event.preventDefault();
                    setSelectedProperty(property);
                    if (!isResident) await loadPlots(property.id);
                  }}
                >
                  <Text fontWeight="bold" color="gray.50">{property.nome}</Text>
                  <Flex mt={3} gap={2} wrap="wrap">
                    {isResident && <AccessStatusBadge status={status} />}
                    {isSelected && <Badge colorPalette="blue" variant="subtle">Selecionada</Badge>}
                  </Flex>

                  {isResident && isSelected && (
                    <Flex mt={4}>
                      {status === "APPROVED" && (
                        <Button size="sm" colorPalette="red" variant="outline" onClick={() => submitAction(() => revokeByStatus(property.id, "APPROVED"))}>
                          Renunciar acesso
                        </Button>
                      )}
                      {status === "PENDING" && (
                        <Button size="sm" colorPalette="orange" variant="outline" onClick={() => submitAction(() => revokeByStatus(property.id, "PENDING"))}>
                          Cancelar pedido de acesso
                        </Button>
                      )}
                      {(status === "NONE" || status === "REJECTED") && (
                        <Button size="sm" colorPalette="green" onClick={() => submitAction(() => requestForProperty(property.id))}>
                          Pedir acesso ao gerente
                        </Button>
                      )}
                    </Flex>
                  )}
                </Box>
              );
            })}
          </SimpleGrid>
          {properties.length === 0 && (
            <Text color="gray.300" role="status">
              Nenhuma propriedade aprovada disponível.
            </Text>
          )}

          {!isResident && selectedProperty && (
            <Box borderWidth="1px" borderColor="gray.600" borderRadius="lg" p={{ base: 3, md: 4 }} bg="blackAlpha.300">
              <Heading size="sm" mb={3}>
                Talhões de {selectedProperty.nome}
              </Heading>
              <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={4}>
                {plots.map((plot) => {
                  const status = plotStatus(selectedProperty.id, plot.id);
                  const presentation = getAccessStatusPresentation(status);
                  return (
                    <Box
                      key={plot.id}
                      p={4}
                      borderWidth="1px"
                      borderLeftWidth="4px"
                      borderColor="gray.600"
                      borderLeftColor={presentation.borderColor}
                      borderRadius="lg"
                      bg="gray.700"
                      color="gray.100"
                      minW={0}
                      minH="150px"
                      display="flex"
                      flexDirection="column"
                      _hover={{ bg: "gray.600", borderColor: "gray.500", borderLeftColor: presentation.borderColor }}
                    >
                      <Text fontWeight="bold" color="gray.50">{plot.identificacao}</Text>
                      <Box mt={3}>
                        <AccessStatusBadge status={status} />
                      </Box>

                      <Flex mt="auto" pt={4}>
                        {status === "APPROVED" && (
                          <Button size="sm" w="full" colorPalette="red" variant="outline" onClick={() => submitAction(() => revokeByStatus(selectedProperty.id, "APPROVED", plot.id))}>
                            Renunciar acesso
                          </Button>
                        )}
                        {status === "PENDING" && (
                          <Button size="sm" w="full" colorPalette="orange" variant="outline" onClick={() => submitAction(() => revokeByStatus(selectedProperty.id, "PENDING", plot.id))}>
                            Cancelar pedido de acesso
                          </Button>
                        )}
                        {(status === "NONE" || status === "REJECTED") && (
                          <Button size="sm" w="full" colorPalette="green" onClick={() => submitAction(() => requestForPlot(selectedProperty.id, plot.id))}>
                            Pedir acesso ao gerente
                          </Button>
                        )}
                      </Flex>
                    </Box>
                  );
                })}
              </SimpleGrid>
              {plots.length === 0 && (
                <Text color="gray.300" role="status">
                  Nenhum talhão encontrado nesta propriedade.
                </Text>
              )}
            </Box>
          )}
        </>
      )}
    </VStack>
  );
}
