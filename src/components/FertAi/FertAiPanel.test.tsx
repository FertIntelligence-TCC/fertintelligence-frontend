import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { RecommendationResponse } from "@/interfaces/Recommendation";
import { getRecommendation } from "@/services/recommendationService";
import {
  FertAiRequestError,
  sendFertAiMessage,
} from "@/services/fertAiService";
import FertAiPanel from "./FertAiPanel";

vi.mock("@/services/recommendationService", () => ({
  getRecommendation: vi.fn(),
}));

vi.mock("@/services/fertAiService", async () => {
  const actual = await vi.importActual<typeof import("@/services/fertAiService")>(
    "@/services/fertAiService",
  );
  return {
    ...actual,
    sendFertAiMessage: vi.fn(),
  };
});

const recommendation = (
  id: number,
  name: string,
  report = `Relatório geral ${id}`,
): RecommendationResponse => ({
  id,
  nome_pasta_recomendacao: name,
  nome_propriedade: `Fazenda ${id}`,
  identificacao_talhao: `Talhão ${id}`,
  cultura: "MILHO",
  ano_safra: 2026,
  laudo_tecnico: report,
} as RecommendationResponse);

const renderPanel = (
  recommendations: RecommendationResponse[] = [
    recommendation(1, "Pasta A"),
    recommendation(2, "Pasta B"),
  ],
) =>
  render(
    <ChakraProvider value={defaultSystem}>
      <FertAiPanel
        recommendations={recommendations}
        loadingRecommendations={false}
      />
    </ChakraProvider>,
  );

