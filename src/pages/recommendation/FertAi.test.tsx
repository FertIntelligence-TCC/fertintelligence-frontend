import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StrictMode } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { RecommendationResponse } from "@/interfaces/Recommendation";
import { getMyRecommendations } from "@/services/recommendationService";
import FertAi from "./FertAi";

vi.mock("@/services/recommendationService", () => ({
  getMyRecommendations: vi.fn(),
}));

vi.mock("@/components/ConfigMenu/ConfigMenu", () => ({
  default: () => null,
}));

vi.mock("@/components/FertName/FertName", () => ({
  default: ({ subtitle }: { subtitle?: string }) => <div>{subtitle}</div>,
}));

vi.mock("@/components/Layouts/UserLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));

vi.mock("@/components/FertAi/FertAiPanel", () => ({
  default: ({
    recommendations,
    loadingRecommendations,
    recommendationsError,
  }: {
    recommendations: RecommendationResponse[];
    loadingRecommendations: boolean;
    recommendationsError?: string | null;
  }) => (
    <section aria-label="Painel Fert-IA">
      <h1>Fert-IA</h1>
      <p>Assistente inteligente para interpretar recomendações agronômicas e esclarecer dúvidas.</p>
      <span>{loadingRecommendations ? "Carregando" : "Carregado"}</span>
      <span>{recommendationsError}</span>
      {recommendations.map((item) => <span key={item.id}>{item.nome_pasta_recomendacao}</span>)}
    </section>
  ),
}));

const renderPage = (strict = false) => {
  const content = (
    <MemoryRouter initialEntries={["/fertintelligence/recommendation/fert-ai"]}>
      <Routes>
        <Route path="/fertintelligence/recommendation/fert-ai" element={<FertAi />} />
        <Route
          path="/fertintelligence/recommendation"
          element={<div>Página de recomendações</div>}
        />
      </Routes>
    </MemoryRouter>
  );

  return render(
    <ChakraProvider value={defaultSystem}>
      {strict ? <StrictMode>{content}</StrictMode> : content}
    </ChakraProvider>,
  );
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getMyRecommendations).mockResolvedValue([
    { id: 1, nome_pasta_recomendacao: "Safra 2026" } as RecommendationResponse,
  ]);
});

afterEach(() => {
  cleanup();
});

describe("página Fert-IA", () => {
  it("carrega recomendações uma única vez mesmo sob StrictMode", async () => {
    renderPage(true);

    expect(screen.getByRole("heading", { name: "Fert-IA" })).toBeInTheDocument();
    expect(screen.getByText(/Assistente inteligente/)).toBeInTheDocument();
    await screen.findByText("Safra 2026");

    expect(getMyRecommendations).toHaveBeenCalledTimes(1);
  });

  it("exibe erro de carregamento sem desmontar o painel", async () => {
    vi.mocked(getMyRecommendations).mockRejectedValue(new Error("indisponível"));
    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/Não foi possível carregar suas recomendações/)).toBeInTheDocument();
    });
    expect(screen.getByRole("region", { name: "Painel Fert-IA" })).toBeInTheDocument();
  });

  it("volta para recomendações pela navegação do React Router", async () => {
    renderPage();

    await userEvent.click(
      screen.getByRole("button", { name: "Voltar para recomendações" }),
    );

    expect(screen.getByText("Página de recomendações")).toBeInTheDocument();
  });
});
