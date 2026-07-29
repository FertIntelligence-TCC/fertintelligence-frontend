import { Box, Button, Flex, Heading, Text } from "@chakra-ui/react";
import { useState } from "react";

import { toaster } from "@/components/ui/toaster";
import { Cargo } from "@/interfaces/User";
import { updateActiveCargo } from "@/services/userService";
import { useUserStore } from "@/stores/user/user.store";

const SELECTABLE_CARGOS = [
  { value: Cargo.PROPRIETARIO, label: "Proprietário" },
  { value: Cargo.GERENTE, label: "Gerente" },
  { value: Cargo.AGRONOMO_CONSULTOR, label: "Agrônomo Consultor" },
  { value: Cargo.AGRONOMO_RESIDENTE, label: "Agrônomo Residente" },
  { value: Cargo.SECRETARIO, label: "Secretário" },
  { value: Cargo.SUPERVISOR_DE_AREA, label: "Supervisor de Área" },
] as const;

export default function ActiveCargoSelector() {
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const [pendingCargo, setPendingCargo] = useState<Cargo | null>(null);
  const currentCargo = user?.cargo as Cargo | undefined;

  const handleChange = async (cargo: Cargo) => {
    if (!user || cargo === currentCargo || pendingCargo) return;

    setPendingCargo(cargo);
    try {
      const response = await updateActiveCargo(cargo);
      sessionStorage.setItem("fertintelligenceToken", response.token);
      setUser({ ...user, cargo: response.cargo });
      toaster.create({
        title: "Cargo atual alterado",
        description: `Cargo atual alterado para ${
          SELECTABLE_CARGOS.find((item) => item.value === response.cargo)?.label ?? response.cargo
        }.`,
        type: "success",
      });
    } catch {
      toaster.create({
        title: "Não foi possível alterar o cargo atual",
        description: "Tente novamente.",
        type: "error",
      });
    } finally {
      setPendingCargo(null);
    }
  };

  return (
    <Box
      borderWidth="1px"
      borderRadius="md"
      boxShadow="md"
      p={8}
      w="100%"
      bg={{ base: "white", _dark: "gray.700" }}
      aria-busy={pendingCargo !== null}
    >
      <Heading as="h2" size="md" mb={2}>
        Cargo atual no sistema
      </Heading>
      <Text mb={5} color="gray.600" _dark={{ color: "gray.300" }}>
        A troca altera o contexto funcional, sem conceder acesso a novos dados.
      </Text>

      {currentCargo === Cargo.USUARIO_SUPREMO ? (
        <Button aria-pressed="true" colorScheme="green" disabled w="100%" h="50px">
          Usuário Supremo
        </Button>
      ) : (
        <Flex
          direction="column"
          gap={3}
          role="group"
          aria-label="Cargos disponíveis"
          data-orientation="vertical"
        >
          {SELECTABLE_CARGOS.map(({ value, label }) => {
            const selected = currentCargo === value;
            return (
              <Button
                key={value}
                aria-pressed={selected}
                colorScheme={selected ? "green" : "gray"}
                variant={selected ? "solid" : "outline"}
                disabled={pendingCargo !== null}
                onClick={() => handleChange(value)}
                w="100%"
                h="50px"
              >
                {pendingCargo === value ? "Alterando…" : label}
              </Button>
            );
          })}
        </Flex>
      )}
    </Box>
  );
}
