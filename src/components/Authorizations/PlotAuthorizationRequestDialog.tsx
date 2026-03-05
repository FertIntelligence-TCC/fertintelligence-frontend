import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Text,
  VStack,
  HStack,
  Badge,
  Spinner,
} from "@chakra-ui/react";

import DialogContainer from "@/components/Property/DialogContainer";
import { toaster } from "@/components/ui/toaster";

import { propertyAccessRequestService } from "@/services/propertyAccessRequestService";
import { getPlotsByProperty } from "@/services/plotService";
import { requestPlotAccess } from "@/services/plotAccessRequestService";

import { useUserStore } from "@/stores/user/user.store";
import type { PropertyResponse } from "@/interfaces/Property";
import type { PlotResponse } from "@/interfaces/Plot";
import type { PermissionType } from "@/interfaces/PlotAccessRequest";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

type RoleMode = "RESIDENT" | "CONSULTANT" | "SECRETARY" | "OTHER";

const normalize = (v?: string) =>
  (v ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "")
    .toUpperCase();

function getRoleMode(cargo?: string): RoleMode {
  const c = normalize(cargo);
  if (c === "AGRONOMO_RESIDENTE") return "RESIDENT";
  if (c === "AGRONOMO_CONSULTOR") return "CONSULTANT";
  if (c === "SECRETARIO") return "SECRETARY";
  return "OTHER";
}