beforeEach(() => {
  vi.clearAllMocks();
  let uuidCounter = 0;
  vi.spyOn(crypto, "randomUUID").mockImplementation(
    () => `00000000-0000-4000-8000-${String(++uuidCounter).padStart(12, "0")}`,
  );
  Object.defineProperty(Element.prototype, "scrollIntoView", {
    configurable: true,
    value: vi.fn(),
  });
  vi.mocked(getRecommendation).mockImplementation(async (id) =>
    recommendation(id, id === 1 ? "Pasta A" : "Pasta B"),
  );
  vi.mocked(sendFertAiMessage).mockResolvedValue({
    session_id: "sessao",
    answer: "Resposta do Fert-IA",
    citations: [],
  });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe("Fert-IA", () => {
  it("renderiza o chat, recomendações próprias e estado inicial vazio", () => {
    renderPanel();

    expect(screen.getByRole("heading", { name: "Fert-IA" })).toBeInTheDocument();
    expect(screen.getByText("Pasta A")).toBeInTheDocument();
    expect(screen.getByText("Pasta B")).toBeInTheDocument();
    expect(
      screen.getByText(/Faça uma pergunta livre ou selecione uma recomendação/),
    ).toBeInTheDocument();
  });

  it("renderiza estados de loading, erro e lista vazia", () => {
    const { rerender } = render(
      <ChakraProvider value={defaultSystem}>
        <FertAiPanel recommendations={[]} loadingRecommendations />
      </ChakraProvider>,
    );
    expect(screen.getByText("Carregando recomendações...")).toBeInTheDocument();

    rerender(
      <ChakraProvider value={defaultSystem}>
        <FertAiPanel
          recommendations={[]}
          loadingRecommendations={false}
          recommendationsError="Falha no histórico."
        />
      </ChakraProvider>,
    );
    expect(screen.getByText("Falha no histórico.")).toBeInTheDocument();

    rerender(
      <ChakraProvider value={defaultSystem}>
        <FertAiPanel recommendations={[]} loadingRecommendations={false} />
      </ChakraProvider>,
    );
    expect(screen.getByText("Nenhuma recomendação encontrada.")).toBeInTheDocument();
  });

  it("envia pergunta livre sem contexto ao pressionar Enter", async () => {
    renderPanel();
    const composer = screen.getByRole("textbox", { name: "Pergunta para o Fert-IA" });

    await userEvent.type(composer, "Qual o efeito do gesso?{enter}");

    await waitFor(() => expect(sendFertAiMessage).toHaveBeenCalledTimes(1));
    expect(vi.mocked(sendFertAiMessage).mock.calls[0][0]).toMatchObject({
      question: "Qual o efeito do gesso?",
      recommendation_context: null,
    });
    expect(screen.getByText("Resposta do Fert-IA")).toBeInTheDocument();
  });

  it("Shift+Enter quebra linha sem enviar", async () => {
    renderPanel();
    const composer = screen.getByRole("textbox", { name: "Pergunta para o Fert-IA" });

    await userEvent.type(composer, "Linha 1{shift>}{enter}{/shift}Linha 2");

    expect(sendFertAiMessage).not.toHaveBeenCalled();
    expect(composer).toHaveValue("Linha 1\nLinha 2");
  });

  it("carrega somente a Geral e envia o contexto apenas na primeira pergunta", async () => {
    renderPanel();
    await userEvent.click(screen.getByRole("button", { name: /Pasta A/ }));

    await waitFor(() => expect(getRecommendation).toHaveBeenCalledWith(1));
    expect(screen.getByText("Recomendação selecionada: Pasta A")).toBeInTheDocument();

    const composer = screen.getByRole("textbox", { name: "Pergunta para o Fert-IA" });
    await userEvent.type(composer, "Explique a dose.");
    await userEvent.click(screen.getByRole("button", { name: "Enviar" }));
    await waitFor(() => expect(sendFertAiMessage).toHaveBeenCalledTimes(1));

    const firstPayload = vi.mocked(sendFertAiMessage).mock.calls[0][0];
    expect(firstPayload.recommendation_context).toEqual({
      recommendation_id: 1,
      general_report: "Relatório geral 1",
      crop: "MILHO",
      property: "Fazenda 1",
      plot: "Talhão 1",
      year: 2026,
    });

    await userEvent.type(composer, "E o potássio?");
    await userEvent.click(screen.getByRole("button", { name: "Enviar" }));
    await waitFor(() => expect(sendFertAiMessage).toHaveBeenCalledTimes(2));

    const secondPayload = vi.mocked(sendFertAiMessage).mock.calls[1][0];
    expect(secondPayload.session_id).toBe(firstPayload.session_id);
    expect(secondPayload.recommendation_context).toBeNull();
  });

  it("troca de recomendação cria sessão nova e limpa o histórico", async () => {
    renderPanel();
    await userEvent.click(screen.getByRole("button", { name: /Pasta A/ }));
    await waitFor(() => expect(getRecommendation).toHaveBeenCalledWith(1));

    const composer = screen.getByRole("textbox", { name: "Pergunta para o Fert-IA" });
    await userEvent.type(composer, "Pergunta A");
    await userEvent.click(screen.getByRole("button", { name: "Enviar" }));
    await screen.findByText("Resposta do Fert-IA");
    const firstSession = vi.mocked(sendFertAiMessage).mock.calls[0][0].session_id;

    await userEvent.click(screen.getByRole("button", { name: /Pasta B/ }));
    await waitFor(() => expect(getRecommendation).toHaveBeenCalledWith(2));
    expect(screen.queryByText("Resposta do Fert-IA")).not.toBeInTheDocument();

    await userEvent.type(composer, "Pergunta B");
    await userEvent.click(screen.getByRole("button", { name: "Enviar" }));
    await waitFor(() => expect(sendFertAiMessage).toHaveBeenCalledTimes(2));
    expect(vi.mocked(sendFertAiMessage).mock.calls[1][0].session_id).not.toBe(firstSession);
  });

  it("permite cancelar uma resposta em andamento", async () => {
    vi.mocked(sendFertAiMessage).mockImplementation(
      (_payload, signal) =>
        new Promise((_resolve, reject) => {
          signal?.addEventListener("abort", () => {
            reject(new FertAiRequestError("ABORTED", "Solicitação cancelada."));
          });
        }),
    );
    renderPanel();
    const composer = screen.getByRole("textbox", { name: "Pergunta para o Fert-IA" });
    await userEvent.type(composer, "Pergunta demorada");
    await userEvent.click(screen.getByRole("button", { name: "Enviar" }));

    await userEvent.click(await screen.findByRole("button", { name: "Cancelar" }));
    await waitFor(() => {
      expect(screen.queryByText("Pensando...")).not.toBeInTheDocument();
    });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("preserva a pergunta e oferece nova tentativa quando ocorre erro", async () => {
    vi.mocked(sendFertAiMessage).mockRejectedValueOnce(
      new FertAiRequestError(
        "TIMEOUT",
        "O Fert-IA demorou mais que o esperado para responder.",
      ),
    );
    renderPanel();
    const composer = screen.getByRole("textbox", { name: "Pergunta para o Fert-IA" });
    await userEvent.type(composer, "Pergunta preservada");
    await userEvent.click(screen.getByRole("button", { name: "Enviar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("demorou mais");
    expect(screen.getByText("Pergunta preservada")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    await waitFor(() => expect(sendFertAiMessage).toHaveBeenCalledTimes(2));
    expect(screen.getAllByText("Pergunta preservada")).toHaveLength(1);
  });

  it("apresenta mensagem segura quando o JWT é recusado", async () => {
    vi.mocked(sendFertAiMessage).mockRejectedValueOnce(
      new FertAiRequestError(
        "UNAUTHORIZED",
        "Sua sessão expirou. Entre novamente.",
        401,
      ),
    );
    renderPanel();
    const composer = screen.getByRole("textbox", { name: "Pergunta para o Fert-IA" });
    await userEvent.type(composer, "Pergunta autenticada");
    await userEvent.click(screen.getByRole("button", { name: "Enviar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Sua sessão expirou. Entre novamente.",
    );
  });

  it("renderiza Markdown e citações sem executar HTML arbitrário", async () => {
    vi.mocked(sendFertAiMessage).mockResolvedValue({
      session_id: "sessao",
      answer: "**Resposta forte** <script>alert('x')</script>",
      citations: [{ id: 1, source: "manual.pdf", page: 12, score: 0.9 }],
    });
    renderPanel();
    const composer = screen.getByRole("textbox", { name: "Pergunta para o Fert-IA" });
    await userEvent.type(composer, "Pergunta");
    await userEvent.click(screen.getByRole("button", { name: "Enviar" }));

    expect((await screen.findByText("Resposta forte")).tagName).toBe("STRONG");
    expect(document.querySelector("script")).toBeNull();
    expect(screen.getByText("[1] manual.pdf — p. 12")).toBeInTheDocument();
  });

  it("não envia pergunta vazia", () => {
    renderPanel();
    expect(screen.getByRole("button", { name: "Enviar" })).toBeDisabled();
    fireEvent.keyDown(
      screen.getByRole("textbox", { name: "Pergunta para o Fert-IA" }),
      { key: "Enter" },
    );
    expect(sendFertAiMessage).not.toHaveBeenCalled();
  });
});
