import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Cargo } from "@/interfaces/User";
import { updateActiveCargo } from "@/services/userService";
import { useUserStore } from "@/stores/user/user.store";
import ActiveCargoSelector from "./ActiveCargoSelector";

vi.mock("@/services/userService", () => ({
  updateActiveCargo: vi.fn(),
}));

vi.mock("@/components/ui/toaster", () => ({
  toaster: { create: vi.fn() },
}));

const renderSelector = () =>
  render(
    <ChakraProvider value={defaultSystem}>
      <ActiveCargoSelector />
    </ChakraProvider>,
  );

beforeEach(() => {
  sessionStorage.clear();
  useUserStore.setState({
    user: { id: 7, login: "usuario", cargo: Cargo.PROPRIETARIO },
  });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("Cargo atual no sistema", () => {
  it("exibe os seis cargos elegíveis e destaca o cargo atual", () => {
    renderSelector();

    expect(screen.getByRole("heading", { name: "Cargo atual no sistema" })).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(6);
    expect(screen.getByRole("button", { name: "Proprietário" })).toHaveAttribute("aria-pressed", "true");
  });

  it("envia somente o cargo, troca o token após sucesso e atualiza o contexto", async () => {
    vi.mocked(updateActiveCargo).mockResolvedValue({
      cargo: Cargo.GERENTE,
      token: "novo-token",
    });
    renderSelector();

    fireEvent.click(screen.getByRole("button", { name: "Gerente" }));

    await waitFor(() => expect(updateActiveCargo).toHaveBeenCalledWith(Cargo.GERENTE));
    await waitFor(() => expect(sessionStorage.getItem("fertintelligenceToken")).toBe("novo-token"));
    expect(useUserStore.getState().user?.cargo).toBe(Cargo.GERENTE);
  });

  it("mantém cargo e token anteriores quando a troca falha", async () => {
    sessionStorage.setItem("fertintelligenceToken", "token-anterior");
    vi.mocked(updateActiveCargo).mockRejectedValue(new Error("falha"));
    renderSelector();

    fireEvent.click(screen.getByRole("button", { name: "Gerente" }));

    await waitFor(() => expect(updateActiveCargo).toHaveBeenCalled());
    expect(sessionStorage.getItem("fertintelligenceToken")).toBe("token-anterior");
    expect(useUserStore.getState().user?.cargo).toBe(Cargo.PROPRIETARIO);
  });
});