export default function PlotAuthorizationRequestDialog({ isOpen, onClose }: Props) {
  const { user } = useUserStore();
  const mode = useMemo(() => getRoleMode(user?.cargo as any), [user?.cargo]);

  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<PropertyResponse | null>(null);
  const [loadingProps, setLoadingProps] = useState(false);

  const [plots, setPlots] = useState<PlotResponse[]>([]);
  const [loadingPlots, setLoadingPlots] = useState(false);

  const [plotSearch, setPlotSearch] = useState("");

  const permissionType: PermissionType = useMemo(
    () => (mode === "SECRETARY" ? "EDIT_ANALYSES" : "EDIT_ANALYSES_AND_CROPS"),
    [mode]
  );

  const filteredPlots = useMemo(() => {
    const q = plotSearch.trim().toLowerCase();
    if (!q) return plots;
    return plots.filter((p) => (p.identificacao ?? "").toLowerCase().includes(q));
  }, [plots, plotSearch]);

  const resetDialog = useCallback(() => {
    setSelectedProperty(null);
    setPlots([]);
    setPlotSearch("");
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    resetDialog();

    if (mode === "OTHER") return;

    (async () => {
      setLoadingProps(true);
      try {
        const data = await propertyAccessRequestService.getMyApprovedProperties();
        setProperties(data ?? []);
      } catch {
        toaster.create({
          title: "Erro",
          description: "Falha ao carregar suas propriedades aprovadas.",
          type: "error",
        });
      } finally {
        setLoadingProps(false);
      }
    })();
  }, [isOpen, mode, resetDialog]);

  const loadPlots = useCallback(
    async (propertyId: number) => {
      setLoadingPlots(true);
      try {
        const data = await getPlotsByProperty(propertyId);
        setPlots(data ?? []);
      } catch {
        toaster.create({
          title: "Erro",
          description: "Falha ao carregar talhões da propriedade selecionada.",
          type: "error",
        });
      } finally {
        setLoadingPlots(false);
      }
    },
    []
  );

  const selectProperty = useCallback(
    async (p: PropertyResponse) => {
      setSelectedProperty(p);
      setPlots([]);
      setPlotSearch("");

      if (mode === "RESIDENT") return; // residente pede acesso global (não precisa listar plots)
      await loadPlots(p.id);
    },
    [mode, loadPlots]
  );

  const requestResidentAllPlots = useCallback(async () => {
    if (!selectedProperty) return;

    try {
      await requestPlotAccess({
        propertyId: selectedProperty.id,
        plotId: null,
        permissionType: "EDIT_ANALYSES_AND_CROPS",
      });

      toaster.create({
        title: "Solicitação enviada",
        description: "Pedido de acesso a todos os talhões enviado ao gerente.",
        type: "success",
      });

      onClose();
    } catch (e: any) {
      toaster.create({
        title: "Erro ao solicitar",
        description: e?.message ?? "Não foi possível enviar a solicitação.",
        type: "error",
      });
    }
  }, [selectedProperty, onClose]);

  const requestSinglePlot = useCallback(
    async (plot: PlotResponse) => {
      if (!selectedProperty) return;

      try {
        await requestPlotAccess({
          propertyId: selectedProperty.id,
          plotId: plot.id,
          permissionType,
        });

        toaster.create({
          title: "Solicitação enviada",
          description: `Pedido enviado para ${plot.identificacao ?? `Talhão ${plot.id}`}.`,
          type: "success",
        });
      } catch (e: any) {
        toaster.create({
          title: "Erro ao solicitar",
          description: e?.message ?? "Não foi possível enviar a solicitação.",
          type: "error",
        });
      }
    },
    [selectedProperty, permissionType]
  );

  const isBusy = loadingProps || loadingPlots;

  return (
    <DialogContainer isOpen={isOpen} onClose={onClose} title="Fazer solicitação">
      {mode === "OTHER" ? (
        <Text>Seu cargo não possui essa funcionalidade no sistema!</Text>
      ) : (
        <VStack align="stretch" gap={4}>
          <Box>
            <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }}>
              Selecione uma propriedade para solicitar permissão ao gerente.
            </Text>
          </Box>

          {/* CARDS DE PROPRIEDADES */}
          {loadingProps ? (
            <Flex justify="center" py={4}>
              <Spinner />
            </Flex>
          ) : (
            <Flex gap={3} wrap="wrap">
              {properties.map((p) => (
                <Box
                  key={p.id}
                  p={3}
                  borderWidth="1px"
                  borderRadius="md"
                  cursor="pointer"
                  _hover={{ opacity: 0.9 }}
                  onClick={() => selectProperty(p)}
                  borderColor={selectedProperty?.id === p.id ? "green.400" : "gray.200"}
                >
                  <Heading size="sm">{p.nome}</Heading>
                  <Text fontSize="xs" opacity={0.8}>
                    ID {p.id}
                  </Text>
                  {selectedProperty?.id === p.id && (
                    <Badge mt={2} colorScheme="green">
                      Selecionada
                    </Badge>
                  )}
                </Box>
              ))}

              {properties.length === 0 && (
                <Text color="gray.500">
                  Você ainda não participa de nenhuma propriedade aprovada.
                </Text>
              )}
            </Flex>
          )}

          {/* RESIDENTE: botão único */}
          {mode === "RESIDENT" && selectedProperty && (
            <Box p={3} borderWidth="1px" borderRadius="md">
              <Text>
                <b>Tipo:</b> Pedido de acesso a todos os talhões
              </Text>
              <Text fontSize="sm" opacity={0.8} mt={1}>
                Permite editar análises e culturas em todos os talhões após aprovação.
              </Text>
              <Button mt={3} colorScheme="green" onClick={requestResidentAllPlots} isDisabled={isBusy}>
                Pedir acesso aos talhões
              </Button>
            </Box>
          )}

          {/* CONSULTOR/SECRETÁRIO: busca por talhão */}
          {(mode === "CONSULTANT" || mode === "SECRETARY") && selectedProperty && (
            <Box p={3} borderWidth="1px" borderRadius="md">
              <HStack justify="space-between" mb={2} flexWrap="wrap">
                <Text>
                  <b>Tipo:</b>{" "}
                  {permissionType === "EDIT_ANALYSES" ? "Editar análises" : "Editar análises e culturas"}
                </Text>
                <Badge colorScheme={mode === "SECRETARY" ? "purple" : "blue"}>
                  {mode === "SECRETARY" ? "SECRETÁRIO" : "AGRONÔMO CONSULTOR"}
                </Badge>
              </HStack>

              <Input
                placeholder="Buscar identificação do talhão..."
                value={plotSearch}
                onChange={(e) => setPlotSearch(e.target.value)}
                isDisabled={loadingPlots}
              />

              {loadingPlots ? (
                <Flex justify="center" py={4}>
                  <Spinner />
                </Flex>
              ) : (
                <VStack align="stretch" mt={3} maxH="240px" overflowY="auto">
                  {filteredPlots.map((pl) => (
                    <Flex
                      key={pl.id}
                      p={2}
                      borderWidth="1px"
                      borderRadius="md"
                      justify="space-between"
                      align="center"
                      gap={3}
                    >
                      <Box>
                        <Text fontWeight="bold">{pl.identificacao ?? `Talhão ${pl.id}`}</Text>
                        <Text fontSize="xs" opacity={0.8}>
                          ID {pl.id}
                        </Text>
                      </Box>
                      <Button
                        colorScheme="green"
                        onClick={() => requestSinglePlot(pl)}
                        isDisabled={isBusy}
                      >
                        Pedir acesso
                      </Button>
                    </Flex>
                  ))}

                  {filteredPlots.length === 0 && (
                    <Text color="gray.500" textAlign="center">
                      Nenhum talhão encontrado.
                    </Text>
                  )}
                </VStack>
              )}
            </Box>
          )}

          <Flex justify="flex-end">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </Flex>
        </VStack>
      )}
    </DialogContainer>
  );
}