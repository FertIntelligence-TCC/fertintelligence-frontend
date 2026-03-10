import { useEffect, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";

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
import type {
  AccessCardStatus,
  AuthorizationRoleMode,
  NormalizedPlotPermission,
} from "@/interfaces/Authorization";
import { getAuthorizationRoleMode } from "@/interfaces/Authorization";
import type { PermissionType } from "@/interfaces/PlotAccessRequest";

type Props = {
  roleOverride?: Extract<
    AuthorizationRoleMode,
    "RESIDENT" | "CONSULTANT" | "SECRETARY"
  >;
};

// Define os detalhes visuais com base no status (sem quebrar o contraste)
const getStatusConfig = (status: AccessCardStatus) => {
  switch (status) {
    case "APPROVED":
      return {
        colorPalette: "green",
        text: "Aprovado",
        borderLight: "green.500",
        borderDark: "green.400",
      };
    case "PENDING":
      return {
        colorPalette: "orange",
        text: "Pendente",
        borderLight: "orange.400",
        borderDark: "orange.300",
      };
    default:
      return {
        colorPalette: "gray",
        text: "Sem acesso",
        borderLight: "gray.300",
        borderDark: "gray.600",
      };
  }
};

const normalizeRequest = (item: any): NormalizedPlotPermission => ({
  id: item.id,
  propertyId: Number(item.propertyId ?? item.id_propriedade ?? 0),
  plotId: item.plotId ?? item.id_talhao ?? null,
  requesterId: Number(item.requesterId ?? item.id_solicitante ?? 0),
  status: item.status,
  permissionType: item.permissionType ?? item.tipo_permissao,
});

export default function MakePlotSolicitations({ roleOverride }: Props) {
  const { user } = useUserStore();
  const rawMode = getAuthorizationRoleMode(user?.cargo);
  const mode = roleOverride ?? rawMode;

  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [selectedProperty, setSelectedProperty] =
    useState<PropertyResponse | null>(null);
  const [loadingProps, setLoadingProps] = useState(false);

  const [plots, setPlots] = useState<PlotResponse[]>([]);
  const [loadingPlots, setLoadingPlots] = useState(false);

  const [requests, setRequests] = useState<NormalizedPlotPermission[]>([]);
  const [loadingReqs, setLoadingReqs] = useState(false);

  const permissionType: PermissionType =
    mode === "SECRETARY" ? "EDIT_ANALYSES" : "EDIT_ANALYSES_AND_CROPS";

  useEffect(() => {
    if (
      mode === "OTHER" ||
      mode === "OWNER" ||
      mode === "MANAGER" ||
      mode === "SUPERVISOR"
    )
      return;

    (async () => {
      setLoadingProps(true);
      try {
        const data =
          await propertyAccessRequestService.getMyApprovedProperties();
        setProperties(data ?? []);
      } catch {
        toaster.create({
          title: "Erro",
          description: "Falha ao carregar propriedades.",
          type: "error",
        });
      } finally {
        setLoadingProps(false);
      }
    })();
  }, [mode]);

  const loadPlotsAndReqs = async (propId: number) => {
    setLoadingPlots(true);
    setLoadingReqs(true);
    try {
      if (mode !== "RESIDENT") {
        const pData = await getPlotsByProperty(propId);
        setPlots(pData ?? []);
      }
      const rData = await getPlotAccessRequests({ propertyId: propId });
      setRequests((rData ?? []).map(normalizeRequest));
    } catch {
      toaster.create({
        title: "Erro",
        description: "Falha ao carregar dados.",
        type: "error",
      });
    } finally {
      setLoadingPlots(false);
      setLoadingReqs(false);
    }
  };

  const handleSelectProperty = (p: PropertyResponse) => {
    setSelectedProperty(p);
    setPlots([]);
    setRequests([]);
    loadPlotsAndReqs(p.id);
  };

  const globalStatus: AccessCardStatus = (() => {
    if (!selectedProperty || mode !== "RESIDENT") return "NONE";
    const req = requests.find((r) => r.plotId === null);
    if (!req) return "NONE";
    return req.status === "APPROVED" ? "APPROVED" : "PENDING";
  })();

  const plotStatus = (propId: number, plotId: number): AccessCardStatus => {
    const req = requests.find(
      (r) => r.propertyId === propId && r.plotId === plotId
    );
    if (!req) return "NONE";
    return req.status === "APPROVED" ? "APPROVED" : "PENDING";
  };

  const submitAction = async (action: () => Promise<any>) => {
    if (!selectedProperty) return;
    setLoadingReqs(true);
    try {
      await action();
      const rData = await getPlotAccessRequests({
        propertyId: selectedProperty.id,
      });
      setRequests((rData ?? []).map(normalizeRequest));
      toaster.create({
        title: "Sucesso",
        description: "Ação realizada.",
        type: "success",
      });
    } catch (e: any) {
      toaster.create({
        title: "Erro",
        description: e?.message ?? "Falha na ação.",
        type: "error",
      });
    } finally {
      setLoadingReqs(false);
    }
  };

  const requestForPlot = (propId: number, plotId: number | null) =>
    requestPlotAccess({ propertyId: propId, plotId, permissionType });

  const revokeByStatus = async (
    propId: number,
    status: "PENDING" | "APPROVED",
    plotId: number | null
  ) => {
    const req = requests.find(
      (r) =>
        r.propertyId === propId && r.plotId === plotId && r.status === status
    );
    if (!req) throw new Error("Solicitação não encontrada.");
    return revokePlotAccessRequest(req.id);
  };

  if (
    mode === "OTHER" ||
    mode === "OWNER" ||
    mode === "MANAGER" ||
    mode === "SUPERVISOR"
  ) {
    return <Text>Seu cargo não possui essa funcionalidade.</Text>;
  }

  return (
    <VStack align="stretch" gap={6}>
      <Box>
        <Heading size="md" mb={4}>
          1. Selecione a Propriedade
        </Heading>
        {loadingProps ? (
          <Spinner />
        ) : (
          <Flex gap={3} wrap="wrap">
            {properties.map((p) => {
              const isSelected = selectedProperty?.id === p.id;
              return (
                <Box
                  key={p.id}
                  p={4}
                  borderWidth="1px"
                  borderRadius="md"
                  cursor="pointer"
                  bg={isSelected ? "blue.50" : "white"}
                  borderColor={isSelected ? "blue.500" : "gray.200"}
                  _dark={{
                    bg: isSelected ? "blue.900" : "gray.800",
                    borderColor: isSelected ? "blue.400" : "gray.700",
                  }}
                  shadow="sm"
                  transition="all 0.2s"
                  _hover={{ shadow: "md", borderColor: "blue.400" }}
                  onClick={() => handleSelectProperty(p)}
                >
                  <Text fontWeight="bold">{p.nome}</Text>
                  <Text
                    fontSize="sm"
                    color="gray.600"
                    _dark={{ color: "gray.400" }}
                  >
                    ID: {p.id}
                  </Text>
                </Box>
              );
            })}
            {properties.length === 0 && (
              <Text color="gray.500">Nenhuma propriedade aprovada.</Text>
            )}
          </Flex>
        )}
      </Box>

      {selectedProperty && (
        <Box position="relative">
          {/* Overlay de loading para proteger os botões enquanto atualiza */}
          {loadingPlots && (
            <Flex
              position="absolute"
              inset={0}
              bg="whiteAlpha.700"
              _dark={{ bg: "blackAlpha.600" }}
              zIndex={10}
              justify="center"
              align="center"
              borderRadius="md"
            >
              <Spinner size="lg" />
            </Flex>
          )}

          {/* RESIDENTE: Pedido Global */}
          {mode === "RESIDENT" &&
            (() => {
              const config = getStatusConfig(globalStatus);
              return (
                <Box
                  p={5}
                  borderWidth="1px"
                  borderLeftWidth="4px"
                  borderLeftColor={config.borderLight}
                  borderRadius="md"
                  bg="white"
                  _dark={{
                    bg: "gray.800",
                    borderColor: "gray.700",
                    borderLeftColor: config.borderDark,
                  }}
                  shadow="sm"
                >
                  <Flex
                    justify="space-between"
                    align="center"
                    wrap="wrap"
                    gap={4}
                  >
                    <Box>
                      <Text fontWeight="bold" fontSize="lg">
                        Acesso Global (Todos os Talhões)
                      </Text>
                      <Badge
                        colorPalette={config.colorPalette}
                        mt={2}
                        size="md"
                      >
                        {config.text}
                      </Badge>
                    </Box>
                    <Flex gap={3}>
                      {globalStatus === "APPROVED" && (
                        <Button
                          colorPalette="red"
                          variant="outline"
                          onClick={() =>
                            submitAction(() =>
                              revokeByStatus(
                                selectedProperty.id,
                                "APPROVED",
                                null
                              )
                            )
                          }
                          loading={loadingReqs}
                        >
                          Renunciar acesso
                        </Button>
                      )}
                      {globalStatus === "PENDING" && (
                        <Button
                          colorPalette="orange"
                          variant="outline"
                          onClick={() =>
                            submitAction(() =>
                              revokeByStatus(
                                selectedProperty.id,
                                "PENDING",
                                null
                              )
                            )
                          }
                          loading={loadingReqs}
                        >
                          Cancelar pedido
                        </Button>
                      )}
                      {globalStatus === "NONE" && (
                        <Button
                          colorPalette="green"
                          onClick={() =>
                            submitAction(() =>
                              requestForPlot(selectedProperty.id, null)
                            )
                          }
                          loading={loadingReqs}
                        >
                          Pedir acesso ao gerente
                        </Button>
                      )}
                    </Flex>
                  </Flex>
                </Box>
              );
            })()}

          {/* CONSULTOR/SECRETÁRIO: Pedidos por Talhão */}
          {(mode === "CONSULTANT" || mode === "SECRETARY") && (
            <Box>
              <Heading size="md" mb={4}>
                2. Solicitações por Talhão
              </Heading>
              <Flex gap={4} wrap="wrap">
                {plots.map((plot) => {
                  const status = plotStatus(selectedProperty.id, plot.id);
                  const config = getStatusConfig(status);
                  return (
                    <Box
                      key={plot.id}
                      p={4}
                      borderWidth="1px"
                      borderLeftWidth="4px"
                      borderRadius="md"
                      bg={{ base: "white", _dark: "gray.800" }}
                      borderColor={{ base: "gray.200", _dark: "gray.700" }}
                      borderLeftColor={{
                        base: config.borderLight,
                        _dark: config.borderDark,
                      }}
                      shadow="sm"
                      minW="220px"
                      flex="1"
                      display="flex"
                      flexDirection="column"
                    >
                      <Text
                        fontWeight="bold"
                        fontSize="md"
                        color={{ base: "gray.800", _dark: "white" }}
                      >
                        {plot.identificacao}
                      </Text>
                      <Badge
                        colorPalette={config.colorPalette}
                        mt={2}
                        mb={4}
                        alignSelf="flex-start"
                      >
                        {config.text}
                      </Badge>

                      <Flex mt="auto">
                        {status === "APPROVED" && (
                          <Button
                            size="sm"
                            w="full"
                            colorPalette="red"
                            variant="outline"
                            onClick={() =>
                              submitAction(() =>
                                revokeByStatus(
                                  selectedProperty.id,
                                  "APPROVED",
                                  plot.id
                                )
                              )
                            }
                            loading={loadingReqs}
                          >
                            Renunciar acesso
                          </Button>
                        )}
                        {status === "PENDING" && (
                          <Button
                            size="sm"
                            w="full"
                            colorPalette="orange"
                            variant="outline"
                            onClick={() =>
                              submitAction(() =>
                                revokeByStatus(
                                  selectedProperty.id,
                                  "PENDING",
                                  plot.id
                                )
                              )
                            }
                            loading={loadingReqs}
                          >
                            Cancelar pedido
                          </Button>
                        )}
                        {status === "NONE" && (
                          <Button
                            size="sm"
                            w="full"
                            colorPalette="green"
                            onClick={() =>
                              submitAction(() =>
                                requestForPlot(selectedProperty.id, plot.id)
                              )
                            }
                            loading={loadingReqs}
                          >
                            Pedir acesso
                          </Button>
                        )}
                      </Flex>
                    </Box>
                  );
                })}
                {plots.length === 0 && !loadingPlots && (
                  <Text color="gray.500">
                    Nenhum talhão encontrado nesta propriedade.
                  </Text>
                )}
              </Flex>
            </Box>
          )}
        </Box>
      )}
    </VStack>
  );
}