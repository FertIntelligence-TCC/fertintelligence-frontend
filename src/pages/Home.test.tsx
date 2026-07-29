import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Cargo } from "@/interfaces/User";
import { useUserStore } from "@/stores/user/user.store";
import Home from "./Home";

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock("@/components/Layouts/UserLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));

vi.mock("@/components/ConfigMenu/ConfigMenu", () => ({
  default: () => null,
}));

vi.mock("@/components/FertName/FertName", () => ({
  default: () => null,
}));

vi.mock("@/components/ActiveCargoSelector/ActiveCargoSelector", () => ({
  default: () => (
    <section>
      <h2>Cargo atual no sistema</h2>
    </section>
  ),
}));

beforeEach(() => {
  useUserStore.setState({
    user: { id: 7, login: "usuario", cargo: Cargo.PROPRIETARIO },
  });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("Painel principal", () => {
  it("mantém propriedades e cargo na coluna esquerda e autorizações na coluna direita", () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <Home />
      </ChakraProvider>,
    );

    const leftColumn = screen.getByTestId("home-left-column");

    expect(
      within(leftColumn).getByRole("heading", {
        name: "Minhas propriedades e cultivos",
      }),
    ).toBeInTheDocument();
    expect(
      within(leftColumn).getByRole("heading", {
        name: "Cargo atual no sistema",
      }),
    ).toBeInTheDocument();
    expect(
      within(leftColumn).queryByRole("heading", { name: "Autorizações" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Autorizações" }),
    ).toBeInTheDocument();
  });
});
