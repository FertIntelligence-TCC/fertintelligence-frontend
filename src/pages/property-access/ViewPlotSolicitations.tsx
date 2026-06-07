// src/pages/plot-access/ViewPlotSolicitations.tsx

import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Flex, Heading, Text, Spinner, Badge, chakra } from "@chakra-ui/react";

import UserLayout from "@/components/Layouts/UserLayout";
import { toaster } from "@/components/ui/toaster";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@/components/ui/custom-tabs";

import { fetchManageableProperties } from "@/services/propertyService";
import { decidePlotAccessRequest, getPlotAccessRequests, revokePlotAccessRequest } from "@/services/plotAccessRequestService";

import { useUserStore } from "@/stores/user/user.store";
import type { PlotAccessRequestResponseDto } from "@/interfaces/PlotAccessRequest";
import type { PropertyResponse } from "@/interfaces/Property";
import { isSupremeUserCargo } from "@/interfaces/Authorization";

type Status = "PENDING" | "APPROVED" | "REVOKED";
const NativeSelect = chakra("select");

const normalize = (v?: string) =>
  (v ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "")
    .toUpperCase();

function normalizeDto(dto: PlotAccessRequestResponseDto): PlotAccessRequestResponseDto {
  return {
    ...dto,
    propertyId: dto.propertyId ?? dto.id_propriedade ?? 0,
    propertyName: dto.propertyName ?? dto.nome_propriedade ?? "",
    requesterId: dto.requesterId ?? dto.id_solicitante ?? 0,
    requesterName: dto.requesterName ?? dto.nome_solicitante ?? "",
    requesterCargo: dto.requesterCargo ?? dto.cargo_solicitante ?? "",
    plotId: dto.plotId ?? dto.id_talhao ?? 0,
    plotIdentification: dto.plotIdentification ?? dto.identificacao_talhao ?? "",
    scope: (dto.scope ?? (dto as any).Escopo) as any,
    permissionType: (dto.permissionType ?? dto.tipo_permissao) as any,
  };
}

function isPropertyScope(req: PlotAccessRequestResponseDto) {
  const s = (req.scope as any) ?? (req as any).Escopo;
  if (s === "PROPERTY") return true;
  return !req.plotId;
}

function plotLabel(req: PlotAccessRequestResponseDto) {
  if (isPropertyScope(req)) return "Todos os talhões";
  return req.plotIdentification || `Talhão ${req.plotId}`;
}

function statusColor(status: Status) {
  if (status === "PENDING") return "yellow";
  if (status === "APPROVED") return "green";
  return "orange";
}

function RequestCard(props: {
  req: PlotAccessRequestResponseDto;
  mode: "DECIDE" | "REVOKE";
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
  onRevoke?: (id: number) => void;
}) {
  const { req, mode, onApprove, onReject, onRevoke } = props;

  const status = (req.status as Status) ?? "PENDING";
  const color = statusColor(status);

  return (
    <Box p={4} borderWidth="1px" borderRadius="md">
      <Flex justify="space-between" align="center" gap={4} flexWrap="wrap">
        <Box>
          <Text fontWeight="bold" fontSize="lg">
            {req.requesterName}
          </Text>

          <Flex gap={2} align="center" mt={1} flexWrap="wrap">
            <Badge colorPalette="purple">{req.requesterCargo}</Badge>
            <Badge colorPalette="blue">{plotLabel(req)}</Badge>
            <Badge colorPalette={color}>{status}</Badge>
          </Flex>

          {isPropertyScope(req) && (
            <Text fontSize="xs" opacity={0.8} mt={2}>
              Pedido de acesso a todos os talhões
            </Text>
          )}
        </Box>

        {mode === "DECIDE" ? (
          <Flex gap={3}>
            <Button colorPalette="green" onClick={() => onApprove?.(req.id)}>
              Aceitar
            </Button>
            <Button colorPalette="red" variant="outline" onClick={() => onReject?.(req.id)}>
              Recusar
            </Button>
          </Flex>
        ) : (
          <Button colorPalette="red" onClick={() => onRevoke?.(req.id)}>
            Revogar permissão
          </Button>
        )}
      </Flex>
    </Box>
  );
}

