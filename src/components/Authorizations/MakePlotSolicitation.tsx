import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Box, Button, Flex, Heading, Spinner, Text, VStack } from "@chakra-ui/react";

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

type Props = {
  roleOverride?: Extract<AuthorizationRoleMode, "RESIDENT" | "CONSULTANT" | "SECRETARY">;
};

const cardColor = (status: AccessCardStatus) => {
  if (status === "APPROVED") return "green.100";
  if (status === "PENDING") return "yellow.100";
  return "red.100";
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
    <VStack align="stretch" gap={4}>
      <Button alignSelf="flex-start" variant="outline" onClick={() => navigate("/fertintelligence/home")}>
        Voltar para o painel
      </Button>
      <Heading size="md">Fazer solicitação</Heading>
      {loading ? (
        <Flex justify="center" py={8}>
          <Spinner />
        </Flex>
      ) : (
        <>
          <Text fontSize="sm" color="gray.600">
            Selecione as permissões a solicitar ao gerente para os recursos internos da propriedade.
          </Text>

          <Flex gap={3} wrap="wrap">
            {properties.map((property) => {
              const status = residentPropertyStatus(property.id);
              return (
                <Box
                  key={property.id}
                  p={4}
                  borderWidth="1px"
                  borderRadius="md"
                  bg={isResident ? cardColor(status) : "gray.50"}
                  _dark={{ bg: isResident ? cardColor(status) : "gray.700" }}
                  cursor="pointer"
                  onClick={async () => {
                    setSelectedProperty(property);
                    if (!isResident) await loadPlots(property.id);
                  }}
                >
                  <Text fontWeight="bold">{property.nome}</Text>
                  {isResident && <Badge mt={2}>{status}</Badge>}
                  {selectedProperty?.id === property.id && <Badge mt={2}>Selecionada</Badge>}

                  {isResident && selectedProperty?.id === property.id && (
                    <Flex mt={3}>
                      {status === "APPROVED" && (
                        <Button colorPalette="red" onClick={() => submitAction(() => revokeByStatus(property.id, "APPROVED"))}>
                          Renunciar acesso
                        </Button>
                      )}
                      {status === "PENDING" && (
                        <Button onClick={() => submitAction(() => revokeByStatus(property.id, "PENDING"))}>
                          Cancelar pedido de acesso
                        </Button>
                      )}
                      {status === "NONE" && (
                        <Button colorPalette="green" onClick={() => submitAction(() => requestForProperty(property.id))}>
                          Pedir acesso ao gerente
                        </Button>
                      )}
                    </Flex>
                  )}
                </Box>
              );
            })}
          </Flex>

          {!isResident && selectedProperty && (
            <Box borderWidth="1px" borderRadius="md" p={4}>
              <Heading size="sm" mb={3}>
                Talhões de {selectedProperty.nome}
              </Heading>
              <Flex gap={3} wrap="wrap">
                {plots.map((plot) => {
                  const status = plotStatus(selectedProperty.id, plot.id);
                  return (
                    <Box key={plot.id} p={3} borderWidth="1px" borderRadius="md" bg={cardColor(status)} minW="220px">
                      <Text fontWeight="bold">{plot.identificacao}</Text>
                      <Badge mt={2}>{status}</Badge>

                      <Flex mt={3}>
                        {status === "APPROVED" && (
                          <Button colorPalette="red" onClick={() => submitAction(() => revokeByStatus(selectedProperty.id, "APPROVED", plot.id))}>
                            Renunciar acesso
                          </Button>
                        )}
                        {status === "PENDING" && (
                          <Button onClick={() => submitAction(() => revokeByStatus(selectedProperty.id, "PENDING", plot.id))}>
                            Cancelar pedido de acesso
                          </Button>
                        )}
                        {status === "NONE" && (
                          <Button colorPalette="green" onClick={() => submitAction(() => requestForPlot(selectedProperty.id, plot.id))}>
                            Pedir acesso ao gerente
                          </Button>
                        )}
                      </Flex>
                    </Box>
                  );
                })}
              </Flex>
            </Box>
          )}
        </>
      )}
    </VStack>
  );
}