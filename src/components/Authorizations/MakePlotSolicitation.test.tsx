import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Cargo } from "@/interfaces/User";
import { propertyAccessRequestService } from "@/services/propertyAccessRequestService";
import { getPlotsByProperty } from "@/services/plotService";
import {
  getPlotAccessRequests,
  requestPlotAccess,
  revokePlotAccessRequest,
} from "@/services/plotAccessRequestService";
import { useUserStore } from "@/stores/user/user.store";
import MakePlotSolicitation from "./MakePlotSolicitation";
import { getAccessStatusPresentation } from "./AccessStatusBadge";

const navigate = vi.fn();
const toast = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => navigate,
}));

vi.mock("@/components/ui/toaster", () => ({
  toaster: { create: (...args: unknown[]) => toast(...args) },
}));

vi.mock("@/services/propertyAccessRequestService", () => ({
  propertyAccessRequestService: {
    getMyApprovedProperties: vi.fn(),
  },
}));

vi.mock("@/services/plotService", () => ({
  getPlotsByProperty: vi.fn(),
}));

vi.mock("@/services/plotAccessRequestService", () => ({
  getPlotAccessRequests: vi.fn(),
  requestPlotAccess: vi.fn(),
  revokePlotAccessRequest: vi.fn(),
}));

const property = { id: 10, nome: "Fazenda Modelo" };
const plots = [
  { id: 101, identificacao: "Talhão sem pedido" },
  { id: 102, identificacao: "Talhão pendente" },
  { id: 103, identificacao: "Talhão aprovado" },
  { id: 104, identificacao: "Talhão recusado" },
];
const requests = [
  { id: 2, propertyId: 10, plotId: 102, requesterId: 7, status: "PENDING" },
  { id: 3, propertyId: 10, plotId: 103, requesterId: 7, status: "APPROVED" },
  { id: 4, propertyId: 10, plotId: 104, requesterId: 7, status: "REJECTED" },
];

const renderPage = (roleOverride: "RESIDENT" | "CONSULTANT" | "SECRETARY") =>
  render(
    <ChakraProvider value={defaultSystem}>
      <MakePlotSolicitation roleOverride={roleOverride} />
    </ChakraProvider>,
  );

beforeEach(() => {
  useUserStore.setState({
    user: { id: 7, login: "usuario", cargo: Cargo.AGRONOMO_CONSULTOR },
  });
  vi.mocked(propertyAccessRequestService.getMyApprovedProperties).mockResolvedValue([property] as never);
  vi.mocked(getPlotAccessRequests).mockResolvedValue(requests as never);
  vi.mocked(getPlotsByProperty).mockResolvedValue(plots as never);
  vi.mocked(requestPlotAccess).mockResolvedValue(undefined as never);
  vi.mocked(revokePlotAccessRequest).mockResolvedValue(undefined as never);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("padronização das solicitações de acesso", () => {
  it("centraliza as variantes visuais sem alterar os códigos internos", () => {
    expect(getAccessStatusPresentation("NONE")).toMatchObject({
      label: "Sem solicitação",
      colorPalette: "gray",
      borderColor: "gray.500",
    });
    expect(getAccessStatusPresentation("PENDING").colorPalette).toBe("orange");
    expect(getAccessStatusPresentation("APPROVED").colorPalette).toBe("green");
    expect(getAccessStatusPresentation("REJECTED").colorPalette).toBe("red");
  });

  it("renderiza propriedade selecionável por teclado e os quatro estados amigáveis", async () => {
    renderPage("CONSULTANT");

    const propertyCard = await screen.findByRole("button", { name: /Fazenda Modelo/i });
    expect(propertyCard).toHaveAttribute("aria-pressed", "false");
    fireEvent.keyDown(propertyCard, { key: "Enter" });

    await screen.findByText("Talhão sem pedido");
    expect(propertyCard).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Selecionada")).toBeInTheDocument();
    expect(screen.getByText("Sem solicitação")).toBeInTheDocument();
    expect(screen.getByText("Solicitação pendente")).toBeInTheDocument();
    expect(screen.getByText("Acesso aprovado")).toBeInTheDocument();
    expect(screen.getByText("Solicitação recusada")).toBeInTheDocument();
  });

  it("preserva ações de pedir, cancelar e renunciar por talhão", async () => {
    renderPage("CONSULTANT");
    fireEvent.click(await screen.findByRole("button", { name: /Fazenda Modelo/i }));
    await screen.findByText("Talhão aprovado");

    const requestButtons = screen.getAllByRole("button", { name: "Pedir acesso ao gerente" });
    expect(requestButtons).toHaveLength(2);
    fireEvent.click(requestButtons[0]);
    await waitFor(() =>
      expect(requestPlotAccess).toHaveBeenCalledWith({
        propertyId: 10,
        plotId: 101,
        permissionType: "EDIT_ANALYSES_AND_CROPS",
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancelar pedido de acesso" }));
    await waitFor(() => expect(revokePlotAccessRequest).toHaveBeenCalledWith(2));

    fireEvent.click(screen.getByRole("button", { name: "Renunciar acesso" }));
    await waitFor(() => expect(revokePlotAccessRequest).toHaveBeenCalledWith(3));
  });

  it("reutiliza a mesma base visual no fluxo global do residente", async () => {
    vi.mocked(getPlotAccessRequests).mockResolvedValue([
      { id: 8, propertyId: 10, plotId: null, requesterId: 7, status: "REJECTED" },
    ] as never);
    renderPage("RESIDENT");

    const propertyCard = await screen.findByRole("button", { name: /Fazenda Modelo/i });
    fireEvent.keyDown(propertyCard, { key: " " });

    expect(await screen.findByText("Solicitação recusada")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pedir acesso ao gerente" })).toBeInTheDocument();
    expect(getPlotsByProperty).not.toHaveBeenCalled();
  });

  it("mostra loading acessível e estado vazio responsivo", async () => {
    let resolveProperties: (value: unknown) => void = () => undefined;
    vi.mocked(propertyAccessRequestService.getMyApprovedProperties).mockReturnValue(
      new Promise((resolve) => {
        resolveProperties = resolve;
      }) as never,
    );
    renderPage("SECRETARY");

    expect(screen.getByRole("status")).toHaveTextContent("Carregando solicitações");
    resolveProperties([]);
    expect(await screen.findByText("Nenhuma propriedade aprovada disponível.")).toBeInTheDocument();
  });

  it("mantém a página utilizável e informa erro de carregamento", async () => {
    vi.mocked(propertyAccessRequestService.getMyApprovedProperties).mockRejectedValue(new Error("falha"));
    renderPage("CONSULTANT");

    await screen.findByText("Nenhuma propriedade aprovada disponível.");
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Erro",
        description: "Falha ao carregar solicitações de autorização.",
      }),
    );
  });

  it("preserva a navegação de volta ao painel", async () => {
    renderPage("CONSULTANT");
    fireEvent.click(screen.getByRole("button", { name: "Voltar para o painel" }));
    expect(navigate).toHaveBeenCalledWith("/fertintelligence/home");
  });
});
