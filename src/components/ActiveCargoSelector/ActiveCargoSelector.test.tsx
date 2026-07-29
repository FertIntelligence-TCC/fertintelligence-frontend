import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
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
    const roleGroup = screen.getByRole("group", { name: "Cargos disponíveis" });
    const roleButtons = within(roleGroup).getAllByRole("button");

    expect(roleGroup).toHaveAttribute("data-orientation", "vertical");
    expect(roleButtons.map((button) => button.textContent)).toEqual([
      "Proprietário",
      "Gerente",
      "Agrônomo Consultor",
      "Agrônomo Residente",
      "Secretário",
      "Supervisor de Área",
    ]);
    expect(roleButtons[0]).toHaveAttribute("aria-pressed", "true");
    roleButtons.slice(1).forEach((button) => {
      expect(button).toHaveAttribute("aria-pressed", "false");
    });
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

  it("bloqueia trocas simultâneas enquanto uma alteração está em andamento", async () => {
    let completeRequest: ((value: { cargo: Cargo; token: string }) => void) | undefined;
    vi.mocked(updateActiveCargo).mockImplementation(
      () =>
        new Promise((resolve) => {
          completeRequest = resolve;
        }),
    );
    renderSelector();

    fireEvent.click(screen.getByRole("button", { name: "Gerente" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Alterando…" })).toBeDisabled();
    });
    screen.getAllByRole("button").forEach((button) => {
      expect(button).toBeDisabled();
    });

    fireEvent.click(screen.getByRole("button", { name: "Agrônomo Consultor" }));
    expect(updateActiveCargo).toHaveBeenCalledTimes(1);

    completeRequest?.({ cargo: Cargo.GERENTE, token: "novo-token" });
    await waitFor(() => expect(useUserStore.getState().user?.cargo).toBe(Cargo.GERENTE));
  });
});
