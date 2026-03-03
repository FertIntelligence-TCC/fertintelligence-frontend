import {
    Badge,
    Box,
    Button,
    Flex,
    Heading,
    HStack,
    Spinner,
    Text,
    VStack,
    Separator,
  } from "@chakra-ui/react";
  import { useMemo, useState } from "react";
  import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
  
  import DialogContainer from "@/components/Property/DialogContainer";
  import { toaster } from "@/components/ui/toaster";
  
  import { propertyAccessRequestService } from "@/services/propertyAccessRequestService";
  import { PropertyAccessRequestResponse } from "@/interfaces/PropertyAccessRequest";
  import { Cargo } from "@/interfaces/User";
  
  type AuthorizationsTab = "PENDING" | "APPROVED";
  
  type Props = {
    isOpen: boolean;
    onClose: () => void;
    propertyId: number | null;
    initialTab?: AuthorizationsTab;
  };
  
  const getErrorMessage = (error: unknown): string => {
    if (typeof error === "string") return error;
  
    if (
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      (error as any).response?.data
    ) {
      const data = (error as any).response.data as { message?: string; error?: string } | string;
      if (typeof data === "string") return data;
      return data.message || data.error || "Erro desconhecido.";
    }
  
    if (error instanceof Error) return error.message;
  
    return "Erro ao conectar com o servidor.";
  };
  
  const normalize = (v?: string) =>
    (v ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "")
      .toUpperCase();
  
  const isApprovedStatus = (status: unknown) => {
    const s = normalize(String(status ?? ""));
    return s.includes("APROV") || s.includes("ACEIT") || s.includes("APPROV") || s.includes("ACCEPT");
  };
  
  const isPendingStatus = (status: unknown) => {
    const s = normalize(String(status ?? ""));
    return s.includes("PEND") || s.includes("AGUARD") || s.includes("PENDING");
  };
  
  export default function PropertyAuthorizationsDialog({
    isOpen,
    onClose,
    propertyId,
    initialTab = "PENDING",
  }: Props) {
    const queryClient = useQueryClient();
    const [tab, setTab] = useState<AuthorizationsTab>(initialTab);
  
    const {
      data: accessRequests = [],
      isLoading,
      error,
    } = useQuery({
      queryKey: ["propertyAccessRequestsByProperty", propertyId],
      queryFn: async () => {
        if (!propertyId) return [];
        return propertyAccessRequestService.getRequestsByProperty(propertyId);
      },
      enabled: isOpen && !!propertyId,
    });
  
    const approvedHasManager = useMemo(() => {
      return accessRequests.some((r) => {
        return (
          isApprovedStatus(r.status) &&
          normalize(String(r.cargo_solicitante)) === normalize(Cargo.GERENTE)
        );
      });
    }, [accessRequests]);
  
    const invalidateAccess = () =>
      queryClient.invalidateQueries({
        queryKey: ["propertyAccessRequestsByProperty", propertyId],
      });
  
    const decideAccessMutation = useMutation({
      mutationFn: async ({ requestId, approved }: { requestId: number; approved: boolean }) => {
        return propertyAccessRequestService.decideRequest(requestId, {
          solicitacao_aprovada: approved,
        });
      },
      onSuccess: async () => {
        toaster.create({ title: "Operação realizada", type: "success" });
        await invalidateAccess();
      },
      onError: (err) =>
        toaster.create({
          title: "Erro ao processar solicitação",
          description: getErrorMessage(err),
          type: "error",
        }),
    });
  
    const handleApprove = (req: PropertyAccessRequestResponse) => {
      const isManager = normalize(String(req.cargo_solicitante)) === normalize(Cargo.GERENTE);
  
      if (isManager && approvedHasManager) {
        toaster.create({
          title: "Ação não permitida",
          description: "A propriedade só pode ter 1 gerente!",
          type: "error",
        });
        return;
      }
  
      decideAccessMutation.mutate({ requestId: req.id, approved: true });
    };
  
    const list = useMemo(() => {
      return accessRequests.filter((r) => {
        const approved = isApprovedStatus(r.status);
        const pending = isPendingStatus(r.status);
        return tab === "APPROVED" ? approved : pending;
      });
    }, [accessRequests, tab]);
  
    return (
      <DialogContainer isOpen={isOpen} onClose={onClose}>
        <VStack align="stretch" spacing={4}>
          <Heading size="md">Autorizações</Heading>
  
          {!propertyId ? (
            <Text color="gray.600">Selecione uma propriedade para visualizar as solicitações.</Text>
          ) : (
            <>
              <HStack gap={2} flexWrap="wrap">
                <Button
                  variant={tab === "PENDING" ? "solid" : "outline"}
                  colorScheme={tab === "PENDING" ? "green" : undefined}
                  onClick={() => setTab("PENDING")}
                >
                  Solicitações pendentes
                </Button>
  
                <Button
                  variant={tab === "APPROVED" ? "solid" : "outline"}
                  colorScheme={tab === "APPROVED" ? "green" : undefined}
                  onClick={() => setTab("APPROVED")}
                >
                  Solicitações aceitas
                </Button>
              </HStack>
  
              <Separator />
  
              {isLoading ? (
                <Flex justify="center" py={8}>
                  <Spinner />
                </Flex>
              ) : error ? (
                <Text color="red.500">{getErrorMessage(error)}</Text>
              ) : (
                <VStack align="stretch" spacing={3} maxH="420px" overflowY="auto">
                  {list.map((r) => (
                    <Box
                      key={r.id}
                      borderWidth="1px"
                      borderRadius="md"
                      p={4}
                      bg={{ base: "white", _dark: "gray.800" }}
                    >
                      <HStack justify="space-between" align="start" gap={4} flexWrap="wrap">
                        <Box>
                          <Text fontWeight="bold">
                            {r.nome_solicitante}{" "}
                            <Badge ml={2} colorScheme="gray">
                              {String(r.cargo_solicitante)}
                            </Badge>
                          </Text>
  
                          <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }}>
                            {r.email_solicitante}
                          </Text>
  
                          <Text fontSize="sm" mt={2}>
                            <Text as="span" fontWeight="bold">
                              Propriedade:
                            </Text>{" "}
                            {r.nome_propriedade}
                          </Text>
                        </Box>
  
                        {tab === "PENDING" ? (
                          <HStack>
                            <Button
                              colorScheme="green"
                              onClick={() => handleApprove(r)}
                              isLoading={decideAccessMutation.isPending}
                            >
                              Aceitar
                            </Button>
  
                            <Button
                              colorScheme="red"
                              variant="outline"
                              onClick={() =>
                                decideAccessMutation.mutate({ requestId: r.id, approved: false })
                              }
                              isLoading={decideAccessMutation.isPending}
                            >
                              Recusar
                            </Button>
                          </HStack>
                        ) : (
                          <Button
                            colorScheme="red"
                            variant="outline"
                            onClick={() =>
                              decideAccessMutation.mutate({ requestId: r.id, approved: false })
                            }
                            isLoading={decideAccessMutation.isPending}
                          >
                            Expulsar
                          </Button>
                        )}
                      </HStack>
                    </Box>
                  ))}
  
                  {list.length === 0 && (
                    <Text color="gray.500" textAlign="center">
                      Nenhuma solicitação nesta aba.
                    </Text>
                  )}
                </VStack>
              )}
            </>
          )}
  
          <Flex justify="flex-end">
            <Button onClick={onClose} variant="outline">
              Fechar
            </Button>
          </Flex>
        </VStack>
      </DialogContainer>
    );
  }