export default function ViewPlotSolicitations() {
  const navigate = useNavigate();
  const { user } = useUserStore();

  const canManage = useMemo(() => {
    const c = normalize(user?.cargo as any);
    return isSupremeUserCargo(user?.cargo) || c === "GERENTE" || c === "PROPRIETARIO";
  }, [user?.cargo]);

  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | "">("");

  const [requests, setRequests] = useState<PlotAccessRequestResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedPlotId, setSelectedPlotId] = useState<number | "">("");

  useEffect(() => {
    if (!user) return;
    if (!canManage) {
      toaster.create({
        title: "Atenção",
        description: "Seu cargo não possui essa funcionalidade no sistema!",
        type: "error",
      });
    }
  }, [user, canManage]);

  useEffect(() => {
    if (!user || !canManage) return;

    (async () => {
      try {
        const data = await fetchManageableProperties();
        setProperties(data ?? []);
        if ((data ?? []).length > 0) setSelectedPropertyId((data ?? [])[0].id);
      } catch {
        toaster.create({
          title: "Erro",
          description: "Falha ao carregar as propriedades gerenciáveis.",
          type: "error",
        });
      }
    })();
  }, [user, canManage]);

  const fetchRequests = useCallback(async (propertyId: number) => {
    setIsLoading(true);
    try {
      const data = await getPlotAccessRequests({ propertyId });
      setRequests((data ?? []).map(normalizeDto));
    } catch {
      toaster.create({
        title: "Erro",
        description: "Falha ao carregar as solicitações de talhão.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!canManage) return;

    if (!selectedPropertyId) {
      setRequests([]);
      setSelectedPlotId("");
      return;
    }

    void fetchRequests(Number(selectedPropertyId));
    setSelectedPlotId("");
  }, [selectedPropertyId, canManage, fetchRequests]);

  const plotsForFilter = useMemo(() => {
    const map = new Map<number, string>();
    for (const r of requests) {
      if (isPropertyScope(r)) continue;
      if (r.plotId && !map.has(r.plotId)) {
        map.set(r.plotId, r.plotIdentification || `Talhão ${r.plotId}`);
      }
    }
    return Array.from(map.entries()).map(([id, identification]) => ({ id, identification }));
  }, [requests]);

  const filteredByPlot = useMemo(() => {
    if (!selectedPlotId) return requests;
    return requests.filter((r) => !isPropertyScope(r) && r.plotId === Number(selectedPlotId));
  }, [requests, selectedPlotId]);

  const pending = useMemo(
    () => filteredByPlot.filter((r) => r.status === "PENDING"),
    [filteredByPlot]
  );

  const approved = useMemo(
    () => filteredByPlot.filter((r) => r.status === "APPROVED"),
    [filteredByPlot]
  );

  const refresh = useCallback(async () => {
    if (!selectedPropertyId) return;
    await fetchRequests(Number(selectedPropertyId));
  }, [selectedPropertyId, fetchRequests]);

  const handleDecide = useCallback(
    async (requestId: number, approve: boolean) => {
      try {
        await decidePlotAccessRequest({ requestId, approve });
        toaster.create({
          title: "Sucesso",
          description: approve ? "Solicitação aceita." : "Solicitação recusada.",
          type: approve ? "success" : "info",
        });
        await refresh();
      } catch {
        toaster.create({
          title: "Erro",
          description: "Ocorreu um erro ao decidir a solicitação.",
          type: "error",
        });
      }
    },
    [refresh]
  );

  const handleRevoke = useCallback(
    async (requestId: number) => {
      try {
        await revokePlotAccessRequest(requestId);
        toaster.create({
          title: "Sucesso",
          description: "Permissão revogada com sucesso.",
          type: "info",
        });
        await refresh();
      } catch {
        toaster.create({
          title: "Erro",
          description: "Ocorreu um erro ao revogar a permissão.",
          type: "error",
        });
      }
    },
    [refresh]
  );

  if (!user) {
    return (
      <UserLayout>
        <Box p={8} maxW="5xl" mx="auto" mt={8}>
          <Text>Carregando usuário...</Text>
        </Box>
      </UserLayout>
    );
  }

  if (!canManage) {
    return (
      <UserLayout>
        <Box p={8} maxW="5xl" mx="auto" mt={8}>
          <Heading mb={2}>Acesso negado</Heading>
          <Text>Seu cargo não possui essa funcionalidade no sistema!</Text>
        </Box>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <Box p={8} maxW="5xl" mx="auto" mt={8}>
        <Button variant="outline" mb={4} onClick={() => navigate("/fertintelligence/home")}>
          Voltar para o painel
        </Button>
        <Heading mb={6}>Solicitações de Acesso aos Talhões</Heading>

        {/* Seleção de Propriedade */}
        <Box mb={4} bg="white" _dark={{ bg: "gray.800" }} p={4} borderRadius="md" boxShadow="sm">
          <Text mb={2} fontWeight="bold">
            Selecione a Propriedade:
          </Text>

          <NativeSelect
            w="full"
            p={2}
            borderWidth="1px"
            borderRadius="md"
            borderColor="gray.200"
            _dark={{ borderColor: "gray.600", bg: "gray.700" }}
            value={selectedPropertyId}
            onChange={(e: any) => {
              const v = e.target.value;
              setSelectedPropertyId(v ? Number(v) : "");
            }}
          >
            <option value="" disabled>
              Escolha uma propriedade
            </option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </NativeSelect>
        </Box>

        {/* Filtro por talhão (opcional) */}
        <Box mb={8} bg="white" _dark={{ bg: "gray.800" }} p={4} borderRadius="md" boxShadow="sm">
          <Text mb={2} fontWeight="bold">
            Filtrar por Talhão (opcional):
          </Text>

          <NativeSelect
            w="full"
            p={2}
            borderWidth="1px"
            borderRadius="md"
            borderColor="gray.200"
            _dark={{ borderColor: "gray.600", bg: "gray.700" }}
            value={selectedPlotId}
            onChange={(e: any) => {
              const v = e.target.value;
              setSelectedPlotId(v ? Number(v) : "");
            }}
            disabled={!selectedPropertyId || plotsForFilter.length === 0}
          >
            <option value="">Todos os talhões</option>
            {plotsForFilter.map((p) => (
              <option key={p.id} value={p.id}>
                {p.identification}
              </option>
            ))}
          </NativeSelect>

          <Text fontSize="xs" opacity={0.8} mt={2}>
            Obs: pedidos “Todos os talhões” (escopo PROPERTY) não entram nesse filtro.
          </Text>
        </Box>

        <Box bg="white" _dark={{ bg: "gray.800" }} p={6} borderRadius="lg" boxShadow="md">
          {isLoading ? (
            <Flex justify="center" align="center" py={10}>
              <Spinner size="xl" />
            </Flex>
          ) : !selectedPropertyId ? (
            <Text textAlign="center" color="gray.500">
              Por favor, selecione uma propriedade acima.
            </Text>
          ) : (
            <Tabs colorScheme="green">
              <TabList>
                <Tab>Pendentes ({pending.length})</Tab>
                <Tab>Aceitas ({approved.length})</Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
                  {pending.length === 0 ? (
                    <Text color="gray.500" mt={4}>
                      Não existem solicitações pendentes.
                    </Text>
                  ) : (
                    <Flex direction="column" gap={4} mt={4}>
                      {pending.map((req) => (
                        <RequestCard
                          key={req.id}
                          req={req}
                          mode="DECIDE"
                          onApprove={(id) => handleDecide(id, true)}
                          onReject={(id) => handleDecide(id, false)}
                        />
                      ))}
                    </Flex>
                  )}
                </TabPanel>

                <TabPanel>
                  {approved.length === 0 ? (
                    <Text color="gray.500" mt={4}>
                      Não há permissões aceitas.
                    </Text>
                  ) : (
                    <Flex direction="column" gap={4} mt={4}>
                      {approved.map((req) => (
                        <RequestCard
                          key={req.id}
                          req={req}
                          mode="REVOKE"
                          onRevoke={handleRevoke}
                        />
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
